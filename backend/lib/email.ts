import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (!apiKey) {
  throw new Error("SENDGRID_API_KEY is not configured");
}

if (!fromEmail) {
  throw new Error("SENDGRID_FROM_EMAIL is not configured");
}

sgMail.setApiKey(apiKey);

export default async function sendmail(email: string, otp: string) {
  try {
    const [response] = await sgMail.send({
      to: email,
      from: {
        email: fromEmail,
        name: "TraceFlow",
      },
      subject: "TraceFlow verification OTP",
      text: `Your OTP for the TraceFlow application is ${otp}.`,
    });

    console.log(`[EMAIL] OTP sent successfully. Status: ${response.statusCode}`);
    return response;
  } catch (error) {
    console.error("[EMAIL] Failed to send OTP:", error);
    throw error;
  }
}
