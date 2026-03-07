import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  LayoutDashboard, Users, BookOpen, Zap, LogOut, Shield, Search,
  Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, ShieldCheck, ShieldOff,
  TrendingUp, FileText, Loader2, RefreshCw, AlertTriangle, Menu, X,
  RotateCcw, Clock,
} from 'lucide-react'
import { adminApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SystemStats {
  total_users: number
  total_stories: number
  published_stories: number
  total_ai_requests: number
  total_vocabulary: number
  new_users_today: number
  new_users_this_week: number
  stories_by_hsk: Record<string, number>
  ai_usage_by_feature: Record<string, number>
}

interface AdminUser {
  id: number
  username: string
  email: string
  full_name?: string
  is_admin: boolean
  created_at: string
  soft_deleted_at?: string | null
}

interface AdminStory {
  id: number
  title: string
  title_english?: string
  hsk_level: number
  is_published: boolean
  author_id: number
  author_username?: string
  created_at: string
  soft_deleted_at?: string | null
}

interface AIEntry {
  id: number
  user_id: number
  username: string
  feature: string
  tokens_used: number
  timestamp: string
}

type Tab = 'overview' | 'users' | 'stories' | 'ai-usage' | 'trash'

const HSK_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// ── Small helpers ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: {
  label: string
  value: number | string
  sub?: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  )
}

function Badge({ children, variant }: { children: React.ReactNode; variant: 'success' | 'muted' | 'warn' | 'info' }) {
  const cls = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    muted: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    info: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  }[variant]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}

function Pagination({ page, total, pageSize, onChange }: {
  page: number, total: number, pageSize: number, onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
      <span>{total.toLocaleString()} total</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[80px] text-center">Page {page} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="text-gray-900 dark:text-gray-100 font-medium">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Tab: Overview ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getStats()
      setStats(data)
    } catch {
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center gap-3 h-48 justify-center text-gray-500">
      <AlertTriangle className="w-6 h-6 text-red-400" />
      <p>{error}</p>
      <button onClick={load} className="text-sm text-indigo-500 hover:underline cursor-pointer">Retry</button>
    </div>
  )

  if (!stats) return null

  const hskChartData = Object.entries(stats.stories_by_hsk)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, count]) => ({ name: `HSK ${level}`, count }))

  const aiChartData = Object.entries(stats.ai_usage_by_feature)
    .map(([feature, count]) => ({ name: feature.replace(/_/g, ' '), count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats.total_users} color="text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Total Stories" value={stats.total_stories} sub={`${stats.published_stories} published`} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="AI Requests" value={stats.total_ai_requests} color="text-violet-600 dark:text-violet-400" />
        <StatCard label="Vocabulary" value={stats.total_vocabulary} color="text-cyan-600 dark:text-cyan-400" />
        <StatCard label="New Users" value={stats.new_users_today} sub={`${stats.new_users_this_week} this week`} color="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stories by HSK Level */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Stories by HSK Level
          </h3>
          {hskChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hskChartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#a5b4fc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hskChartData.map((_, i) => (
                    <Cell key={i} fill={HSK_COLORS[i % HSK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Usage by Feature */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            AI Usage by Feature
          </h3>
          {aiChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No AI usage yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aiChartData} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17,24,39,0.9)', border: 'none', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#c4b5fd' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Users ─────────────────────────────────────────────────────────────────

function UsersTab({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  const PAGE_SIZE = 15

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUsers(page, PAGE_SIZE, search || undefined)
      setUsers(data.users)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleToggleAdmin = async (user: AdminUser) => {
    setActionUserId(user.id)
    try {
      const updated = await adminApi.toggleAdmin(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_admin: updated.is_admin } : u))
    } finally {
      setActionUserId(null)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    setActionUserId(user.id)
    try {
      await adminApi.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setTotal(prev => prev - 1)
    } finally {
      setActionUserId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search username, email…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found</td>
                </tr>
              ) : users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{user.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                      {user.full_name && <p className="text-xs text-gray-400">{user.full_name}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.is_admin
                      ? <Badge variant="info">Admin</Badge>
                      : <Badge variant="muted">User</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {user.id !== currentUserId && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            disabled={actionUserId === user.id}
                            title={user.is_admin ? 'Revoke admin' : 'Grant admin'}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {actionUserId === user.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : user.is_admin
                                ? <ShieldOff className="w-4 h-4" />
                                : <ShieldCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            disabled={actionUserId === user.id}
                            title="Delete user"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            message={`Delete "${confirmDelete.username}"? This cannot be undone.`}
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: Stories ───────────────────────────────────────────────────────────────

function StoriesTab() {
  const [stories, setStories] = useState<AdminStory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [hskFilter, setHskFilter] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminStory | null>(null)

  const PAGE_SIZE = 15

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getStories(page, PAGE_SIZE, search || undefined, hskFilter)
      setStories(data.stories)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page, search, hskFilter])

  useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleTogglePublish = async (story: AdminStory) => {
    setActionId(story.id)
    try {
      const updated = await adminApi.toggleStoryPublish(story.id)
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, is_published: updated.is_published } : s))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (story: AdminStory) => {
    setActionId(story.id)
    try {
      await adminApi.deleteStory(story.id)
      setStories(prev => prev.filter(s => s.id !== story.id))
      setTotal(prev => prev - 1)
    } finally {
      setActionId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search story title…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors"
          >
            Search
          </button>
        </form>
        <select
          value={hskFilter ?? ''}
          onChange={e => { setHskFilter(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All HSK</option>
          {[1, 2, 3, 4, 5, 6].map(l => <option key={l} value={l}>HSK {l}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">HSK</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Author</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No stories found</td>
                </tr>
              ) : stories.map(story => (
                <tr
                  key={story.id}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{story.id}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{story.title}</p>
                    {story.title_english && (
                      <p className="text-xs text-gray-400 truncate">{story.title_english}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: HSK_COLORS[(story.hsk_level - 1) % HSK_COLORS.length] }}
                    >
                      HSK {story.hsk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {story.is_published
                      ? <Badge variant="success">Published</Badge>
                      : <Badge variant="muted">Draft</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                    {story.author_username ?? `#${story.author_id}`}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {new Date(story.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleTogglePublish(story)}
                        disabled={actionId === story.id}
                        title={story.is_published ? 'Unpublish' : 'Publish'}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {actionId === story.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : story.is_published
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(story)}
                        disabled={actionId === story.id}
                        title="Delete story"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            message={`Delete "${confirmDelete.title}"? This cannot be undone.`}
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: AI Usage ──────────────────────────────────────────────────────────────

function AIUsageTab() {
  const [entries, setEntries] = useState<AIEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const PAGE_SIZE = 20

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAIUsage(page, PAGE_SIZE)
      setEntries(data.entries)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Feature</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tokens</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">No AI usage data</td>
                </tr>
              ) : entries.map(entry => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.username}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{entry.feature.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{entry.tokens_used.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

// ── Tab: Trash ─────────────────────────────────────────────────────────────────

const TRASH_RETENTION_DAYS = 30

function daysLeft(softDeletedAt: string): number {
  const deleted = new Date(softDeletedAt).getTime()
  const expiry = deleted + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000)))
}

function TrashTab({ currentUserId }: { currentUserId: number }) {
  const [subTab, setSubTab] = useState<'users' | 'stories'>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stories, setStories] = useState<AdminStory[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [storiesTotal, setStoriesTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [storiesPage, setStoriesPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [confirmPerm, setConfirmPerm] = useState<{ type: 'user' | 'story'; item: AdminUser | AdminStory } | null>(null)
  const [purging, setPurging] = useState(false)

  const PAGE_SIZE = 15

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getTrashUsers(usersPage, PAGE_SIZE, search || undefined)
      setUsers(data.users)
      setUsersTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [usersPage, search])

  const loadStories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getTrashStories(storiesPage, PAGE_SIZE, search || undefined)
      setStories(data.stories)
      setStoriesTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [storiesPage, search])

  useEffect(() => {
    if (subTab === 'users') loadUsers()
    else loadStories()
  }, [subTab, loadUsers, loadStories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setUsersPage(1)
    setStoriesPage(1)
  }

  const handleRestoreUser = async (user: AdminUser) => {
    setActionId(user.id)
    try {
      await adminApi.restoreUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setUsersTotal(prev => prev - 1)
    } finally {
      setActionId(null)
    }
  }

  const handleRestoreStory = async (story: AdminStory) => {
    setActionId(story.id)
    try {
      await adminApi.restoreStory(story.id)
      setStories(prev => prev.filter(s => s.id !== story.id))
      setStoriesTotal(prev => prev - 1)
    } finally {
      setActionId(null)
    }
  }

  const handlePermanentDelete = async () => {
    if (!confirmPerm) return
    const { type, item } = confirmPerm
    setActionId(item.id)
    try {
      if (type === 'user') {
        await adminApi.permanentDeleteUser(item.id)
        setUsers(prev => prev.filter(u => u.id !== item.id))
        setUsersTotal(prev => prev - 1)
      } else {
        await adminApi.permanentDeleteStory(item.id)
        setStories(prev => prev.filter(s => s.id !== item.id))
        setStoriesTotal(prev => prev - 1)
      }
    } finally {
      setActionId(null)
      setConfirmPerm(null)
    }
  }

  const handlePurge = async () => {
    setPurging(true)
    try {
      await adminApi.purgeTrash()
      if (subTab === 'users') loadUsers()
      else loadStories()
    } finally {
      setPurging(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle + search + purge */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {(['users', 'stories'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setSubTab(t); setSearch(''); setSearchInput('') }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${
                subTab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={subTab === 'users' ? 'Search username, email…' : 'Search story title…'}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors">
            Search
          </button>
        </form>

        <button
          onClick={handlePurge}
          disabled={purging}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer transition-colors disabled:opacity-50"
        >
          {purging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Purge Expired
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
        <Clock className="w-4 h-4 shrink-0" />
        Items in trash are permanently deleted after {TRASH_RETENTION_DAYS} days.
      </div>

      {/* Users table */}
      {subTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deleted</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Trash is empty</td></tr>
                ) : users.map(user => {
                  const left = user.soft_deleted_at ? daysLeft(user.soft_deleted_at) : 0
                  return (
                    <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{user.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                        {user.full_name && <p className="text-xs text-gray-400">{user.full_name}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {user.soft_deleted_at ? new Date(user.soft_deleted_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${left <= 3 ? 'text-red-500' : left <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {left}d left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleRestoreUser(user)}
                            disabled={actionId === user.id}
                            title="Restore"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {actionId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                          {user.id !== currentUserId && (
                            <button
                              onClick={() => setConfirmPerm({ type: 'user', item: user })}
                              disabled={actionId === user.id}
                              title="Delete permanently"
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination page={usersPage} total={usersTotal} pageSize={PAGE_SIZE} onChange={setUsersPage} />
          </div>
        </div>
      )}

      {/* Stories table */}
      {subTab === 'stories' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">HSK</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deleted</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                ) : stories.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Trash is empty</td></tr>
                ) : stories.map(story => {
                  const left = story.soft_deleted_at ? daysLeft(story.soft_deleted_at) : 0
                  return (
                    <tr key={story.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{story.id}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{story.title}</p>
                        {story.title_english && <p className="text-xs text-gray-400 truncate">{story.title_english}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ background: HSK_COLORS[(story.hsk_level - 1) % HSK_COLORS.length] }}
                        >
                          HSK {story.hsk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {story.soft_deleted_at ? new Date(story.soft_deleted_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${left <= 3 ? 'text-red-500' : left <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {left}d left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleRestoreStory(story)}
                            disabled={actionId === story.id}
                            title="Restore"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {actionId === story.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmPerm({ type: 'story', item: story })}
                            disabled={actionId === story.id}
                            title="Delete permanently"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination page={storiesPage} total={storiesTotal} pageSize={PAGE_SIZE} onChange={setStoriesPage} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {confirmPerm && (
          <ConfirmModal
            message={`Permanently delete "${
              confirmPerm.type === 'user'
                ? (confirmPerm.item as AdminUser).username
                : (confirmPerm.item as AdminStory).title
            }"? This cannot be undone.`}
            onConfirm={handlePermanentDelete}
            onCancel={() => setConfirmPerm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Admin Page ────────────────────────────────────────────────────────────

const NAV_ITEMS: { tab: Tab; label: string; icon: React.ElementType }[] = [
  { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
  { tab: 'users', label: 'Users', icon: Users },
  { tab: 'stories', label: 'Stories', icon: BookOpen },
  { tab: 'ai-usage', label: 'AI Usage', icon: Zap },
  { tab: 'trash', label: 'Trash', icon: Trash2 },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/landing')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Admin Panel</span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">—</span>
          <span className="hidden sm:inline text-sm text-gray-400">HanziNarrative</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span>{user?.username}</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">App</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar overlay (mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-[57px] left-0 bottom-0 z-20 w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
            flex flex-col py-4 px-3 gap-1 transition-transform duration-200
            lg:static lg:translate-x-0 lg:top-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSidebarOpen(false) }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors w-full text-left
                ${activeTab === tab
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              <span>Admin Console</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {(() => {
                  const item = NAV_ITEMS.find(n => n.tab === activeTab)
                  return item ? <><item.icon className="w-5 h-5 text-indigo-500" />{item.label}</> : null
                })()}
              </h1>
            </div>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'users' && <UsersTab currentUserId={user?.id ?? -1} />}
              {activeTab === 'stories' && <StoriesTab />}
              {activeTab === 'ai-usage' && <AIUsageTab />}
              {activeTab === 'trash' && <TrashTab currentUserId={user?.id ?? -1} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
