import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BarChart3, Building2, CalendarDays, ChevronRight, LayoutDashboard, LogOut, Menu, UsersRound, X } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApi, useSession } from '../../app/providers/AppProviders'
import { SkipLink } from '../../design-system/patterns/navigation'

const ownerLinks = [
  { to:'/owner', label:'Visão geral', icon:LayoutDashboard, end:true },
  { to:'/owner/agenda', label:'Agenda', icon:CalendarDays },
  { to:'/owner/atividade', label:'Atividade', icon:Building2 },
  { to:'/owner/clientes', label:'Clientes', icon:UsersRound },
  { to:'/owner/relatorios', label:'Relatórios', icon:BarChart3 },
]

export function OwnerLayout(){
  const api=useApi(); const session=useSession(); const navigate=useNavigate(); const qc=useQueryClient()
  const [open,setOpen]=useState(false); const [loggingOut,setLoggingOut]=useState(false)
  const logout=async()=>{setLoggingOut(true);try{await api.auth.logout()}finally{qc.setQueryData(['auth','me'],null);qc.removeQueries({queryKey:['owner']});setLoggingOut(false);navigate('/login',{replace:true})}}
  return <div className="owner-layout">
    <SkipLink />
    <aside id="owner-navigation-panel" className={`owner-sidebar ${open?'owner-sidebar--open':''}`}>
      <div className="owner-sidebar__brand"><Link to="/owner"><strong>CASTRO’S</strong><span>EXECUTIVE</span></Link><button type="button" onClick={()=>setOpen(false)} aria-label="Fechar navegação"><X size={19}/></button></div>
      <div className="owner-sidebar__identity"><small>CEO / OWNER</small><strong>{session?.displayName||'Castro’s Services'}</strong><span>Visão executiva da organização</span></div>
      <nav aria-label="Navegação executiva">{ownerLinks.map(({to,label,icon:Icon,end})=><NavLink key={to} to={to} end={end} onClick={()=>setOpen(false)}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="owner-sidebar__bottom"><Link to="/"><ChevronRight size={15}/>Ver website</Link><button type="button" disabled={loggingOut} onClick={logout}><LogOut size={15}/>{loggingOut?'A sair…':'Terminar sessão'}</button></div>
    </aside>
    {open&&<button className="owner-scrim" type="button" onClick={()=>setOpen(false)} aria-label="Fechar navegação"/>}
    <div className="owner-main">
      <header className="owner-topbar"><button type="button" className="owner-menu" onClick={()=>setOpen(true)} aria-label="Abrir navegação" aria-expanded={open} aria-controls="owner-navigation-panel"><Menu size={20}/></button><span>Castro’s Services</span><div><small>Área executiva</small><strong>{session?.displayName||'CEO / Owner'}</strong></div></header>
      <main id="main-content" tabIndex={-1} className="owner-content"><Outlet/></main>
    </div>
  </div>
}
