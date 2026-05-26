import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addWorkout, updateWorkout } from '../services/workoutService';

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function nowISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddScreen({ route, navigation }) {
  const edit = route?.params?.workout;
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [datetime, setDatetime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (edit) {
      setExercise(edit.exercise || '');
      setWeight(String(edit.weight || ''));
      setReps(String(edit.reps || ''));
      const d = edit.datetime || new Date().toISOString();
      setDatetime(d.slice(0, 16));
    } else {
      setDatetime(nowISO());
    }
  }, [edit]);

  const handleSave = async () => {
    if (!exercise.trim() || !weight.trim() || !reps.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (isNaN(Number(weight)) || isNaN(Number(reps))) {
      Alert.alert('Ошибка', 'Вес и повторения должны быть числами');
      return;
    }
    setSaving(true);
    try {
      const data = {
        exercise: exercise.trim(),
        weight: Number(weight),
        reps: Number(reps),
        datetime: datetime || nowISO(),
      };
      if (edit?.id) {
        await updateWorkout(edit.id, data);
      } else {
        await addWorkout(data);
      }
      Alert.alert('Готово', edit ? 'Тренировка обновлена' : 'Тренировка сохранена');
      if (!edit) {
        setExercise('');
        setWeight('');
        setReps('');
        setDatetime(nowISO());
      }
      navigation.navigate('History');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить. Проверьте интернет.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#0d0d0d']} style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.label}>Упражнение</Text>
          <TextInput
            style={s.input}
            value={exercise}
            onChangeText={setExercise}
            placeholder="Например: Жим лёжа"
            placeholderTextColor="#444"
          />

          <Text style={s.label}>Вес (кг)</Text>
          <TextInput
            style={s.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#444"
          />

          <Text style={s.label}>Повторения</Text>
          <TextInput
            style={s.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#444"
          />

          <Text style={s.label}>Дата и время</Text>
          <TextInput
            style={s.input}
            value={datetime}
            onChangeText={setDatetime}
            placeholder="ГГГГ-ММ-ДДTЧЧ:ММ"
            placeholderTextColor="#444"
          />
          <Text style={s.hint}>Формат: ГГГГ-ММ-ДДTЧЧ:ММ (напр. 2025-05-26T14:30)</Text>

          <TouchableOpacity style={s.btnWrap} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={['#7C6FFF', '#6B5CE7']} style={s.btn}>
              <Text style={s.btnText}>{saving ? 'Сохранение...' : edit ? 'Обновить' : 'Сохранить'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {edit && (
            <TouchableOpacity
              style={[s.btnWrap, { marginTop: 0 }]}
              onPress={() => { navigation.navigate('History'); }}
            >
              <LinearGradient colors={['#2a2a2a', '#1e1e1e']} style={s.btn}>
                <Text style={s.btnText}>Отмена</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  label: { color: '#fff', fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#141414', color: '#fff', fontSize: 16,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2a2a2a',
  },
  hint: { color: '#555', fontSize: 12, marginTop: 6 },
  btnWrap: { marginTop: 28, borderRadius: 12, overflow: 'hidden' },
  btn: { padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: 0.5 },
});
