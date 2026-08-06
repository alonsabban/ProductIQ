interface SuggestedQuestionsProps {
  onSelect: (q: string) => void;
}

const SUGGESTIONS = [
  "What is CyberArk Privilege Cloud?",
  "How does CyberArk Identity handle MFA?",
  "What is the difference between PAM Self-Hosted and Privilege Cloud?",
  "How do I configure session recording in CyberArk?",
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[oklch(0.18_0.05_240)] border border-[oklch(0.28_0.08_260)] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C8.48 3 4 7.48 4 13c0 2.39.86 4.58 2.27 6.29L4 25l5.71-2.27C11.42 23.89 12.69 24.2 14 24.2c5.52 0 10-4.48 10-10S19.52 3 14 3z" fill="oklch(0.55 0.22 260)" opacity="0.9"/>
            <circle cx="10" cy="13" r="1.2" fill="white"/>
            <circle cx="14" cy="13" r="1.2" fill="white"/>
            <circle cx="18" cy="13" r="1.2" fill="white"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[oklch(0.92_0.01_230)] mb-1">
          Ask me anything about CyberArk
        </h2>
        <p className="text-sm text-[oklch(0.60_0.05_240)] max-w-sm">
          I&apos;m grounded in the official CyberArk product documentation. Try one of these to get started:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left px-4 py-3 rounded-xl border border-[oklch(0.22_0.05_240)] bg-[oklch(0.12_0.030_240)] hover:bg-[oklch(0.17_0.045_240)] hover:border-[oklch(0.40_0.15_260)] text-sm text-[oklch(0.82_0.04_230)] transition-all duration-150 group"
          >
            <span className="text-[oklch(0.55_0.22_260)] mr-1.5 group-hover:text-[oklch(0.65_0.22_260)]">→</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
