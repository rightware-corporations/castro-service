import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { motionDurations, motionPresets } from './motionPresets'

export function SectionReveal({ children, className, amount = 0.28 }: { children: ReactNode; className?: string; amount?: number }) {
  const reduced = useReducedMotion()
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const initial = reduced || !canObserve ? false : motionPresets.sectionReveal.initial
  const transition = reduced ? { duration: motionDurations.instant } : motionPresets.sectionReveal.transition
  return <motion.div className={className} initial={initial} animate={!canObserve ? motionPresets.sectionReveal.animate : undefined} whileInView={canObserve ? motionPresets.sectionReveal.animate : undefined} viewport={canObserve ? { once: true, amount, margin: '0px 0px -10% 0px' } : undefined} transition={transition} data-motion-reduced={reduced ? 'true' : 'false'}>{children}</motion.div>
}
