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
import { colors } from '../theme/colors';
import { SystemActivityLog } from '../types/lead';

interface ActivityLogViewProps {
  activities: SystemActivityLog[];
  onBackToInbox: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  activities,
  onBackToInbox,
}) => {
  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toTimeString().split(' ')[0];
    } catch {
      return '';
    }
  };

  const getEventBadge = (type: SystemActivityLog['type']): { icon: keyof typeof Ionicons.glyphMap; color: string; label: string } => {
    switch (type) {
      case 'webhook_received':
        return { icon: 'mail', color: '#818CF8', label: 'Webhook' };
      case 'signature_verified':
        return { icon: 'shield-checkmark', color: '#10B981', label: 'HMAC' };
      case 'lead_fetched':
        return { icon: 'cloud-download', color: '#38BDF8', label: 'Graph API' };
      case 'lead_broadcast':
        return { icon: 'flash', color: '#F59E0B', label: 'Broadcast' };
      case 'status_updated':
        return { icon: 'bookmark', color: '#A855F7', label: 'Status' };
      case 'client_connected':
      default:
        return { icon: 'radio-button-on', color: '#64748B', label: 'Client' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Telemetry Log</Text>
          <Text style={styles.subtitle}>Real-time cryptographic pipeline events</Text>
        </View>

        <TouchableOpacity style={styles.inboxBtn} onPress={onBackToInbox} activeOpacity={0.7}>
          <Ionicons name="home" size={14} color={colors.primary} />
          <Text style={styles.inboxBtnText}>Inbox</Text>
        </TouchableOpacity>
      </View>

      {/* Terminal Card */}
      <View style={styles.terminalCard}>
        <View style={styles.terminalHeader}>
          <View style={styles.terminalDots}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.terminalTitle}>gateway-stream.log</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{activities.length} events</Text>
          </View>
        </View>

        <ScrollView
          style={styles.logScroll}
          contentContainerStyle={styles.logContent}
          showsVerticalScrollIndicator={false}
        >
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="terminal" size={28} color="#475569" />
              <Text style={styles.emptyText}>Waiting for system activity...</Text>
              <Text style={styles.emptySub}>
                Trigger a lead to observe real-time cryptographic logs
              </Text>
            </View>
          ) : (
            activities.map((act) => {
              const badge = getEventBadge(act.type);
              return (
                <View key={act.id} style={styles.logItem}>
                  <Text style={styles.logTime}>{formatTimestamp(act.timestamp)}</Text>
                  <View style={[styles.tagPill, { backgroundColor: `${badge.color}22` }]}>
                    <Ionicons name={badge.icon} size={10} color={badge.color} />
                    <Text style={[styles.tagText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <Text style={styles.logMsg}>{act.message}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  inboxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  inboxBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  terminalCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 100, // Clear floating dock
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badgeCount: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
  },
  logScroll: {
    flex: 1,
    padding: 14,
  },
  logContent: {
    gap: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E293B',
  },
  logTime: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logMsg: {
    fontSize: 11,
    color: '#E2E8F0',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
