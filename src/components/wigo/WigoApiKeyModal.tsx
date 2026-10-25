import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { KeyRound, X, Check } from 'lucide-react-native';

interface WigoApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
}

export function WigoApiKeyModal({
  visible,
  onClose,
  onSaveKey,
}: WigoApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState('');

  if (!visible) return null;

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    onSaveKey(trimmed);
    setKeyInput('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.container}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <KeyRound size={16} color="#ff5e00" strokeWidth={2.4} />
                  </View>
                  <View>
                    <Text style={styles.title}>Gemini Vision API Key</Text>
                    <Text style={styles.subtitle}>Required to OCR & parse receipts</Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                >
                  <X size={16} color="#9DA1A8" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={styles.body}>
                <Text style={styles.description}>
                  Enter your Google Gemini API key to enable AI receipt intake. You can also configure{' '}
                  <Text style={styles.codeSnippet}>EXPO_PUBLIC_GEMINI_API_KEY</Text> in your `.env` file.
                </Text>

                <View style={styles.inputBox}>
                  <TextInput
                    value={keyInput}
                    onChangeText={setKeyInput}
                    placeholder="AIzaSy..."
                    placeholderTextColor="#686D76"
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                </View>

                <Text style={styles.hintText}>
                  Get a key at Google AI Studio: https://aistudio.google.com/
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSave}
                  disabled={!keyInput.trim()}
                  style={[
                    styles.saveBtn,
                    !keyInput.trim() && styles.saveBtnDisabled,
                  ]}
                >
                  <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.saveBtnText}>Save Key</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#141518',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26282E',
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.25)',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Geist, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 11,
    color: '#8A8F98',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E2025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 10,
  },
  description: {
    fontSize: 12,
    color: '#A0A4AE',
    lineHeight: 17,
  },
  codeSnippet: {
    color: '#ff5e00',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  inputBox: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1B1C21',
    borderWidth: 1,
    borderColor: '#2C2E36',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  hintText: {
    fontSize: 10,
    color: '#6E737D',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E2025',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0A4AE',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#ff5e00',
  },
  saveBtnDisabled: {
    backgroundColor: '#353840',
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
