import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Lead, LeadStatus } from '../types/lead';
import { DeliveryTrace } from './DeliveryTrace';

interface LeadCardProps {
  lead: Lead;
  onPressDetails: (lead: Lead) => void;
  onQuickStatusChange?: (leadId: string, status: LeadStatus) => void;
}

export const LeadCard: React.FC<LeadCardProps> = React.memo(({
  lead,
  onPressDetails,
  onQuickStatusChange,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-16)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const [, setTick] = useState(0);

  // Auto-refresh relative timestamps every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const handleCall = () => {
    if (lead.phone_number && lead.phone_number !== 'N/A') {
      Linking.openURL(`tel:${lead.phone_number}`).catch((err) =>
        console.warn('Cannot open phone dialer', err)
      );
      if (lead.status === 'new') {
        onQuickStatusChange?.(lead.id, 'contacted');
      }
    }
  };

  const handleSms = () => {
    if (lead.phone_number && lead.phone_number !== 'N/A') {
      Linking.openURL(`sms:${lead.phone_number}`).catch((err) =>
        console.warn('Cannot open SMS app', err)
      );
      if (lead.status === 'new') {
        onQuickStatusChange?.(lead.id, 'contacted');
      }
    }
  };

  const handleEmail = () => {
    if (lead.email) {
      Linking.openURL(
        `mailto:${lead.email}?subject=Follow-up on your inquiry`
      ).catch((err) => console.warn('Cannot open mail composer', err));
      if (lead.status === 'new') {
        onQuickStatusChange?.(lead.id, 'contacted');
      }
    }
  };

  const handleCycleStatus = () => {
    const nextStatus: Record<LeadStatus, LeadStatus> = {
      new: 'contacted',
      contacted: 'qualified',
      qualified: 'closed',
      closed: 'new',
    };
    onQuickStatusChange?.(lead.id, nextStatus[lead.status] || 'contacted');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRelativeTime = (timeStr: string) => {
    try {
      const diffMs = Date.now() - new Date(timeStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(timeStr).toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const getStatusBadge = () => {
    switch (lead.status) {
      case 'contacted':
        return { text: 'Contacted', icon: 'checkmark-circle-outline' as const, bg: '#EFF6FF', color: '#2563EB' };
      case 'qualified':
        return { text: 'Qualified', icon: 'star-outline' as const, bg: '#FDF4FF', color: '#9333EA' };
      case 'closed':
        return { text: 'Closed', icon: 'checkmark-done' as const, bg: '#F1F5F9', color: '#475569' };
      case 'new':
      default:
        return { text: 'New Lead', icon: 'radio-button-on' as const, bg: '#ECFDF5', color: '#059669' };
    }
  };

  const statusBadge = getStatusBadge();
  const primaryInterest =
    lead.custom_fields?.['Interested Service'] ||
    lead.custom_fields?.['interested_service'] ||
    lead.custom_fields?.['Service Requested'] ||
    lead.form_name ||
    'Meta Lead Ads Inquiry';

  const budget =
    lead.custom_fields?.['Budget Estimate'] ||
    lead.custom_fields?.['budget'] ||
    lead.custom_fields?.['Budget'];

  const preferredTime =
    lead.custom_fields?.['Preferred Contact Time'] ||
    lead.custom_fields?.['preferred_time'];

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, lead.isNew && styles.cardHighlight]}
        onPress={() => onPressDetails(lead)}
        activeOpacity={0.92}
      >
        {/* Real-time Delivery Trace Header (Active on newly arrived lead) */}
        {lead.showTrace && <DeliveryTrace telemetry={lead.telemetry} />}

        {/* Top Meta Strip: Freshness, Latency & Status Pill */}
        <View style={styles.metaRow}>
          <View style={styles.freshnessGroup}>
            <Feather name="clock" size={12} color={colors.textSecondary} />
            <Text style={styles.timeText}>
              {getRelativeTime(lead.received_at || lead.created_time)}
            </Text>
            {lead.telemetry && (
              <View style={styles.latencyGroup}>
                <Ionicons name="flash" size={11} color={colors.success} />
                <Text style={styles.latencyBadge}>
                  {lead.telemetry.pipeline_latency_ms}ms delivery
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}
            onPress={handleCycleStatus}
            activeOpacity={0.7}
          >
            <Ionicons name={statusBadge.icon} size={11} color={statusBadge.color} />
            <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Header: Avatar, Name & Key Interest */}
        <View style={styles.mainInfoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(lead.full_name)}</Text>
          </View>

          <View style={styles.titleColumn}>
            <View style={styles.nameRow}>
              <Text style={styles.leadName} numberOfLines={1}>
                {lead.full_name}
              </Text>
              {lead.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>LIVE</Text>
                </View>
              )}
            </View>

            <Text style={styles.interestSubtitle} numberOfLines={1}>
              {primaryInterest}
            </Text>
          </View>
        </View>

        {/* Speed to Lead Metric */}
        {lead.response_time_seconds ? (
          <View style={styles.speedToLeadPill}>
            <Ionicons name="flash" size={12} color={colors.primary} />
            <Text style={styles.speedToLeadText}>
              Speed-to-Lead: Contacted in {lead.response_time_seconds}s
            </Text>
          </View>
        ) : null}

        {/* Qualification Summary Card */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryLabelGroup}>
              <Feather name="phone" size={11} color={colors.textSecondary} />
              <Text style={styles.summaryLabel}>Phone</Text>
            </View>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {lead.phone_number}
            </Text>
          </View>

          {budget && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelGroup}>
                <Feather name="dollar-sign" size={11} color={colors.textSecondary} />
                <Text style={styles.summaryLabel}>Budget</Text>
              </View>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {budget}
              </Text>
            </View>
          )}

          {preferredTime && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelGroup}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <Text style={styles.summaryLabel}>Preferred</Text>
              </View>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {preferredTime}
              </Text>
            </View>
          )}

          {(lead as Lead).notes ? (
            <View style={styles.notesPreview}>
              <Feather name="edit-3" size={11} color="#B45309" />
              <Text style={styles.notesValue} numberOfLines={1}>
                {(lead as Lead).notes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Quick Action Button Bar: Call, SMS, Email, Details */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.7}>
            <Ionicons name="call" size={13} color={colors.primary} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smsButton} onPress={handleSms} activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses" size={13} color="#059669" />
            <Text style={styles.smsButtonText}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={handleEmail} activeOpacity={0.7}>
            <Ionicons name="mail" size={13} color={colors.textPrimary} />
            <Text style={styles.emailButtonText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => onPressDetails(lead)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsText}>View</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHighlight: {
    borderColor: colors.success,
    borderWidth: 1.5,
    backgroundColor: '#FAFCFA',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  freshnessGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  latencyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 4,
  },
  latencyBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  titleColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  newBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  interestSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  speedToLeadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  speedToLeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  summarySection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: '65%',
  },
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  notesValue: {
    fontSize: 11,
    color: '#78350F',
    flex: 1,
    fontWeight: '500',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  callButton: {
    flex: 1.1,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  smsButton: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emailButton: {
    flex: 1.1,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
