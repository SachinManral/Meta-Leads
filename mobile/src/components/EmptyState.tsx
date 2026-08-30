import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AppMode } from '../types/lead';

interface EmptyStateProps {
  appMode: AppMode;
  onSimulate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ appMode, onSimulate }) => {
  return (
    <View style={styles.container}>
      {/* Minimalist Apple-style Monochrome Icon (NO bright colored circles) */}
      <View style={styles.iconCircle}>
        <Feather name="inbox" size={28} color="#64748B" />
      </View>

      <Text style={styles.title}>Awaiting Inbound Leads</Text>
      <Text style={styles.description}>
        Submissions from Meta Lead Ads forms will appear here in real time via WebSockets with zero manual refresh.
      </Text>

      {/* Clean Minimalist Protocol Card (Neutral, no colored blocks) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="check-circle" size={14} color="#64748B" />
          <Text style={styles.cardTitle}>Live Testing Protocol</Text>
        </View>

        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>1</Text>
          <Text style={styles.stepText}>Open Meta Lead Ads Testing Tool</Text>
        </View>

        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>2</Text>
          <Text style={styles.stepText}>Select your Facebook Page & Lead Form</Text>
        </View>

        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>3</Text>
          <Text style={styles.stepText}>Click &quot;Create Lead&quot; for instant live delivery</Text>
        </View>
      </View>

      {appMode === 'dev' && (
        <TouchableOpacity style={styles.simulateBtn} onPress={onSimulate} activeOpacity={0.8}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.simulateBtnText}>Simulate Test Lead</Text>
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9', // Clean neutral gray circle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
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
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 360,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    width: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 18,
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
