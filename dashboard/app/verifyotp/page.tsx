"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const params=useSearchParams();
  const email=params.get("email");
  const router=useRouter()
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async() => {
    const finalotp=otp.join("")
    const verifyotp=await axios.post("http://localhost:3001/api/verifyotp",{
        otp:finalotp,
        email:email
    })
    if(!verifyotp){
        alert("Something went wrong")
    }
    router.push("/login")
   
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">

        <h1 className="text-3xl font-semibold text-white text-center">
          Verify Email
        </h1>

        <p className="text-slate-400 text-sm text-center mt-3">
          Enter the 6 digit verification code sent to your email.
        </p>

        <div className="flex justify-between mt-10 gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="h-14 w-14 rounded-xl border border-white/10 bg-[#111827] text-center text-xl font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="mt-8 w-full rounded-xl bg-indigo-500 py-3 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          Verify OTP
        </button>

        <button
          className="mt-4 w-full text-sm text-slate-400 hover:text-white transition"
        >
          Resend Code
        </button>

      </div>
    </div>
  );
}