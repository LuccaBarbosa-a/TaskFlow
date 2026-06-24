import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Colors } from '../theme';
import type { Category, Priority, Status, Task, TaskPayload } from '../types';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'alta', label: '🔴 Alta' },
  { value: 'media', label: '🟡 Média' },
  { value: 'baixa', label: '🟢 Baixa' },
];
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'faculdade', label: '📚 Faculdade' },
  { value: 'trabalho', label: '💼 Trabalho' },
  { value: 'pessoal', label: '👤 Pessoal' },
];
const STATUSES: { value: Status; label: string }[] = [
  { value: 'pendente', label: '⏳ Pendente' },
  { value: 'em_andamento', label: '🔄 Em andamento' },
  { value: 'concluida', label: '✅ Concluída' },
];

interface SegmentedPickerProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function SegmentedPicker<T extends string>({ options, value, onChange }: SegmentedPickerProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createPickerStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.btn, value === opt.value && styles.btnActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, value === opt.value && styles.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function createPickerStyles(c: Colors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    btn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.gray200,
      backgroundColor: c.white,
    },
    btnActive: { borderColor: c.purple, backgroundColor: c.purpleLt },
    label: { fontSize: 12, color: c.textSec },
    labelActive: { color: c.purple, fontWeight: '600' },
  });
}

interface TaskModalProps {
  visible: boolean;
  task: Task | null;
  onSave: (data: TaskPayload) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ visible, task, onSave, onClose }: TaskModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState<Category>('pessoal');
  const [status, setStatus] = useState<Status>('pendente');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'media');
      setCategory(task.category || 'pessoal');
      setStatus(task.status || 'pendente');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : null);
    } else {
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('pessoal');
      setStatus('pendente');
      setDueDate(null);
    }
  }, [task, visible]);

  async function handleSave(): Promise<void> {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description, priority, category, status, due_date: dueDate });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{task ? 'Editar tarefa' : 'Nova tarefa'}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="O que precisa ser feito?"
              placeholderTextColor={colors.gray400}
              autoFocus
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Detalhes adicionais (opcional)"
              placeholderTextColor={colors.gray400}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Prioridade</Text>
            <SegmentedPicker options={PRIORITIES} value={priority} onChange={setPriority} />

            <Text style={[styles.label, { marginTop: 14 }]}>Categoria</Text>
            <SegmentedPicker options={CATEGORIES} value={category} onChange={setCategory} />

            <Text style={[styles.label, { marginTop: 14 }]}>Status</Text>
            <SegmentedPicker options={STATUSES} value={status} onChange={setStatus} />

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!title.trim() || saving) && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!title.trim() || saving}
              >
                <Text style={styles.saveTxt}>
                  {saving ? 'Salvando...' : task ? 'Salvar' : 'Criar tarefa'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: c.white,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 32,
      maxHeight: '90%',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.gray200,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: c.gray100,
    },
    title: { fontSize: 17, fontWeight: '700', color: c.text },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: c.gray100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeTxt: { fontSize: 20, color: c.textSec, lineHeight: 22 },

    form: { paddingHorizontal: 20, paddingTop: 16 },

    label: {
      fontSize: 13,
      fontWeight: '500',
      color: c.gray600,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1.5,
      borderColor: c.gray200,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      color: c.text,
      backgroundColor: c.white,
      marginBottom: 14,
    },
    textarea: { height: 80, textAlignVertical: 'top' },

    footer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
      marginBottom: 8,
    },
    cancelBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: c.gray100,
      borderWidth: 1,
      borderColor: c.gray200,
      alignItems: 'center',
    },
    cancelTxt: { fontSize: 14, color: c.textSec },
    saveBtn: {
      flex: 2,
      padding: 12,
      borderRadius: 8,
      backgroundColor: c.purple,
      alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveTxt: { fontSize: 14, fontWeight: '600', color: c.white },
  });
}
