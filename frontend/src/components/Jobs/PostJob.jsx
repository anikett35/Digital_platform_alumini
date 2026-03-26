import React, { useState } from "react";
import { jobsAPI } from "../../services/api.jsx";
import { Briefcase, Building, MapPin, DollarSign, FileText, CheckCircle, Loader } from "lucide-react";

export default function PostJob() {
  const [form, setForm] = useState({ title: "", company: "", location: "", type: "Full-time", description: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsAPI.createJob(form);
      setSuccess(true);
      setForm({ title: "", company: "", location: "", type: "Full-time", description: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error posting job", error);
      alert("Failed to post job. Please ensure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="glass-card rounded-3xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200/50 animate-fade-in-up relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 mb-8 pb-6 border-b border-slate-200/60">
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-4 shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Post a Job</h1>
          </div>
          <p className="text-slate-500 font-medium ml-16">Share opportunities with the alumni community</p>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700 font-medium animate-fade-in">
            <CheckCircle className="w-5 h-5 mr-3" />
            Job posted successfully! It will now appear on the job board.
          </div>
        )}

        <form onSubmit={submit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Job Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  name="title"
                  value={form.title}
                  placeholder="e.g. Senior Frontend Engineer" 
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Company Name *</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  name="company"
                  value={form.company}
                  placeholder="e.g. Acme Corp" 
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="location"
                  value={form.location}
                  placeholder="e.g. New York, NY or Remote" 
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Job Type</label>
              <div className="relative">
                <select 
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium appearance-none" 
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Job Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <textarea 
                name="description"
                value={form.description}
                placeholder="Describe the role, responsibilities, and requirements..." 
                onChange={handleChange}
                rows={6}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium resize-y" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] transition-all hover:-translate-y-1 flex items-center disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <><Loader className="w-5 h-5 mr-2 animate-spin" /> Posting...</>
              ) : (
                'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
