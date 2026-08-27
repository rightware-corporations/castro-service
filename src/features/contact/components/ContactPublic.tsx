import { useEffect } from 'react'
import { useForm, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { RequestRequestDto } from '../../../api/contracts'
import { ApiError } from '../../../api/client/errors'
import { Alert, ErrorState } from '../../../design-system/patterns/feedback-overlays'
import { FormActions, FormSection, StickyMobileActions } from '../../../design-system/patterns/forms'
import { Button, Select, Textarea, TextField } from '../../../design-system/primitives'
import { useCreateRequest } from '../hooks'
import { contactSchema, requestTypeOptions, type ContactFormValues } from '../schema'

export function ContactPublic() {
  const mutation = useCreateRequest()
  return <ContactForm submitRequest={mutation.mutateAsync} isPending={mutation.isPending} isSuccess={mutation.isSuccess} error={mutation.error} />
}

export function ContactForm({ submitRequest, isPending, isSuccess, error }: { submitRequest: (values: RequestRequestDto) => Promise<unknown>; isPending: boolean; isSuccess: boolean; error: unknown }) {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), mode: 'onBlur', defaultValues: { type: 'GENERAL' } })
  const apiError = error instanceof ApiError ? error : undefined
  const apiErrorMessage = apiError ? String(apiError.message) : ''
  const fieldMessage = (value: unknown) => typeof value === 'string' ? value : undefined

  useEffect(() => {
    if (!apiError?.fieldErrors) return
    Object.entries(apiError.fieldErrors).forEach(([field, messages]) => setError(field as Path<ContactFormValues>, { type: 'backend', message: messages[0] }))
  }, [apiError, setError])

  const onSubmit = handleSubmit(async (values) => { await submitRequest(values); reset({ type: 'GENERAL' }) })
  return <section className="public-page contact-page container"><header className="public-page-intro"><span className="eyebrow">CASTRO’S · CONTACTO</span><h1>Começamos pela conversa certa.</h1><p>Partilhe o contexto que quer explorar. O pedido será encaminhado através do contrato de contacto aprovado.</p></header><div className="contact-layout"><form className="contact-form" onSubmit={onSubmit} noValidate><FormSection title="Os seus dados" description="Indique apenas a informação necessária para podermos compreender o pedido."><div className="contact-form__grid"><TextField id="firstName" label="Nome" required autoComplete="given-name" {...register('firstName')} error={fieldMessage(errors.firstName?.message)} /><TextField id="lastName" label="Apelido" required autoComplete="family-name" {...register('lastName')} error={fieldMessage(errors.lastName?.message)} /><TextField id="email" label="Email" required type="email" autoComplete="email" {...register('email')} error={fieldMessage(errors.email?.message)} /><TextField id="phone" label="Telefone" description="Opcional." autoComplete="tel" {...register('phone')} error={fieldMessage(errors.phone?.message)} /></div></FormSection><FormSection title="Sobre o que quer falar?" description="Escolha o tipo de pedido e acrescente contexto se fizer sentido."><Select id="type" label="Tipo de pedido" required {...register('type')} error={fieldMessage(errors.type?.message)}>{requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select><Textarea id="message" label="Mensagem" description="Opcional." rows={6} {...register('message')} error={fieldMessage(errors.message?.message)} /></FormSection>{isSuccess && <Alert tone="success" title="Pedido submetido.">O pedido foi recebido pelo adapter configurado.</Alert>}{apiError?.code === 'VALIDATION_FAILED' && <Alert tone="danger" title="Verifique os dados.">O backend devolveu erros de validação. Reveja os campos assinalados.</Alert>}{Boolean(error && !apiError) && <ErrorState title="Não foi possível enviar o pedido." />}{apiError && apiError.code !== 'VALIDATION_FAILED' && <Alert tone="danger" title="Não foi possível enviar o pedido.">{apiErrorMessage}</Alert>}<FormActions><Button type="submit" loading={isPending}>Enviar pedido <ArrowRight size={16} /></Button></FormActions><StickyMobileActions><Button type="submit" loading={isPending}>Enviar pedido <ArrowRight size={16} /></Button></StickyMobileActions></form><aside className="contact-aside"><div className="media-placeholder" aria-label="Imagem institucional por confirmar"><span>IMAGEM INSTITUCIONAL · A CONFIRMAR</span></div><div className="contact-aside__note"><span className="eyebrow">INFORMAÇÃO</span><p>Dados de contacto institucionais serão apresentados quando estiverem confirmados.</p><Link className="text-link" to="/">Voltar ao início <ArrowRight size={16} /></Link></div></aside></div></section>
}
