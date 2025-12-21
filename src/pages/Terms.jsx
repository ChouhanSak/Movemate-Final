import React from "react";
import { ShieldCheck, Scale, FileCheck, Lock, ArrowLeft } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal"; // <-- import your component
import { useNavigate } from "react-router-dom";


export default function TermsAndConditions({ setPage }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      
      {/* BACK BUTTON */}
      <button
  className="flex items-center gap-2 text-purple-600 mb-6 hover:underline"
  onClick={() => navigate("/select-user")}
 // <-- change here
>
  <ArrowLeft size={20} /> Back to Home
</button>

      <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-2xl shadow-md space-y-8">

        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-green-600" /> Terms & Conditions
          </h1>
          <p className="text-gray-600 mb-6">
            Please read these Terms & Conditions carefully before using our services.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FileCheck className="text-blue-600" /> Acceptance of Terms
            </h2>
            <p className="text-gray-600">
              By accessing or using our platform, you agree to follow and be bound by these Terms
              & Conditions. If you disagree with any part, please discontinue using our services.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Lock className="text-purple-600" /> User Responsibilities
            </h2>
            <ul className="text-gray-600 list-disc ml-6">
              <li>Provide accurate and up-to-date information.</li>
              <li>Do not misuse or illegally use our services.</li>
              <li>Maintain confidentiality of your account credentials.</li>
            </ul>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Scale className="text-red-600" /> Limitations
            </h2>
            <p className="text-gray-600">
              We are not responsible for any indirect or accidental losses that may occur while
              using our platform.
            </p>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
