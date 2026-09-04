import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './router/AppRouter'
import { ScrollToTop } from './router/ScrollToTop'
import { PublicJourneyTracker } from '../features/contact/PublicJourneyTracker'

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PublicJourneyTracker />
      <AppRouter />
    </BrowserRouter>
  )
}
