import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useApi } from '../../app/providers/AppProviders'
import type { AuthSession } from '../../domain'

type AuthKind = 'login' | 'forgot' | 'reset'
type FormValues = { email?: string; password?: string; confirmation?: string }
type LoginLocationState = { from?: string }

function createAuthSchema(kind: AuthKind) {
  return z.object({ email: z.string().optional(), password: z.string().optional(), confirmation: z.string().optional() }).superRefine((values, context) => {
    if ((kind === 'login' || kind === 'forgot') && !values.email?.includes('@')) context.addIssue({ code: 'custom', path: ['email'], message: 'Indique um email válido.' })
    if ((kind === 'login' || kind === 'reset') && !values.password) context.addIssue({ code: 'custom', path: ['password'], message: 'Indique a palavra-passe.' })
    if (kind === 'reset') {
      if (!values.confirmation) context.addIssue({ code: 'custom', path: ['confirmation'], message: 'Repita a nova palavra-passe.' })
      if (values.password && values.confirmation && values.password !== values.confirmation) context.addIssue({ code: 'custom', path: ['confirmation'], message: 'As palavras-passe devem coincidir.' })
    }
  })
}

export function AuthPage({ kind }: { kind: AuthKind }) {
  const api = useApi()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const schema = createAuthSchema(kind)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })
  const copy = {
    login: { eyebrow: 'ÁREA INTERNA', title: 'Entrar na Castro’s', description: 'Acesso reservado à equipa autorizada.', action: 'Entrar' },
    forgot: { eyebrow: 'RECUPERAÇÃO', title: 'Recuperar acesso', description: 'A recuperação automática ainda não está disponível.', action: 'Enviar instruções' },
    reset: { eyebrow: 'NOVA PALAVRA-PASSE', title: 'Definir nova palavra-passe', description: 'A alteração automática de palavra-passe ainda não está disponível.', action: 'Guardar palavra-passe' },
  }[kind]

  const submit = async (values: FormValues) => {
    if (kind !== 'login') {
      setError('root', { message: 'Este fluxo ainda não está ligado ao backend.' })
      return
    }
    try {
      const session = await api.auth.login(values.email!, values.password!)
      queryClient.setQueryData(['auth', 'me'], session)
      const state = location.state as LoginLocationState | null
      navigate(authenticatedDestination(session, state?.from), { replace: true })
    } catch {
      setError('root', { message: 'Não foi possível iniciar sessão. Verifique as credenciais e tente novamente.' })
    }
  }

  return <section className="auth-page container"><div className="auth-card">
    <span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p>
    <form onSubmit={handleSubmit(submit)} noValidate>
      {(kind === 'login' || kind === 'forgot') && <label className="field"><span>Email</span><input type="email" autoComplete="email" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>}
      {(kind === 'login' || kind === 'reset') && <label className="field"><span>{kind === 'reset' ? 'Nova palavra-passe' : 'Palavra-passe'}</span><input type="password" autoComplete={kind === 'reset' ? 'new-password' : 'current-password'} {...register('password')} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>}
      {kind === 'reset' && <label className="field"><span>Repetir palavra-passe</span><input type="password" autoComplete="new-password" {...register('confirmation')} />{errors.confirmation && <small className="field-error">{errors.confirmation.message}</small>}</label>}
      {errors.root && <div className="field-error" role="alert">{errors.root.message}</div>}
      <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'A processar…' : copy.action}</button>
    </form>
    {kind === 'login' ? <Link className="text-link auth-link" to="/forgot-password">Esqueci-me da palavra-passe <span aria-hidden="true">→</span></Link> : <Link className="text-link auth-link" to="/login">Voltar ao início de sessão <span aria-hidden="true">→</span></Link>}
  </div></section>
}

export function authenticatedDestination(session: AuthSession, from?: string) {
  if (session.permissions?.includes('platform.admin')) return '/platform'
  if (session.experienceType === 'OWNER') return from?.startsWith('/owner') ? from : '/owner'
  return from?.startsWith('/app/') ? from : '/app/dashboard'
}
