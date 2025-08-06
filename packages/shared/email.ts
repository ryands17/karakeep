import { createTransport } from "nodemailer";

import serverConfig from "./config";

export async function sendInviteEmail(
  email: string,
  token: string,
  inviterName: string,
) {
  if (!serverConfig.email.smtp) {
    throw new Error("SMTP is not configured");
  }

  const transporter = createTransport({
    host: serverConfig.email.smtp.host,
    port: serverConfig.email.smtp.port,
    secure: serverConfig.email.smtp.secure,
    auth:
      serverConfig.email.smtp.user && serverConfig.email.smtp.password
        ? {
            user: serverConfig.email.smtp.user,
            pass: serverConfig.email.smtp.password,
          }
        : undefined,
  });

  const inviteUrl = `${serverConfig.publicUrl}/invite/${encodeURIComponent(token)}`;

  const mailOptions = {
    from: serverConfig.email.smtp.from,
    to: email,
    subject: "You've been invited to join Karakeep",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join Karakeep!</h2>
        <p>${inviterName} has invited you to join Karakeep, the bookmark everything app.</p>
        <p>Click the link below to accept your invitation and create your account:</p>
        <p>
          <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
    `,
    text: `
You've been invited to join Karakeep!

${inviterName} has invited you to join Karakeep, a powerful bookmarking and content organization platform.

Accept your invitation by visiting this link:
${inviteUrl}

This invitation will expire in 7 days.

If you weren't expecting this invitation, you can safely ignore this email.
    `,
  };

  await transporter.sendMail(mailOptions);
}
