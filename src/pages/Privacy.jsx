import React from "react";
import { Shield, UserCheck, Lock, Globe, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ScrollReveal from "../components/ScrollReveal"; // <-- import your scroll reveal component


export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-6">

      {/* ✅ BACK BUTTON — TOP LEFT */}
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => navigate("/select-user")}
          className="flex items-center gap-2 text-purple-600 hover:underline"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
      </div>

      {/* ✅ PRIVACY CARD — CENTER */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border space-y-8">
        
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
            <Shield className="text-purple-600" size={32} />
            Privacy Policy
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheck className="text-blue-600" size={20} />
              Information We Collect
            </h2>
            <p className="text-gray-700 mt-2 leading-6">
              We collect your basic information such as name, email, and contact details 
              for creating your account and providing services.  
              We do not collect unnecessary personal data.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lock className="text-green-600" size={20} />
              How We Use Your Data
            </h2>
            <p className="text-gray-700 mt-2 leading-6">
              Your data is used to verify your account, manage orders, improve performance, 
              and ensure a smooth customer experience.  
              We never sell or misuse your information.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="text-yellow-600" size={20} />
              Data Security
            </h2>
            <p className="text-gray-700 mt-2 leading-6">
              We use industry-level security practices to protect your data.  
              Your passwords are encrypted and your information remains safe with us.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-red-600" size={20} />
              Third-Party Services
            </h2>
            <p className="text-gray-700 mt-2 leading-6">
              We may use trusted third-party services (like Firebase) to process your data 
              securely. They follow strict privacy and protection standards.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-gray-500 text-sm mt-10">
            Last updated: 22 November 2025
          </p>
        </ScrollReveal>

      </div>
    </div>
  );
}
