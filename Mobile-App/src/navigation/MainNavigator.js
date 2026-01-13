import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ExecutiveOverview from '../screens/ExecutiveOverview';
import MyAssetsScreen from '../screens/MyAssetsScreen';
import AddAssetScreen from '../screens/AddAssetScreen';
import AssetDetailsScreen from '../screens/AssetDetailsScreen';
import ScanAssetScreen from '../screens/ScanAssetScreen';
import EnterpriseScreen from '../screens/EnterpriseScreen';
import BottomNavigation from '../components/BottomNavigation';
import MoreMenuSheet from '../components/MoreMenuSheet';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const MainNavigator = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('main');
  const [currentAsset, setCurrentAsset] = useState(null);
  const [isScanAssetScanning, setIsScanAssetScanning] = useState(true);

  const handleTabPress = (tabId) => {
    if (tabId === 'settings') {
      setIsMoreMenuVisible(true);
    } else {
      setActiveTab(tabId);
      setCurrentScreen('main');
      if (tabId === 'reports') {
        setIsScanAssetScanning(true);
      }
    }
  };

  const handleNavigate = (screen, params) => {
    if (screen === 'AddAsset') {
      setCurrentScreen('addAsset');
    } else if (screen === 'AssetDetails') {
      setCurrentAsset(params?.asset || null);
      setCurrentScreen('assetDetails');
    } else if (screen === 'back' || screen === 'goBack') {
      setCurrentScreen('main');
      setCurrentAsset(null);
    }
  };

  const handleMenuItemPress = (itemId) => {
    setIsMoreMenuVisible(false);
    if (itemId === 'enterprise') {
      setCurrentScreen('enterprise');
    }
  };

  const handleScanningStateChange = (isScanning) => {
    setIsScanAssetScanning(isScanning);
  };

  const renderScreen = () => {
    if (currentScreen === 'addAsset') {
      return (
        <AddAssetScreen
          navigation={{
            goBack: () => handleNavigate('back'),
            navigate: handleNavigate,
          }}
        />
      );
    }

    if (currentScreen === 'assetDetails') {
      return (
        <AssetDetailsScreen
          navigation={{
            goBack: () => handleNavigate('back'),
            navigate: handleNavigate,
          }}
          route={{ params: { asset: currentAsset } }}
        />
      );
    }

    if (currentScreen === 'enterprise') {
      return (
        <EnterpriseScreen
          navigation={{
            goBack: () => setCurrentScreen('main'),
            navigate: handleNavigate,
          }}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return <ExecutiveOverview />;
      case 'assets':
        return (
          <MyAssetsScreen
            navigation={{
              navigate: handleNavigate,
              goBack: () => handleNavigate('back'),
            }}
          />
        );
      case 'reports':
        return (
          <ScanAssetScreen
            navigation={{
              goBack: () => handleNavigate('back'),
              navigate: handleNavigate,
            }}
            onScanningStateChange={handleScanningStateChange}
          />
        );
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {currentScreen === 'main' && isScanAssetScanning && (
        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      )}
      <MoreMenuSheet
        visible={isMoreMenuVisible}
        onClose={() => setIsMoreMenuVisible(false)}
        onMenuItemPress={handleMenuItemPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  placeholder: {
    flex: 1,
    backgroundColor: Colors.warmBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.h2,
    color: Colors.warmText,
    marginBottom: Spacing.sm,
  },
  placeholderSubtext: {
    ...Typography.body,
    color: Colors.warmTextSecondary,
  },
});

export default MainNavigator;
