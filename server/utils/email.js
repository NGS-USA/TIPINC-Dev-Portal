import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173'

export async function sendInviteEmail({ to, name, tempPassword, role }) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'You have been invited to the TIPINC Dev Portal',
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #0f172a;">
          <div style="background: #6366f1; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="color: white; font-size: 20px;">▦</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">You're invited to the TIPINC Dev Portal</h1>
          <p style="font-size: 15px; color: #64748b; margin: 0 0 32px; line-height: 1.5;">
            ${name ? `Hi ${name}, you've` : "You've"} been added as a <strong>${role === 'SeniorDeveloper' ? 'Senior Developer' : 'Developer'}</strong>. Sign in with the credentials below.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px;">Your login details</p>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 2px;">Email</p>
              <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">${to}</p>
            </div>
            <div>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 2px;">Temporary password</p>
              <p style="font-size: 15px; font-weight: 600; color: #6366f1; margin: 0; font-family: monospace; letter-spacing: 0.05em;">${tempPassword}</p>
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b; margin: 0 0 24px;">
            You will be asked to set a new password when you first sign in.
          </p>

          <a href="${APP_URL}" style="display: inline-block; background: #6366f1; color: white; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Sign in to Dev Portal →
          </a>

          <p style="font-size: 12px; color: #94a3b8; margin: 32px 0 0;">
            TIPINC Dev Portal · Internal access only
          </p>
        </div>
      `
    })
  } catch (err) {
    console.error('Failed to send invite email:', err.message)
  }
}

export async function sendNotificationEmail({ to, name, title, message, type }) {
  const typeConfig = {
    NEW_REQUEST: { emoji: '📝', label: 'New Request' },
    PENDING_APPROVAL: { emoji: '⏳', label: 'Pending Approval' },
    ASSIGNED: { emoji: '👤', label: 'Assigned to You' }
  }
  const config = typeConfig[type] || { emoji: '🔔', label: 'Notification' }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${config.emoji} ${title} — TIPINC Dev Portal`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #0f172a;">
          <div style="background: #6366f1; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="color: white; font-size: 20px;">▦</span>
          </div>
          <p style="font-size: 12px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">${config.label}</p>
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">${title}</h1>
          ${message ? `<p style="font-size: 15px; color: #64748b; margin: 0 0 32px; line-height: 1.5;">${message}</p>` : ''}
          <a href="${APP_URL}" style="display: inline-block; background: #6366f1; color: white; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            View in Dev Portal →
          </a>
          <p style="font-size: 12px; color: #94a3b8; margin: 32px 0 0;">
            TIPINC Dev Portal · Internal access only
          </p>
        </div>
      `
    })
  } catch (err) {
    console.error('Failed to send notification email:', err.message)
  }
}