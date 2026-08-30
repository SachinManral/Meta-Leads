import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  View,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Lead } from '../types/lead';

interface LiveToastAlertProps {
  lead: Lead | null;
  onPress: (lead: Lead) => void;
  onDismiss: () => void;
}

export const LiveToastAlert: React.FC<LiveToastAlertProps> = ({
  lead,
  onPress,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (lead) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 70,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [lead]);

  if (!lead) return null;

  const latency = lead.telemetry?.pipeline_latency_ms || 45;
  const service =
    lead.custom_fields?.['Interested Service'] ||
    lead.custom_fields?.['interested_service'] ||
    lead.form_name ||
    'Meta Lead Inquiry';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastCard}
        onPress={() => onPress(lead)}
        activeOpacity={0.92}
      >
        {/* Left: Meta App Icon with Glowing Green Dot */}
        <View style={styles.appIconWrapper}>
          <View style={styles.appIcon}>
            <Ionicons name="logo-facebook" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.livePulseDot} />
        </View>

        {/* Center: Push Notification Content */}
        <View style={styles.contentColumn}>
          <View style={styles.appMetaRow}>
            <Text style={styles.appMetaText}>META LEAD ADS</Text>
            <Text style={styles.appMetaDivider}>·</Text>
            <Text style={styles.appMetaTime}>Just now</Text>
          </View>

          <Text style={styles.leadTitle} numberOfLines={1}>
            {lead.full_name}
          </Text>

          <Text style={styles.leadSubtitle} numberOfLines={1}>
            {service}
          </Text>
        </View>

        {/* Right: Latency Badge & Dismiss Button */}
        <View style={styles.rightActions}>
          <View style={styles.latencyPill}>
            <Ionicons name="flash" size={10} color="#10B981" />
            <Text style={styles.latencyText}>{latency}ms</Text>
          </View>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 14 : 10,
    left: 12,
    right: 12,
    zIndex: 99999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.95)',
      android: 'rgba(255, 255, 255, 0.98)',
      web: 'rgba(255, 255, 255, 0.94)',
    }),
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
      web: {
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      },
    }),
  },
  appIconWrapper: {
    position: 'relative',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentColumn: {
    flex: 1,
    gap: 1,
  },
  appMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appMetaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  appMetaDivider: {
    fontSize: 9,
    color: '#94A3B8',
  },
  appMetaTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  leadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  leadSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  latencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  latencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  dismissBtn: {
    padding: 2,
  },
});
