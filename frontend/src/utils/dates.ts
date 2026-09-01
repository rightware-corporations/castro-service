import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

export function formatLocalDate(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy', { locale: pt })
}
