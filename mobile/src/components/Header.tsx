import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { ConnectionStatus, AppMode } from '../types/lead';

interface HeaderProps {
  status: ConnectionStatus;
  totalLeads: number;
  uncontactedCount: number;
  appMode: AppMode;
  onToggleAppMode: () => void;
  onSimulate: () => void;
  onClear: () => void;
  onPressStatus?: () => void;
  isSimulating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  totalLeads,
  uncontactedCount,
  appMode,
  onToggleAppMode,
  onSimulate,
  onClear,
  onPressStatus,
  isSimulating = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const getConnectionConfig = () => {
    switch (status) {
      case 'connected':
        return {
          pillBg: '#ECFDF5',
          dotBg: '#10B981',
          mainText: 'LIVE',
          subText: 'Receiving leads automatically',
          textColor: '#047857',
        };
      case 'connecting':
        return {
          pillBg: '#FFFBEB',
          dotBg: '#F59E0B',
          mainText: 'RECONNECTING',
          subText: 'Restoring live connection...',
          textColor: '#B45309',
        };
      case 'disconnected':
      default:
        return {
          pillBg: '#FEF2F2',
          dotBg: '#EF4444',
          mainText: 'OFFLINE',
          subText: 'Tap to configure server',
          textColor: '#B91C1C',
        };
    }
  };

  const conn = getConnectionConfig();

  return (
    <View style={styles.container}>
      {/* Top Header Row: Brand & Settings / Mode Switcher */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.metaIconBadge}>
            <Ionicons name="logo-facebook" size={17} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.appTitle}>Meta Leads Inbox</Text>
            <Text style={styles.subtitle}>Real-time Lead Ingestion</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.modeBadge}
            onPress={onToggleAppMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={appMode === 'demo' ? 'sparkles' : 'code-slash'}
              size={12}
              color="#475569"
            />
            <Text style={styles.modeBadgeText}>
              {appMode === 'demo' ? 'Demo Mode' : 'Dev Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Connection Status Banner */}
      <TouchableOpacity
        style={[styles.connectionBanner, { backgroundColor: conn.pillBg }]}
        onPress={onPressStatus}
        activeOpacity={0.8}
      >
        <View style={styles.connectionLeft}>
          <Animated.View
            style={[
              styles.connectionDot,
              { backgroundColor: conn.dotBg, opacity: pulseAnim },
            ]}
          />
          <View>
            <Text style={[styles.connectionMainText, { color: conn.textColor }]}>
              {conn.mainText}
            </Text>
            <Text style={styles.connectionSubText}>{conn.subText}</Text>
          </View>
        </View>

        <Ionicons name="settings-sharp" size={14} color={conn.textColor} />
      </TouchableOpacity>

      {/* Stats and Operational Action Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statsGroup}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalLeads}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                uncontactedCount > 0 && { color: colors.primary },
              ]}
            >
              {uncontactedCount}
            </Text>
            <Text style={styles.statLabel}>Uncontacted</Text>
          </View>
        </View>

        <View style={styles.controlsGroup}>
          {totalLeads > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.7}>
              <Feather name="trash-2" size={12} color="#64748B" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}

          {appMode === 'dev' && (
            <TouchableOpacity
              style={[styles.simulateBtn, isSimulating && styles.btnDisabled]}
              onPress={onSimulate}
              disabled={isSimulating}
              activeOpacity={0.8}
            >
              {isSimulating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={styles.simulateBtnText}>Simulate</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  connectionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionMainText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  connectionSubText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  simulateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
