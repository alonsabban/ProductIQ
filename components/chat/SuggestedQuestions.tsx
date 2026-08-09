interface SuggestedQuestionsProps {
  onSelect: (q: string) => void;
}

const SUGGESTIONS = [
  "What is Idira Privilege Cloud?",
  "How does Idira Identity handle MFA?",
  "What is the difference between PAM Self-Hosted and Privilege Cloud?",
  "How do I configure session recording in Idira?",
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-14 px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#ccd9eb] shadow-sm flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C8.48 3 4 7.48 4 13c0 2.39.86 4.58 2.27 6.29L4 25l5.71-2.27C11.42 23.89 12.69 24.2 14 24.2c5.52 0 10-4.48 10-10S19.52 3 14 3z" fill="#1a56db"/>
            <circle cx="10" cy="13" r="1.3" fill="white"/>
            <circle cx="14" cy="13" r="1.3" fill="white"/>
            <circle cx="18" cy="13" r="1.3" fill="white"/>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-[#0f1f35] mb-2">
          Ask me anything about Idira Products
        </h2>
        <p className="text-base text-[#4a6889] max-w-md">
          Based on the official Idira product documentation. Try one of these to get started:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left px-5 py-4 rounded-xl border border-[#ccd9eb] bg-white hover:border-[#1a56db] hover:shadow-md text-base text-[#0f1f35] transition-all duration-150 group shadow-sm"
          >
            <span className="text-[#1a56db] mr-2 font-medium group-hover:translate-x-0.5 inline-block transition-transform">→</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
