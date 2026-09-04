import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Clock3, Save } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { GeneralSettingsDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

type ContactSettings = GeneralSettingsDto & { contactPhone?: string | null; whatsappNumber?: string | null; contactEmail?: string | null }

export function GeneralSettingsPage() {
  const api = useApi()
  const can = useCan()
  const settings = useQuery({
    queryKey: ['operations', 'settings', 'general'],
    queryFn: () => api.operations.getGeneralSettings(),
    enabled: can('settings.read'),
  })

  if (settings.isLoading) return <LoadingState label="A carregar configurações." />
  if (settings.isError || !settings.data) return <ErrorState title="Não foi possível carregar as configurações gerais." />

  const initial = settings.data as ContactSettings
  return <GeneralSettingsForm key={`${initial.organizationName}:${initial.businessTimezone}:${initial.contactPhone ?? ''}:${initial.whatsappNumber ?? ''}:${initial.contactEmail ?? ''}`} initial={initial} />
}

function GeneralSettingsForm({ initial }: { initial: ContactSettings }) {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [organizationName, setOrganizationName] = useState(initial.organizationName)
  const [businessTimezone, setBusinessTimezone] = useState(initial.businessTimezone)
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber ?? '')
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? '')

  const save = useMutation({
    mutationFn: () => api.operations.updateGeneralSettings({ organizationName, businessTimezone, contactPhone, whatsappNumber, contactEmail } as never),
    onSuccess: (value) => {
      queryClient.setQueryData(['operations', 'settings', 'general'], value)
      void queryClient.invalidateQueries({ queryKey: ['public', 'config'] })
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">CONFIGURAÇÕES</span><h1>Geral</h1><p>Identidade operacional, fuso horário e canais públicos usados pelo website, agendamento e pedidos.</p></div></header>
    <section className="catalog-admin__summary">
      <article><small>Organização</small><strong>{initial.organizationName}</strong></article>
      <article><small>Telefone</small><strong>{initial.contactPhone || '—'}</strong></article>
      <article><small>WhatsApp</small><strong>{initial.whatsappNumber || '—'}</strong></article>
      <article><small>Fuso horário</small><strong>{initial.businessTimezone}</strong></article>
    </section>
    <div className="catalog-admin__layout">
      <main className="catalog-admin__main">
        <div className="catalog-admin__empty" style={{ textAlign: 'left' }}>
          <Building2 size={22} aria-hidden="true" />
          <h3>Contacto humano como fallback real</h3>
          <p>Telefone, WhatsApp e email configurados aqui podem aparecer nos fluxos públicos. Se um cliente não encontrar um slot adequado, continua a poder falar diretamente com a Castro’s sem perder o contexto.</p>
        </div>
      </main>
      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">EDITAR</span><h2>Definições gerais</h2></div><Clock3 size={20} aria-hidden="true" /></div>
        <form className="catalog-admin__form" onSubmit={submit}>
          <label>Nome da organização<input required maxLength={160} value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} /></label>
          <label>Slug<input value={initial.organizationSlug} readOnly aria-readonly="true" /><small>Identificador técnico. Não é alterado nesta área.</small></label>
          <label>Fuso horário<input required maxLength={80} value={businessTimezone} onChange={(event) => setBusinessTimezone(event.target.value)} placeholder="Africa/Maputo" /><small>Utilize um identificador IANA válido, por exemplo Africa/Maputo.</small></label>
          <label>Telefone público<input maxLength={50} value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+258 ..." /></label>
          <label>WhatsApp público<input maxLength={50} value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} placeholder="+258 ..." /><small>Use um número capaz de receber mensagens WhatsApp.</small></label>
          <label>Email público<input type="email" maxLength={320} value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="contacto@..." /></label>
          {save.isError && <p className="field-error" role="alert">Não foi possível guardar as configurações. Confirme os dados e tente novamente.</p>}
          {save.isSuccess && <p role="status">Configurações guardadas.</p>}
          <button className="button button--primary" type="submit" disabled={!can('settings.manage') || save.isPending}><Save size={16} />{save.isPending ? 'A guardar…' : 'Guardar configurações'}</button>
        </form>
      </aside>
    </div>
  </section>
}
