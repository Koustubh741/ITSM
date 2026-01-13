import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
  Modal,
  Share,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const INITIAL_HEIGHT = SCREEN_HEIGHT * 0.75;
const DRAG_THRESHOLD = 50;

const DigitalIdentityBottomSheet = ({ visible, onClose, asset }) => {
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const [isBarcodeExpanded, setIsBarcodeExpanded] = useState(false);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const startY = useRef(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(SCREEN_HEIGHT - INITIAL_HEIGHT, {
        duration: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      if (!visible) {
        setIsQRExpanded(false);
        setIsBarcodeExpanded(false);
      }
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        startY.current = translateY.value;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newTranslateY = startY.current + gestureState.dy;
        const minTranslateY = SCREEN_HEIGHT - MAX_HEIGHT;
        const maxTranslateY = SCREEN_HEIGHT;
        if (newTranslateY >= minTranslateY && newTranslateY <= maxTranslateY) {
          translateY.value = newTranslateY;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const velocity = gestureState.vy;
        if (gestureState.dy > DRAG_THRESHOLD || velocity > 0.5) {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onClose)();
          });
        } else if (gestureState.dy < -DRAG_THRESHOLD || velocity < -0.5) {
          translateY.value = withTiming(SCREEN_HEIGHT - MAX_HEIGHT, {
            duration: 300,
          });
        } else {
          translateY.value = withTiming(SCREEN_HEIGHT - INITIAL_HEIGHT, {
            duration: 300,
          });
        }
      },
    })
  ).current;

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleBackdropPress = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleExportPDF = () => {
    Alert.alert('Export PDF', 'PDF export functionality will be implemented here.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Asset: ${asset?.name || 'Asset'}\nID: ${asset?.id || 'N/A'}`,
        title: 'Share Asset',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = () => {
    Alert.alert('Save', 'Save functionality will be implemented here.');
  };

  const qrCodeData = asset?.id || 'MAC-2024-883';
  const serialNumber = asset?.serialNumber || 'C02XYZ123ABC';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleBackdropPress}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Digital Identity</Text>
                <Text style={styles.subtitle}>Manage asset identification</Text>
              </View>
              <TouchableOpacity
                onPress={handleExportPDF}
                style={styles.exportButton}
                activeOpacity={0.7}>
                <Text style={styles.exportIcon}>📄</Text>
                <Text style={styles.exportText}>Export PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            
            <View style={styles.assetCard}>
              <View style={styles.statusTag}>
                <Text style={styles.statusText}>Assigned</Text>
              </View>
              <Text style={styles.assetCardTitle}>DIGITAL ASSET CARD</Text>
              <Text style={styles.assetName}>{asset?.name || 'Macbook Pro 16 M2'}</Text>
              <View style={styles.assetInfo}>
                <View style={styles.assetInfoRow}>
                  <Text style={styles.assetInfoIcon}>#</Text>
                  <Text style={styles.assetInfoText}>
                    Asset ID: #{asset?.id || 'MAC-2024-883'}
                  </Text>
                </View>
              </View>
            </View>

            <ExpandableSection
              title="QR Code"
              subtitle="Tap to view"
              icon="📱"
              isExpanded={isQRExpanded}
              onToggle={() => setIsQRExpanded(!isQRExpanded)}>
              {isQRExpanded && (
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCode}>
                    <View style={styles.qrCodePlaceholder}>
                      <Text style={styles.qrCodeText}>{qrCodeData}</Text>
                    </View>
                  </View>
                  <Text style={styles.qrCodeDescription}>
                    Scan to instantly retrieve asset details or verify possession.
                  </Text>
                  <View style={styles.qrCodeActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleShare}
                      activeOpacity={0.7}>
                      <Text style={styles.actionIcon}>📤</Text>
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleSave}
                      activeOpacity={0.7}>
                      <Text style={styles.actionIcon}>💾</Text>
                      <Text style={styles.actionText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ExpandableSection>

            <ExpandableSection
              title="Barcode"
              subtitle="Tap to view"
              icon="📊"
              isExpanded={isBarcodeExpanded}
              onToggle={() => setIsBarcodeExpanded(!isBarcodeExpanded)}>
              {isBarcodeExpanded && (
                <View style={styles.barcodeContainer}>
                  <View style={styles.barcode}>
                    <View style={styles.barcodePlaceholder}>
                      <Text style={styles.barcodeText}>|||| ||| || ||||| ||||</Text>
                    </View>
                  </View>
                  <Text style={styles.serialName}>Serial: {serialNumber}</Text>
                </View>
              )}
            </ExpandableSection>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const ExpandableSection = ({ title, subtitle, icon, isExpanded, onToggle, children }) => {
  return (
    <View style={styles.expandableCard}>
      <TouchableOpacity
        style={styles.expandableHeader}
        onPress={onToggle}
        activeOpacity={0.7}>
        <View style={styles.expandableHeaderLeft}>
          <Text style={styles.expandableIcon}>{icon}</Text>
          <View style={styles.expandableTitleContainer}>
            <Text style={styles.expandableTitle}>{title}</Text>
            <Text style={styles.expandableSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Text style={styles.expandableChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.expandableContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.warmCardBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: MAX_HEIGHT,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dragHandleContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.warmBorder,
    borderRadius: BorderRadius.round,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warmBorder,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    color: Colors.warmText,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  exportIcon: {
    fontSize: 14,
  },
  exportText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  assetCard: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  assetCardTitle: {
    ...Typography.caption,
    color: Colors.warmTextSecondary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  assetName: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  assetInfo: {
    marginTop: Spacing.xs,
  },
  assetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  assetInfoIcon: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
    marginRight: Spacing.xs,
  },
  assetInfoText: {
    ...Typography.bodySmall,
    color: Colors.warmText,
  },
  expandableCard: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  expandableIcon: {
    fontSize: 20,
  },
  expandableTitleContainer: {
    flex: 1,
  },
  expandableTitle: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  expandableSubtitle: {
    ...Typography.caption,
    color: Colors.warmTextSecondary,
  },
  expandableChevron: {
    fontSize: 12,
    color: Colors.warmTextSecondary,
  },
  expandableContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.warmBorder,
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCode: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    minWidth: 200,
  },
  qrCodePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  qrCodeText: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrCodeDescription: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  qrCodeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '500',
  },
  barcodeContainer: {
    alignItems: 'center',
  },
  barcode: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  barcodePlaceholder: {
    width: '100%',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    ...Typography.h2,
    color: Colors.warmText,
    fontWeight: '700',
    letterSpacing: 2,
  },
  serialName: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

export default DigitalIdentityBottomSheet;
