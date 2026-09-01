import { useEffect } from 'react'
import { useForm, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ArrowUpRight, Building2, GraduationCap, Handshake, MessageCircle } from 'lucide-react'
import type { RequestRequestDto } from '../../../api/contracts'
import { ApiError } from '../../../api/client/errors'
import { Alert, ErrorState } from '../../../design-system/patterns/feedback-overlays'
import { FormActions, FormSection, StickyMobileActions } from '../../../design-system/patterns/forms'
import { Button, Select, Textarea, TextField } from '../../../design-system/primitives'
import { useCreateRequest } from '../hooks'
import { contactSchema, requestTypeOptions, type ContactFormValues } from '../schema'

const intentCards = [
  { icon: Handshake, title: 'Consultoria', text: 'Quando existe um desafio, uma decisão ou um contexto organizacional a compreender.' },
  { icon: Building2, title: 'Proposta corporativa', text: 'Quando a conversa envolve uma organização, equipa ou necessidade específica.' },
  { icon: GraduationCap, title: 'Formação', text: 'Para palestras, workshops, formação ou treinamento corporativo personalizado.' },
  { icon: MessageCircle, title: 'Contacto geral', text: 'Quando ainda não é necessário enquadrar o pedido numa área específica.' },
]

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

  return <div className="contact-v2-page">
    <section className="contact-v2-hero">
      <div className="container contact-v2-hero__grid">
        <div><span className="eyebrow eyebrow--light">CASTRO’S · CONTACTO</span><h1>Começamos pela <em>conversa certa.</em></h1></div>
        <div className="contact-v2-hero__copy"><span>CONTACTO / 04</span><p>Partilhe o contexto, a necessidade ou a ideia que quer explorar. O formulário organiza o pedido sem obrigar a ter a solução definida à partida.</p><ArrowUpRight size={24} aria-hidden="true" /></div>
      </div>
    </section>

    <section className="container contact-v2-intents" aria-label="Tipos de conversa">
      {intentCards.map(({ icon: Icon, title, text }, index) => <article key={title}><div><span>0{index + 1}</span><Icon size={19} aria-hidden="true" /></div><h2>{title}</h2><p>{text}</p></article>)}
    </section>

    <section className="contact-v2-form-region">
      <div className="container contact-v2-layout">
        <div className="contact-v2-form-intro"><span className="eyebrow">O SEU CONTEXTO</span><h2>Conte o suficiente para sabermos por onde começar.</h2><p>Os campos abaixo correspondem diretamente ao contrato público de pedidos. Não pedimos dados que o fluxo atual não utiliza.</p><div className="contact-v2-form-intro__note"><span>01</span><p>Escolha o tipo de pedido.</p><span>02</span><p>Partilhe os dados essenciais.</p><span>03</span><p>Acrescente contexto, se fizer sentido.</p></div></div>

        <form className="contact-form contact-form--v2" onSubmit={onSubmit} noValidate>
          <FormSection title="Os seus dados" description="Informação essencial para identificar e responder ao pedido.">
            <div className="contact-form__grid"><TextField id="firstName" label="Nome" required autoComplete="given-name" {...register('firstName')} error={fieldMessage(errors.firstName?.message)} /><TextField id="lastName" label="Apelido" required autoComplete="family-name" {...register('lastName')} error={fieldMessage(errors.lastName?.message)} /><TextField id="email" label="Email" required type="email" autoComplete="email" {...register('email')} error={fieldMessage(errors.email?.message)} /><TextField id="phone" label="Telefone" description="Opcional." autoComplete="tel" {...register('phone')} error={fieldMessage(errors.phone?.message)} /></div>
          </FormSection>
          <FormSection title="Sobre o que quer falar?" description="Escolha o enquadramento mais próximo. Pode explicar o resto na mensagem.">
            <Select id="type" label="Tipo de pedido" required {...register('type')} error={fieldMessage(errors.type?.message)}>{requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>
            <Textarea id="message" label="Mensagem" description="Opcional." rows={7} {...register('message')} error={fieldMessage(errors.message?.message)} />
          </FormSection>
          {isSuccess && <Alert tone="success" title="Pedido submetido.">O pedido foi recebido pelo serviço configurado.</Alert>}
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
