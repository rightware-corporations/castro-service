import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { motionDurations, motionPresets } from './motionPresets'

export function SectionReveal({ children, className, amount = 0.18 }: { children: ReactNode; className?: string; amount?: number }) {
  const reduced = useReducedMotion()
  const initial = reduced ? { opacity: 1, y: 0 } : motionPresets.sectionReveal.initial
  const transition = reduced ? { duration: motionDurations.instant } : motionPresets.sectionReveal.transition
  return <motion.div className={className} initial={initial} whileInView={motionPresets.sectionReveal.animate} viewport={{ once: true, amount }} transition={transition} data-motion-reduced={reduced ? 'true' : 'false'}>{children}</motion.div>
}
