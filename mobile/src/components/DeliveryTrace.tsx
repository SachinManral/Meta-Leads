import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeadTelemetry } from '../types/lead';

interface DeliveryTraceProps {
  telemetry?: LeadTelemetry;
}

export const DeliveryTrace: React.FC<DeliveryTraceProps> = ({ telemetry }) => {
  const [step, setStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const latency = telemetry?.pipeline_latency_ms || 64;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Sequential pipeline steps
    const t1 = setTimeout(() => setStep(2), 100);
    const t2 = setTimeout(() => setStep(3), 240);
    const t3 = setTimeout(() => setStep(4), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>LIVE PIPELINE TRACE</Text>
        </View>
        <View style={styles.latencyBadge}>
          <Ionicons name="flash" size={11} color="#059669" />
          <Text style={styles.latencyText}>{latency} ms</Text>
        </View>
      </View>

      <View style={styles.stepsRow}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotDone]}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>
            Meta Event
          </Text>
        </View>

        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 2 && styles.stepDotDone]}>
            {step >= 2 ? (
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepDotText}>2</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>
            HMAC Valid
          </Text>
        </View>

        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 3 && styles.stepDotDone]}>
            {step >= 3 ? (
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepDotText}>3</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>
            Graph API
          </Text>
        </View>

        <View style={[styles.stepLine, step >= 4 && styles.stepLineActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 4 && styles.stepDotDone]}>
            {step >= 4 ? (
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepDotText}>4</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, step >= 4 && styles.stepLabelActive]}>
            Delivered Live
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  latencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 3,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#10B981',
  },
  stepDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: '#047857',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 12,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
});
