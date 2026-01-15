import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const AssetCard = ({ asset, onPress, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleToggle = () => {
    const toValue = isExpanded ? 0 : 180;
    setIsExpanded(!isExpanded);

    rotation.value = withSpring(toValue, {
      damping: 15,
      stiffness: 100,
    });

    if (onPress) {
      onPress(asset);
    }
  };

  // Get icon based on asset type
  const getAssetIcon = (type) => {
    const iconMap = {
      laptop: '💻',
      mobile: '📱',
      server: '🖥️',
      tablet: '📱',
      peripheral: '⌨️',
      default: '📦',
    };
    return iconMap[type?.toLowerCase()] || iconMap.default;
  };

  // Get icon color based on asset type
  const getIconColor = (type) => {
    const colorMap = {
      laptop: Colors.orangeLight,
      mobile: '#E3F2FD',
      server: '#F3E5F5',
      tablet: '#E3F2FD',
      peripheral: '#ECEFF1',
      default: Colors.grayLight,
    };
    return colorMap[type?.toLowerCase()] || colorMap.default;
  };

  // Get segment color
  const getSegmentColor = (segment) => {
    return segment === 'IT' ? Colors.primary : Colors.textSecondary;
  };

  const iconBgColor = getIconColor(asset.type);
  const segmentColor = getSegmentColor(asset.segment);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleToggle}
      activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Text style={styles.icon}>{getAssetIcon(asset.type)}</Text>
          </View>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetTag}>
              {asset.tag} • {asset.type}
            </Text>
            <View style={styles.segmentContainer}>
              <Text style={styles.segmentIcon}>
                {asset.segment === 'IT' ? '🏢' : '🏪'}
              </Text>
              <Text style={[styles.segmentText, { color: segmentColor }]}>
                {asset.segment} Segment
              </Text>
            </View>
          </View>
        </View>
        <Animated.View style={animatedChevronStyle}>
          <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </Animated.View>
      </View>

      {isExpanded && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.expandedContent}>
          <View style={styles.detailsContainer}>
            {asset.assignedTo && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ASSIGNED TO</Text>
                <View style={styles.assignedContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {typeof asset.assignedTo === 'string'
                        ? asset.assignedTo
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.detailValue}>{asset.assignedTo}</Text>
                </View>
              </View>
            )}

            {asset.cost !== null && asset.cost !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>COST</Text>
                <Text style={styles.detailValue}>{asset.cost}</Text>
              </View>
            )}

            {asset.assignedBy && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ASSIGNED BY</Text>
                <Text style={styles.detailValue}>{asset.assignedBy}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={(e) => {
                e.stopPropagation();
                if (onViewDetails) {
                  onViewDetails(asset);
                }
              }}
              activeOpacity={0.8}>
              <Text style={styles.viewDetailsIcon}>👁️</Text>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      {!isExpanded && asset.status && (
        <View style={styles.statusTag}>
          <Text style={styles.statusText}>{asset.status}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    ...Typography.h3,
    color: Colors.warmText,
    marginBottom: Spacing.xs,
  },
  assetTag: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
    marginBottom: Spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  segmentIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  segmentText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 12,
    color: Colors.warmTextSecondary,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  detailsContainer: {
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.warmBorder,
  },
  detailRow: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.warmTextSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  viewDetailsIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  viewDetailsText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  statusTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.orangeDark,
    fontWeight: '600',
  },
});

export default AssetCard;
