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
import { colors } from '../theme/colors';
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

  const getConnectionDotColor = () => {
    switch (status) {
      case 'connected':
        return '#10B981';
      case 'connecting':
        return '#F59E0B';
      case 'disconnected':
      default:
        return '#EF4444';
    }
  };

  const getConnectionText = () => {
    switch (status) {
      case 'connected':
        return 'Live Webhook Ingestion';
      case 'connecting':
        return 'Connecting to Gateway...';
      case 'disconnected':
      default:
        return 'Offline (Tap to Config)';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.metaIconBadge}>
            <Ionicons name="logo-facebook" size={17} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.appTitle}>Meta Leads Inbox</Text>
            <TouchableOpacity
              style={styles.statusRow}
              onPress={onPressStatus}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.statusDot,
                  { backgroundColor: getConnectionDotColor(), opacity: pulseAnim },
                ]}
              />
              <Text style={styles.statusText}>{getConnectionText()}</Text>
            </TouchableOpacity>
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
              {appMode === 'demo' ? 'Demo' : 'Dev'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statsInline}>
          <Text style={styles.statCount}>{totalLeads}</Text>
          <Text style={styles.statLabel}>Total Leads</Text>
          <Text style={styles.statDivider}>·</Text>
          <Text
            style={[
              styles.statCount,
              uncontactedCount > 0 && { color: colors.primary },
            ]}
          >
            {uncontactedCount}
          </Text>
          <Text style={styles.statLabel}>Uncontacted</Text>
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
                  <Ionicons name="add" size={13} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
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
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  statsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statCount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    fontSize: 14,
    color: '#CBD5E1',
    marginHorizontal: 3,
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
    backgroundColor: '#F8FAFC',
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
    gap: 4,
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
