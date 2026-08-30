import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type BottomTabKey = 'inbox' | 'analytics' | 'activity' | 'settings';

interface BottomTabBarProps {
  activeTab: BottomTabKey;
  onSelectTab: (tab: BottomTabKey) => void;
  uncontactedBadgeCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  uncontactedBadgeCount = 0,
}) => {
  const tabs: {
    key: BottomTabKey;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
    badge?: number;
  }[] = [
    {
      key: 'inbox',
      iconActive: 'file-tray-full',
      iconInactive: 'file-tray-full-outline',
      badge: uncontactedBadgeCount,
    },
    {
      key: 'analytics',
      iconActive: 'stats-chart',
      iconInactive: 'stats-chart-outline',
    },
    {
      key: 'activity',
      iconActive: 'pulse',
      iconInactive: 'pulse-outline',
    },
    {
      key: 'settings',
      iconActive: 'settings',
      iconInactive: 'settings-outline',
    },
  ];

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.floatingDock}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TabItem
              key={tab.key}
              icon={isActive ? tab.iconActive : tab.iconInactive}
              isActive={isActive}
              badge={tab.badge}
              onPress={() => onSelectTab(tab.key)}
            />
          );
        })}
      </View>
    </View>
  );
};

interface TabItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  badge?: number;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ icon, isActive, badge, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconPill,
          isActive && styles.iconPillActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={isActive ? colors.primary : '#64748B'}
        />

        {/* Small Active Dot indicator beneath icon */}
        {isActive && <View style={styles.activeDot} />}

        {/* Uncontacted Badge */}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badgeDot} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 26 : 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  floatingDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    maxWidth: 380,
    height: 62,
    borderRadius: 31,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.84)',
      android: 'rgba(255, 255, 255, 0.94)',
      web: 'rgba(255, 255, 255, 0.88)',
    }),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 22,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconPill: {
    width: 48,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconPillActive: {
    backgroundColor: '#EFF6FF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
});
