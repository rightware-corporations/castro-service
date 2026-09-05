export const motionDurations = {
  instant: 0.1,
  fast: 0.16,
  normal: 0.2,
  standard: 0.24,
  slow: 0.28,
  emphasis: 0.42,
} as const

export const motionEasings = {
  standard: [0.23, 1, 0.32, 1] as [number, number, number, number],
  inOut: [0.77, 0, 0.175, 1] as [number, number, number, number],
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
} as const

export const motionSprings = {
  selection: { type: 'spring' as const, stiffness: 430, damping: 34, mass: 0.65 },
  layout: { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.72 },
} as const

export const motionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motionDurations.normal, ease: motionEasings.standard },
  },
  scrim: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motionDurations.fast, ease: motionEasings.standard },
  },
  panel: {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.995 },
    transition: { duration: motionDurations.standard, ease: motionEasings.standard },
  },
  drawer: {
    initial: { opacity: 0, x: 18 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 14 },
    transition: { duration: motionDurations.standard, ease: motionEasings.standard },
  },
  bottomSheet: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 14 },
    transition: { duration: motionDurations.standard, ease: motionEasings.standard },
  },
  mobileMenu: {
    open: { opacity: 1, y: 0, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: motionDurations.fast, ease: motionEasings.enter } },
    closed: { opacity: 0, y: -8, pointerEvents: 'none' as const, transition: { duration: motionDurations.fast, ease: motionEasings.exit }, transitionEnd: { visibility: 'hidden' as const } },
    desktop: { opacity: 1, y: 0, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: 0 } },
  },
  mobileSidebar: {
    open: { opacity: 1, x: 0, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: motionDurations.standard, ease: motionEasings.enter } },
    closed: { opacity: 0, x: '-105%', pointerEvents: 'none' as const, transition: { duration: motionDurations.standard, ease: motionEasings.exit }, transitionEnd: { visibility: 'hidden' as const } },
    desktop: { opacity: 1, x: 0, visibility: 'visible' as const, pointerEvents: 'auto' as const, transition: { duration: 0 } },
  },
  sectionReveal: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: motionDurations.emphasis, ease: motionEasings.standard },
  },
} as const
