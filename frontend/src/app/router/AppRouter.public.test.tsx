import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppRouter } from './AppRouter'

vi.mock('../../features/home/components/HomeLaunchPublic', () => ({ HomeLaunchPublic: () => <div>route:home</div> }))
vi.mock('../../features/home/components/AboutPublic', () => ({ AboutPublic: () => <div>route:about</div> }))
vi.mock('../../features/home/components/InsightsPublic', () => ({ InsightsPublic: () => <div>route:insights</div> }))
vi.mock('../../features/services/components/ServicesPublic', () => ({
  ServicesCatalog: () => <div>route:services</div>,
  ServiceDetail: () => <div>route:service-detail</div>,
}))
vi.mock('../../features/courses/components/CoursesPublic', () => ({ CoursesCatalog: () => <div>route:courses</div> }))
vi.mock('../../features/courses/CourseMarketingDetailPage', () => ({ CourseMarketingDetailPage: () => <div>route:course-detail</div> }))
vi.mock('../../features/courses/CourseRegistrationPage', () => ({ CourseRegistrationPage: () => <div>route:course-registration</div> }))
vi.mock('../../features/contact/components/ContactPublic', () => ({ ContactPublic: () => <div>route:contact</div> }))
vi.mock('../../features/spaces/components/SpacesPublic', () => ({
  SpacesCatalog: () => <div>route:spaces</div>,
  SpaceDetail: () => <div>route:space-detail</div>,
  SpaceExplorer: () => <div>route:space-explorer</div>,
  SpaceConfigurator: () => <div>route:space-configurator</div>,
}))
vi.mock('../../features/booking/components/BookingPublic', () => ({
  BookingDate: () => <div>route:booking-date</div>,
  BookingTime: () => <div>route:booking-time</div>,
  BookingCustomer: () => <div>route:booking-customer</div>,
  BookingReview: () => <div>route:booking-review</div>,
  BookingConfirmation: () => <div>route:booking-confirmation</div>,
}))
vi.mock('../../pages/public/DeferredPublicPage', () => ({ DeferredPublicPage: () => <div>route:deferred</div> }))
vi.mock('../../pages/NotFound', () => ({ NotFound: () => <div>route:not-found</div> }))

function renderPath(path: string) {
  render(<MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>)
}

describe('public router contract', () => {
  it.each([
    ['/', 'route:home'],
    ['/sobre', 'route:about'],
    ['/insights', 'route:insights'],
    ['/servicos', 'route:services'],
    ['/servicos/lideranca', 'route:service-detail'],
    ['/formacao', 'route:courses'],
    ['/formacao/lideranca', 'route:course-detail'],
    ['/formacao/lideranca/sessoes/session-1/inscricao', 'route:course-registration'],
    ['/espacos', 'route:spaces'],
    ['/espacos/sala-reuniao', 'route:space-detail'],
    ['/espacos/sala-reuniao/explorar', 'route:space-explorer'],
    ['/espacos/sala-reuniao/configurar', 'route:space-configurator'],
    ['/espacos/sala-reuniao/disponibilidade', 'route:deferred'],
    ['/contacto', 'route:contact'],
    ['/reservar', 'route:deferred'],
    ['/reservar/SERVICE/service-1/data', 'route:booking-date'],
    ['/reservar/SPACE/space-1/horario', 'route:booking-time'],
    ['/reservar/SERVICE/service-1/dados', 'route:booking-customer'],
    ['/reservar/SERVICE/service-1/rever', 'route:booking-review'],
    ['/reservar/confirmacao/CASTRO-001', 'route:booking-confirmation'],
    ['/pagina-inexistente', 'route:not-found'],
  ])('resolves %s to the intended public destination', (path, marker) => {
    renderPath(path)
    expect(screen.getByText(marker)).toBeInTheDocument()
  })
})
