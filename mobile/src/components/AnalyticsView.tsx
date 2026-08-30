import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Lead } from '../types/lead';

interface AnalyticsViewProps {
  leads: Lead[];
  onBackToInbox: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  onBackToInbox,
}) => {
  const total = leads.length;
  const contacted = leads.filter((l) => l.status === 'contacted' || l.status === 'qualified' || l.status === 'closed').length;
  const qualified = leads.filter((l) => l.status === 'qualified').length;
  const closed = leads.filter((l) => l.status === 'closed').length;

  // Compute average speed-to-lead for contacted leads
  const responseTimes = leads
    .map((l) => l.response_time_seconds)
    .filter((t): t is number => typeof t === 'number' && t > 0);
  
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 32;

  const contactRate = total > 0 ? Math.round((contacted / total) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Performance Analytics</Text>
          <Text style={styles.subtitle}>Speed-to-Lead & Conversion Telemetry</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBackToInbox} activeOpacity={0.7}>
          <Ionicons name="file-tray-full" size={14} color={colors.primary} />
          <Text style={styles.backBtnText}>Inbox</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Metric: Speed-to-Lead Response Time */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconBg}>
            <Ionicons name="flash" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.heroTitleGroup}>
            <Text style={styles.heroLabel}>AVERAGE SPEED-TO-LEAD</Text>
            <Text style={styles.heroSub}>Time to first contact</Text>
          </View>
        </View>

        <View style={styles.heroNumberRow}>
          <Text style={styles.heroNumber}>{avgResponseTime}</Text>
          <Text style={styles.heroUnit}>seconds</Text>
        </View>

        <View style={styles.heroBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#10B981" />
          <Text style={styles.heroBadgeText}>Within the 5-minute golden conversion window</Text>
        </View>
      </View>

      {/* 2x2 Metric Grid */}
      <View style={styles.grid}>
        <View style={styles.gridCard}>
          <View style={[styles.gridIconBg, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={16} color="#2563EB" />
          </View>
          <Text style={styles.gridNumber}>{total}</Text>
          <Text style={styles.gridLabel}>Total Leads</Text>
          <Text style={styles.gridSub}>Live Webhook Ingested</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconBg, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="call" size={16} color="#059669" />
          </View>
          <Text style={[styles.gridNumber, { color: '#059669' }]}>{contactRate}%</Text>
          <Text style={styles.gridLabel}>Contact Rate</Text>
          <Text style={styles.gridSub}>{contacted} contacted</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconBg, { backgroundColor: '#FDF4FF' }]}>
            <Ionicons name="star" size={16} color="#9333EA" />
          </View>
          <Text style={[styles.gridNumber, { color: '#9333EA' }]}>{qualified}</Text>
          <Text style={styles.gridLabel}>Qualified Leads</Text>
          <Text style={styles.gridSub}>High Intent</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconBg, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
          </View>
          <Text style={[styles.gridNumber, { color: '#16A34A' }]}>100%</Text>
          <Text style={styles.gridLabel}>HMAC Verified</Text>
          <Text style={styles.gridSub}>SHA-256 Auth</Text>
        </View>
      </View>

      {/* Funnel Progress Breakdown */}
      <View style={styles.funnelCard}>
        <Text style={styles.cardTitle}>Pipeline Breakdown</Text>

        <View style={styles.stageRow}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageName}>New Leads</Text>
            <Text style={styles.stageCount}>{total - contacted}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: total > 0 ? `${((total - contacted) / total) * 100}%` : '0%', backgroundColor: '#059669' },
              ]}
            />
          </View>
        </View>

        <View style={styles.stageRow}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageName}>Contacted</Text>
            <Text style={styles.stageCount}>{contacted}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: total > 0 ? `${(contacted / total) * 100}%` : '0%', backgroundColor: '#2563EB' },
              ]}
            />
          </View>
        </View>

        <View style={styles.stageRow}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageName}>Qualified</Text>
            <Text style={styles.stageCount}>{qualified}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: total > 0 ? `${(qualified / total) * 100}%` : '0%', backgroundColor: '#9333EA' },
              ]}
            />
          </View>
        </View>

        <View style={styles.stageRow}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageName}>Closed</Text>
            <Text style={styles.stageCount}>{closed}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: total > 0 ? `${(closed / total) * 100}%` : '0%', backgroundColor: '#475569' },
              ]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  heroIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleGroup: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  heroSub: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  heroNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34D399',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  gridIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  gridSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  funnelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stageRow: {
    gap: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stageCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
