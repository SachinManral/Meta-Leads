import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SystemActivityLog } from '../types/lead';

interface SystemActivityDrawerProps {
  activities: SystemActivityLog[];
}

export const SystemActivityDrawer: React.FC<SystemActivityDrawerProps> = ({
  activities,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toTimeString().split(' ')[0];
    } catch {
      return '';
    }
  };

  const getEventBadge = (type: SystemActivityLog['type']): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case 'webhook_received':
        return { icon: 'mail-outline', color: '#818CF8' };
      case 'signature_verified':
        return { icon: 'shield-checkmark-outline', color: '#34D399' };
      case 'lead_fetched':
        return { icon: 'cloud-download-outline', color: '#38BDF8' };
      case 'lead_broadcast':
        return { icon: 'flash-outline', color: '#10B981' };
      case 'status_updated':
        return { icon: 'bookmark-outline', color: '#FBBF24' };
      case 'client_connected':
      default:
        return { icon: 'radio-button-on', color: '#94A3B8' };
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerBar}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Feather name="terminal" size={13} color="#38BDF8" />
          <Text style={styles.headerTitle}>System Activity Stream</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{activities.length}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.chevronText}>{expanded ? 'Hide' : 'View Log'}</Text>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-up'}
            size={13}
            color="#38BDF8"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.drawerContent}>
          <ScrollView
            style={styles.logList}
            contentContainerStyle={styles.logListContent}
            nestedScrollEnabled
          >
            {activities.length === 0 ? (
              <Text style={styles.emptyText}>Waiting for system events...</Text>
            ) : (
              activities.map((act) => {
                const badge = getEventBadge(act.type);
                return (
                  <View key={act.id} style={styles.logItem}>
                    <Text style={styles.logTime}>{formatTimestamp(act.timestamp)}</Text>
                    <Ionicons name={badge.icon} size={12} color={badge.color} />
                    <Text style={styles.logMessage} numberOfLines={2}>
                      {act.message}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  countBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chevronText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  drawerContent: {
    maxHeight: 180,
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  logList: {
    paddingHorizontal: 16,
  },
  logListContent: {
    paddingVertical: 8,
    gap: 6,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logTime: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logMessage: {
    fontSize: 11,
    color: '#CBD5E1',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
