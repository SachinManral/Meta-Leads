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
  const tabs: { key: BottomTabKey; iconActive: keyof typeof Ionicons.glyphMap; iconInactive: keyof typeof Ionicons.glyphMap; badge?: number }[] = [
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
    <View style={styles.wrapper}>
      <View style={styles.container}>
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
        toValue: 0.85,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
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
          styles.iconContainer,
          isActive && styles.iconContainerActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? colors.primary : '#94A3B8'}
        />

        {/* Small Active Glow Dot directly below the icon */}
        {isActive && <View style={styles.activeDot} />}

        {/* Dynamic Uncontacted Badge Count */}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badgePill}>
            <View style={styles.badgeInnerDot} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    height: 48,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: '#F0F7FF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  badgePill: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeInnerDot: {
    flex: 1,
  },
});
