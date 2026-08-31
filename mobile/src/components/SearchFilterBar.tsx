import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Lead, LeadStatus } from '../types/lead';

export type FilterStatus = 'all' | LeadStatus;

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  leads: Lead[];
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  leads,
}) => {
  const counts: Record<FilterStatus, number> = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    closed: leads.filter((l) => l.status === 'closed').length,
  };

  const filterOptions: { key: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'layers-outline' },
    { key: 'new', label: 'New', icon: 'radio-button-on' },
    { key: 'contacted', label: 'Contacted', icon: 'checkmark-circle-outline' },
    { key: 'qualified', label: 'Qualified', icon: 'star-outline' },
    { key: 'closed', label: 'Closed', icon: 'checkmark-done' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Feather name="search" size={15} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search name, phone, email, service..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={14} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.key;
          const count = counts[opt.key];

          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => onSelectFilter(opt.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={12}
                color={isActive ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    isActive && styles.countBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 2,
  },
  filterScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 16,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  countBadgeTextActive: {
    color: '#FFFFFF',
  },
});
