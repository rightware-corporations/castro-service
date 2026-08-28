import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/providers/AppProviders'
import './styles/global.css'
import './styles/public-v2.css'
import './styles/public-pages-v2.css'
import './styles/spaces-v2.css'
import './styles/booking-v2.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
