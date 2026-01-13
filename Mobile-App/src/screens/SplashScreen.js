import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const patternOpacity = useSharedValue(0);
  const patternScale = useSharedValue(0.8);

  // Interactive gradient animations
  const gradient1Scale = useSharedValue(1);
  const gradient1Opacity = useSharedValue(0);
  const gradient1TranslateX = useSharedValue(0);
  const gradient1TranslateY = useSharedValue(0);

  const gradient2Scale = useSharedValue(1);
  const gradient2Opacity = useSharedValue(0);
  const gradient2TranslateX = useSharedValue(0);
  const gradient2TranslateY = useSharedValue(0);

  const gradient3Scale = useSharedValue(1);
  const gradient3Opacity = useSharedValue(0);
  const gradient3TranslateX = useSharedValue(0);

  const gradient4Scale = useSharedValue(1);
  const gradient4Opacity = useSharedValue(0);
  const gradient4TranslateY = useSharedValue(0);

  useEffect(() => {
    // Animate pattern first (subtle)
    patternOpacity.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
    patternScale.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });

    // Gradient 1 (Top-right) - Floating and pulsing
    gradient1Opacity.value = withDelay(200, withTiming(0.5, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    }));
    gradient1Scale.value = withRepeat(
      withSequence(
        withTiming(1.15, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient1TranslateX.value = withRepeat(
      withSequence(
        withTiming(15, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-10, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient1TranslateY.value = withRepeat(
      withSequence(
        withTiming(-20, {
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(10, {
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Gradient 2 (Bottom-left) - Breathing effect
    gradient2Opacity.value = withDelay(400, withTiming(0.45, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    }));
    gradient2Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient2TranslateX.value = withRepeat(
      withSequence(
        withTiming(-15, {
          duration: 3800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(12, {
          duration: 3800,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient2TranslateY.value = withRepeat(
      withSequence(
        withTiming(20, {
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-15, {
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Gradient 3 (Center-right) - Subtle movement
    gradient3Opacity.value = withDelay(600, withTiming(0.35, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    }));
    gradient3Scale.value = withRepeat(
      withSequence(
        withTiming(1.1, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient3TranslateX.value = withRepeat(
      withSequence(
        withTiming(25, {
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-20, {
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Gradient 4 (Bottom-center) - Gentle pulse
    gradient4Opacity.value = withDelay(800, withTiming(0.4, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    }));
    gradient4Scale.value = withRepeat(
      withSequence(
        withTiming(1.18, {
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    gradient4TranslateY.value = withRepeat(
      withSequence(
        withTiming(-18, {
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(15, {
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Animate logo with bounce effect
    logoScale.value = withSequence(
      withTiming(1.1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      })
    );
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Animate title
    titleOpacity.value = withDelay(400, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }));
    titleTranslateY.value = withDelay(400, withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }));

    // Animate subtitle
    subtitleOpacity.value = withDelay(600, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }));
    subtitleTranslateY.value = withDelay(600, withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }));

    // Animate progress bar
    progress.value = withDelay(800, withTiming(1, {
      duration: 2500,
      easing: Easing.linear,
    }));

    // Auto navigate after animation
    const timer = setTimeout(() => {
      if (onFinish) {
        opacity.value = withTiming(0, { duration: 500 }, () => {
          runOnJS(onFinish)();
        });
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleTranslateY.value }],
    };
  });

  const patternAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: patternOpacity.value * 0.12,
      transform: [{ scale: patternScale.value }],
    };
  });

  // Gradient animated styles
  const gradient1Style = useAnimatedStyle(() => {
    return {
      opacity: gradient1Opacity.value,
      transform: [
        { scale: gradient1Scale.value },
        { translateX: gradient1TranslateX.value },
        { translateY: gradient1TranslateY.value },
      ],
    };
  });

  const gradient2Style = useAnimatedStyle(() => {
    return {
      opacity: gradient2Opacity.value,
      transform: [
        { scale: gradient2Scale.value },
        { translateX: gradient2TranslateX.value },
        { translateY: gradient2TranslateY.value },
      ],
    };
  });

  const gradient3Style = useAnimatedStyle(() => {
    return {
      opacity: gradient3Opacity.value,
      transform: [
        { scale: gradient3Scale.value },
        { translateX: gradient3TranslateX.value },
      ],
    };
  });

  const gradient4Style = useAnimatedStyle(() => {
    return {
      opacity: gradient4Opacity.value,
      transform: [
        { scale: gradient4Scale.value },
        { translateY: gradient4TranslateY.value },
      ],
    };
  });

  // Generate network pattern points
  const generatePatternPoints = () => {
    const points = [];
    const centerX = SCREEN_WIDTH * 0.7;
    const centerY = SCREEN_HEIGHT * 0.3;
    
    // Create radiating network pattern
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const distance = 50 + (i % 3) * 80;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      points.push({ x, y, id: i });
    }
    return points;
  };

  const patternPoints = generatePatternPoints();

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* White Background */}
      <View style={styles.whiteBackground} />

      {/* Interactive Blue Glass Gradient Effects */}
      <View style={styles.gradientContainer}>
        {/* Top-right corner gradient - Floating */}
        <Animated.View style={[styles.glassGradient, styles.gradientTopRight, gradient1Style]} />

        {/* Bottom-left corner gradient - Breathing */}
        <Animated.View style={[styles.glassGradient, styles.gradientBottomLeft, gradient2Style]} />

        {/* Center-right gradient - Subtle movement */}
        <Animated.View style={[styles.glassGradient, styles.gradientCenterRight, gradient3Style]} />

        {/* Bottom-center gradient - Gentle pulse */}
        <Animated.View style={[styles.glassGradient, styles.gradientBottomCenter, gradient4Style]} />
      </View>

      {/* Network Pattern Overlay */}
      <Animated.View style={[styles.patternContainer, patternAnimatedStyle]}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="patternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#B0BEC5" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#90CAF9" stopOpacity="0.2" />
            </SvgLinearGradient>
          </Defs>
          {patternPoints.map((point, index) => {
            const nextPoint = patternPoints[(index + 1) % patternPoints.length];
            return (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={1.5}
                  fill="url(#patternGradient)"
                />
                {index % 3 === 0 && (
                  <Line
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke="url(#patternGradient)"
                    strokeWidth={0.5}
                    opacity={0.25}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          {/* Corner brackets */}
          <View style={[styles.cornerBracket, styles.topLeft]} />
          <View style={[styles.cornerBracket, styles.bottomRight]} />

          {/* Main logo square with glow */}
          <View style={styles.logoSquare}>
            <View style={styles.logoGlow} />
            {/* Shield icon */}
            <View style={styles.shieldContainer}>
              <View style={styles.shield}>
                <View style={styles.shieldUpper} />
                <View style={styles.shieldLower} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          IT System Management
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Manage Assets. Track Systems. Stay Secure.
        </Animated.Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
        <Text style={styles.loadingText}>INITIALIZING V2.0</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  glassGradient: {
    position: 'absolute',
    borderRadius: 200,
  },
  gradientTopRight: {
    top: -SCREEN_HEIGHT * 0.08,
    right: -SCREEN_WIDTH * 0.12,
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: '#E3F2FD', // Soft light blue
    borderBottomLeftRadius: SCREEN_WIDTH * 0.45,
    ...Platform.select({
      ios: {
        shadowColor: '#90CAF9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  gradientBottomLeft: {
    bottom: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: '#B3E5FC', // Light cyan blue
    borderTopRightRadius: SCREEN_WIDTH * 0.4,
    ...Platform.select({
      ios: {
        shadowColor: '#81D4FA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  gradientCenterRight: {
    top: SCREEN_HEIGHT * 0.2,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: '#E1F5FE', // Very light blue
    borderTopLeftRadius: SCREEN_WIDTH * 0.55,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.55,
    ...Platform.select({
      ios: {
        shadowColor: '#B3E5FC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
    }),
  },
  gradientBottomCenter: {
    bottom: SCREEN_HEIGHT * 0.08,
    left: SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_HEIGHT * 0.25,
    backgroundColor: '#BBDEFB', // Light blue
    borderRadius: SCREEN_WIDTH * 0.35,
    ...Platform.select({
      ios: {
        shadowColor: '#90CAF9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  cornerBracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#64B5F6',
    opacity: 0.4,
    zIndex: 2,
  },
  topLeft: {
    top: -8,
    left: -8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 3,
  },
  bottomRight: {
    bottom: -8,
    right: -8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 3,
  },
  logoSquare: {
    width: 100,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#64B5F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: '#E1F5FE',
    opacity: 0.5,
    transform: [{ scale: 1.2 }],
  },
  shieldContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  shield: {
    width: 60,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  shieldUpper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '55%',
    backgroundColor: '#26C6DA', // Darker teal blue
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  shieldLower: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '55%',
    backgroundColor: '#4FC3F7', // Lighter cyan blue
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  title: {
    ...Typography.h1,
    fontSize: 24,
    color: '#263238', // Dark charcoal grey
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#78909C', // Light grey
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    zIndex: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#26C6DA', // Vibrant blue matching shield
    borderRadius: 1,
  },
  loadingText: {
    ...Typography.caption,
    fontSize: 10,
    color: '#78909C',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});

export default SplashScreen;
