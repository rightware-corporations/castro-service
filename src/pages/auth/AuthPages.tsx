import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

type AuthKind = 'login' | 'forgot' | 'reset'
type FormValues = { email?: string; password?: string; confirmation?: string }

function createAuthSchema(kind: AuthKind) {
  return z.object({
    email: z.string().optional(),
    password: z.string().optional(),
    confirmation: z.string().optional(),
  }).superRefine((values, context) => {
    if ((kind === 'login' || kind === 'forgot') && !values.email?.includes('@')) context.addIssue({ code: 'custom', path: ['email'], message: 'Indique um email válido.' })
    if ((kind === 'login' || kind === 'reset') && !values.password) context.addIssue({ code: 'custom', path: ['password'], message: 'Indique a palavra-passe.' })
    if (kind === 'reset') {
      if (!values.confirmation) context.addIssue({ code: 'custom', path: ['confirmation'], message: 'Repita a nova palavra-passe.' })
      if (values.password && values.confirmation && values.password !== values.confirmation) context.addIssue({ code: 'custom', path: ['confirmation'], message: 'As palavras-passe devem coincidir.' })
    }
  })
}

export function AuthPage({ kind }: { kind: AuthKind }) {
  const schema = createAuthSchema(kind)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })
  const copy = {
    login: { eyebrow: 'ÁREA INTERNA', title: 'Entrar na Castro’s', description: 'A autenticação será ligada ao contrato backend aprovado.', action: 'Entrar' },
    forgot: { eyebrow: 'RECUPERAÇÃO', title: 'Recuperar acesso', description: 'Indique o email associado à sua conta.', action: 'Enviar instruções' },
    reset: { eyebrow: 'NOVA PALAVRA-PASSE', title: 'Definir nova palavra-passe', description: 'A política de palavra-passe será aplicada pelo backend quando o contrato estiver disponível.', action: 'Guardar palavra-passe' },
  }[kind]

  return (
    <section className="auth-page container">
      <div className="auth-card">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <form onSubmit={handleSubmit(() => undefined)} noValidate>
          {(kind === 'login' || kind === 'forgot') && <label className="field"><span>Email</span><input type="email" autoComplete="email" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>}
          {(kind === 'login' || kind === 'reset') && <label className="field"><span>{kind === 'reset' ? 'Nova palavra-passe' : 'Palavra-passe'}</span><input type="password" autoComplete={kind === 'reset' ? 'new-password' : 'current-password'} {...register('password')} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>}
          {kind === 'reset' && <label className="field"><span>Repetir palavra-passe</span><input type="password" autoComplete="new-password" {...register('confirmation')} />{errors.confirmation && <small className="field-error">{errors.confirmation.message}</small>}</label>}
          <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>{copy.action}</button>
        </form>
        {kind === 'login' ? <Link className="text-link auth-link" to="/forgot-password">Esqueci-me da palavra-passe <span aria-hidden="true">→</span></Link> : <Link className="text-link auth-link" to="/login">Voltar ao início de sessão <span aria-hidden="true">→</span></Link>}
      </div>
    </section>
  )
}
