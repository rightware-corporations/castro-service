import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useSession, useSessionReady } from '../../app/providers/AppProviders'
import { mapPlatformSession, platformApi } from './platformApi'

const schema = z.object({
  email: z.string().email('Indique um email válido.'),
  password: z.string().min(1, 'Indique a palavra-passe.'),
})

type Values = z.infer<typeof schema>

export function PlatformLoginPage() {
  const session = useSession()
  const ready = useSessionReady()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onBlur' })

  if (ready && session?.authenticated && session.permissions?.includes('platform.admin')) return <Navigate to="/platform" replace />

  const submit = async (values: Values) => {
    try {
      const dto = await platformApi.login(values.email, values.password)
      const mapped = mapPlatformSession(dto)
      queryClient.setQueryData(['auth', 'me'], mapped)
      navigate('/platform', { replace: true })
    } catch {
      setError('root', { message: 'Não foi possível iniciar a sessão de plataforma. Verifique as credenciais.' })
    }
  }

  return <main className="platform-login">
    <section className="platform-login__brand" aria-label="RIGHTWARE Platform Control">
      <div className="platform-login__brand-inner">
        <span className="platform-kicker">RIGHTWARE</span>
        <h1>Platform<br />Control</h1>
        <p>Administração técnica da plataforma Castro’s Services.</p>
        <div className="platform-login__boundary"><span>SECURITY BOUNDARY</span><strong>Platform administration</strong><small>Separado das funções e permissões da organização.</small></div>
      </div>
    </section>
    <section className="platform-login__form-wrap">
      <div className="platform-login__form">
        <span className="platform-kicker">SUPER ADMIN</span>
        <h2>Acesso à plataforma</h2>
        <p>Utilize apenas a credencial de administração RIGHTWARE.</p>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <label><span>Email</span><input type="email" autoComplete="username" {...register('email')} />{errors.email && <small>{errors.email.message}</small>}</label>
          <label><span>Palavra-passe</span><input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small>{errors.password.message}</small>}</label>
          {errors.root && <div className="platform-login__error" role="alert">{errors.root.message}</div>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'A autenticar…' : 'Entrar no Platform Control'}</button>
        </form>
        <Link to="/">Voltar ao website da Castro’s</Link>
      </div>
    </section>
  </main>
}
