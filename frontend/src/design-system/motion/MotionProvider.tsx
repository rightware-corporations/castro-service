import { LazyMotion, MotionConfig } from 'motion/react'
import type { PropsWithChildren } from 'react'

const loadMotionFeatures = () => import('./motionFeatures').then((module) => module.default)

export function MotionProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user"><LazyMotion features={loadMotionFeatures} strict>{children}</LazyMotion></MotionConfig>
}
