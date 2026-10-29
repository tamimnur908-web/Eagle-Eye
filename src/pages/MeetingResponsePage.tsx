import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getLeadById, respondToMeeting } from '../services/firestoreService';
import { Lead } from '../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';

export const MeetingResponsePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const initialAction = searchParams.get('action'); // 'accept' | 'cancel'

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'confirmed' | 'cancelled'>('idle');
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) {
      setError('Invalid meeting link. No inquiry ID provided.');
      setLoading(false);
      return;
    }

    getLeadById(leadId)
      .then((data) => {
        if (!data || !data.meetingDetails) {
          setError('Meeting details not found for this inquiry.');
        } else {
          setLead(data);
          if (data.meetingDetails.meetingStatus === 'confirmed') {
            setCurrentStatus('confirmed');
          } else if (data.meetingDetails.meetingStatus === 'cancelled') {
            setCurrentStatus('cancelled');
          } else if (initialAction === 'accept') {
            handleAction('accept');
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Error loading meeting details.');
      })
      .finally(() => setLoading(false));
  }, [leadId]);

  const handleAction = async (action: 'accept' | 'cancel', reason?: string) => {
    if (!leadId) return;
    setSubmitting(true);
    try {
      await respondToMeeting(leadId, action, reason);
      setCurrentStatus(action === 'accept' ? 'confirmed' : 'cancelled');
      const updated = await getLeadById(leadId);
      if (updated) setLead(updated);
    } catch (err: any) {
      alert('Could not update meeting: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#667085]">Verifying consultation details...</p>
      </div>
    );
  }

  if (error || !lead || !lead.meetingDetails) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#08152F]">Meeting Not Found</h2>
        <p className="text-xs text-[#667085]">{error || 'Unable to locate this consultation invitation.'}</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  const meeting = lead.meetingDetails;
  const formattedDate = new Date(meeting.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Google Calendar Link generator
  const startTime = new Date(meeting.scheduledTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endTime = new Date(new Date(meeting.scheduledTime).getTime() + 45 * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Eagle Eye Digital Consultation: ${lead.serviceInterest}`
  )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
    `Video meeting session for ${lead.name}.\nJoin Link: ${meeting.meetingLink}\nHost: ${meeting.scheduledBy}`
  )}&location=${encodeURIComponent(meeting.meetingLink)}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-20 font-sans">
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#08152F] tracking-tight">
            Consultation Session
          </h1>
          <p className="text-xs text-[#667085]">
            Eagle Eye Digital Strategic Review for <strong>{lead.name}</strong>
          </p>
        </div>

        {/* Schedule Box */}
        <div className="bg-[#F3F5F9] border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Proposed Time</span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                currentStatus === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStatus === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-[#FFC629]/25 text-[#08152F] border border-[#FFC629]/50'
              }`}
            >
              {currentStatus === 'confirmed' ? '✓ Confirmed' : currentStatus === 'cancelled' ? '✕ Cancelled' : '● Awaiting Response'}
            </span>
          </div>

          <div className="text-base font-extrabold text-[#08152F] flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="text-[#172033] space-y-1 pt-1 border-t border-slate-200/80">
            <div><strong className="text-[#08152F]">Service:</strong> {lead.serviceInterest}</div>
            <div><strong className="text-[#08152F]">Host:</strong> {meeting.scheduledBy || 'Strategist'}</div>
            {meeting.notes && (
              <div className="text-[#667085] italic mt-1 bg-white p-2.5 rounded-lg border border-slate-200/60">
                "{meeting.notes}"
              </div>
            )}
          </div>
        </div>

        {/* CONFIRMED STATE (UNLOCKED MEETING LINK) */}
        {currentStatus === 'confirmed' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1 text-xs text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm text-emerald-800">Meeting Confirmed!</div>
              <p className="text-emerald-700">
                Your video consultation is locked in. The meeting link below is now unlocked for you.
              </p>
            </div>

            {/* Unlocked Meeting Button */}
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs rounded-xl shadow-lg shadow-[#2563EB]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" />
              <span>Join Video Meeting Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#F3F5F9] hover:bg-slate-200 text-[#172033] font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Add to Google Calendar</span>
              </a>

              <Link
                to="/account"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[#172033] font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#667085]" />
                <span>View in Account Portal</span>
              </Link>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => handleAction('cancel', 'Client requested cancellation after initial confirmation')}
                className="text-[11px] text-[#667085] hover:text-red-600 underline font-medium transition-colors"
              >
                Need to cancel or reschedule?
              </button>
            </div>
          </div>
        )}

        {/* CANCELLED STATE */}
        {currentStatus === 'cancelled' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1 text-xs text-red-900">
              <XCircle className="w-6 h-6 text-red-600 mx-auto" />
              <div className="font-bold text-sm text-red-800">Meeting Cancelled</div>
              <p className="text-red-700">
                This meeting request has been cancelled. Our team has been notified.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={`https://wa.me/88${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Eagle Eye Digital, I would like to reschedule my consultation for inquiry #${lead.id.substring(0, 8)}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Request New Time on WhatsApp</span>
              </a>

              <button
                onClick={() => handleAction('accept')}
                disabled={submitting}
                className="w-full py-2.5 bg-[#F3F5F9] hover:bg-slate-200 text-[#172033] font-bold text-xs rounded-xl transition-colors"
              >
                Re-confirm this meeting time
              </button>
            </div>
          </div>
        )}

        {/* PENDING RESPONSE STATE */}
        {currentStatus === 'idle' && (
          <div className="space-y-4">
            <p className="text-xs text-[#667085] text-center leading-relaxed">
              Please choose whether this meeting time works for you. Upon confirmation, the video meeting link will unlock immediately.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAction('accept')}
                disabled={submitting}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Confirming...' : 'Accept & Confirm'}</span>
              </button>

              <button
                onClick={() => {
                  const reason = prompt('Optional: Reason for declining or preferred alternative time:');
                  handleAction('cancel', reason || undefined);
                }}
                disabled={submitting}
                className="py-3.5 bg-[#F3F5F9] hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 disabled:opacity-50 text-[#172033] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline / Cancel</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
