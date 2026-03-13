/**
 * Email template builders. Add new template functions for future notification types.
 */

export interface PasswordResetTemplatePayload {
  to: string;
  resetLink: string;
}

export function buildPasswordResetEmail(
  payload: PasswordResetTemplatePayload
): { subject: string; text: string; html: string } {
  const { resetLink } = payload;
  const subject = "Reset your TeleCare password";
  const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2>Reset your TeleCare password</h2>
  <p>You requested a password reset. Click the button below to reset your password:</p>
  <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
  <p style="color: #666; font-size: 0.9em;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  <p style="color: #666; font-size: 0.85em;">Or copy this link: ${resetLink}</p>
</body>
</html>`;
  return { subject, text, html };
}

/* Future template stubs (implement when features are built):
export function buildSignupVerificationEmail(...): { subject, text, html } { ... }
export function buildAppointmentConfirmationEmail(...): { subject, text, html } { ... }
export function buildAppointmentReminderEmail(...): { subject, text, html } { ... }
export function buildVideoCallLinkEmail(...): { subject, text, html } { ... }
export function buildAppointmentCancelledEmail(...): { subject, text, html } { ... }
export function buildAppointmentRescheduledEmail(...): { subject, text, html } { ... }
*/
