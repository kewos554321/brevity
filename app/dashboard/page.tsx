"use client"

import Link from "next/link"
import { useLinkHistory } from "@/hooks/use-link-history"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { QRCodeDisplay } from "@/components/qr-code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

interface PersonalStats {
  totalLinks: number
  totalClicks: number
  clickTrend: { date: string; clicks: number }[]
  platforms: { platform: string; count: number }[]
  devices: { desktop: number; mobile: number; tablet: number; other: number }
  browsers: { browser: string; count: number }[]
  operatingSystems: { os: string; count: number }[]
  countries: { country: string; count: number }[]
  clicksByHour: { hour: number; clicks: number }[]
  topLinks: { shortCode: string; clicks: number; createdAt: string }[]
}

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function DashboardPage() {
  const { history, isLoaded, refreshClicks, removeFromHistory, clearHistory } = useLinkHistory()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<PersonalStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Fetch personal stats when history is loaded
  useEffect(() => {
    const fetchStats = async () => {
      if (!isLoaded || history.length === 0) {
        setStats(null)
        return
      }

      setIsLoadingStats(true)
      try {
        const shortCodes = history.map((item) => item.shortCode)
        const res = await fetch("/api/stats/personal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortCodes }),
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [isLoaded, history])

  const totalClicks = history.reduce((sum, item) => sum + (item.clicks || 0), 0)
  const totalLinks = history.length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshClicks()
    if (history.length > 0) {
      try {
        const shortCodes = history.map((item) => item.shortCode)
        const res = await fetch("/api/stats/personal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortCodes }),
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      }
    }
    setIsRefreshing(false)
    toast.success("Stats refreshed!")
  }

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Copied!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return "12AM"
    if (hour === 12) return "12PM"
    return hour < 12 ? `${hour}AM` : `${hour - 12}PM`
  }

  const truncateUrl = (url: string, maxLength = 40) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url
  }

  // Prepare device data for pie chart
  const deviceData = stats
    ? [
        { name: "Desktop", value: stats.devices.desktop },
        { name: "Mobile", value: stats.devices.mobile },
        { name: "Tablet", value: stats.devices.tablet },
        { name: "Other", value: stats.devices.other },
      ].filter((d) => d.value > 0)
    : []

  if (!isLoaded) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-8">
        {/* Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </header>

        {history.length === 0 ? (
          <div className="max-w-6xl mx-auto w-full flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 text-zinc-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">No Analytics Yet</h2>
              <p className="text-zinc-500 mb-6">Create your first short link to start tracking analytics</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Link
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Total Links</p>
                    <p className="text-2xl font-bold text-white">{totalLinks}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Total Clicks</p>
                    <p className="text-2xl font-bold text-white">{totalClicks}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Avg. Clicks</p>
                    <p className="text-2xl font-bold text-white">
                      {totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">7-Day Clicks</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.clickTrend.reduce((sum, d) => sum + d.clicks, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid - Row 1 */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Click Trend Chart */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Click Trend (7 Days)</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.clickTrend.some(d => d.clicks > 0) ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.clickTrend}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" tickFormatter={formatDate} stroke="#71717a" fontSize={11} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                          labelFormatter={formatDate}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No click data yet</div>
                )}
              </div>

              {/* Click by Hour */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Clicks by Hour</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.clicksByHour.some(d => d.clicks > 0) ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.clicksByHour}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="hour" tickFormatter={formatHour} stroke="#71717a" fontSize={10} interval={3} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                          labelFormatter={(h) => formatHour(h as number)}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Bar dataKey="clicks" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No click data yet</div>
                )}
              </div>
            </div>

            {/* Charts Grid - Row 2 */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Device Distribution */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Devices</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : deviceData.length > 0 ? (
                  <div className="h-48 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                          {deviceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {deviceData.map((device, index) => (
                        <div key={device.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-zinc-400 text-sm">{device.name}</span>
                          <span className="text-white text-sm font-medium ml-auto">{device.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No device data yet</div>
                )}
              </div>

              {/* Platforms */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Platforms</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.platforms.length > 0 ? (
                  <div className="h-48 overflow-y-auto space-y-2">
                    {stats.platforms.map((item, index) => (
                      <div key={item.platform} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-zinc-300 text-sm flex-1 truncate">{item.platform}</span>
                        <span className="text-white text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No platform data yet</div>
                )}
              </div>

              {/* Countries */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Countries</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.countries.length > 0 ? (
                  <div className="h-48 overflow-y-auto space-y-2">
                    {stats.countries.map((item, index) => (
                      <div key={item.country} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-zinc-300 text-sm flex-1 truncate">{item.country}</span>
                        <span className="text-white text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No country data yet</div>
                )}
              </div>
            </div>

            {/* Charts Grid - Row 3: Browsers & OS */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Browsers */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Browsers</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.browsers.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.browsers}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="browser" stroke="#71717a" fontSize={10} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#fff" }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No browser data yet</div>
                )}
              </div>

              {/* Operating Systems */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Operating Systems</h2>
                {isLoadingStats ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats && stats.operatingSystems.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.operatingSystems}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="os" stroke="#71717a" fontSize={10} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#fff" }} />
                        <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-500">No OS data yet</div>
                )}
              </div>
            </div>

            {/* Top Links */}
            <div className="max-w-6xl mx-auto w-full glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Performing Links</h2>
              {isLoadingStats ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : stats && stats.topLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {stats.topLinks.map((link, index) => (
                    <div key={link.shortCode} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-blue-400 font-mono text-sm truncate">{link.shortCode}</p>
                        <p className="text-cyan-400 text-xs font-medium">{link.clicks} clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-zinc-500">No links yet</div>
              )}
            </div>

            {/* Links Table */}
            <div className="max-w-6xl mx-auto w-full glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">All Links</h2>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-sm text-zinc-500 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Short URL</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm hidden md:table-cell">Original URL</th>
                      <th className="text-center py-3 px-4 text-zinc-400 font-medium text-sm">Clicks</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm hidden sm:table-cell">Created</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-mono text-sm">
                            {item.shortCode}
                          </a>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className="text-zinc-400 text-sm" title={item.originalUrl}>{truncateUrl(item.originalUrl)}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                            {item.clicks || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <span className="text-zinc-500 text-sm">{formatFullDate(item.createdAt)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleCopy(item.shortUrl)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Copy">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="QR Code">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                  </svg>
                                </button>
                              </DialogTrigger>
                              <DialogContent className="glass border-white/10">
                                <DialogHeader>
                                  <DialogTitle className="text-white">QR Code</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center py-4">
                                  <QRCodeDisplay url={item.shortUrl} />
                                  <p className="mt-4 text-sm text-zinc-400 text-center break-all px-4">{item.shortUrl}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Open">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button onClick={() => removeFromHistory(item.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="max-w-6xl mx-auto w-full mt-auto pt-8 text-center text-zinc-600 text-sm">
          <p>Your personal analytics dashboard</p>
        </footer>
      </div>
    </div>
  )
}
