import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../../app/providers/AppProviders'
import { useForm, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ArrowUpRight, Building2, GraduationCap, Handshake, MessageCircle } from 'lucide-react'
import type { RequestRequestDto, RequestType } from '../../../api/contracts'
import { ApiError } from '../../../api/client/errors'
import { Alert, ErrorState } from '../../../design-system/patterns/feedback-overlays'
import { FormActions, FormSection, StickyMobileActions } from '../../../design-system/patterns/forms'
import { Button, Select, Textarea, TextField } from '../../../design-system/primitives'
import { useCreateRequest } from '../hooks'
import { contactSchema, requestTypeOptions, type ContactFormValues } from '../schema'
import { contextFromSearch, type RequestIntentContext } from '../intent'

const intentCards = [
  { icon: Handshake, title: 'Consultoria', text: 'Quando existe um desafio, uma decisão ou um contexto organizacional a compreender.' },
  { icon: Building2, title: 'Proposta corporativa', text: 'Quando a conversa envolve uma organização, equipa ou necessidade específica.' },
  { icon: GraduationCap, title: 'Formação', text: 'Para palestras, workshops, formação ou treinamento corporativo personalizado.' },
  { icon: MessageCircle, title: 'Contacto geral', text: 'Quando ainda não é necessário enquadrar o pedido numa área específica.' },
]

const requestTypes = new Set<RequestType>(['CONSULTATION', 'CORPORATE_PROPOSAL', 'TRAINING_INFO', 'SPACE_INFO', 'GENERAL'])

type ContextualRequest = RequestRequestDto & { context?: RequestIntentContext }

function validRequestType(value: string | null): RequestType {
  return value && requestTypes.has(value as RequestType) ? value as RequestType : 'GENERAL'
}

function sourceLabel(source: RequestIntentContext['sourceType']) {
  if (source === 'SERVICE') return 'Serviço selecionado'
  if (source === 'TRAINING') return 'Formação selecionada'
  if (source === 'SPACE') return 'Espaço selecionado'
  return 'Contacto geral'
}

export function ContactPublic() {
  const mutation = useCreateRequest()
  const api = useApi()
  const [search] = useSearchParams()
  const requested = contextFromSearch(search, '/contacto')
  const contextual = requested.sourceType !== 'GENERAL'
  const resource = useQuery({
    queryKey: ['public', 'contact-origin', requested.sourceType, requested.entityId],
    enabled: contextual,
    retry: false,
    queryFn: async () => {
      if (!requested.entityId) return null
      const result = requested.sourceType === 'SERVICE' ? await api.public.listServices()
        : requested.sourceType === 'SPACE' ? await api.public.listSpaces() : await api.public.listCourses()
      return result.items.find((item) => item.id === requested.entityId) ?? null
    },
  })
  const origin = contextual && !resource.isError && resource.data ? resource.data : undefined
  const context: RequestIntentContext = origin ? requested : { ...requested, sourceType: 'GENERAL', entityId: undefined }
  return <>
    {contextual && resource.isLoading && <p role="status" className="container">A verificar a origem do pedido.</p>}
    {contextual && resource.isError && <div className="container" role="alert"><p>Não foi possível verificar a origem. Os seus dados continuam no formulário.</p><Button onClick={() => void resource.refetch()}>Tentar novamente</Button></div>}
    {contextual && !resource.isLoading && !resource.isError && !origin && <p role="status" className="container">A origem já não está disponível. Pode enviar um contacto geral.</p>}
    <ContactForm submitRequest={mutation.mutateAsync} isPending={mutation.isPending} submissionBlocked={contextual && (resource.isLoading || resource.isError)} isSuccess={mutation.isSuccess} error={mutation.error} verifiedContext={context} originName={origin?.name} />
  </>
}

export function ContactForm({ submitRequest, isPending, isSuccess, error, verifiedContext, originName, submissionBlocked = false }: { submitRequest: (values: ContextualRequest) => Promise<unknown>; isPending: boolean; isSuccess: boolean; error: unknown; verifiedContext?: RequestIntentContext; originName?: string; submissionBlocked?: boolean }) {
  const [submitError, setSubmitError] = useState<unknown>()
  const [sending, setSending] = useState(false)
  const submissionLock = useRef(false)
  const busy = isPending || sending
  const currentError = error ?? submitError
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialType = validRequestType(searchParams.get('type'))
  const initialMessage = ''
  const intentContext = useMemo(() => verifiedContext ?? contextFromSearch(searchParams, location.pathname), [verifiedContext, location.pathname, searchParams])
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), mode: 'onBlur', defaultValues: { type: initialType, message: initialMessage } })
  const apiError = currentError instanceof ApiError ? currentError : undefined
  const apiErrorMessage = apiError ? String(apiError.message) : ''
  const fieldMessage = (value: unknown) => typeof value === 'string' ? value : undefined

  useEffect(() => {
    if (!apiError?.fieldErrors) return
    Object.entries(apiError.fieldErrors).forEach(([field, messages]) => setError(field as Path<ContactFormValues>, { type: 'backend', message: messages[0] }))
  }, [apiError, setError])

  const submitValues = async (values: ContactFormValues) => {
    if (isPending || submissionBlocked || submissionLock.current) return
    submissionLock.current = true
    setSending(true)
    setSubmitError(undefined)
    try {
      await submitRequest({ ...values, context: intentContext })
      reset({ firstName: '', lastName: '', email: '', phone: '', type: initialType, message: '' })
    } catch (failure) {
      setSubmitError(failure ?? new Error('Request failed'))
    } finally {
      submissionLock.current = false
      setSending(false)
    }
  }

  const contextual = intentContext.sourceType !== 'GENERAL' && Boolean(originName)

  return <div className="contact-v2-page">
    <section className="contact-v2-hero">
      <div className="container contact-v2-hero__grid">
        <div><span className="eyebrow eyebrow--light">CASTRO’S · CONTACTO</span><h1>Começamos pela <em>conversa certa.</em></h1></div>
        <div className="contact-v2-hero__copy"><span>CONTACTO / 04</span><p>Partilhe o contexto, a necessidade ou a ideia que quer explorar. O formulário preserva o caminho que o trouxe até aqui para não lhe pedir a mesma informação duas vezes.</p><ArrowUpRight size={24} aria-hidden="true" /></div>
      </div>
    </section>

    <section className="container contact-v2-intents" aria-label="Tipos de conversa">
      {intentCards.map(({ icon: Icon, title, text }, index) => <article key={title}><div><span>0{index + 1}</span><Icon size={19} aria-hidden="true" /></div><h2>{title}</h2><p>{text}</p></article>)}
    </section>

    <section className="contact-v2-form-region">
      <div className="container contact-v2-layout">
        <div className="contact-v2-form-intro"><span className="eyebrow">O SEU CONTEXTO</span><h2>Conte apenas o que ainda não sabemos.</h2><p>Se chegou a partir de um serviço, formação ou espaço, essa referência acompanha o seu pedido.</p>{contextual && <div className="contact-v2-form-intro__note" role="status"><span>✓</span><p>{sourceLabel(intentContext.sourceType)}: {originName} — contexto preservado.</p><span>→</span><p>A Secretária receberá a origem juntamente com os seus dados.</p></div>}</div>

        <form className="contact-form contact-form--v2" onSubmit={(event) => { if (submissionLock.current || isPending) { event.preventDefault(); return } void handleSubmit(submitValues)(event) }} noValidate>
          <fieldset disabled={busy} aria-label="Dados do pedido" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}><FormSection title="Os seus dados" description="Informação essencial para identificar e responder ao pedido.">
            <div className="contact-form__grid"><TextField id="firstName" label="Nome" required autoComplete="given-name" {...register('firstName')} error={fieldMessage(errors.firstName?.message)} /><TextField id="lastName" label="Apelido" required autoComplete="family-name" {...register('lastName')} error={fieldMessage(errors.lastName?.message)} /><TextField id="email" label="Email" required type="email" autoComplete="email" {...register('email')} error={fieldMessage(errors.email?.message)} /><TextField id="phone" label="Telefone" description="Opcional." autoComplete="tel" {...register('phone')} error={fieldMessage(errors.phone?.message)} /></div>
          </FormSection>
          <FormSection title="Sobre o que quer falar?" description={contextual ? 'Já preservámos a origem. Pode ajustar o enquadramento ou acrescentar apenas o que falta.' : 'Escolha o enquadramento mais próximo. Pode explicar o resto na mensagem.'}>
            <Select id="type" label="Tipo de pedido" required {...register('type')} error={fieldMessage(errors.type?.message)}>{requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>
            <Textarea id="message" label="Mensagem" description="Opcional." rows={7} {...register('message')} error={fieldMessage(errors.message?.message)} />
          </FormSection>
          </fieldset>
          {isSuccess && <Alert tone="success" title="Pedido submetido.">Recebemos o pedido e o respetivo contexto. A equipa poderá dar seguimento sem lhe pedir para repetir a origem.</Alert>}
          {apiError?.code === 'VALIDATION_FAILED' && <Alert tone="danger" title="Verifique os dados.">Reveja os campos assinalados antes de enviar novamente.</Alert>}
          {Boolean(currentError && !apiError) && <ErrorState title="Não foi possível enviar o pedido." />}
          {apiError && apiError.code !== 'VALIDATION_FAILED' && <Alert tone="danger" title="Não foi possível enviar o pedido.">{apiErrorMessage}</Alert>}
          <FormActions><Button type="submit" disabled={submissionBlocked} loading={busy}>Enviar pedido <ArrowRight size={16} /></Button></FormActions>
          <StickyMobileActions><Button type="submit" disabled={submissionBlocked} loading={busy}>Enviar pedido <ArrowRight size={16} /></Button></StickyMobileActions>
        </form>
      </div>
    </section>
  </div>
}
