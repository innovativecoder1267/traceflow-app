import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_SECRET);

export default async function sendmail(email: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: "TraceFlow <noreply@traceflow-app.com>",
    to: email,
    subject: "TraceFlow verification OTP",
    text: `Your OTP for the TraceFlow application is ${otp}.`,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(error.message);
  }

  console.log(`Email sent successfully: ${data?.id}`);
  return data;
}
