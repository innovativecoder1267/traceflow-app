export async function sendOtpEmail(email: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_SECRET_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your TraceFlow verification code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
          <h2>Verify your TraceFlow account</h2>
          <p>Use the following OTP to verify your email address:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${otp}</div>
          <p>This code expires in 15 minutes.</p>
          <p>If you did not create a TraceFlow account, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}
