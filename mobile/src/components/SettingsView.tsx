import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { ConnectionStatus } from '../types/lead';

interface SettingsViewProps {
  serverUrl: string;
  connectionStatus: ConnectionStatus;
  onOpenServerConfig: () => void;
  onBackToInbox: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  serverUrl,
  connectionStatus,
  onOpenServerConfig,
  onBackToInbox,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Gateway connection and security status</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBackToInbox} activeOpacity={0.7}>
          <Feather name="arrow-left" size={13} color="#0F172A" />
          <Text style={styles.backBtnText}>Inbox</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="server" size={15} color="#0F172A" />
          <Text style={styles.cardTitle}>Gateway Server Connection</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Endpoint URL</Text>
          <Text style={styles.rowValue} numberOfLines={1}>
            {serverUrl}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Socket Transport</Text>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    connectionStatus === 'connected'
                      ? '#10B981'
                      : connectionStatus === 'connecting'
                      ? '#F59E0B'
                      : '#EF4444',
                },
              ]}
            />
            <Text style={styles.statusPillText}>
              {connectionStatus === 'connected'
                ? 'Connected (Live)'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={onOpenServerConfig} activeOpacity={0.7}>
          <Feather name="edit-2" size={13} color="#0F172A" />
          <Text style={styles.actionBtnText}>Configure Server Address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="logo-facebook" size={16} color="#1877F2" />
          <Text style={styles.cardTitle}>Meta Integration & Security</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Graph API Version</Text>
          <Text style={styles.rowValue}>v19.0 (Leadgen Webhooks)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Payload Signature</Text>
          <View style={styles.verifiedRow}>
            <Feather name="check" size={12} color="#10B981" />
            <Text style={styles.verifiedText}>HMAC-SHA256 Protected</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Deduplication Guard</Text>
          <Text style={styles.rowValue}>Active (LRU Memory Cache)</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="shield" size={15} color="#0F172A" />
          <Text style={styles.cardTitle}>System Architecture</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Architecture</Text>
          <Text style={styles.rowValue}>Node.js + Socket.IO + Expo</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>PoC Deliverable</Text>
          <Text style={styles.rowValue}>Meta Lead Ads Live Sync</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
