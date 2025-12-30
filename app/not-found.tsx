"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
      <div className="absolute inset-0 bg-grid" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="glass rounded-2xl p-8 shadow-2xl">
            {/* 404 Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </div>

            {/* Error Code */}
            <h1 className="text-6xl font-bold mb-2">
              <span className="text-gradient-brand">404</span>
            </h1>

            {/* Message */}
            <h2 className="text-xl font-semibold text-white mb-2">Link Not Found</h2>
            <p className="text-zinc-400 mb-8">
              This link may have expired, been deleted, or never existed.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] flex items-center justify-center"
              >
                Create New Link
              </Link>
              <button
                onClick={() => window.history.back()}
                className="w-full h-12 rounded-xl font-medium text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <p className="mt-6 text-zinc-600 text-sm">
            If you believe this is an error, please contact us.
          </p>
        </div>
      </div>
    </div>
  )
}
