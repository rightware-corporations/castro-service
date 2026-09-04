import { MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublicConfig } from '../home/hooks'
import { whatsappHref } from './intent'

export function PublicContactChannels({ contextMessage, contactHref = '/contacto' }: { contextMessage: string; contactHref?: string }) {
  const config = usePublicConfig()
  const phone = config.data?.contactPhone
  const whatsapp = config.data?.whatsappNumber
  const whatsappUrl = whatsapp ? whatsappHref(whatsapp, contextMessage) : undefined
  return <div className="public-contact-channels" aria-label="Outras formas de falar com a Castro’s">
    <span>Prefere falar connosco?</span>
    <div>
      {phone ? <a href={`tel:${phone.replace(/\s/g, '')}`}><Phone size={16} aria-hidden="true" />{phone}</a> : null}
      {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a> : null}
      {!phone && !whatsappUrl ? <Link to={contactHref}>Enviar um pedido</Link> : null}
    </div>
  </div>
}
