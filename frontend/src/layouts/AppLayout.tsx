import { Bell, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const links = user?.role === 'student' ? [['/dashboard', 'Dashboard'], ['/courses', 'Explore'], ['/my-learning', 'My learning'], ['/certificates', 'Certificates']] : user?.role === 'instructor' ? [['/dashboard', 'Studio'], ['/courses', 'Explore']] : [['/dashboard', 'Control room'], ['/courses', 'Catalog']];
  return <div className="min-h-screen bg-[#f4f1e8] text-[#18221d]">
    <header className="sticky top-0 z-20 border-b border-[#d8d2c3] bg-[#f4f1e8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="grid h-9 w-9 place-items-center rounded-full bg-[#d86445] text-white"><BookOpen size={18} /></span><span className="font-sans text-xs font-bold uppercase tracking-[0.22em]">SkillForge</span></Link>
        <button className="rounded p-2 lg:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={`${open ? 'absolute left-0 right-0 top-full flex border-b bg-[#f4f1e8] p-5' : 'hidden'} flex-col gap-4 lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0`}>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `font-sans text-sm ${isActive ? 'font-bold text-[#d86445]' : 'text-[#657066] hover:text-[#18221d]'}`}>{label}</NavLink>)}
          {user ? <><Link to="/notifications" className="text-[#657066]" title="Notifications"><Bell size={18} /></Link><button onClick={logout} className="flex items-center gap-2 font-sans text-sm text-[#657066] hover:text-[#d86445]"><LogOut size={16} /> Log out</button></> : <><Link to="/login" className="font-sans text-sm">Log in</Link><Link to="/register" className="rounded-full bg-[#18221d] px-4 py-2 font-sans text-sm text-white">Join SkillForge</Link></>}
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
  </div>;
}
