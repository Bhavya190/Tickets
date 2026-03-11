import nodemailer from 'nodemailer';

export const sendEmail = async (
  to: string, 
  subject: string, 
  html: string, 
  options?: { fromName?: string, fromEmail?: string }
) => {
  try {
    let transporter;

    // Check if real SMTP credentials are provided in .env
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal for testing
      console.log("No SMTP credentials found in .env, using Ethereal fallback.");
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const from = options?.fromName && options?.fromEmail 
      ? `"${options.fromName}" <${options.fromEmail}>`
      : process.env.SMTP_FROM || '"Support Team" <support@tickets.com>';

    const info = await transporter.sendMail({
      from,
      replyTo: options?.fromEmail,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    
    // Only log preview URL if using Ethereal
    if (!process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return nodemailer.getTestMessageUrl(info);
    }
    
    return null;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
