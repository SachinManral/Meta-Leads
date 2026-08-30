import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { colors } from './src/theme/colors';
import { useRealtimeLeads } from './src/hooks/useRealtimeLeads';
import { Header } from './src/components/Header';
import { LeadCard } from './src/components/LeadCard';
import { LeadDetailModal } from './src/components/LeadDetailModal';
import { ServerConfigModal } from './src/components/ServerConfigModal';
import { SystemActivityDrawer } from './src/components/SystemActivityDrawer';
import { LiveToastAlert } from './src/components/LiveToastAlert';
import { EmptyState } from './src/components/EmptyState';
import { BottomTabBar, BottomTabKey } from './src/components/BottomTabBar';
import { AnalyticsView } from './src/components/AnalyticsView';
import { Lead, LeadStatus } from './src/types/lead';

export default function App() {
  const {
    leads,
    connectionStatus,
    serverUrl,
    setServerUrl,
    latestLead,
    dismissLatestLead,
    activities,
    appMode,
    setAppMode,
    updateLeadStatus,
    updateLeadNotes,
    triggerMockLead,
    clearLeads,
  } = useRealtimeLeads();

  const [activeTab, setActiveTab] = useState<BottomTabKey>('inbox');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [activityDrawerExpanded, setActivityDrawerExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const uncontactedCount = leads.filter((l) => l.status === 'new').length;

  const handleOpenDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedLead(null);
  };

  const handleUpdateStatus = (leadId: string, status: LeadStatus) => {
    updateLeadStatus(leadId, status);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleSaveNotes = (leadId: string, notes: string) => {
    updateLeadNotes(leadId, notes);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      await triggerMockLead();
    } catch (error: unknown) {
      Alert.alert(
        'Backend Connection Error',
        `Make sure backend server is running on ${serverUrl}`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleAppMode = () => {
    setAppMode((prev) => (prev === 'demo' ? 'dev' : 'demo'));
  };

  const handleSelectTab = (tab: BottomTabKey) => {
    if (tab === 'settings') {
      setServerModalVisible(true);
    } else if (tab === 'activity') {
      setActiveTab('inbox');
      setActivityDrawerExpanded((prev) => !prev);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        {/* Floating Live Arrival Toast Banner */}
        <LiveToastAlert
          lead={latestLead}
          onPress={handleOpenDetails}
          onDismiss={dismissLatestLead}
        />

        {/* Dynamic Content: Inbox vs Analytics */}
        {activeTab === 'analytics' ? (
          <AnalyticsView
            leads={leads}
            onBackToInbox={() => setActiveTab('inbox')}
          />
        ) : (
          <>
            {/* Top Header */}
            <Header
              status={connectionStatus}
              totalLeads={leads.length}
              uncontactedCount={uncontactedCount}
              appMode={appMode}
              onToggleAppMode={toggleAppMode}
              onSimulate={handleSimulate}
              onClear={clearLeads}
              onPressStatus={() => setServerModalVisible(true)}
              isSimulating={isSimulating}
            />

            {/* Real-time Lead Inbox Stream */}
            <FlatList
              data={leads}
              keyExtractor={(item) => item.id || item.leadgen_id}
              renderItem={({ item }) => (
                <LeadCard
                  lead={item}
                  onPressDetails={handleOpenDetails}
                  onQuickStatusChange={handleUpdateStatus}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState appMode={appMode} onSimulate={handleSimulate} />
              }
            />

            {/* Collapsible System Activity Log Stream */}
            <SystemActivityDrawer
              activities={activities}
              isExpanded={activityDrawerExpanded}
              onToggleExpanded={() => setActivityDrawerExpanded((prev) => !prev)}
            />
          </>
        )}

        {/* Sleek iOS Bottom Tab Bar (Only original vector icons, no text labels) */}
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          uncontactedBadgeCount={uncontactedCount}
        />

        {/* Lead Detail & Technical Inspector Modal */}
        <LeadDetailModal
          visible={modalVisible}
          lead={selectedLead}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          onSaveNotes={handleSaveNotes}
        />

        {/* Server Connection Config Modal */}
        <ServerConfigModal
          visible={serverModalVisible}
          currentUrl={serverUrl}
          status={connectionStatus}
          onClose={() => setServerModalVisible(false)}
          onSave={(newUrl: string) => setServerUrl(newUrl)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 110,
    flexGrow: 1,
  },
});
