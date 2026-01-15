import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCodeScanner, CameraPermissionStatus } from 'react-native-vision-camera';
import AnimatedInput from '../components/AnimatedInput';
import Dropdown from '../components/Dropdown';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ScanAssetScreen = ({ navigation, onScanningStateChange }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(
    CameraPermissionStatus?.NOT_DETERMINED || 'not-determined'
  );
  
  const device = useCameraDevice ? useCameraDevice('back') : null;
  
  const [assetId, setAssetId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [segment, setSegment] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('Active');
  const [vendor, setVendor] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');

  const scanLineY = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);

  const segmentOptions = ['IT Equipment', 'Furniture', 'Vehicles', 'Other'];
  const typeOptions = ['Laptop', 'Desktop', 'Tablet', 'Mobile', 'Other'];
  const statusOptions = ['Active', 'In Use', 'In Stock', 'In Repair', 'Retired'];
  const locationOptions = ['New York Office', 'San Francisco Office', 'Building 4, Floor 2, Zone B', 'Remote', 'Warehouse'];

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (onScanningStateChange) {
      onScanningStateChange(isScanning);
    }
  }, [isScanning]);

  useEffect(() => {
    if (isScanning && hasPermission) {
      scanLineY.value = withRepeat(
        withTiming(SCREEN_WIDTH * 0.6, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [isScanning, hasPermission]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          setCameraPermission(CameraPermissionStatus?.GRANTED || 'granted');
        } else {
          setHasPermission(false);
          setCameraPermission(CameraPermissionStatus?.DENIED || 'denied');
        }
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      if (Camera && Camera.requestCameraPermission) {
        const status = await Camera.requestCameraPermission();
        setCameraPermission(status);
        setHasPermission(status === (CameraPermissionStatus?.GRANTED || 'granted'));
      } else {
        setHasPermission(false);
      }
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        handleQRCodeScanned(codes[0].value);
      }
    },
  });

  /**
   * Parse ASSET IDENTITY CARD format from QR code
   * Format:
   * ASSET IDENTITY CARD
   * ------------------
   * Name: LAPTOP-JHTTQ3PC
   * Model: Unknown
   * S/N: 211334710009390
   * ID: ee512be9-b188-4748-be5d-3a9b905ce8a3
   * Type: Server
   * Status: Active
   * Loc: Windows Environment
   * User: Unassigned
   * Dept: IT Operations
   * Purchased: null
   * Warranty: 2026-02-17
   * Specs: Standard / Standard
   * ------------------
   * Property of: AssetMgr
   */
  const parseAssetIdentityCard = (qrText) => {
    const data = {};
    const lines = qrText.split('\n').map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
      // Skip header, footer, and separator lines
      if (line.includes('ASSET IDENTITY CARD') || 
          line.includes('Property of') || 
          line.startsWith('---') ||
          line.length === 0) {
        continue;
      }
      
      // Parse key-value pairs
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        // Map keys to form fields
        switch (key.toLowerCase()) {
          case 'name':
            data.name = value;
            break;
          case 'model':
            data.model = value !== 'Unknown' ? value : '';
            break;
          case 's/n':
          case 'serial number':
          case 'serial':
            data.serialNumber = value;
            break;
          case 'id':
            data.id = value;
            break;
          case 'type':
            data.type = value;
            break;
          case 'status':
            data.status = value;
            break;
          case 'loc':
          case 'location':
            data.location = value;
            break;
          case 'user':
            data.user = value;
            break;
          case 'dept':
          case 'department':
            data.department = value;
            break;
          case 'purchased':
            if (value && value !== 'null') {
              // Convert date format if needed
              data.purchaseDate = value;
            }
            break;
          case 'warranty':
            if (value && value !== 'null') {
              // Convert YYYY-MM-DD to MM/DD/YYYY
              const warrantyDate = new Date(value);
              if (!isNaN(warrantyDate.getTime())) {
                const month = String(warrantyDate.getMonth() + 1).padStart(2, '0');
                const day = String(warrantyDate.getDate()).padStart(2, '0');
                const year = warrantyDate.getFullYear();
                data.warrantyExpiry = `${month}/${day}/${year}`;
              } else {
                data.warrantyExpiry = value;
              }
            }
            break;
          case 'specs':
          case 'specifications':
            // Parse specs like "Standard / Standard" or extract CPU/RAM/Storage if available
            const specsParts = value.split('/').map(s => s.trim());
            if (specsParts.length >= 2) {
              data.cpu = specsParts[0] !== 'Standard' ? specsParts[0] : '';
              data.ram = specsParts[1] !== 'Standard' ? specsParts[1] : '';
            }
            break;
        }
      }
    }
    
    return data;
  };

  const handleQRCodeScanned = async (qrValue) => {
    if (!qrValue) {
      Alert.alert('Error', 'No QR code data found');
      return;
    }

    try {
      setIsScanning(false);
      
      // Parse the QR code data
      const parsedData = parseAssetIdentityCard(qrValue);
      
      // Search backend if we have ID or Serial Number
      let backendAsset = null;
      if (parsedData.id || parsedData.serialNumber) {
        try {
          const searchParams = new URLSearchParams();
          if (parsedData.id) searchParams.append('asset_id', parsedData.id);
          if (parsedData.serialNumber) searchParams.append('serial_number', parsedData.serialNumber);
          
          const response = await fetch(
            `${API_BASE_URL}/assets/search/by-id-or-serial?${searchParams.toString()}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            backendAsset = await response.json();
          }
        } catch (error) {
          console.log('Backend search failed, using QR data only:', error);
        }
      }
      
      // Merge backend data with parsed QR data (backend takes precedence)
      const finalData = backendAsset ? {
        ...parsedData,
        ...backendAsset,
        // Keep QR parsed data for fields not in backend
        id: backendAsset.id || parsedData.id,
        name: backendAsset.name || parsedData.name,
        model: backendAsset.model || parsedData.model,
        serialNumber: backendAsset.serial_number || parsedData.serialNumber,
        location: backendAsset.location || parsedData.location,
        status: backendAsset.status || parsedData.status,
        type: backendAsset.type || parsedData.type,
        warrantyExpiry: backendAsset.warranty_expiry 
          ? new Date(backendAsset.warranty_expiry).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : parsedData.warrantyExpiry,
        purchaseDate: backendAsset.purchase_date
          ? new Date(backendAsset.purchase_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : parsedData.purchaseDate,
        cpu: backendAsset.specifications?.cpu || parsedData.cpu || '',
        ram: backendAsset.specifications?.ram || parsedData.ram || '',
        storage: backendAsset.specifications?.storage || parsedData.storage || '',
      } : parsedData;
      
      // Populate form fields
      if (finalData.id) setAssetId(finalData.id);
      if (finalData.name) setAssetName(finalData.name);
      if (finalData.type) {
        setType(finalData.type);
        // Map type to segment
        if (['Laptop', 'Desktop', 'Tablet', 'Mobile', 'Server'].includes(finalData.type)) {
          setSegment('IT Equipment');
        }
      }
      if (finalData.status) setStatus(finalData.status);
      if (finalData.model) setModel(finalData.model);
      if (finalData.serialNumber) setSerialNumber(finalData.serialNumber);
      if (finalData.location) setLocation(finalData.location);
      if (finalData.purchaseDate) setPurchaseDate(finalData.purchaseDate);
      if (finalData.warrantyExpiry) setWarrantyExpiry(finalData.warrantyExpiry);
      if (finalData.cpu) setCpu(finalData.cpu);
      if (finalData.ram) setRam(finalData.ram);
      if (finalData.storage) setStorage(finalData.storage);
      
      // Extract vendor from name if available (e.g., "LAPTOP-JHTTQ3PC" might indicate vendor)
      // This is a simple heuristic - you might want to improve this
      if (finalData.name && !finalData.vendor) {
        const nameUpper = finalData.name.toUpperCase();
        if (nameUpper.includes('LAPTOP') || nameUpper.includes('DESKTOP')) {
          // Could extract vendor from model or other fields
        }
      }
      
      cardOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
      cardTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }));
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code data');
      setIsScanning(true);
    }
  };

  const handleScanAnother = () => {
    setIsScanning(true);
    cardOpacity.value = 0;
    cardTranslateY.value = 50;
    
    setAssetName('');
    setSegment('');
    setType('');
    setStatus('Active');
    setVendor('');
    setModel('');
    setSerialNumber('');
    setLocation('');
    setPurchaseDate('');
    setWarrantyExpiry('');
    setCpu('');
    setRam('');
    setStorage('');
  };

  const handleAddToInventory = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    console.log('Adding asset to inventory:', {
      assetId,
      assetName,
      segment,
      type,
      status,
      vendor,
      model,
      serialNumber,
      location,
      purchaseDate,
      warrantyExpiry,
      cpu,
      ram,
      storage,
    });
    
    setTimeout(() => {
      if (navigation) {
        navigation.goBack();
      }
    }, 300);
  };

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!device) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Asset QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Asset QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isScanning ? (
        <View style={styles.scanningContainer}>
          <View style={styles.scanningContent}>
            <Text style={styles.scanTitle}>Scan Asset Code</Text>
            <Text style={styles.scanInstruction}>
              Align QR inside the frame to auto-detect asset.
            </Text>

            {hasPermission && device && Camera ? (
              <View style={styles.cameraPreview}>
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isScanning}
                  codeScanner={codeScanner}
                />
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                  <Animated.View style={[styles.scanLine, scanLineStyle]} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.placeholderText}>📷</Text>
                <Text style={styles.placeholderSubtext}>
                  Camera permission required
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestCameraPermission}>
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.detectedCard, cardStyle]}>
            <View style={styles.detectedHeader}>
              <View style={styles.detectedLeft}>
                <View style={styles.checkmarkCircle}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <View style={styles.detectedTextContainer}>
                  <Text style={styles.detectedTitle}>Asset Detected</Text>
                  <Text style={styles.detectedSubtitle}>Ready to add to inventory</Text>
                </View>
              </View>
              <View style={styles.statusTag}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.assetInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ASSET ID</Text>
                <Text style={styles.infoValue}>{assetId || serialNumber || 'IT-AST-8920'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ASSET NAME</Text>
                <Text style={styles.infoValue}>{assetName || 'MacBook Pro M3 Max 16"'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TYPE</Text>
                <Text style={styles.infoValue}>{type || 'Laptop'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>LOCATION</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.infoValue}>{location || 'Building 4, Floor 2, Zone B'}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <AnimatedInput
              label="Asset ID"
              placeholder="e.g. ee512be9-b188-4748-be5d-3a9b905ce8a3"
              value={assetId}
              onChangeText={setAssetId}
            />
            
            <AnimatedInput
              label="Asset Name"
              placeholder="e.g. MacBook Pro M3"
              value={assetName}
              onChangeText={setAssetName}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Dropdown
                  options={segmentOptions}
                  selected={segment}
                  onSelect={setSegment}
                  placeholder="Segment"
                />
              </View>
              <View style={styles.halfWidth}>
                <Dropdown
                  options={typeOptions}
                  selected={type}
                  onSelect={setType}
                  placeholder="Type"
                />
              </View>
            </View>

            <Dropdown
              options={statusOptions}
              selected={status}
              onSelect={setStatus}
              placeholder="Status"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Vendor"
                  placeholder="Apple"
                  value={vendor}
                  onChangeText={setVendor}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Model"
                  placeholder="A2141"
                  value={model}
                  onChangeText={setModel}
                />
              </View>
            </View>

            <AnimatedInput
              label="Serial Number"
              placeholder="Enter or scan SN"
              value={serialNumber}
              onChangeText={setSerialNumber}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Details & Specs</Text>

            <Dropdown
              options={locationOptions}
              selected={location}
              onSelect={setLocation}
              placeholder="Location"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Purchase Date"
                  placeholder="mm/dd/yyyy"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Warranty Expiry"
                  placeholder="mm/dd/yyyy"
                  value={warrantyExpiry}
                  onChangeText={setWarrantyExpiry}
                />
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Specifications</Text>

            <AnimatedInput
              label="CPU"
              placeholder="e.g. Intel Core i7 or M3 Pro"
              value={cpu}
              onChangeText={setCpu}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="RAM"
                  placeholder="e.g. 16GB"
                  value={ram}
                  onChangeText={setRam}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Storage"
                  placeholder="e.g. 512GB SSD"
                  value={storage}
                  onChangeText={setStorage}
                />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {!isScanning && (
        <Animated.View style={[styles.buttonContainer, cardStyle]}>
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToInventory}
              activeOpacity={0.9}>
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Add Asset to Inventory</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.scanAnotherButton}
            onPress={handleScanAnother}
            activeOpacity={0.8}>
            <Text style={styles.scanAnotherText}>Scan another Asset</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  scanningContent: {
    width: '100%',
    alignItems: 'center',
  },
  scanTitle: {
    ...Typography.h1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  scanInstruction: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 19,
  },
  cameraPreview: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraPlaceholder: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: '#2C2C2E',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  placeholderSubtext: {
    ...Typography.body,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  permissionButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -(SCREEN_WIDTH * 0.3),
    marginLeft: -(SCREEN_WIDTH * 0.3),
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  detectedCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  detectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  detectedTextContainer: {
    flex: 1,
  },
  detectedTitle: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  detectedSubtitle: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  assetInfo: {
    gap: Spacing.md,
  },
  infoRow: {
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 14,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subsectionTitle: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
  },
  addButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  scanAnotherButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  scanAnotherText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

export default ScanAssetScreen;
