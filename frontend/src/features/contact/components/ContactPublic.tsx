import { useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
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
  return <ContactForm submitRequest={mutation.mutateAsync} isPending={mutation.isPending} isSuccess={mutation.isSuccess} error={mutation.error} />
}

export function ContactForm({ submitRequest, isPending, isSuccess, error }: { submitRequest: (values: ContextualRequest) => Promise<unknown>; isPending: boolean; isSuccess: boolean; error: unknown }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialType = validRequestType(searchParams.get('type'))
  const initialMessage = searchParams.get('message') ?? ''
  const intentContext = useMemo(() => contextFromSearch(searchParams, location.pathname), [location.pathname, searchParams])
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), mode: 'onBlur', defaultValues: { type: initialType, message: initialMessage } })
  const apiError = error instanceof ApiError ? error : undefined
  const apiErrorMessage = apiError ? String(apiError.message) : ''
  const fieldMessage = (value: unknown) => typeof value === 'string' ? value : undefined

  useEffect(() => {
    if (!apiError?.fieldErrors) return
    Object.entries(apiError.fieldErrors).forEach(([field, messages]) => setError(field as Path<ContactFormValues>, { type: 'backend', message: messages[0] }))
  }, [apiError, setError])

  const onSubmit = handleSubmit(async (values) => {
    await submitRequest({ ...values, context: intentContext })
    reset({ type: initialType, message: '' })
  })

  const contextual = intentContext.sourceType !== 'GENERAL'

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
        <div className="contact-v2-form-intro"><span className="eyebrow">O SEU CONTEXTO</span><h2>Conte apenas o que ainda não sabemos.</h2><p>Se chegou a partir de um serviço, formação ou espaço, essa referência segue com o pedido e será validada pelo backend.</p>{contextual && <div className="contact-v2-form-intro__note" role="status"><span>✓</span><p>{sourceLabel(intentContext.sourceType)} — contexto preservado.</p><span>→</span><p>A Secretária receberá a origem juntamente com os seus dados.</p></div>}</div>

        <form className="contact-form contact-form--v2" onSubmit={onSubmit} noValidate>
          <FormSection title="Os seus dados" description="Informação essencial para identificar e responder ao pedido.">
            <div className="contact-form__grid"><TextField id="firstName" label="Nome" required autoComplete="given-name" {...register('firstName')} error={fieldMessage(errors.firstName?.message)} /><TextField id="lastName" label="Apelido" required autoComplete="family-name" {...register('lastName')} error={fieldMessage(errors.lastName?.message)} /><TextField id="email" label="Email" required type="email" autoComplete="email" {...register('email')} error={fieldMessage(errors.email?.message)} /><TextField id="phone" label="Telefone" description="Opcional." autoComplete="tel" {...register('phone')} error={fieldMessage(errors.phone?.message)} /></div>
          </FormSection>
          <FormSection title="Sobre o que quer falar?" description={contextual ? 'Já preservámos a origem. Pode ajustar o enquadramento ou acrescentar apenas o que falta.' : 'Escolha o enquadramento mais próximo. Pode explicar o resto na mensagem.'}>
            <Select id="type" label="Tipo de pedido" required {...register('type')} error={fieldMessage(errors.type?.message)}>{requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>
            <Textarea id="message" label="Mensagem" description="Opcional." rows={7} {...register('message')} error={fieldMessage(errors.message?.message)} />
          </FormSection>
          {isSuccess && <Alert tone="success" title="Pedido submetido.">Recebemos o pedido e o respetivo contexto. A equipa poderá dar seguimento sem lhe pedir para repetir a origem.</Alert>}
          {apiError?.code === 'VALIDATION_FAILED' && <Alert tone="danger" title="Verifique os dados.">O backend devolveu erros de validação. Reveja os campos assinalados.</Alert>}
          {Boolean(error && !apiError) && <ErrorState title="Não foi possível enviar o pedido." />}
          {apiError && apiError.code !== 'VALIDATION_FAILED' && <Alert tone="danger" title="Não foi possível enviar o pedido.">{apiErrorMessage}</Alert>}
          <FormActions><Button type="submit" loading={isPending}>Enviar pedido <ArrowRight size={16} /></Button></FormActions>
          <StickyMobileActions><Button type="submit" loading={isPending}>Enviar pedido <ArrowRight size={16} /></Button></StickyMobileActions>
        </form>
      </div>
    </section>
  </div>
}
