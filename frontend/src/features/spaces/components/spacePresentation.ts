import type { Space } from '../../../domain/models'

export function formatCapacity(space: Space) {
  if (space.capacityMin !== undefined && space.capacityMax !== undefined) return `${space.capacityMin}–${space.capacityMax} pessoas`
  if (space.capacityMax !== undefined) return `Até ${space.capacityMax} pessoas`
  if (space.capacityMin !== undefined) return `A partir de ${space.capacityMin} pessoas`
  return 'A confirmar'
}
