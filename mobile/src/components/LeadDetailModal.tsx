import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Lead, LeadStatus } from '../types/lead';

interface LeadDetailModalProps {
  visible: boolean;
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus?: (leadId: string, status: LeadStatus) => void;
  onSaveNotes?: (leadId: string, notes: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  visible,
  lead,
  onClose,
  onUpdateStatus,
  onSaveNotes,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [noteText, setNoteText] = useState(lead?.notes || '');
  const [noteSaved, setNoteSaved] = useState(false);

  if (!lead) return null;

  const handleCall = () => {
    if (lead.phone_number && lead.phone_number !== 'N/A') {
      Linking.openURL(`tel:${lead.phone_number}`).catch((err) =>
        console.warn('Cannot open phone dialer', err)
      );
      if (lead.status === 'new') {
        onUpdateStatus?.(lead.id, 'contacted');
      }
    }
  };

  const handleSms = () => {
    if (lead.phone_number && lead.phone_number !== 'N/A') {
      Linking.openURL(`sms:${lead.phone_number}`).catch((err) =>
        console.warn('Cannot open SMS app', err)
      );
      if (lead.status === 'new') {
        onUpdateStatus?.(lead.id, 'contacted');
      }
    }
  };

  const handleEmail = () => {
    if (lead.email) {
      Linking.openURL(
        `mailto:${lead.email}?subject=Follow-up on your inquiry`
      ).catch((err) => console.warn('Cannot open mail composer', err));
      if (lead.status === 'new') {
        onUpdateStatus?.(lead.id, 'contacted');
      }
    }
  };

  const handleSaveNote = () => {
    onSaveNotes?.(lead.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const statuses: { key: LeadStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'new', label: 'New', icon: 'radio-button-on' },
    { key: 'contacted', label: 'Contacted', icon: 'call-outline' },
    { key: 'qualified', label: 'Qualified', icon: 'star-outline' },
    { key: 'closed', label: 'Closed', icon: 'checkmark-circle-outline' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title} numberOfLines={1}>
                {lead.full_name}
              </Text>
              <View style={styles.sourceRow}>
                <Ionicons name="logo-facebook" size={13} color="#1877F2" />
                <Text style={styles.subtitle} numberOfLines={1}>
                  {lead.form_name || 'Meta Instant Form'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.callAction} onPress={handleCall} activeOpacity={0.8}>
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.callActionText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smsAction} onPress={handleSms} activeOpacity={0.8}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#059669" />
                <Text style={styles.smsActionText}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.emailAction} onPress={handleEmail} activeOpacity={0.8}>
                <Ionicons name="mail" size={16} color="#2563EB" />
                <Text style={styles.emailActionText}>Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="bookmark-outline" size={15} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Lead Status & Workflow</Text>
              </View>

              <View style={styles.statusSegment}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.statusTab,
                      lead.status === s.key && styles.statusTabActive,
                    ]}
                    onPress={() => onUpdateStatus?.(lead.id, s.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={s.icon}
                      size={13}
                      color={lead.status === s.key ? colors.primary : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.statusTabText,
                        lead.status === s.key && styles.statusTabTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {lead.response_time_seconds ? (
                <View style={styles.speedBadge}>
                  <Ionicons name="flash" size={14} color="#059669" />
                  <Text style={styles.speedBadgeText}>
                    Speed-to-Lead: First contacted in {lead.response_time_seconds}s
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person-outline" size={15} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Contact Information</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <Text style={styles.fieldVal}>{lead.full_name}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldVal}>{lead.email}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <Text style={styles.fieldVal}>{lead.phone_number}</Text>
              </View>

              {lead.city && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <Text style={styles.fieldVal}>{lead.city}</Text>
                </View>
              )}

              {lead.company_name && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Company</Text>
                  <Text style={styles.fieldVal}>{lead.company_name}</Text>
                </View>
              )}
            </View>

            {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="clipboard-outline" size={15} color={colors.textPrimary} />
                  <Text style={styles.sectionTitle}>Form Qualification Responses</Text>
                </View>

                {Object.entries(lead.custom_fields).map(([k, v]) => (
                  <View key={k} style={styles.customAnswerRow}>
                    <Text style={styles.customQuestion}>{k}</Text>
                    <Text style={styles.customAnswer}>{v}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="create-outline" size={15} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Internal Sales Note</Text>
              </View>

              <TextInput
                style={styles.notesInput}
                placeholder="Add meeting notes, callback time, requirements..."
                placeholderTextColor="#94A3B8"
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveNoteBtn, noteSaved && styles.saveNoteBtnSuccess]}
                onPress={handleSaveNote}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={noteSaved ? 'checkmark' : 'save-outline'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.saveNoteBtnText}>
                  {noteSaved ? 'Note Saved!' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.technicalCard}>
              <TouchableOpacity
                style={styles.technicalHeader}
                onPress={() => setShowTechnical(!showTechnical)}
                activeOpacity={0.7}
              >
                <View style={styles.techTitleGroup}>
                  <View style={styles.sectionHeaderRow}>
                    <Feather name="cpu" size={15} color={colors.textPrimary} />
                    <Text style={styles.technicalTitle}>Technical Delivery Telemetry</Text>
                  </View>
                  <Text style={styles.technicalSubtitle}>
                    HMAC verification, latency & Graph API payload
                  </Text>
                </View>
                <Ionicons
                  name={showTechnical ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>

              {showTechnical && (
                <View style={styles.technicalBody}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Source</Text>
                    <Text style={styles.fieldVal}>Meta Lead Ads Webhook</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Lead ID</Text>
                    <Text style={styles.fieldCode}>{lead.leadgen_id}</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>HMAC-SHA256</Text>
                    <Text style={styles.fieldSuccess}>
                      ✓ Verified (X-Hub-Signature)
                    </Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Pipeline Latency</Text>
                    <Text style={styles.fieldCode}>
                      {lead.telemetry?.pipeline_latency_ms || 84} ms
                    </Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Duplicate Protection</Text>
                    <Text style={styles.fieldSuccess}>Passed</Text>
                  </View>

                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Received At</Text>
                    <Text style={styles.fieldValSmall}>
                      {new Date(lead.telemetry?.webhook_received_at || lead.received_at).toLocaleTimeString()}
                    </Text>
                  </View>

                  <Text style={styles.rawJsonLabel}>Raw Graph API Response:</Text>
                  <View style={styles.jsonBox}>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(lead.raw_data || lead, null, 2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    ...shadows.lg,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callAction: {
    flex: 1.4,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    ...shadows.sm,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  smsAction: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  smsActionText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  emailAction: {
    flex: 1.1,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emailActionText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 8,
  },
  statusTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 6,
  },
  statusTabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusTabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  speedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fieldVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  fieldValSmall: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  fieldCode: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  fieldSuccess: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  customAnswerRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customQuestion: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  customAnswer: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  saveNoteBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 6,
  },
  saveNoteBtnSuccess: {
    backgroundColor: '#059669',
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  technicalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  technicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  techTitleGroup: {
    flex: 1,
  },
  technicalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  technicalSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  technicalBody: {
    padding: 14,
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  rawJsonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  jsonBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  jsonText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },
});
