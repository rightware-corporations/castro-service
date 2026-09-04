import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthLayout, OperationsLayout, PublicLayout } from '../layouts/Layouts'
import { useApi, useCan, useSession, useSessionError, useSessionReady } from '../providers/AppProviders'
import type { Permission } from '../../domain'
import { AuthPage } from '../../pages/auth/AuthPages'
import { NotFound } from '../../pages/NotFound'
import { OperationsFoundationPage } from '../../features/operations/OperationsFoundationPage'
import { SecretaryDashboardPage } from '../../features/operations/SecretaryDashboardPage'
import { SecretaryCalendarPage } from '../../features/operations/SecretaryCalendarPage'
import { SecretarySettingsHomePage } from '../../features/operations/SecretarySettingsHomePage'
import { BookingsPagedPage, CustomersPagedPage, RequestsPagedPage } from '../../features/operations/PagedOperationsPages'
import { AvailabilitySettingsPage } from '../../features/admin/AvailabilitySettingsPage'
import { AuditSettingsPage } from '../../features/admin/AuditSettingsPage'
import { ServiceSettingsPage } from '../../features/services/ServiceSettingsPage'
import { CourseSettingsPage } from '../../features/courses/CourseSettingsPage'
import { CourseRegistrationPage } from '../../features/courses/CourseRegistrationPage'
import { SpaceSettingsPage } from '../../features/spaces/SpaceSettingsPage'
import { SpaceExperienceSettingsPage } from '../../features/spaces/SpaceExperienceSettingsPage'
import { SpaceScenesSettingsPage } from '../../features/spaces/SpaceScenesSettingsPage'
import { SpaceHotspotsSettingsPage } from '../../features/spaces/SpaceHotspotsSettingsPage'
import { ManualBookingPage } from '../../features/operations/ManualBookingPage'
import { AccessSettingsPage } from '../../features/admin/AccessSettingsPage'
import { GeneralSettingsPage } from '../../features/admin/GeneralSettingsPage'
import { ContentSettingsPage } from '../../features/admin/ContentSettingsPage'
import { TasksPage } from '../../features/operations/TasksPage'
import { NotificationsPage } from '../../features/operations/NotificationsPage'
import { ReportsPage } from '../../features/operations/ReportsPage'
import { OwnerLayout } from '../../features/owner/OwnerLayout'
import { OwnerDashboardPage } from '../../features/owner/OwnerDashboardPage'
import { OwnerActivityPage, OwnerAgendaPage, OwnerCustomersPage } from '../../features/owner/OwnerOverviewPages'
import { PlatformDashboardPage } from '../../features/platform/PlatformDashboardPage'
import { PlatformLayout } from '../../features/platform/PlatformLayout'
import { PlatformLoginPage } from '../../features/platform/PlatformLoginPage'
import { ComponentLab } from '../../pages/dev/ComponentLab'
import { HomePublic } from '../../features/home/components/HomePublic'
import { ServicesCatalog, ServiceDetail } from '../../features/services/components/ServicesPublic'
import { CoursesCatalog, CourseDetail } from '../../features/courses/components/CoursesPublic'
import { ContactPublic } from '../../features/contact/components/ContactPublic'
import { SpaceConfigurator, SpaceDetail, SpaceExplorer, SpacesCatalog } from '../../features/spaces/components/SpacesPublic'
import { BookingConfirmation, BookingCustomer, BookingDate, BookingReview, BookingTime } from '../../features/booking/components/BookingPublic'
import { DeferredPublicPage } from '../../pages/public/DeferredPublicPage'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const permissionRoutes: ReadonlyArray<readonly [string, Permission]> = [
  ['/app/pedidos/:id', 'request.read'],
  ['/app/reservas/:id', 'booking.read'],
  ['/app/clientes/:id', 'customer.read'],
  ['/app/espacos', 'space.read'], ['/app/servicos', 'service.read'], ['/app/formacao', 'course.read'],
]

const isPlatformSession = (permissions?: string[]) => permissions?.includes('platform.admin') === true

function OperationsGuard() {
  const api = useApi(); const session = useSession(); const ready = useSessionReady(); const sessionError = useSessionError(); const location = useLocation()
  if (api.kind === 'mock' && import.meta.env.DEV) return <OperationsLayout />
  if (!ready) return <main className="operations-auth-loading"><LoadingState label="A validar sessão." /></main>
  if (sessionError) return <main className="operations-auth-loading"><ErrorState title="Não foi possível validar a sessão." /></main>
  if (!session?.authenticated) return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  if (isPlatformSession(session.permissions)) return <Navigate to="/platform" replace />
  if (session.experienceType === 'OWNER') return <Navigate to="/owner" replace />
  return <OperationsLayout />
}

function OwnerGuard() {
  const api = useApi(); const session = useSession(); const ready = useSessionReady(); const sessionError = useSessionError(); const location = useLocation()
  if (api.kind === 'mock' && import.meta.env.DEV) return <OwnerLayout />
  if (!ready) return <main className="operations-auth-loading"><LoadingState label="A validar sessão." /></main>
  if (sessionError) return <main className="operations-auth-loading"><ErrorState title="Não foi possível validar a sessão." /></main>
  if (!session?.authenticated) return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  if (isPlatformSession(session.permissions)) return <Navigate to="/platform" replace />
  if (session.experienceType !== 'OWNER') return <Navigate to="/app/dashboard" replace />
  return <OwnerLayout />
}

function PlatformGuard() {
  const api = useApi(); const session = useSession(); const ready = useSessionReady(); const sessionError = useSessionError(); const location = useLocation()
  if (api.kind === 'mock' && import.meta.env.DEV) return <PlatformLayout />
  if (!ready) return <main className="operations-auth-loading"><LoadingState label="A validar sessão de plataforma." /></main>
  if (sessionError) return <main className="operations-auth-loading"><ErrorState title="Não foi possível validar a sessão de plataforma." /></main>
  if (!session?.authenticated) return <Navigate to="/platform/login" state={{ from: `${location.pathname}${location.search}` }} replace />
  if (!isPlatformSession(session.permissions)) return <Navigate to={session.experienceType === 'OWNER' ? '/owner' : '/app/dashboard'} replace />
  return <PlatformLayout />
}

function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const can = useCan()
  if (can(permission)) return <>{children}</>
  return <section className="ops-v2__page"><header className="ops-v2__hero"><div><span className="eyebrow">ACESSO</span><h1>Sem acesso</h1><p>A tua função não possui a permissão necessária para abrir esta área.</p></div></header><div className="catalog-admin__empty"><h3>Permissão necessária</h3><p><code>{permission}</code></p></div></section>
}

const guarded = (permission: Permission, element: ReactNode) => <RequirePermission permission={permission}>{element}</RequirePermission>

export function AppRouter() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePublic />} />
      <Route path="/servicos" element={<ServicesCatalog />} />
      <Route path="/servicos/:slug" element={<ServiceDetail />} />
      <Route path="/formacao" element={<CoursesCatalog />} />
      <Route path="/formacao/:slug" element={<CourseDetail />} />
      <Route path="/formacao/:slug/sessoes/:sessionId/inscricao" element={<CourseRegistrationPage />} />
      <Route path="/espacos" element={<SpacesCatalog />} />
      <Route path="/espacos/:slug" element={<SpaceDetail />} />
      <Route path="/espacos/:slug/explorar" element={<SpaceExplorer />} />
      <Route path="/espacos/:slug/configurar" element={<SpaceConfigurator />} />
      <Route path="/espacos/:slug/disponibilidade" element={<DeferredPublicPage />} />
      <Route path="/contacto" element={<ContactPublic />} />
      <Route path="/reservar" element={<DeferredPublicPage />} />
      <Route path="/reservar/:bookableType/:bookableId/data" element={<BookingDate />} />
      <Route path="/reservar/:bookableType/:bookableId/horario" element={<BookingTime />} />
      <Route path="/reservar/:bookableType/:bookableId/dados" element={<BookingCustomer />} />
      <Route path="/reservar/:bookableType/:bookableId/rever" element={<BookingReview />} />
      <Route path="/reservar/confirmacao/:reference" element={<BookingConfirmation />} />
      {import.meta.env.DEV && <Route path="/__dev/components" element={<ComponentLab />} />}
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<AuthPage kind="login" />} />
      <Route path="/forgot-password" element={<AuthPage kind="forgot" />} />
      <Route path="/reset-password" element={<AuthPage kind="reset" />} />
    </Route>
    <Route path="/platform/login" element={<PlatformLoginPage />} />
    <Route element={<PlatformGuard />}>
      <Route path="/platform" element={<PlatformDashboardPage />} />
    </Route>
    <Route element={<OwnerGuard />}>
      <Route path="/owner" element={guarded('dashboard.read', <OwnerDashboardPage />)} />
      <Route path="/owner/agenda" element={guarded('booking.read', <OwnerAgendaPage />)} />
      <Route path="/owner/atividade" element={guarded('dashboard.read', <OwnerActivityPage />)} />
      <Route path="/owner/clientes" element={guarded('customer.read', <OwnerCustomersPage />)} />
      <Route path="/owner/relatorios" element={guarded('report.read', <ReportsPage />)} />
    </Route>
    <Route element={<OperationsGuard />}>
      <Route path="/app/dashboard" element={guarded('dashboard.read', <SecretaryDashboardPage />)} />
      <Route path="/app/pedidos" element={guarded('request.read', <RequestsPagedPage />)} />
      <Route path="/app/reservas" element={guarded('booking.read', <BookingsPagedPage />)} />
      <Route path="/app/clientes" element={guarded('customer.read', <CustomersPagedPage />)} />
      <Route path="/app/calendario" element={guarded('booking.read', <SecretaryCalendarPage />)} />
      <Route path="/app/reservas/nova" element={guarded('booking.create', <ManualBookingPage />)} />
      <Route path="/app/tarefas" element={guarded('task.read', <TasksPage />)} />
      <Route path="/app/notificacoes" element={guarded('notification.read', <NotificationsPage />)} />
      <Route path="/app/relatorios" element={guarded('report.read', <ReportsPage />)} />
      <Route path="/app/configuracoes" element={guarded('settings.read', <SecretarySettingsHomePage />)} />
      <Route path="/app/configuracoes/disponibilidade" element={guarded('availability.read', <AvailabilitySettingsPage />)} />
      <Route path="/app/configuracoes/servicos" element={guarded('service.read', <ServiceSettingsPage />)} />
      <Route path="/app/configuracoes/formacao" element={guarded('course.read', <CourseSettingsPage />)} />
      <Route path="/app/configuracoes/espacos" element={guarded('space.read', <SpaceSettingsPage />)} />
      <Route path="/app/configuracoes/layouts" element={guarded('space.read', <SpaceExperienceSettingsPage />)} />
      <Route path="/app/configuracoes/recursos" element={guarded('space.read', <SpaceExperienceSettingsPage />)} />
      <Route path="/app/configuracoes/cenas" element={guarded('space.read', <SpaceScenesSettingsPage />)} />
      <Route path="/app/configuracoes/hotspots" element={guarded('space.read', <SpaceHotspotsSettingsPage />)} />
      <Route path="/app/configuracoes/utilizadores" element={guarded('user.read', <AccessSettingsPage />)} />
      <Route path="/app/configuracoes/funcoes" element={guarded('role.read', <AccessSettingsPage />)} />
      <Route path="/app/configuracoes/permissoes" element={guarded('permission.read', <AccessSettingsPage />)} />
      <Route path="/app/configuracoes/geral" element={guarded('settings.read', <GeneralSettingsPage />)} />
      <Route path="/app/configuracoes/conteudo" element={guarded('content.read', <ContentSettingsPage />)} />
      <Route path="/app/configuracoes/auditoria" element={guarded('audit.read', <AuditSettingsPage />)} />
      {permissionRoutes.map(([path, permission]) => <Route key={path} path={path} element={guarded(permission, <OperationsFoundationPage />)} />)}
    </Route>
  </Routes>
}
