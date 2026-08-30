import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BottomTabKey = 'inbox' | 'grid' | 'analytics' | 'settings';

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
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    badge?: number;
  }[] = [
    {
      key: 'inbox',
      icon: 'home-outline',
      activeIcon: 'home',
      badge: uncontactedBadgeCount,
    },
    {
      key: 'grid',
      icon: 'grid-outline',
      activeIcon: 'grid',
    },
    {
      key: 'analytics',
      icon: 'bar-chart-outline',
      activeIcon: 'bar-chart',
    },
    {
      key: 'settings',
      icon: 'person-outline',
      activeIcon: 'person',
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
              icon={isActive ? tab.activeIcon : tab.icon}
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
        toValue: 0.84,
        duration: 60,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.iconBase,
          isActive && styles.iconActiveCircle,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={icon}
          size={isActive ? 22 : 21}
          color={isActive ? '#0F172A' : 'rgba(255, 255, 255, 0.7)'}
        />

        {/* Live Badge Dot for Inbound Leads */}
        {!isActive && badge !== undefined && badge > 0 && (
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
    bottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  floatingDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '92%',
    maxWidth: 390,
    height: 68,
    borderRadius: 34,
    // Transparent Frosted Glass effect
    backgroundColor: Platform.select({
      ios: 'rgba(15, 23, 42, 0.75)',
      android: 'rgba(15, 23, 42, 0.82)',
      web: 'rgba(15, 23, 42, 0.76)',
    }),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.35,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconBase: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconActiveCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF', // High-contrast White circular highlight
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
});
