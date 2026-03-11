"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import { Trash2, UploadCloud, Info, X, ChevronDown, Paperclip, Search, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; 

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type FormData = {
  brand: string;
  isPrivate: boolean;
  requester: string;
  subject: string;
  description: string;
  assigneeType: 'auto' | 'agent';
  priority: string;
  files: File[];
};

export default function CreateTicketForm() {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      brand: 'Individual',
      isPrivate: false,
      requester: '',
      subject: '',
      description: '',
      assigneeType: 'auto',
      priority: 'Normal',
      files: []
    }
  });

  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [requesters, setRequesters] = useState<{id: string, email: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedFiles = watch("files");

  useEffect(() => {
    fetch('/api/brands').then(res => res.json()).then(setBrands);
    fetch('/api/requesters').then(res => res.json()).then(setRequesters);
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      
      const formData = new FormData();
      formData.append('brand', data.brand);
      formData.append('isPrivate', String(data.isPrivate));
      formData.append('requester', data.requester);
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      
      data.files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json();
      if (responseData.success) {
        setSuccessMessage("Ticket created successfully! Redirecting...");
        setTimeout(() => {
          router.push('/tickets');
        }, 1500);
      } else {
        alert("Failed to create ticket.");
      }
    } catch(err) {
      console.error(err);
      alert("Error submitting ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedFiles = Array.from(e.dataTransfer.files);
    setValue("files", [...selectedFiles, ...draggedFiles], { shouldValidate: true });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setValue("files", [...selectedFiles, ...selected], { shouldValidate: true });
      // Reset input value so same file can be selected again if removed
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="h-screen bg-[#F6F7FB] dark:bg-[#0f172a] font-sans text-slate-700 dark:text-slate-300 flex overflow-hidden transition-colors duration-300">
        <Sidebar />

        <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-[#1e293b] shadow-xl rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Ticket</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Raise a new support request for your brand.</p>
                </div>
                <Link 
                  href="/tickets" 
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tickets
                </Link>
              </div>

              {successMessage && (
                <div className="mx-8 mt-6 p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg flex items-center animate-in fade-in slide-in-from-top-4">
                  <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{successMessage}</span>
                  <button onClick={() => setSuccessMessage("")} className="ml-auto text-indigo-400 hover:text-indigo-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-8 text-[#1a1a1a]">
                {/* Brand Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center">
                      Brand <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                       <select
                          {...register("brand", { required: "This field is required." })}
                          className="w-full appearance-none bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer pr-10"
                       >
                          <option value="Individual">Individual</option>
                          {brands.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.brand && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.brand.message}</p>}
                  </div>

                  <div className="flex items-center group">
                    <input type="checkbox" id="isPrivate" {...register("isPrivate")} 
                      className="rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer transition-colors" 
                    />
                    <label htmlFor="isPrivate" className="ml-2.5 text-[14px] text-gray-600 dark:text-slate-400 flex items-center cursor-pointer select-none font-medium">
                      Make this ticket private 
                      <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                    </label>
                  </div>
                </div>

                {/* Requester Section */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300">
                      Requester <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center divide-x divide-indigo-200 dark:divide-slate-800">
                      <button 
                        type="button" 
                        className="pr-3 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        onClick={async () => {
                          const res = await fetch('/api/auth/me');
                          const data = await res.json();
                          if (data?.user?.email) setValue('requester', data.user.email);
                        }}
                      >
                        Add Me
                      </button>
                      <button type="button" className="pl-3 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">Add new contact</button>
                    </div>
                  </div>
                  <div className="relative">
                     <input
                        {...register("requester", { 
                          required: "This field is required.",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="Select Requester or type email"
                     />
                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                  <div className="flex justify-between mt-1.5 items-start">
                     {errors.requester ? (
                       <p className="text-rose-500 text-xs font-medium">{errors.requester.message}</p>
                     ) : <div/>}
                     <button type="button" className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Add CC</button>
                  </div>
                </div>

                {/* Subject Section */}
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                    Subject <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    {...register("subject", { required: "This field is required." })}
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter Subject"
                  />
                  {errors.subject && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.subject.message}</p>}
                </div>

                {/* Description Section */}
                <div>
                   <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300">
                      Description <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <button type="button" className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors uppercase tracking-tight">Use Canned Response</button>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden min-h-[280px] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all border-b-0">
                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: "Description is required." }}
                      render={({ field }) => (
                        <ReactQuill 
                          theme="snow" 
                          value={field.value} 
                          onChange={field.onChange} 
                          className="bg-white dark:bg-[#0f172a] dark:text-white"
                          placeholder="Enter Description. Type / to open a list, and @mention can be used to notify an agent."
                        />
                      )}
                    />
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-slate-700" />
                  {errors.description && <p className="text-rose-500 text-xs mt-2 font-medium">{errors.description.message}</p>}
                </div>

                {/* File Upload Section */}
                <div 
                  className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileSelect} />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700 mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-[14px] font-medium text-gray-700 dark:text-slate-200">
                       Drop file here or <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Browse</span>
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-slate-500 mt-1">(Up to 20MB)</p>
                  </div>
                </div>
                
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm animate-in zoom-in-95 duration-200">
                         <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded mr-3">
                            <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-700 dark:text-slate-200 truncate">{file.name}</p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                         </div>
                         <button 
                          type="button" 
                          className="ml-2 text-gray-400 dark:text-slate-500 hover:text-rose-500 transition-colors"
                          onClick={(e) => {
                             e.stopPropagation();
                             const updated = [...selectedFiles];
                             updated.splice(idx, 1);
                             setValue("files", updated);
                          }}
                         >
                           <X className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assignee & Priority Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50 dark:border-slate-800">
                  <div className="space-y-3">
                    <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300">Assignee</label>
                    <div className="flex flex-col space-y-3 px-1">
                      <label className="flex items-center text-[14px] text-gray-700 dark:text-slate-400 cursor-pointer group">
                        <input type="radio" value="auto" {...register("assigneeType")} 
                          className="mr-3 h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-700 transition-all" 
                        />
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Auto Assign</span>
                        <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                      </label>
                      <label className="flex items-center text-[14px] text-gray-700 dark:text-slate-400 cursor-pointer group">
                        <input type="radio" value="agent" {...register("assigneeType")} 
                          className="mr-3 h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-700 transition-all" 
                        />
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Select Agent</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-gray-700 dark:text-slate-300 mb-2">
                      Priority <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        {...register("priority", { required: true })}
                        className="w-full appearance-none bg-indigo-50/30 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg px-4 py-2.5 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-all text-indigo-900 dark:text-indigo-400 pr-10"
                      >
                        <option value="Low" className="dark:bg-[#1e293b]">Low</option>
                        <option value="Normal" className="dark:bg-[#1e293b]">Normal</option>
                        <option value="High" className="dark:bg-[#1e293b]">High</option>
                        <option value="Critical" className="dark:bg-[#1e293b]">Critical</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-start space-x-4 pt-8 border-t border-gray-100 dark:border-slate-800">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[15px] py-3 px-8 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                  >
                    {isSubmitting ? "Creating..." : "Create Ticket"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => window.location.reload()}
                    className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white font-semibold text-[15px] py-3 px-6 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>


      </div>
    </>
  );
}
