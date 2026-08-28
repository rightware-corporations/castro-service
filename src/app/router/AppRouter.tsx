import { Route, Routes } from 'react-router-dom'
import { AuthLayout, OperationsLayout, PublicLayout } from '../layouts/Layouts'
import { AuthPage } from '../../pages/auth/AuthPages'
import { NotFound } from '../../pages/NotFound'
import { OperationsFoundationPage } from '../../pages/operations/OperationsFoundationPage'
import { ComponentLab } from '../../pages/dev/ComponentLab'
import { HomePublic } from '../../features/home/components/HomePublic'
import { ServicesCatalog, ServiceDetail } from '../../features/services/components/ServicesPublic'
import { CoursesCatalog, CourseDetail } from '../../features/courses/components/CoursesPublic'
import { ContactPublic } from '../../features/contact/components/ContactPublic'
import { SpaceConfigurator, SpaceDetail, SpaceExplorer, SpacesCatalog } from '../../features/spaces/components/SpacesPublic'
import { BookingConfirmation, BookingCustomer, BookingDate, BookingReview, BookingTime } from '../../features/booking/components/BookingPublic'
import { DeferredPublicPage } from '../../pages/public/DeferredPublicPage'

const operationPaths = [
  '/app/dashboard', '/app/pedidos', '/app/pedidos/:id', '/app/reservas', '/app/reservas/:id', '/app/clientes', '/app/clientes/:id',
  '/app/calendario', '/app/espacos', '/app/servicos', '/app/formacao', '/app/tarefas', '/app/relatorios', '/app/configuracoes',
  '/app/configuracoes/servicos', '/app/configuracoes/formacao', '/app/configuracoes/espacos', '/app/configuracoes/layouts',
  '/app/configuracoes/recursos', '/app/configuracoes/disponibilidade', '/app/configuracoes/conteudo', '/app/configuracoes/utilizadores',
  '/app/configuracoes/funcoes', '/app/configuracoes/permissoes', '/app/configuracoes/geral',
]

export function AppRouter() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePublic />} />
      <Route path="/servicos" element={<ServicesCatalog />} />
      <Route path="/servicos/:slug" element={<ServiceDetail />} />
      <Route path="/formacao" element={<CoursesCatalog />} />
      <Route path="/formacao/:slug" element={<CourseDetail />} />
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
    <Route element={<OperationsLayout />}>
      {operationPaths.map((path) => <Route key={path} path={path} element={<OperationsFoundationPage />} />)}
    </Route>
  </Routes>
}
