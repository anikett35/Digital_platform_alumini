import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Clock, Users, Plus, X, RefreshCw, Loader } from 'lucide-react';

const TYPE_COLORS = {
  Workshop: 'badge-violet', Networking: 'badge-blue', Seminar: 'badge-amber',
  Conference: 'badge-green', Webinar: 'badge-blue', Social: 'badge-gray', 'Career Fair': 'badge-red',
};

function EventModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', description:'', date:'', time:'', location:'', type:'Workshop', maxAttendees:50, duration:'2 hours', organizer:'' });
  const [loading, setLoading] = useState(false);
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await eventsAPI.createEvent(form);
      toast.success('Event created!');
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-violet-600" />Create Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="label">Title *</label><input name="title" value={form.title} onChange={change} className="input" required /></div>
          <div><label className="label">Description *</label><textarea name="description" value={form.description} onChange={change} className="input resize-none" rows={3} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date *</label><input type="date" name="date" value={form.date} onChange={change} className="input" required /></div>
            <div><label className="label">Time *</label><input type="time" name="time" value={form.time} onChange={change} className="input" required /></div>
          </div>
          <div><label className="label">Location *</label><input name="location" value={form.location} onChange={change} className="input" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select name="type" value={form.type} onChange={change} className="input">
                {['Workshop','Networking','Seminar','Conference','Webinar','Social','Career Fair'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Max Attendees</label><input type="number" name="maxAttendees" value={form.maxAttendees} onChange={change} className="input" min={1} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Duration</label><input name="duration" value={form.duration} onChange={change} className="input" placeholder="e.g. 2 hours" /></div>
            <div><label className="label">Organizer</label><input name="organizer" value={form.organizer} onChange={change} className="input" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Event'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAllEvents();
      setEvents(res.data || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const register = async (id) => {
    try { await eventsAPI.registerForEvent(id); toast.success('Registered!'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const unregister = async (id) => {
    try { await eventsAPI.unregisterFromEvent(id); toast.success('Unregistered'); load(); }
    catch { toast.error('Failed'); }
  };

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now);
  const past     = events.filter(e => new Date(e.date) < now);
  const shown    = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Calendar className="w-5 h-5" /><h1 className="text-xl font-bold">Events</h1></div>
          <p className="text-violet-100 text-sm">{upcoming.length} upcoming events</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-4 py-2 rounded-xl hover:bg-violet-50 transition-all text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('upcoming')} className={`tab-btn ${tab === 'upcoming' ? 'tab-btn-active' : 'tab-btn-inactive'}`}>Upcoming ({upcoming.length})</button>
        <button onClick={() => setTab('past')} className={`tab-btn ${tab === 'past' ? 'tab-btn-active' : 'tab-btn-inactive'}`}>Past ({past.length})</button>
        <button onClick={load} className="ml-auto btn-secondary p-2"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div className="card p-12 text-center"><Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500">No {tab} events</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map(event => {
            const isRegistered = event.registeredUsers?.includes(user?.id);
            const spots = event.maxAttendees - (event.registeredUsers?.length || 0);
            return (
              <div key={event._id} className="card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                    <span className={TYPE_COLORS[event.type] || 'badge-gray'}>{event.type}</span>
                  </div>
                  {isRegistered && <span className="badge-green shrink-0">Registered</span>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{event.description}</p>
                <div className="space-y-1.5 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-500" />{new Date(event.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})} at {event.time}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-violet-500" />{event.location}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-violet-500" />{event.registeredUsers?.length || 0}/{event.maxAttendees} registered {spots > 0 ? `· ${spots} spots left` : '· Full'}</div>
                  {event.duration && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-500" />{event.duration}</div>}
                </div>
                {tab === 'upcoming' && user?.role !== 'admin' && (
                  isRegistered
                    ? <button onClick={() => unregister(event._id)} className="btn-secondary w-full text-xs py-2 text-red-600 border-red-200 hover:bg-red-50">Cancel Registration</button>
                    : spots > 0
                      ? <button onClick={() => register(event._id)} className="btn-primary w-full text-xs py-2">Register Now</button>
                      : <button disabled className="btn-secondary w-full text-xs py-2 opacity-50">Event Full</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <EventModal onClose={() => setShowCreate(false)} onSaved={load} />}
    </div>
  );
}
