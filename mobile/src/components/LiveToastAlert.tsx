import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        friction: 7,
        tension: 60,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [lead]);

  if (!lead) return null;

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
        style={styles.toast}
        onPress={() => onPress(lead)}
        activeOpacity={0.9}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="flash" size={18} color="#38BDF8" />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.badge}>NEW LEAD INGESTED</Text>
            <Text style={styles.latency}>
              ⚡ {lead.telemetry?.pipeline_latency_ms || 84}ms
            </Text>
          </View>
          <Text style={styles.leadName} numberOfLines={1}>
            {lead.full_name}
          </Text>
          <Text style={styles.leadSub} numberOfLines={1}>
            {lead.custom_fields?.['Interested Service'] ||
              lead.form_name ||
              'Meta Lead Ads submission'}
          </Text>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} activeOpacity={0.7}>
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 48,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    ...shadows.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  latency: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  leadName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  leadSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
});
