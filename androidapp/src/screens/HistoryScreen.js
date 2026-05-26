import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getWorkouts, deleteWorkout } from '../services/workoutService';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()} ${hh}:${mi}`;
}

export default function HistoryScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить тренировки');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const exercises = [...new Set(workouts.map(w => w.exercise))].sort();
  const filtered = filter ? workouts.filter(w => w.exercise === filter) : workouts;

  const handleDelete = (id) => {
    Alert.alert('Удалить?', 'Это действие нельзя отменить', [
      { text: 'Нет', style: 'cancel' },
      { text: 'Да', style: 'destructive', onPress: async () => {
        try {
          await deleteWorkout(id);
          load();
        } catch { Alert.alert('Ошибка', 'Не удалось удалить'); }
      }},
    ]);
  };

  const exportForAI = async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recent = workouts.filter(w => {
      const d = new Date(w.datetime);
      return d >= thirtyDaysAgo;
    });

    if (recent.length === 0) {
      Alert.alert('Нет данных', 'За последние 30 дней нет тренировок');
      return;
    }

    const lines = recent.reverse().map(w =>
      `Дата: ${fmtDate(w.datetime)}, Упражнение: ${w.exercise}, Вес: ${w.weight}кг, Повторы: ${w.reps}`
    );
    const content = lines.join('\n');
    const uri = FileSystem.documentDirectory + 'export_training.txt';

    try {
      await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'text/plain' });
      } else {
        Alert.alert('Готово', 'Файл сохранён, но общий доступ недоступен');
      }
    } catch { Alert.alert('Ошибка', 'Не удалось создать файл'); }
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <TouchableOpacity
        style={s.cardBody}
        onPress={() => navigation.navigate('Add', { workout: item })}
      >
        <Text style={s.exercise}>{item.exercise}</Text>
        <Text style={s.detail}>{fmtDate(item.datetime)}</Text>
        <Text style={s.detail}>{item.weight} кг × {item.reps} повторений</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ff4757" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#0d0d0d']} style={s.center}>
        <ActivityIndicator size="large" color="#7C6FFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0a', '#0d0d0d']} style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilter(true)}>
          <Ionicons name="funnel-outline" size={16} color="#7C6FFF" />
          <Text style={s.filterText}>{filter || 'Все упражнения'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.exportBtn} onPress={exportForAI}>
          <Ionicons name="share-outline" size={16} color="#fff" />
          <Text style={s.exportText}>Экспорт для ИИ</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="barbell-outline" size={48} color="#2a2a2a" />
          <Text style={s.emptyText}>
            {filter ? 'Нет записей для этого упражнения' : 'Тренировок пока нет'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
        />
      )}

      <Modal visible={showFilter} transparent animationType="fade">
        <Pressable style={s.overlay} onPress={() => setShowFilter(false)}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Выберите упражнение</Text>
            <TouchableOpacity
              style={[s.modalItem, !filter && s.modalItemActive]}
              onPress={() => { setFilter(null); setShowFilter(false); }}
            >
              <Text style={[s.modalItemText, !filter && s.modalItemTextActive]}>Все</Text>
            </TouchableOpacity>
            {exercises.map(ex => (
              <TouchableOpacity
                key={ex}
                style={[s.modalItem, filter === ex && s.modalItemActive]}
                onPress={() => { setFilter(ex); setShowFilter(false); }}
              >
                <Text style={[s.modalItemText, filter === ex && s.modalItemTextActive]}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414',
    borderRadius: 10, padding: 10, gap: 6, flex: 1,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C6FFF',
    borderRadius: 10, padding: 10, gap: 6,
  },
  filterText: { color: '#aaa', fontSize: 13 },
  exportText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  card: {
    backgroundColor: '#141414', borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardBody: { flex: 1 },
  exercise: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  detail: { color: '#888', fontSize: 13, marginTop: 2 },
  deleteBtn: { marginLeft: 12, padding: 8 },
  emptyText: { color: '#555', fontSize: 15, marginTop: 12 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', padding: 40,
  },
  modal: { backgroundColor: '#141414', borderRadius: 16, padding: 20, maxHeight: 400, borderWidth: 1, borderColor: '#2a2a2a' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 14 },
  modalItem: { padding: 12, borderRadius: 10, marginBottom: 4 },
  modalItemActive: { backgroundColor: '#1e1e1e' },
  modalItemText: { color: '#888', fontSize: 15 },
  modalItemTextActive: { color: '#fff' },
});
