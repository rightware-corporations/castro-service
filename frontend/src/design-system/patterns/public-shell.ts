export type PublicShellId = 'SH01' | 'SH02' | 'SH03' | 'SH04' | 'SH05' | 'SH06' | 'SH07' | 'SH08'

/** Insights is editorial; its dedicated state contracts remain content-dependent. */
export function publicShellForPath(pathname: string): { id: PublicShellId; family: string } {
  const segment = pathname.split('/')[1]
  switch (segment) {
    case '': return { id: 'SH01', family: 'home' }
    case 'servicos': return { id: 'SH02', family: 'services' }
    case 'formacao': return { id: 'SH03', family: 'training' }
    case 'espacos': return { id: 'SH04', family: 'spaces' }
    case 'sobre': return { id: 'SH05', family: 'about' }
    case 'insights': return { id: 'SH05', family: 'insights' }
    case 'contacto': return { id: 'SH06', family: 'contact' }
    case 'reservar': return { id: 'SH07', family: 'booking' }
    default: return { id: 'SH08', family: 'recovery' }
  }
}
