import React, { ReactNode, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Fonts, usePalette } from '@/constants/palette';
import { X, ArrowRight, ArrowLeft } from 'lucide-react-native';

interface TourTooltipProps {
  visible: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  onClose: () => void;
  title: string;
  content: string;
  stepNumber: number;
  totalSteps: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  children?: ReactNode;
  showPrev?: boolean;
  showNext?: boolean;
  isLastStep?: boolean;
  showSkipButton?: boolean;
  nextButtonText?: string;
  skipButtonText?: string;
  delayMs?: number;
}

export const TourTooltip: React.FC<TourTooltipProps> = ({
  visible,
  onNext,
  onPrev,
  onSkip,
  onClose,
  title,
  content,
  stepNumber,
  totalSteps,
  placement = 'bottom',
  children,
  showPrev = false,
  showNext = true,
  isLastStep = false,
  showSkipButton = true,
  nextButtonText,
  skipButtonText = 'Skip Tour',
  delayMs = 0,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = usePalette();

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showContent, setShowContent] = React.useState(false);

  useEffect(() => {
    if (visible) {
      // Reset animation
      fadeAnim.setValue(0);
      setShowContent(false);

      // Delay before showing tooltip
      const delayTimer = setTimeout(() => {
        setShowContent(true);
        // Start fade-in animation after delay
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, delayMs);

      return () => clearTimeout(delayTimer);
    } else {
      setShowContent(false);
    }
  }, [visible, fadeAnim, delayMs]);

  return (
    <Tooltip
      isVisible={visible && showContent}
      content={
        <Animated.View style={[
          styles.tooltipContent,
          {
            backgroundColor: c.surface,
            opacity: fadeAnim,
            transform: [{
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }],
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.badge, { backgroundColor: c.lav }]}>
                <Text style={styles.badgeText}>
                  {stepNumber}/{totalSteps}
                </Text>
              </View>
              <Text style={[
                styles.title,
                { color: c.ink }
              ]}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onSkip} style={styles.closeButton}>
              <X size={20} color={c.muted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Text style={[
            styles.content,
            { color: c.muted }
          ]}>
            {content}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {showSkipButton && (
              <TouchableOpacity
                onPress={onSkip}
                style={[
                  styles.skipButton,
                  { backgroundColor: c.surface2 }
                ]}
              >
                <Text style={[
                  styles.skipButtonText,
                  { color: c.muted }
                ]}>
                  {skipButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.navigationButtons}>
              {showPrev && stepNumber > 1 && onPrev && (
                <TouchableOpacity
                  onPress={onPrev}
                  style={[
                    styles.navButton,
                    { backgroundColor: c.surface2 }
                  ]}
                >
                  <ArrowLeft size={16} color={c.ink} />
                  <Text style={[
                    styles.navButtonText,
                    { color: c.ink }
                  ]}>
                    Prev
                  </Text>
                </TouchableOpacity>
              )}

              {showNext && onNext && (
                <TouchableOpacity
                  onPress={onNext}
                  style={[styles.navButton, { backgroundColor: c.inkButton }]}
                >
                  <Text style={[styles.nextButtonText, { color: c.inkButtonText }]}>
                    {nextButtonText || (isLastStep ? 'Finish' : 'Next')}
                  </Text>
                  {!isLastStep && !nextButtonText && (
                    <ArrowRight size={16} color={c.inkButtonText} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      }
      placement={placement}
      onClose={onClose}
      contentStyle={[
        styles.tooltip,
        { backgroundColor: c.surface }
      ]}
      arrowSize={{ width: 16, height: 8 }}
      backgroundColor={c.overlay}
      showChildInTooltip={true}
      disableShadow={false}
    >
      {children}
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 24,
  },
  tooltipContent: {
    padding: 18,
    borderRadius: 24,
    minWidth: 280,
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#0B0A0F',
    fontSize: 12,
    fontFamily: Fonts.bodyHeavy,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.display,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.bodySemi,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  skipButtonText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 4,
  },
  navButtonText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
  },
  nextButtonText: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
  },
});
