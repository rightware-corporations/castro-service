import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Stepper } from './navigation'
import { Button } from '../primitives'
import { motionSprings } from '../motion/motionPresets'

export function CalendarFoundation({ monthLabel, children }: { monthLabel: string; children?: ReactNode }) { return <section className="ds-calendar" aria-label={`Calendário ${monthLabel}`}><header><Button variant="tertiary" size="sm" aria-label="Mês anterior">←</Button><strong>{monthLabel}</strong><Button variant="tertiary" size="sm" aria-label="Mês seguinte">→</Button></header>{children ?? <div className="ds-calendar__empty">Calendário pronto para dados de disponibilidade.</div>}</section> }
export function DatePicker({ label = 'Data', value, onChange }: { label?: string; value?: string; onChange?: (value: string) => void }) { return <label className="ds-field"><span className="ds-field__label">{label}</span><input className="ds-control" type="date" value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} /></label> }

export type TimeSlotState = 'available' | 'selected' | 'booked' | 'disabled' | 'loading'
export function TimeSlot({ label, state = 'available', onSelect }: { label: string; state?: TimeSlotState; onSelect?: () => void }) { const isDisabled = state === 'disabled' || state === 'booked' || state === 'loading'; return <motion.button layout className={`ds-time-slot ds-time-slot--${state}`} type="button" disabled={isDisabled} aria-pressed={state === 'selected'} aria-label={`${label}, ${state}`} onClick={onSelect} animate={{ scale: state === 'selected' ? 1.015 : 1 }} transition={motionSprings.selection}>{state === 'loading' ? 'A carregar…' : label}</motion.button> }
export function TimeSlotGroup({ label, slots }: { label: string; slots: { id: string; label: string; state?: TimeSlotState }[] }) { const [selected, setSelected] = useState<string | undefined>(); return <fieldset className="ds-time-slot-group"><legend>{label}</legend><div>{slots.map((slot) => <TimeSlot key={slot.id} label={slot.label} state={selected === slot.id ? 'selected' : slot.state} onSelect={() => setSelected(slot.id)} />)}</div></fieldset> }

export function BookingStepper({ current }: { current: 'selection' | 'time' | 'customer-details' | 'review' | 'confirmation' }) { const steps = [{ id: 'selection', label: 'Escolha' }, { id: 'time', label: 'Horário' }, { id: 'customer-details', label: 'Dados' }, { id: 'review', label: 'Rever' }, { id: 'confirmation', label: 'Confirmação' }]; return <Stepper steps={steps} current={current} /> }
export function BookingSummary({ title = 'Resumo da reserva', children }: { title?: string; children?: ReactNode }) { return <aside className="ds-booking-summary"><h3>{title}</h3>{children ?? <p>Os dados da reserva aparecerão aqui quando estiverem confirmados.</p>}</aside> }
