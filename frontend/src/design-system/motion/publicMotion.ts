/** Approved functional primitives. Scene ownership and masks are authored per frame. */
export const publicMotion = {
  micro: 0.15,
  component: 0.2,
  page: 0.3,
  brandSequence: 1.2,
  crossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  reduced: {
    initial: false as const,
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0 },
  },
} as const
