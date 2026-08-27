import { Route, Routes, useParams } from 'react-router-dom'
import { AuthLayout, OperationsLayout, PublicLayout } from '../layouts/Layouts'
import { AuthPage } from '../../pages/auth/AuthPages'
import { NotFound } from '../../pages/NotFound'
import { PublicFoundationPage } from '../../pages/public/PublicFoundationPage'
import { OperationsFoundationPage } from '../../pages/operations/OperationsFoundationPage'

const publicPaths = [
  '/servicos', '/servicos/:slug', '/formacao', '/formacao/:slug', '/espacos', '/espacos/:slug',
  '/espacos/:slug/explorar', '/espacos/:slug/configurar', '/espacos/:slug/disponibilidade', '/contacto',
]

const operationPaths = [
  '/app/dashboard', '/app/pedidos', '/app/pedidos/:id', '/app/reservas', '/app/reservas/:id',
  '/app/clientes', '/app/clientes/:id', '/app/calendario', '/app/espacos', '/app/servicos', '/app/formacao',
  '/app/tarefas', '/app/relatorios', '/app/configuracoes', '/app/configuracoes/servicos',
  '/app/configuracoes/formacao', '/app/configuracoes/espacos', '/app/configuracoes/layouts',
  '/app/configuracoes/recursos', '/app/configuracoes/disponibilidade', '/app/configuracoes/conteudo',
  '/app/configuracoes/utilizadores', '/app/configuracoes/funcoes', '/app/configuracoes/permissoes',
  '/app/configuracoes/geral',
]

function BookingStep({ title }: { title: string }) {
  const { bookableType, bookableId } = useParams()
  return <section className="route-placeholder container"><span className="eyebrow">RESERVAR · FOUNDATION</span><h1>{title}</h1><p>Contexto preservado: {bookableType} / {bookableId}. O passo será ligado ao domínio partilhado SPACE, SERVICE e COURSE_SESSION.</p></section>
}

function BookingConfirmation() {
  const { reference } = useParams()
  return <section className="route-placeholder container"><span className="eyebrow">RESERVAR · CONFIRMAÇÃO</span><h1>Pedido recebido.</h1><p>Referência: {reference}. O detalhe de confirmação será ligado ao contrato BookingResponse.</p></section>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicFoundationPage />} />
        {publicPaths.map((path) => <Route key={path} path={path} element={<PublicFoundationPage />} />)}
        <Route path="/reservar" element={<BookingStep title="Escolher o que pretende reservar" />} />
        <Route path="/reservar/:bookableType/:bookableId/data" element={<BookingStep title="Escolher data" />} />
        <Route path="/reservar/:bookableType/:bookableId/horario" element={<BookingStep title="Escolher horário" />} />
        <Route path="/reservar/:bookableType/:bookableId/dados" element={<BookingStep title="Dados do cliente" />} />
        <Route path="/reservar/:bookableType/:bookableId/rever" element={<BookingStep title="Rever pedido" />} />
        <Route path="/reservar/confirmacao/:reference" element={<BookingConfirmation />} />
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
  )
}
