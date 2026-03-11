"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Ticket as TicketIcon, 
  MessageSquare, 
  Cpu, 
  CheckSquare, 
  User, 
  Monitor, 
  Settings,
  MoreHorizontal
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, href: '/', active: pathname === '/' },
    { icon: TicketIcon, href: '/tickets', active: pathname.startsWith('/tickets') },
    { icon: MessageSquare, href: '#' },
    { icon: Cpu, label: 'AI', href: '#' },
    { icon: CheckSquare, href: '#' },
    { icon: User, href: '#' },
    { icon: Monitor, href: '#' },
  ];

  return (
    <aside className="w-[68px] bg-[#7032E3] dark:bg-[#7032E3] flex flex-col items-center py-4 gap-2 shrink-0 h-full overflow-y-auto no-scrollbar border-r border-black/10 transition-colors z-50">
      <Link href="/" className="w-[42px] h-[42px] bg-white rounded-xl flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-white/90 transition-all shadow-md shrink-0">
        <div className="flex gap-0.5 items-end justify-center">
            <div className="w-1.5 h-3 bg-[#7032E3] rounded-sm" />
            <div className="w-1.5 h-4 bg-[#7032E3] rounded-sm" />
            <div className="w-1.5 h-2 bg-[#7032E3] rounded-sm" />
        </div>
      </Link>
      
      {menuItems.map((item, i) => (
        <Link 
          key={i} 
          href={item.href}
          className={`w-[46px] h-[46px] flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl relative group shrink-0 ${item.active ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          {item.label === 'AI' ? (
              <span className={`text-[17px] font-black tracking-tighter ${item.active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>Ai</span>
          ) : (
              <item.icon className={`w-5.5 h-5.5 ${item.active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} fill={item.active ? 'currentColor' : 'none'} strokeWidth={item.active ? 0 : 2}/>
          )}
          {item.active && <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
        </Link>
      ))}
      
      <div className="mt-auto w-[46px] h-[46px] flex items-center justify-center cursor-pointer text-white/70 hover:text-white hover:bg-white/10 rounded-xl shrink-0 transition-all">
        <Settings className="w-5.5 h-5.5" />
      </div>
      <div className="w-[46px] h-[46px] flex items-center justify-center cursor-pointer text-white/70 hover:text-white hover:bg-white/10 rounded-xl shrink-0 transition-all">
        <MoreHorizontal className="w-5.5 h-5.5" />
      </div>
    </aside>
  );
}
