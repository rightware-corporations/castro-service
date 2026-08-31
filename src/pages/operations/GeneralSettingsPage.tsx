import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Clock3, Save } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

export function GeneralSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const settings = useQuery({
    queryKey: ['operations', 'settings', 'general'],
    queryFn: () => api.operations.getGeneralSettings(),
    enabled: can('settings.read'),
  })
  const [organizationName, setOrganizationName] = useState('')
  const [businessTimezone, setBusinessTimezone] = useState('')

  useEffect(() => {
    if (!settings.data) return
    setOrganizationName(settings.data.organizationName)
    setBusinessTimezone(settings.data.businessTimezone)
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => api.operations.updateGeneralSettings({ organizationName, businessTimezone }),
    onSuccess: (value) => {
      queryClient.setQueryData(['operations', 'settings', 'general'], value)
      void queryClient.invalidateQueries({ queryKey: ['public', 'config'] })
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  if (settings.isLoading) return <LoadingState label="A carregar configurações." />
  if (settings.isError || !settings.data) return <ErrorState title="Não foi possível carregar as configurações gerais." />

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">CONFIGURAÇÕES</span><h1>Geral</h1><p>Identidade operacional da organização e fuso horário utilizado pelos fluxos públicos.</p></div></header>
    <section className="catalog-admin__summary">
      <article><small>Organização</small><strong>{settings.data.organizationName}</strong></article>
      <article><small>Slug</small><strong>{settings.data.organizationSlug}</strong></article>
      <article><small>Fuso horário</small><strong>{settings.data.businessTimezone}</strong></article>
      <article><small>Fonte</small><strong>Backend</strong></article>
    </section>
    <div className="catalog-admin__layout">
      <main className="catalog-admin__main">
        <div className="catalog-admin__empty" style={{ textAlign: 'left' }}>
          <Building2 size={22} aria-hidden="true" />
          <h3>Configuração por organização</h3>
          <p>Estas definições são lidas no contexto da organização autenticada. O slug é apresentado apenas para referência e não é alterado por este formulário.</p>
        </div>
      </main>
      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">EDITAR</span><h2>Definições gerais</h2></div><Clock3 size={20} aria-hidden="true" /></div>
        <form className="catalog-admin__form" onSubmit={submit}>
          <label>Nome da organização<input required maxLength={160} value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} /></label>
          <label>Slug<input value={settings.data.organizationSlug} readOnly aria-readonly="true" /><small>Identificador técnico. Não é alterado nesta área.</small></label>
          <label>Fuso horário<input required maxLength={80} value={businessTimezone} onChange={(event) => setBusinessTimezone(event.target.value)} placeholder="Africa/Maputo" /><small>Utilize um identificador IANA válido, por exemplo Africa/Maputo.</small></label>
          {save.isError && <p className="field-error" role="alert">Não foi possível guardar as configurações. Confirme o fuso horário e tente novamente.</p>}
          {save.isSuccess && <p role="status">Configurações guardadas.</p>}
          <button className="button button--primary" type="submit" disabled={!can('settings.manage') || save.isPending}><Save size={16} />{save.isPending ? 'A guardar…' : 'Guardar configurações'}</button>
        </form>
      </aside>
    </div>
  </section>
}
