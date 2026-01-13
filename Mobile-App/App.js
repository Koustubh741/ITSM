import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import OnBoardingScreen1 from './src/screens/OnBoardingScreen1';
import OnBoardingScreen2 from './src/screens/OnBoardingScreen2';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import EndUserScreen from './src/screens/EndUserScreen';
import EndUserManagerScreen from './src/screens/EndUserManagerScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash'); // 'splash', 'onboarding1', 'onboarding2', 'signup', 'login', 'main', 'endUser', 'endUserManager'
  const [currentUser, setCurrentUser] = useState(null); // Store logged-in user data
  const isDarkMode = useColorScheme() === 'dark';

  const handleSplashFinish = () => {
    setCurrentScreen('onboarding1');
  };

  const handleOnboarding1Next = () => {
    setCurrentScreen('onboarding2');
  };

  const handleOnboarding1Skip = () => {
    setCurrentScreen('main');
  };

  const handleOnboarding2Next = () => {
    setCurrentScreen('signup');
  };

  const handleOnboarding2Back = () => {
    setCurrentScreen('onboarding1');
  };

  const handleOnboarding2Skip = () => {
    setCurrentScreen('endUser');
  };

  const handleSignUpBack = () => {
    setCurrentScreen('onboarding2');
  };

  const handleSignUpSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLoginBack = () => {
    setCurrentScreen('signup');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    
    if (!user) {
      setCurrentScreen('main');
      return;
    }

    const userRole = user.role?.toUpperCase() || user.role;
    const userPosition = user.position?.toUpperCase() || user.position;

    // Check if user is "User" role with position
    if (userRole === 'USER' || userRole === 'END_USER') {
      // Check position for User role
      if (userPosition === 'TEAM_MEMBER') {
        setCurrentScreen('endUser');
      } else if (userPosition === 'MANAGER') {
        setCurrentScreen('endUserManager');
      } else {
        // Default to EndUserScreen for END_USER role without position or other variations
        setCurrentScreen('endUser');
      }
    } else {
      // Other roles go to main dashboard
      setCurrentScreen('main');
    }
  };

  const handleSignUpFromLogin = () => {
    setCurrentScreen('signup');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;
      case 'onboarding1':
        return (
          <OnBoardingScreen1
            onNext={handleOnboarding1Next}
            onSkip={handleOnboarding1Skip}
          />
        );
      case 'onboarding2':
        return (
          <OnBoardingScreen2
            onNext={handleOnboarding2Next}
            onBack={handleOnboarding2Back}
            onSkip={handleOnboarding2Skip}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onBack={handleSignUpBack}
            onSignUpSuccess={handleSignUpSuccess}
            onSignUpToLogin={handleSignUpFromLogin}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={handleLoginBack}
            onLoginSuccess={handleLoginSuccess}
            onSignUp={handleSignUpFromLogin}
          />
        );
      case 'endUser':
        return <EndUserScreen />;
      case 'endUserManager':
        return <EndUserManagerScreen />;
      case 'main':
      default:
        return <MainNavigator />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

export default App;
