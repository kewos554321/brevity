"use client";

export function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="w-full h-12 rounded-xl font-medium text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300"
    >
      Go Back
    </button>
  );
}
