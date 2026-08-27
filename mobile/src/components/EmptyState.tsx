import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AppMode } from '../types/lead';

interface EmptyStateProps {
  appMode: AppMode;
  onSimulate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ appMode, onSimulate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="mail-unread-outline" size={28} color={colors.primary} />
      </View>

      <Text style={styles.title}>No Leads in Inbox</Text>
      <Text style={styles.description}>
        When a customer submits a Meta Lead Ads form, it will land here automatically via WebSockets in real time.
      </Text>

      <View style={styles.guideBox}>
        <View style={styles.guideHeaderRow}>
          <Ionicons name="information-circle-outline" size={15} color={colors.textPrimary} />
          <Text style={styles.guideHeader}>How to test live sync:</Text>
        </View>
        <Text style={styles.guideStep}>1. Open Meta Lead Ads Testing Tool</Text>
        <Text style={styles.guideStep}>2. Select your Facebook Page & Lead Form</Text>
        <Text style={styles.guideStep}>3. Click &quot;Create Lead&quot;</Text>
      </View>

      {appMode === 'dev' && (
        <TouchableOpacity style={styles.simulateAction} onPress={onSimulate} activeOpacity={0.8}>
          <Ionicons name="flask-outline" size={14} color={colors.primary} />
          <Text style={styles.simulateActionText}>Simulate Test Lead</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 320,
  },
  guideBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    maxWidth: 360,
    gap: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  guideHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guideStep: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  simulateAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simulateActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
