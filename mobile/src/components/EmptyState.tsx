import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { AppMode } from '../types/lead';

interface EmptyStateProps {
  appMode: AppMode;
  onSimulate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ appMode, onSimulate }) => {
  return (
    <View style={styles.container}>
      {/* Warm Pastel Hero Circle */}
      <View style={styles.heroCircle}>
        <View style={styles.innerCircle}>
          <Ionicons name="sparkles" size={24} color="#D97706" />
        </View>
      </View>

      <Text style={styles.title}>Your Live Inbox is Ready</Text>
      <Text style={styles.description}>
        When a prospect submits a Meta Lead Ads form, it will land here instantly with zero user touch.
      </Text>

      {/* Guide Card with Pastel Border */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flash-outline" size={15} color={colors.primary} />
          <Text style={styles.cardTitle}>Live Testing Protocol</Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <Text style={styles.stepText}>Open Meta Lead Ads Testing Tool</Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <Text style={styles.stepText}>Select your Page & Lead Ad Form</Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <Text style={styles.stepText}>Click &quot;Create Lead&quot; $\rightarrow$ Live Sync in &lt;100ms</Text>
        </View>
      </View>

      {appMode === 'dev' && (
        <TouchableOpacity style={styles.simulateBtn} onPress={onSimulate} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={16} color="#FFFFFF" />
          <Text style={styles.simulateBtnText}>Simulate Inbound Lead</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  heroCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7', // Warm sunny amber pastel from reference
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.sm,
  },
  innerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    maxWidth: 320,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    maxWidth: 360,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  stepText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 18,
    ...shadows.sm,
  },
  simulateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
