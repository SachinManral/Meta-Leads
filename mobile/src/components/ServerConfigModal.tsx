import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { ConnectionStatus } from '../types/lead';

interface ServerConfigModalProps {
  visible: boolean;
  currentUrl: string;
  status: ConnectionStatus;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  currentUrl,
  status,
  onClose,
  onSave,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);

  const presets = [
    { label: 'Cloudflare Live Tunnel', url: 'https://feet-procedure-figure-ordering.trycloudflare.com' },
    { label: 'This PC (Wi-Fi LAN)', url: 'http://10.10.167.97:4000' },
    { label: 'Localhost (Web/iOS)', url: 'http://localhost:4000' },
    { label: 'Android Emulator', url: 'http://10.0.2.2:4000' },
  ];

  const handleSave = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onSave(trimmed);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Title */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Backend Connection Setup</Text>
                <Text style={styles.subtitle}>Configure WebSocket & API Server URL</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            <View style={styles.body}>
              <Text style={styles.inputLabel}>Server Base URL</Text>
              <TextInput
                style={styles.textInput}
                value={urlInput}
                onChangeText={setUrlInput}
                placeholder="http://192.168.1.X:4000"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {/* Quick Preset Buttons */}
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <View style={styles.presetGroup}>
                {presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.url}
                    style={[
                      styles.presetButton,
                      urlInput === preset.url && styles.presetButtonActive,
                    ]}
                    onPress={() => setUrlInput(preset.url)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        urlInput === preset.url && styles.presetButtonTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.helperBox}>
                <View style={styles.helperHeaderRow}>
                  <Feather name="info" size={13} color="#64748B" />
                  <Text style={styles.helperTitle}>Physical Device Setup</Text>
                </View>
                <Text style={styles.helperText}>
                  Connect to your computer's local Wi-Fi IP (e.g. http://192.168.1.4:4000) or an active Ngrok tunnel.
                </Text>
              </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Connect & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  body: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  presetGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetButtonTextActive: {
    color: colors.primary,
  },
  helperBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  helperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  helperTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helperText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    ...shadows.sm,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
