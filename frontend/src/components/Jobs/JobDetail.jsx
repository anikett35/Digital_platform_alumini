import React from "react";
import { Briefcase, Building, MapPin, DollarSign, Clock, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";

export default function JobDetail({ job, onBack }) {
  if (!job) return null;

  return (
    <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200/50 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-primary-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Jobs
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-200/60">
        <div className="flex gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 flex-shrink-0 to-slate-200 flex items-center justify-center shadow-inner border border-slate-200">
            {job.logo ? (
              <span className="font-extrabold text-4xl text-slate-700">{job.logo}</span>
            ) : (
              <Building className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{job.title}</h1>
            <p className="text-xl font-medium text-slate-600 mb-4">{job.company}</p>
            
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-500" />
                {job.location || 'Remote'}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100/50">
                <Briefcase className="w-4 h-4 mr-1.5" />
                {job.type || 'Full-time'}
              </span>
              {job.salary && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-100/50">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {job.salary}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <button className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center">
            Apply Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
          <button className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all">
            Save for later
          </button>
          <span className="text-xs font-medium text-slate-400 text-center flex items-center justify-center mt-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Posted {job.posted || 'recently'}
          </span>
        </div>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">About the Role</h3>
          <p>{job.description || 'No detailed description provided for this position. Please contact the company or visit their careers page for more information.'}</p>
        </section>

        {job.requirements && (
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h3>
            <ul className="space-y-3">
              {Array.isArray(job.requirements) ? (
                job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                  <span>{job.requirements}</span>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
