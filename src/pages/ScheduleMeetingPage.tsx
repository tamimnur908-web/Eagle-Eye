import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getLeadById, updateLeadMeeting } from '../services/firestoreService';
import { Lead } from '../types';
import {
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ScheduleMeetingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('16:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [scheduledBy, setScheduledBy] = useState('Eagle Eye Digital Strategist');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setError('No lead ID specified. Please use the scheduling link provided in your notification email.');
      setLoading(false);
      return;
    }

    // Default meeting date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setMeetingDate(dateStr);

    if (currentUser?.email) {
      setScheduledBy(currentUser.displayName || currentUser.email);
    }

    getLeadById(leadId)
      .then((data) => {
        if (!data) {
          setError('Inquiry not found in database.');
        } else {
          setLead(data);
          if (data.meetingDetails?.scheduledTime) {
            const dt = new Date(data.meetingDetails.scheduledTime);
            setMeetingDate(dt.toISOString().split('T')[0]);
            setMeetingTime(dt.toTimeString().substring(0, 5));
          }
          if (data.meetingDetails?.meetingLink) {
            setMeetingLink(data.meetingDetails.meetingLink);
          }
          if (data.meetingDetails?.notes) {
            setNotes(data.meetingDetails.notes);
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load inquiry details.');
      })
      .finally(() => setLoading(false));
  }, [leadId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !lead) return;

    if (!meetingDate || !meetingTime) {
      alert('Please choose a valid meeting Date and Time.');
      return;
    }
    if (!meetingLink.trim()) {
      alert('Please provide a video meeting link (e.g. Google Meet, Zoom).');
      return;
    }

    setSubmitting(true);
    try {
      const combinedDateTime = `${meetingDate}T${meetingTime}:00`;
      await updateLeadMeeting(leadId, {
        scheduledTime: combinedDateTime,
        meetingLink: meetingLink.trim(),
        scheduledBy: scheduledBy.trim() || 'Admin Strategist',
        meetingStatus: 'proposed',
        notes: notes.trim()
      });

      setSuccess(true);
    } catch (err: any) {
      alert('Failed to schedule meeting: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#667085]">Loading inquiry details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#08152F]">Inquiry Not Found</h2>
        <p className="text-xs text-[#667085]">{error || 'Unable to locate this inquiry record.'}</p>
        <Link to="/admin" className="inline-block px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
          Return to Admin Console
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#667085] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Panel</span>
        </Link>
        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
          Inquiry #{lead.id.substring(0, 8)}
        </span>
      </div>

      {success ? (
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 sm:p-12 text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#08152F]">Meeting Successfully Scheduled!</h2>
          <p className="text-[#667085] text-sm max-w-md mx-auto leading-relaxed">
            An automated notification email with the proposed time and <strong>Accept / Cancel</strong> options has been dispatched to <strong>{lead.email}</strong>.
          </p>
          <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1.5 font-sans">
            <div><strong className="text-[#08152F]">Client:</strong> {lead.name}</div>
            <div><strong className="text-[#08152F]">Scheduled Time:</strong> {meetingDate} at {meetingTime}</div>
            <div><strong className="text-[#08152F]">Meeting Link:</strong> <a href={meetingLink} target="_blank" rel="noreferrer" className="text-[#2563EB] underline font-mono break-all">{meetingLink}</a></div>
            <div><strong className="text-[#08152F]">Client Portal Status:</strong> Proposed (Client can confirm or cancel directly)</div>
          </div>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/admin"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md shadow-[#2563EB]/20 transition-colors"
            >
              Go to Leads & Inquiries
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-slate-200 text-[#08152F] font-semibold text-xs rounded-xl transition-colors"
            >
              Edit Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Client Details Summary Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h1 className="text-xl font-black text-[#08152F] tracking-tight flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  <span>Schedule Consultation Meeting</span>
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  Set meeting date, time, and Google Meet/Zoom link. The client will be notified immediately.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFC629]/20 text-[#08152F] border border-[#FFC629]/40">
                {lead.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2.5 text-[#08152F]">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong>Client:</strong> {lead.name} {lead.businessName ? `(${lead.businessName})` : ''}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#08152F]">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong>Email:</strong> <a href={`mailto:${lead.email}`} className="text-[#2563EB] underline">{lead.email}</a></span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#08152F]">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong>Phone/WhatsApp:</strong> <a href={`tel:${lead.phoneOrWhatsApp}`} className="text-[#2563EB] font-mono">{lead.phoneOrWhatsApp}</a></span>
              </div>
              <div className="flex items-center space-x-2.5 text-[#08152F]">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong>Interest:</strong> {lead.serviceInterest}</span>
              </div>
            </div>

            {lead.projectDescription && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Project Requirements</span>
                <p className="text-xs text-[#667085] bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                  {lead.projectDescription}
                </p>
              </div>
            )}
          </div>

          {/* Schedule Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5 text-xs">
            <h2 className="text-sm font-black text-[#08152F] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>Meeting Schedule Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#08152F] mb-1.5">
                  Meeting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-[#08152F] mb-1.5">
                  Meeting Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-[#08152F]">
                  Meeting Link (Google Meet, Zoom, etc.) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateMeet}
                  className="text-[10px] text-[#2563EB] hover:underline font-bold flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-[#FFC629]" />
                  <span>Open Google Meet to Create Link</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-[#08152F] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                This link will unlock on the client's dashboard once they click "Accept / Confirm".
              </p>
            </div>

            {/* Scheduled By */}
            <div>
              <label className="block font-bold text-[#08152F] mb-1.5">
                Scheduled By (Strategist / Host Name)
              </label>
              <input
                type="text"
                value={scheduledBy}
                onChange={(e) => setScheduledBy(e.target.value)}
                placeholder="e.g. Tamim Nur / Lead Strategist"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            {/* Agenda / Notes */}
            <div>
              <label className="block font-bold text-[#08152F] mb-1.5">
                Session Agenda / Notes (Visible to Client)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 30-min discovery call to discuss campaign targets, asset deliverables, and monthly retainer scope."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs text-[#08152F] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white resize-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{submitting ? 'Dispatching Meeting Schedule...' : 'Confirm Schedule & Send Client Invitation'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
