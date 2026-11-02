import { Easing, ReduceMotion, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';
import { motion } from '@/shared';

export const easeOut = Easing.bezier(...motion.easeOut);
export const easeInOut = Easing.bezier(...motion.easeInOut);

/** Things appearing or responding to a touch. */
export const timing = (duration: number = motion.duration.base): WithTimingConfig => ({
  duration,
  easing: easeOut,
  reduceMotion: ReduceMotion.System,
});

/** Gesture-driven movement only (card flips, holds). */
export const spring: WithSpringConfig = { ...motion.spring, reduceMotion: ReduceMotion.System };

export { motion };
