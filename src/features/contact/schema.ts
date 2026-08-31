import { z } from 'zod'

export const requestTypeOptions = [
  { value: 'CONSULTATION', label: 'Consultoria' },
  { value: 'CORPORATE_PROPOSAL', label: 'Proposta para empresa' },
  { value: 'TRAINING_INFO', label: 'Informação sobre formação' },
  { value: 'SPACE_INFO', label: 'Informação sobre espaços' },
  { value: 'GENERAL', label: 'Pedido geral' },
] as const

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'Indique o primeiro nome.'),
  lastName: z.string().trim().min(1, 'Indique o apelido.'),
  email: z.string().trim().email('Indique um email válido.'),
  phone: z.string().trim().optional(),
  type: z.enum(['CONSULTATION', 'CORPORATE_PROPOSAL', 'TRAINING_INFO', 'SPACE_INFO', 'GENERAL']),
  message: z.string().trim().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
