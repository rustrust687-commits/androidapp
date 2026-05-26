import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Dimensions, Modal, Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { getWorkouts } from '../services/workoutService';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProgressScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getWorkouts();
        setWorkouts(data);
      } catch { Alert.alert('Ошибка', 'Не удалось загрузить данные'); }
      finally { setLoading(false); }
    })();
  }, []));

  const exercises = [...new Set(workouts.map(w => w.exercise))].sort();

  const chartData = selected
    ? workouts
        .filter(w => w.exercise === selected)
        .reverse()
        .reduce((acc, item) => {
          const existing = acc.find(a => a.label === item.datetime?.slice(0, 10));
          if (existing) {
            existing.value = Math.max(existing.value, Number(item.weight));
          } else {
            acc.push({
              label: item.datetime?.slice(5, 10) || '',
              value: Number(item.weight),
            });
          }
          return acc;
        }, [])
    : [];

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#0d0d0d']} style={s.center}>
        <ActivityIndicator size="large" color="#7C6FFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0a', '#0d0d0d']} style={s.container}>
      <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPicker(true)}>
        <Ionicons name="barbell-outline" size={18} color="#7C6FFF" />
        <Text style={s.pickerText}>{selected || 'Выберите упражнение'}</Text>
        <Ionicons name="chevron-down" size={16} color="#555" />
      </TouchableOpacity>

      {chartData.length > 1 ? (
        <LineChart
          data={{
            labels: chartData.map(d => d.label),
            datasets: [{ data: chartData.map(d => d.value) }],
          }}
          width={SCREEN_WIDTH - 30}
          height={280}
          yAxisSuffix="кг"
          chartConfig={{
            backgroundColor: '#0a0a0a',
            backgroundGradientFrom: '#141414',
            backgroundGradientTo: '#0d0d0d',
            decimalCount: 0,
            color: () => '#7C6FFF',
            labelColor: () => '#888',
            propsForBackgroundLines: { strokeDasharray: '3,3', stroke: '#2a2a2a' },
            propsForDots: { r: '5', strokeWidth: '2', stroke: '#7C6FFF', fill: '#0a0a0a' },
          }}
          bezier
          style={s.chart}
        />
      ) : chartData.length === 1 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>Нужно минимум 2 тренировки для графика</Text>
        </View>
      ) : selected ? (
        <View style={s.center}>
          <Ionicons name="analytics-outline" size={48} color="#2a2a2a" />
          <Text style={s.emptyText}>Нет данных для этого упражнения</Text>
        </View>
      ) : (
        <View style={s.center}>
          <Ionicons name="analytics-outline" size={48} color="#2a2a2a" />
          <Text style={s.emptyText}>Выберите упражнение для просмотра прогресса</Text>
        </View>
      )}

      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={s.overlay} onPress={() => setShowPicker(false)}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Выберите упражнение</Text>
            {exercises.length === 0 ? (
              <Text style={s.emptyText}>Нет упражнений</Text>
            ) : (
              exercises.map(ex => (
                <TouchableOpacity
                  key={ex}
                  style={[s.modalItem, selected === ex && s.modalItemActive]}
                  onPress={() => { setSelected(ex); setShowPicker(false); }}
                >
                  <Text style={[s.modalItemText, selected === ex && s.modalItemTextActive]}>{ex}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414',
    borderRadius: 12, padding: 14, marginHorizontal: 15, gap: 8,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  pickerText: { color: '#fff', fontSize: 15, flex: 1 },
  chart: { marginTop: 20, borderRadius: 12, alignSelf: 'center' },
  emptyText: { color: '#555', fontSize: 14, marginTop: 12, textAlign: 'center', padding: 20 },
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
