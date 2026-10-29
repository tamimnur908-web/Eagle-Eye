import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, MeetingDetails } from '../types';

export interface EmailLogEntry {
  id?: string;
  type: 'lead_notification' | 'meeting_scheduled' | 'meeting_status_change';
  leadId: string;
  recipients: string[];
  subject: string;
  status: 'dispatched' | 'skipped' | 'failed';
  timestamp: number;
  details?: Record<string, any>;
}

/**
 * Dispatches an email notification to all configured recipient emails when a new lead/inquiry is submitted.
 * If no recipient emails are configured, notifications are strictly skipped.
 */
export const sendLeadNotificationEmails = async (
  lead: Lead,
  recipientEmails: string[]
): Promise<boolean> => {
  if (!recipientEmails || recipientEmails.length === 0) {
    console.info('No notification recipient emails configured. Skipping notification email dispatch.');
    return false;
  }

  const validRecipients = recipientEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@'));
  if (validRecipients.length === 0) {
    return false;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eagleeyedigital.com';
  const scheduleMeetingUrl = `${origin}/schedule-meeting?leadId=${lead.id}`;
  const adminUrl = `${origin}/admin`;

  const subject = `🚨 New Inquiry: ${lead.name} (${lead.serviceInterest}) - Eagle Eye Digital`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .badge { display: inline-block; background: #fef3c7; color: #b45309; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .grid td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .label { font-weight: 700; color: #475569; width: 35%; background: #f8fafc; }
        .value { color: #0f172a; font-weight: 500; }
        .desc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0 24px 0; font-size: 13px; line-height: 1.6; white-space: pre-line; }
        .btn-schedule { display: inline-block; background: #246BFD; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 10px rgba(36, 107, 253, 0.25); text-align: center; }
        .btn-admin { display: inline-block; background: #f1f5f9; color: #334155 !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 20px; border-radius: 10px; margin-left: 8px; text-align: center; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">New Lead Notification</span>
          <h1 class="title">New Client Inquiry Received</h1>
          <p class="subtitle">A prospective client has submitted an inquiry form on Eagle Eye Digital.</p>
        </div>

        <table class="grid">
          <tr>
            <td class="label">Client Name</td>
            <td class="value"><strong>${lead.name}</strong></td>
          </tr>
          ${lead.businessName ? `<tr><td class="label">Business / Brand</td><td class="value">${lead.businessName}</td></tr>` : ''}
          <tr>
            <td class="label">Email Address</td>
            <td class="value"><a href="mailto:${lead.email}">${lead.email}</a></td>
          </tr>
          <tr>
            <td class="label">Phone / WhatsApp</td>
            <td class="value"><a href="tel:${lead.phoneOrWhatsApp}">${lead.phoneOrWhatsApp}</a></td>
          </tr>
          <tr>
            <td class="label">Service Interest</td>
            <td class="value"><strong>${lead.serviceInterest}</strong></td>
          </tr>
          <tr>
            <td class="label">Budget Range</td>
            <td class="value">${lead.budgetRange}</td>
          </tr>
          <tr>
            <td class="label">Preferred Contact</td>
            <td class="value">${lead.preferredContactMethod}</td>
          </tr>
          ${lead.deadline ? `<tr><td class="label">Target Deadline</td><td class="value">${lead.deadline}</td></tr>` : ''}
          ${lead.websiteOrSocial ? `<tr><td class="label">Website / Socials</td><td class="value"><a href="${lead.websiteOrSocial}">${lead.websiteOrSocial}</a></td></tr>` : ''}
        </table>

        <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Project Requirements & Notes:</div>
        <div class="desc-box">${lead.projectDescription}</div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${scheduleMeetingUrl}" class="btn-schedule" target="_blank">
            📅 Schedule / Book Time with Client
          </a>
          <a href="${adminUrl}" class="btn-admin" target="_blank">
            Open Admin Panel
          </a>
        </div>

        <div class="footer">
          Eagle Eye Digital Admin Console & Notification Dispatcher • Notification sent to: ${validRecipients.join(', ')}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // 1. Write to Firestore 'mail' collection (Trigger Email extension format)
    await addDoc(collection(db, 'mail'), {
      to: validRecipients,
      message: {
        subject,
        html: htmlContent,
        text: `New Lead: ${lead.name} (${lead.email}, ${lead.phoneOrWhatsApp})\nService: ${lead.serviceInterest}\nSchedule Meeting: ${scheduleMeetingUrl}`
      },
      createdAt: Date.now()
    });

    // 2. Write to 'emailLogs' collection for real-time audit inside Admin Panel
    await addDoc(collection(db, 'emailLogs'), {
      type: 'lead_notification',
      leadId: lead.id,
      recipients: validRecipients,
      subject,
      status: 'dispatched',
      timestamp: Date.now(),
      details: {
        clientName: lead.name,
        clientEmail: lead.email,
        service: lead.serviceInterest
      }
    });

    return true;
  } catch (err) {
    console.warn('Failed to queue mail via Firestore collection:', err);
    return false;
  }
};

/**
 * Dispatches an automated email to the client when the admin or recipient schedules a meeting.
 * Includes proposed time and direct Accept / Decline options.
 */
export const sendMeetingScheduledEmail = async (
  lead: Lead,
  meeting: MeetingDetails
): Promise<boolean> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eagleeyedigital.com';
  const acceptUrl = `${origin}/meeting-response?leadId=${lead.id}&action=accept`;
  const cancelUrl = `${origin}/meeting-response?leadId=${lead.id}&action=cancel`;
  const accountUrl = `${origin}/account`;

  const formattedDate = new Date(meeting.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const subject = `📅 Proposed Meeting: Consultation with Eagle Eye Digital (${formattedDate})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
        .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 6px; }
        .meeting-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
        .meeting-time { font-size: 18px; font-weight: 800; color: #1e40af; margin: 8px 0; }
        .btn-accept { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; margin: 6px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25); text-align: center; }
        .btn-cancel { display: inline-block; background: #f1f5f9; color: #475569 !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 13px 24px; border-radius: 12px; margin: 6px; border: 1px solid #cbd5e1; text-align: center; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Consultation Time Proposed</h1>
          <p class="subtitle">Thank you for contacting Eagle Eye Digital regarding <strong>${lead.serviceInterest}</strong>.</p>
        </div>

        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          Hello <strong>${lead.name}</strong>,<br/>
          Our team strategist has reviewed your requirements and proposed a one-on-one video session to discuss your project roadmap and quote.
        </p>

        <div class="meeting-box">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #3b82f6; letter-spacing: 0.05em;">Proposed Meeting Date & Time</div>
          <div class="meeting-time">${formattedDate}</div>
          <div style="font-size: 12px; color: #64748b;">Scheduled by: ${meeting.scheduledBy || 'Eagle Eye Digital Team'}</div>
          ${meeting.notes ? `<div style="font-size: 12px; color: #334155; margin-top: 10px; font-style: italic;">"${meeting.notes}"</div>` : ''}
        </div>

        <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 20px;">
          Please confirm if this time works for you. Upon confirmation, your secure meeting link will unlock immediately in your portal.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${acceptUrl}" class="btn-accept" target="_blank">
            ✓ Accept & Confirm Time
          </a>
          <a href="${cancelUrl}" class="btn-cancel" target="_blank">
            ✕ Decline / Cancel
          </a>
        </div>

        <div style="text-align: center; margin-top: 16px;">
          <a href="${accountUrl}" style="font-size: 12px; color: #246BFD; text-decoration: underline; font-weight: 600;">
            View inside your Eagle Eye Digital Account Dashboard
          </a>
        </div>

        <div class="footer">
          Eagle Eye Digital • Dhaka, Bangladesh • Contact: 01836126791
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await addDoc(collection(db, 'mail'), {
      to: [lead.email],
      message: {
        subject,
        html: htmlContent,
        text: `Consultation Proposed: ${formattedDate}\nAccept: ${acceptUrl}\nDecline: ${cancelUrl}`
      },
      createdAt: Date.now()
    });

    await addDoc(collection(db, 'emailLogs'), {
      type: 'meeting_scheduled',
      leadId: lead.id,
      recipients: [lead.email],
      subject,
      status: 'dispatched',
      timestamp: Date.now(),
      details: {
        scheduledTime: meeting.scheduledTime,
        meetingLink: meeting.meetingLink,
        scheduledBy: meeting.scheduledBy
      }
    });

    return true;
  } catch (err) {
    console.warn('Failed to queue meeting scheduled mail:', err);
    return false;
  }
};

/**
 * Notifies admin recipients and/or client when a meeting is confirmed or cancelled.
 */
export const sendMeetingStatusAlert = async (
  lead: Lead,
  status: 'confirmed' | 'cancelled',
  recipientEmails: string[],
  reason?: string
): Promise<boolean> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eagleeyedigital.com';
  const adminUrl = `${origin}/admin`;

  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed
    ? `✅ Meeting Confirmed by Client: ${lead.name} (${lead.serviceInterest})`
    : `❌ Meeting Cancelled by Client: ${lead.name} (${lead.serviceInterest})`;

  const validRecipients = [...(recipientEmails || []), lead.email].filter((e) => e && e.includes('@'));
  if (validRecipients.length === 0) return false;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: ${isConfirmed ? '#16a34a' : '#dc2626'}; margin-top: 0;">
        ${isConfirmed ? 'Meeting Confirmed!' : 'Meeting Cancelled'}
      </h2>
      <p style="font-size: 14px; color: #334155;">
        Client <strong>${lead.name}</strong> (${lead.email}, ${lead.phoneOrWhatsApp}) has 
        <strong>${isConfirmed ? 'ACCEPTED & CONFIRMED' : 'CANCELLED / DECLINED'}</strong> the scheduled consultation.
      </p>
      ${reason ? `<p style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px;">Reason: ${reason}</p>` : ''}
      <div style="margin-top: 24px;">
        <a href="${adminUrl}" style="background: #246BFD; color: #fff; text-decoration: none; font-weight: 700; padding: 10px 20px; border-radius: 8px; font-size: 13px;">
          View in Admin Console
        </a>
      </div>
    </div>
  `;

  try {
    await addDoc(collection(db, 'mail'), {
      to: validRecipients,
      message: {
        subject,
        html: htmlContent,
        text: `${subject}\nClient: ${lead.name} (${lead.email})\nAdmin: ${adminUrl}`
      },
      createdAt: Date.now()
    });

    await addDoc(collection(db, 'emailLogs'), {
      type: 'meeting_status_change',
      leadId: lead.id,
      recipients: validRecipients,
      subject,
      status: 'dispatched',
      timestamp: Date.now(),
      details: { status, reason }
    });

    return true;
  } catch (err) {
    console.warn('Failed to dispatch meeting status alert:', err);
    return false;
  }
};
