"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Tag, 
  Paperclip,
  Calendar,
  MoreVertical,
  MessageSquare
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  brand: { name: string };
  requester: { email: string; name: string | null };
  attachments: { id: string; fileName: string; fileUrl: string }[];
};

export default function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then(res => res.json())
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'RESOLVED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium italic">Opening ticket #{id.slice(0, 8)}...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
          <p className="text-slate-500 mb-8">The ticket you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F6F7FB] dark:bg-[#0f172a] font-sans text-slate-700 dark:text-slate-300 flex overflow-hidden transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 pt-10 pb-20 custom-scrollbar">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* Breadcrumbs & Back */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/tickets" 
            className="p-2.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:shadow-md dark:shadow-none group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest gap-2">
            <span>Tickets</span>
            <span className="opacity-30">/</span>
            <span className="text-slate-600 dark:text-slate-300 italic">#{ticket.id.slice(0, 8)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{ticket.subject}</h1>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Tag className="w-3.5 h-3.5 opacity-60" />
                      {ticket.brand.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              <div className="p-8">
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>

              {ticket.attachments.length > 0 && (
                <div className="p-8 bg-slate-50/50 dark:bg-black/10 border-t border-slate-50 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({ticket.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ticket.attachments.map(att => (
                      <a 
                        key={att.id} 
                        href={att.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                      >
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl mr-3 group-hover:bg-indigo-600 transition-colors">
                          <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{att.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder for Conversation/Activity */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center py-20 opacity-60">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">No activity yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Replies and status changes will appear here.</p>
            </div>
          </div>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ticket Status</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Status</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {getStatusIcon(ticket.status)}
                    <span className="text-[13px] font-black">{ticket.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Priority</span>
                  <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border tracking-tighter shadow-sm ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Requester</h3>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[15px] font-bold truncate text-slate-900 dark:text-white">{ticket.requester.name || 'Anonymous'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate italic">{ticket.requester.email}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold py-4 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none transition-all hover:-translate-y-1 active:scale-95">
              Update Ticket
            </button>
          </div>

        </div>
      </div>
    </main>
  </div>
);
}
