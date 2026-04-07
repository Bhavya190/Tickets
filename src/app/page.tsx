"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar"; 
import { 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Home, 
  Ticket as TicketIcon,
  MessageSquare, 
  Cpu, 
  CheckSquare, 
  Users, 
  Monitor, 
  MoreHorizontal, 
  HelpCircle, 
  Rocket, 
  Moon, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight, 
  Copy, 
  ExternalLink,
  PlayCircle,
  Clock,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Columns,
  ArrowUpDown,
  LogOut,
  Sun
} from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  brand: { name: string };
  requester: { email: string; name: string | null };
};

export default function Dashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<{ name?: string, email?: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Fetch user session
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
      })
      .catch(err => console.error("Session error:", err));

    fetch('/api/tickets?my=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTickets(data);
        } else {
          console.warn("API Error:", data.error || data);
          setTickets([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Fetch Error:", err);
        setTickets([]);
        setLoading(false);
      });
  }, []);

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.requester.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: tickets.filter(t => t.status === 'OPEN').length,
    onHold: 0,
    resolutionDue: 0,
    responseDue: 0,
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-screen bg-[#F6F7FB] dark:bg-[#0f172a] font-sans text-slate-700 dark:text-slate-300 flex overflow-hidden transition-colors duration-300">
        <Sidebar />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-[60px] bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 transition-colors">
            <h2 className="text-[17px] font-bold text-slate-800 dark:text-white">My Dashboard</h2>
            
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5]" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-[280px] bg-[#F1F5F9] dark:bg-[#0f172a] border-none rounded-lg py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all placeholder:text-slate-400 dark:text-slate-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 bg-white dark:bg-[#1e293b] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">/</span>
              </div>

              <button 
                onClick={() => router.push('/tickets/new')}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                Create
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 text-slate-500">
                <HelpCircle className="w-5 h-5 cursor-pointer hover:text-slate-800" />
                <Rocket className="w-5 h-5 cursor-pointer hover:text-slate-800" />
                <div className="relative">
                  <Bell className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 cursor-pointer text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
                  )}
                </button>

                <div className="relative">
                  <div 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {getInitials(user?.name)}
                  </div>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                      
                      <button className="w-full text-left px-4 py-2 text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-colors">
                        <User className="w-4 h-4" /> Profile Settings
                      </button>
                      
                      <button 
                        onClick={async () => {
                          await fetch("/api/auth/logout", { method: "POST" });
                          router.push("/login");
                          router.refresh();
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-bold mt-1 border-t border-slate-50 pt-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            


            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-[#4F46E5] p-0.5"><div className="w-full h-full bg-[#4F46E5] rounded-full"></div></div>
                  <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">My Tickets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 dark:border-slate-700 p-0.5"></div>
                  <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">My Groups</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 dark:border-slate-700 p-0.5"></div>
                  <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">Agent</span>
                </label>
              </div>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-[13px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline">Requested Approvals (0)</Link>
                <Link href="#" className="text-[13px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline">Pending Approvals (0)</Link>
                <Link href="#" className="text-[13px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline">Pending Activities (0)</Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Assigned Tickets */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-4">
                 <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Assigned Tickets</h3>
                 <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden transition-colors">
                    {[
                      { label: 'Pending', value: stats.pending, active: true },
                      { label: 'On Hold', value: stats.onHold },
                      { label: 'Resolution Due', value: stats.resolutionDue, icon: HelpCircle },
                      { label: 'Response Due', value: stats.responseDue, icon: HelpCircle },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold text-[12px] uppercase tracking-wide">
                          {stat.label} {stat.icon && <stat.icon className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`text-3xl font-bold ${stat.active ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-300'}`}>{stat.value}</div>
                        {stat.active && <div className="h-1 bg-[#4F46E5] w-full absolute bottom-0 left-0"></div>}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Customer Satisfaction */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                 <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Customer Satisfaction <span className="text-slate-400 font-medium text-[12px]">(Last 30 days)</span></h3>
                 <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between h-[103px] transition-colors">
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center gap-1">
                          <div className="h-8 flex items-center"><ThumbsUp className="w-5 h-5 text-emerald-500" /></div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">0%</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Positive</span>
                       </div>
                       <div className="flex flex-col items-center gap-1">
                          <div className="h-8 flex items-center"><Meh className="w-5 h-5 text-amber-500" /></div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">0%</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Neutral</span>
                       </div>
                       <div className="flex flex-col items-center gap-1">
                          <div className="h-8 flex items-center"><ThumbsDown className="w-5 h-5 text-rose-500" /></div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">0%</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Negative</span>
                       </div>
                    </div>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F1F5F9" className="dark:stroke-slate-800" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#E2E8F0" className="dark:stroke-slate-700" strokeWidth="6" strokeDasharray="175" strokeDashoffset="175" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[11px] font-black leading-none dark:text-white">0%</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">CSAT</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col min-h-[500px] transition-colors overflow-hidden">
              {/* Tabs */}
              <div className="px-6 flex items-center gap-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-black/10">
                <button className="h-[60px] relative text-[13px] font-bold text-[#4F46E5] border-b-2 border-[#4F46E5] shrink-0">
                  Pending <span className="bg-[#EEF2FF] dark:bg-indigo-900/30 px-1.5 py-0.5 rounded ml-1">({stats.pending})</span>
                </button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">
                  Response Due <span className="text-slate-300 dark:text-slate-700 ml-1">(0)</span> <HelpCircle className="w-3.5 h-3.5 inline ml-1 opacity-50" />
                </button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">
                  Resolution Due <span className="text-slate-300 dark:text-slate-700 ml-1">(0)</span> <HelpCircle className="w-3.5 h-3.5 inline ml-1 opacity-50" />
                </button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">Created</button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">Requested</button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">Participated <HelpCircle className="w-3.5 h-3.5 inline ml-1 opacity-50" /></button>
                <button className="h-[60px] text-[13px] font-bold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors shrink-0">Mentioned</button>
              </div>

              {/* Table Toolbar */}
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-black/5">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by Title or ID" 
                      className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-all placeholder:text-slate-400 dark:text-slate-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="px-3 py-1.5 bg-[#EEF2FF] dark:bg-indigo-900/40 text-[#4F46E5] dark:text-indigo-400 text-[12px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/50">Pending</button>
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[12px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Hold</button>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    Created - Desc
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <Columns className="w-4 h-4 text-slate-400" />
                    Columns
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-black/10 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-500 uppercase">Ticket ID</th>
                      <th className="px-6 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-500 uppercase">Created On</th>
                      <th className="px-6 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-500 uppercase">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-medium italic">Scanning tickets...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center opacity-30">
                            <TicketIcon className="w-12 h-12 mb-4 dark:text-slate-400" />
                            <p className="font-bold text-lg dark:text-slate-400">No tickets found</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 cursor-pointer group transition-colors"
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline">#{ticket.id.slice(0, 4)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">{ticket.subject}</div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(ticket.createdAt).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-bold text-[#4F46E5] dark:text-indigo-400 bg-[#EEF2FF] dark:bg-indigo-900/30 px-2 py-0.5 rounded transition-colors">{ticket.status}</span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                           {ticket.brand.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-auto bg-slate-50/20 dark:bg-black/5">
                <div className="flex items-center gap-4 text-slate-400">
                  <ChevronsLeft className="w-5 h-5 cursor-not-allowed opacity-30" />
                  <ChevronLeft className="w-5 h-5 cursor-not-allowed opacity-30" />
                  <div className="w-8 h-8 bg-[#EEF2FF] dark:bg-indigo-900/30 text-[#4F46E5] dark:text-indigo-400 rounded flex items-center justify-center font-bold text-[13px]">1</div>
                  <ChevronRight className="w-5 h-5 cursor-not-allowed opacity-30" />
                  <ChevronsRight className="w-5 h-5 cursor-not-allowed opacity-30" />
                </div>
                <div className="text-[12px] font-bold text-slate-400 dark:text-slate-500">
                  1 of 1 pages ({filteredTickets.length} item)
                </div>
              </div>
            </div>

          </div>

          {/* Floating Chat Button */}
          <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#4F46E5] dark:bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 shadow-indigo-500/20">
            <MessageSquare className="w-7 h-7 fill-white" />
          </button>
        </main>
      </div>
  );
}
