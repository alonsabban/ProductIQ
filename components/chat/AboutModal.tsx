"use client";

import { X, Mail } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-[#ccd9eb] w-full max-w-md mx-4 p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-[#0f1f35]">About ProductIQ</h2>
            <p className="text-sm text-[#4a6889] mt-0.5">Product knowledge at your fingertips</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9ab0c8] hover:text-[#0f1f35] transition-colors p-1 rounded-lg hover:bg-[#e8eef6]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="text-base text-[#1e3a5f] leading-relaxed mb-5">
          ProductIQ is an AI-powered assistant that answers questions about CyberArk products.
          All responses are grounded in the official CyberArk documentation library, keeping answers
          accurate and up to date.
        </p>

        {/* Product OPS badge */}
        <div className="flex items-center gap-2.5 bg-[#e8eef6] border border-[#ccd9eb] rounded-xl px-4 py-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">OPS</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0f1f35]">Provided by Product OPS</p>
            <p className="text-xs text-[#4a6889]">Built and maintained by the Product Operations team</p>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-[#e8eef6] pt-5">
          <p className="text-sm font-semibold text-[#0f1f35] mb-3">Questions or feedback?</p>
          <div className="flex flex-col gap-2.5">
            {[
              { name: "Alon Sabban", email: "alon.sabban@cyberark.com" },
              { name: "Dan Bidner", email: "dan.bidner@cyberark.com" },
            ].map(({ name, email }) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#ccd9eb] hover:border-[#1a56db] hover:shadow-sm transition-all group bg-[#f8fafc]"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a56db] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0f1f35]">{name}</p>
                  <p className="text-xs text-[#4a6889] truncate">{email}</p>
                </div>
                <Mail size={14} className="text-[#9ab0c8] group-hover:text-[#1a56db] transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
