import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/providers/AppProviders'
import './styles/global.css'
import './styles/public-v2.css'
import './styles/public-pages-v2.css'
import './styles/spaces-v2.css'
import './styles/booking-v2.css'
import './styles/operations-v2.css'
import './styles/operations-data.css'
import './styles/availability-admin.css'
import './styles/catalog-admin.css'
import './styles/access-admin.css'
import './styles/secretary-dashboard.css'
import './styles/owner-executive.css'
import './styles/platform-admin.css'
import './styles/accessibility-foundation.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
