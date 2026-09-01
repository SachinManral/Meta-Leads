import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { SystemActivityLog } from '../types/lead';

interface ActivityLogViewProps {
  activities: SystemActivityLog[];
  onBackToInbox: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  activities,
  onBackToInbox,
}) => {
  const [filter, setFilter] = useState<'all' | 'leads' | 'system'>('all');

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  const getEventDetails = (act: SystemActivityLog) => {
    switch (act.type) {
      case 'webhook_received':
        return {
          icon: 'logo-facebook' as const,
          iconColor: '#1877F2',
          bgColor: '#EFF6FF',
          title: 'Meta Webhook Ingested',
          category: 'leads',
        };
      case 'signature_verified':
        return {
          icon: 'shield-checkmark' as const,
          iconColor: '#10B981',
          bgColor: '#ECFDF5',
          title: 'HMAC-SHA256 Authenticated',
          category: 'system',
        };
      case 'lead_fetched':
        return {
          icon: 'cloud-download' as const,
          iconColor: '#0284C7',
          bgColor: '#F0F9FF',
          title: 'Graph API Data Normalized',
          category: 'leads',
        };
      case 'lead_broadcast':
        return {
          icon: 'flash' as const,
          iconColor: '#F59E0B',
          bgColor: '#FEF3C7',
          title: 'Live Lead Dispatched',
          category: 'leads',
        };
      case 'status_updated':
        return {
          icon: 'bookmark' as const,
          iconColor: '#7C3AED',
          bgColor: '#F5F3FF',
          title: 'Pipeline Status Updated',
          category: 'leads',
        };
      case 'client_connected':
      default:
        return {
          icon: 'phone-portrait-outline' as const,
          iconColor: '#64748B',
          bgColor: '#F1F5F9',
          title: 'Device Connected',
          category: 'system',
        };
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    const details = getEventDetails(act);
    return details.category === filter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activity Stream</Text>
          <Text style={styles.subtitle}>Real-time delivery audit trail</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBackToInbox} activeOpacity={0.7}>
          <Feather name="arrow-left" size={13} color="#0F172A" />
          <Text style={styles.backBtnText}>Inbox</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            All Events ({activities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'leads' && styles.filterChipActive]}
          onPress={() => setFilter('leads')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'leads' && styles.filterChipTextActive]}>
            Lead Deliveries
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'system' && styles.filterChipActive]}
          onPress={() => setFilter('system')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'system' && styles.filterChipTextActive]}>
            Gateway Logs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.timelineScroll}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Feather name="activity" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Activity Recorded Yet</Text>
            <Text style={styles.emptySub}>
              Trigger a test lead or submit a Meta Lead form to view live audit events.
            </Text>
          </View>
        ) : (
          filteredActivities.map((act, index) => {
            const details = getEventDetails(act);
            const isLast = index === filteredActivities.length - 1;

            return (
              <View key={act.id} style={styles.eventRow}>
                <View style={styles.timelineCol}>
                  <View style={[styles.iconCircle, { backgroundColor: details.bgColor }]}>
                    <Ionicons name={details.icon} size={15} color={details.iconColor} />
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.eventCard}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.eventTitle}>{details.title}</Text>
                    <Text style={styles.eventTime}>{formatTimestamp(act.timestamp)}</Text>
                  </View>

                  <Text style={styles.eventMessage} numberOfLines={2}>
                    {act.message}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingBottom: 110, // Clear floating bottom dock
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 74,
  },
  timelineCol: {
    alignItems: 'center',
    width: 32,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eventTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  eventMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
