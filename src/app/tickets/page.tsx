"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; 

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import {
  Search, 
  Bell, 
  ChevronDown, 
  Ticket as TicketIcon, 
  HelpCircle, 
  Moon, 
  Sun,
  User,
  ArrowUpDown,
  RefreshCw,
  Edit2,
  MoreHorizontal,
  Clock,
  ExternalLink,
  History,
  Shield,
  FileText,
  Users,
  Flag,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Monitor,
  Trash2,
  Tag,
  Link as LinkIcon
} from "lucide-react";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  description?: string;
  brand: { name: string };
  requester: { email: string; name: string | null };
  attachments?: { fileName: string; fileUrl: string }[];
  comments?: Comment[];
};

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<{ name?: string, email?: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Messages");
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Fetch user session
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data.user);
      });

    // Fetch tickets
    fetch('/api/tickets')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (Array.isArray(data)) {
          setTickets(data);
          if (data.length > 0) setSelectedTicket(data[0]);
        } else {
          console.warn("API response is not an array:", data.error || data);
          setTickets([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Error fetching tickets:', err);
        setTickets([]);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleReplySubmit = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      setIsSubmittingReply(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent })
      });

      if (res.ok) {
        const newComment = await res.json();
        // Update selected ticket comments
        const updatedTicket = {
          ...selectedTicket,
          comments: [...(selectedTicket.comments || []), newComment]
        };
        setSelectedTicket(updatedTicket);
        
        // Update tickets list
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        
        setReplyContent("");
        setIsReplying(false);
      } else {
        alert("Failed to post reply");
      }
    } catch (error) {
      console.error("Reply Submit Error:", error);
      alert("Error posting reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'resolved': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-[#0f172a] font-sans text-slate-700 dark:text-slate-300 flex overflow-hidden transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Top Header (BoldDesk Style) */}
        <header className="h-[52px] bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 transition-colors">
          <div className="flex items-center gap-3">
             <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                All Pending Tickets 
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:rotate-180 transition-all duration-500" />
                <Edit2 className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-purple-600" />
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search" 
                className="w-[240px] bg-slate-100 dark:bg-[#0f172a] border-none rounded-md py-1.5 pl-9 pr-8 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 shadow-inner"
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 text-slate-400 font-bold px-1.5">/</span>
            </div>
            
            <div className="flex items-center gap-2 pr-2">
              <button 
                  onClick={() => router.push('/tickets/new')}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-500/10"
              >
                  Create <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-0.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><HelpCircle className="w-4.5 h-4.5" /></button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors relative">
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                </button>
                <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold ml-2 shadow-sm border-2 border-white dark:border-slate-800">
                    {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Middle Pane: Tickets List */}
          <section className="w-[340px] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
            {/* List Header Filter */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="relative">
                    <select className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 pl-3 pr-10 text-[13px] font-medium outline-none focus:border-purple-500 transition-all cursor-pointer">
                        <option>All Brands</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Title or ID" 
                        className="w-full border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50 rounded-md py-1.5 pl-9 pr-4 text-[12px] outline-none focus:border-purple-500 transition-all placeholder:text-slate-400"
                        value={searchTerm || ""}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-3.5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 bg-[#f8fafc] dark:bg-transparent transition-colors">
                <div className="flex items-center gap-3 pl-1.5">
                    <div className="w-[18px] h-[18px] rounded-[4px] border border-[#d8b4fe] bg-[#f3e8ff] dark:bg-white dark:border-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-colors"></div>
                    <span className="text-[13px] font-medium text-[#475569] dark:text-[#94a3b8] uppercase tracking-wide">Select All</span>
                </div>
                <div className="flex items-center gap-3 pr-2">
                   <div className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                   </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar dark:bg-[#1a1c2e] transition-colors">
               {loading ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-50">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                    <p className="text-xs font-medium">Loading...</p>
                  </div>
               ) : filteredTickets.map((ticket, index) => (
                  <div 
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsReplying(false);
                    }}
                    className={`p-3.5 pt-4 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-all relative group ${selectedTicket?.id === ticket.id ? 'bg-[#f4e8ff] dark:bg-[#1e1b4b] dark:border-[#2e2a5d]' : 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                  >
                    <div className="flex gap-3">
                        <div className="relative shrink-0 mt-0.5 ml-1.5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[15px] font-bold shadow-sm ${index % 2 === 0 ? 'bg-[#ec4899]' : 'bg-[#10b981]'} ${isDarkMode && selectedTicket?.id === ticket.id ? 'bg-[#7032E3]' : ''}`}>
                                {getInitials(ticket.requester.name || ticket.requester.email)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-1.5">
                            <div className="flex justify-between items-start mb-0.5 mt-[-2px]">
                                <h4 className={`text-[15px] flex-1 font-bold truncate ${selectedTicket?.id === ticket.id && isDarkMode ? 'text-[#c084fc]' : 'text-[#334155] dark:text-[#a78bfa]'}`}>
                                    {ticket.requester.name || ticket.requester.email.split('@')[0]}
                                </h4>
                                <span className={`text-[11px] font-medium pt-0.5 ${selectedTicket?.id === ticket.id && !isDarkMode ? 'text-[#475569]' : 'text-[#94a3b8]'}`}>3 Mar</span>
                            </div>
                            <div className="flex justify-between items-start mb-1.5 min-h-[18px]">
                                <p className={`text-[13.5px] truncate pr-3 flex-1 ${selectedTicket?.id === ticket.id && !isDarkMode ? 'text-[#475569]' : 'text-[#64748b] dark:text-[#cbd5e1]'}`}>
                                    {ticket.subject}
                                </p>
                                <ChevronDown className={`w-[14px] h-[14px] shrink-0 opacity-70 mt-1 ${selectedTicket?.id === ticket.id && !isDarkMode ? 'text-[#64748b]' : 'text-[#94a3b8]'}`} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[12px] flex items-center gap-1.5 font-medium truncate ${selectedTicket?.id === ticket.id && !isDarkMode ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                                    <User className="w-[14px] h-[14px]" /> --
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>
               ))}
            </div>

            {/* Pagination/Summary */}
            <div className="flex items-center justify-center gap-6 p-3 bg-slate-50/50 dark:bg-black/5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                 <button className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded transition-all"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                 <span className="text-[11px] font-bold text-slate-500">1 - {filteredTickets.length} of {tickets.length}</span>
                 <button className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded transition-all"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            </div>
          </section>

          {/* Right Pane: Ticket Detail */}
          <section className="flex-1 flex flex-col bg-slate-50/30 dark:bg-transparent overflow-hidden">
            {selectedTicket ? (
                <>
                    {/* Detail Header */}
                    <div className="h-[52px] bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center text-[12px] font-medium text-slate-500 gap-1.5">
                                <span className="hover:text-purple-600 cursor-pointer">{selectedTicket.brand.name}</span>
                                <ChevronRight className="w-3 h-3 opacity-50" />
                                <span className="text-slate-800 dark:text-slate-200 font-bold">5</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-4 border-l border-slate-200 dark:border-slate-700 pl-4">
                                <button className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400"><LinkIcon className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400"><Tag className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400"><RefreshCw className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded p-0.5">
                                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                             </div>
                             <div className="flex items-center gap-2 ml-4">
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><History className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Users className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Shield className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Maximize2 className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#fcfcfd] dark:bg-transparent">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Card Content */}
                            <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                                <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                                    <h1 className="text-[20px] font-bold text-slate-800 dark:text-white mb-4">
                                        {selectedTicket.subject}
                                    </h1>
                                    <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400 text-[12px] font-medium">
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                                            <Monitor className="w-3.5 h-3.5" />
                                            Customer Portal
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 opacity-60" />
                                            {new Date(selectedTicket.createdAt).toLocaleString(undefined, { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold cursor-pointer hover:underline">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Customer Portal
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section */}
                                <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 scrollbar-hide flex overflow-x-auto">
                                    {[`Messages (${1 + (selectedTicket.comments?.length || 0)})`, "Links (0)", "Activities (0)", "Approvals (0)", "Worklog (0)", "Files (1)", "History", "Insights", "Suspended Emails"].map((tab) => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-5 py-3 text-[12px] font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Reply Area */}
                                <div className="p-6 bg-slate-50/30 dark:bg-black/5">
                                    {!isReplying ? (
                                        <div 
                                            onClick={() => setIsReplying(true)}
                                            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-5 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer group"
                                        >
                                            <p className="text-[14px] text-slate-400 group-hover:text-slate-500 italic transition-colors">Reply (r) or Add notes (n)</p>
                                        </div>
                                    ) : (
                                        <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-purple-500/10 transition-all animate-in fade-in zoom-in-95 duration-200">
                                            <ReactQuill 
                                                theme="snow" 
                                                value={replyContent || ""}
                                                onChange={setReplyContent} 
                                                className="border-none"
                                                placeholder="Reply (r) or Add notes (n)"
                                            />
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                                <button 
                                                    onClick={() => setIsReplying(false)}
                                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-[13px] font-bold px-4"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleReplySubmit}
                                                    disabled={isSubmittingReply || !replyContent.trim()}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-[13px] font-bold transition-all disabled:opacity-50"
                                                >
                                                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Conversation Filters */}
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-2">
                                            {[`All (${1 + (selectedTicket.comments?.length || 0)})`, `Public (${1 + (selectedTicket.comments?.length || 0)})`, "Private (0)", "Flagged (0)"].map(f => (
                                                <button key={f} className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${f.startsWith('Public') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                           <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded text-[12px] text-slate-500 font-medium">
                                              Filter by tags <ChevronDown className="w-3.5 h-3.5" />
                                           </div>
                                        </div>
                                    </div>

                                    {/* Message Thread */}
                                    <div className="mt-8 space-y-8">
                                        {/* Original Ticket Description */}
                                        <div className="flex gap-4">
                                            <div className="shrink-0">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[12px] font-bold ring-4 ring-emerald-500/10">
                                                    {getInitials(selectedTicket.requester.name)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex flex-col">
                                                        <h5 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            {selectedTicket.requester.name || selectedTicket.requester.email.split('@')[0]}
                                                            <span className="text-[12px] font-normal text-slate-400">raised this ticket</span>
                                                        </h5>
                                                        <span className="text-[12px] text-slate-400 mt-0.5">
                                                            {new Date(selectedTicket.createdAt).toLocaleString(undefined, { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><Flag className="w-3.5 h-3.5" /></button>
                                                        <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><LinkIcon className="w-3.5 h-3.5" /></button>
                                                        <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                                
                                                <div 
                                                    className="mt-4 text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed ql-editor !p-0 !min-h-0"
                                                    dangerouslySetInnerHTML={{ __html: selectedTicket.description || "<p class='italic text-slate-400'>No description provided.</p>" }}
                                                />

                                                {/* Attachment Preview */}
                                                <div className="mt-6 flex flex-wrap gap-4">
                                                    {selectedTicket.attachments?.map((file, i) => (
                                                        <a 
                                                            key={i}
                                                            href={file.fileUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-4 p-3 pr-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group cursor-pointer hover:border-purple-300 transition-all shadow-sm"
                                                        >
                                                           <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded flex items-center justify-center">
                                                              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                                           </div>
                                                           <div className="flex flex-col">
                                                              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{file.fileName}</span>
                                                              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Attachment</span>
                                                           </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies / Comments */}
                                        {selectedTicket.comments?.map((comment) => (
                                            <div key={comment.id} className="flex gap-4">
                                                <div className="shrink-0">
                                                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[12px] font-bold ring-4 ring-indigo-500/10">
                                                        {getInitials(comment.user.name || comment.user.email)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between group">
                                                        <div className="flex flex-col">
                                                            <h5 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                {comment.user.name || comment.user.email.split('@')[0]}
                                                                <span className="text-[12px] font-normal text-slate-400">replied</span>
                                                            </h5>
                                                            <span className="text-[12px] text-slate-400 mt-0.5">
                                                                {new Date(comment.createdAt).toLocaleString(undefined, { 
                                                                    month: 'short', 
                                                                    day: 'numeric', 
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><Flag className="w-3.5 h-3.5" /></button>
                                                            <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><LinkIcon className="w-3.5 h-3.5" /></button>
                                                            <button className="p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div 
                                                        className="mt-4 text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium ql-editor p-0 min-h-0"
                                                        dangerouslySetInnerHTML={{ __html: comment.content }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-transparent">
                    <div className="flex flex-col items-center opacity-30 text-center">
                        <TicketIcon className="w-20 h-20 mb-6 text-slate-300" />
                        <h3 className="text-xl font-bold dark:text-slate-400">Select a ticket to view details</h3>
                        <p className="text-sm dark:text-slate-500 max-w-[280px] mt-2">Choose a ticket from the left panel to see conversation and manage it.</p>
                    </div>
                </div>
            )}
          </section>


        </div>
      </main>
    </div>
  );
}
