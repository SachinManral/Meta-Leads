import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { colors } from './src/theme/colors';
import { useRealtimeLeads } from './src/hooks/useRealtimeLeads';
import { Header } from './src/components/Header';
import { SearchFilterBar, FilterStatus } from './src/components/SearchFilterBar';
import { LeadCard } from './src/components/LeadCard';
import { LeadDetailModal } from './src/components/LeadDetailModal';
import { ServerConfigModal } from './src/components/ServerConfigModal';
import { LiveToastAlert } from './src/components/LiveToastAlert';
import { EmptyState } from './src/components/EmptyState';
import { BottomTabBar, BottomTabKey } from './src/components/BottomTabBar';
import { AnalyticsView } from './src/components/AnalyticsView';
import { ActivityLogView } from './src/components/ActivityLogView';
import { SettingsView } from './src/components/SettingsView';
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
    isRefreshing,
    refreshLeads,
    updateLeadStatus,
    updateLeadNotes,
    triggerMockLead,
    clearLeads,
  } = useRealtimeLeads();

  const [activeTab, setActiveTab] = useState<BottomTabKey>('inbox');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

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
    setActiveTab(tab);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Status filter
      if (selectedFilter !== 'all' && l.status !== selectedFilter) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = l.full_name?.toLowerCase().includes(q);
        const emailMatch = l.email?.toLowerCase().includes(q);
        const phoneMatch = l.phone_number?.toLowerCase().includes(q);
        const companyMatch = l.company_name?.toLowerCase().includes(q);
        const formMatch = l.form_name?.toLowerCase().includes(q);
        const serviceMatch = l.custom_fields && Object.values(l.custom_fields).some((v) => v.toLowerCase().includes(q));
        return nameMatch || emailMatch || phoneMatch || companyMatch || formMatch || serviceMatch;
      }
      return true;
    });
  }, [leads, selectedFilter, searchQuery]);

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

        {/* Dynamic Content Views */}
        {activeTab === 'analytics' ? (
          <AnalyticsView
            leads={leads}
            onBackToInbox={() => setActiveTab('inbox')}
          />
        ) : activeTab === 'grid' ? (
          <ActivityLogView
            activities={activities}
            onBackToInbox={() => setActiveTab('inbox')}
          />
        ) : activeTab === 'settings' ? (
          <SettingsView
            serverUrl={serverUrl}
            connectionStatus={connectionStatus}
            onOpenServerConfig={() => setServerModalVisible(true)}
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

            {/* Instant Search & Status Filter Chips */}
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              leads={leads}
            />

            {/* Real-time Lead Inbox Stream */}
            <FlatList
              data={filteredLeads}
              keyExtractor={(item) => item.id || item.leadgen_id}
              renderItem={({ item }) => (
                <LeadCard
                  lead={item}
                  onPressDetails={handleOpenDetails}
                  onQuickStatusChange={handleUpdateStatus}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refreshLeads}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState appMode={appMode} onSimulate={handleSimulate} />
              }
            />
          </>
        )}

        {/* High-End Floating iOS Transparent Glass Capsule Dock */}
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
