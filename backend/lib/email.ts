import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

if (!fromEmail) {
  throw new Error("RESEND_FROM_EMAIL is not configured");
}

const resend = new Resend(apiKey);

export default async function sendmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `TraceFlow <${fromEmail}>`,
      to: [email],
      subject: "TraceFlow verification OTP",
      text: `Your OTP for the TraceFlow application is ${otp}.`,
    });

    if (error) {
      console.error("[EMAIL] Resend failed:", error);
      throw new Error(error.message);
    }

    console.log("[EMAIL] OTP sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("[EMAIL] Failed to send OTP:", error);
    throw error;
  }
}
