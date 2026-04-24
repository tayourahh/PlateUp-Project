'use client'
// app/dashboard/partner/orders/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut,
    RefreshCw, ChevronLeft, ChevronRight,
    CalendarDays, Filter, CheckCircle2, XCircle, Truck
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
type PickupStatus = 'ready_for_pickup' | 'completed' | 'cancelled'

interface PickupOrder {
    id: string
    order_id: string
    partner_id: string
    customer_id: string | null
    customer_name: string
    product_name: string
    product_image_url: string | null
    item_count: number
    total_price: number
    status: PickupStatus
    pickup_id: string
    ordered_at: string
    confirmed_at: string | null
    created_at: string
}

type FilterTab = 'all' | PickupStatus

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

const ITEMS_PER_PAGE = 10

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: PickupStatus }) {
    const config: Record<PickupStatus, { label: string; className: string }> = {
        ready_for_pickup: {
            label: 'Ready for Pickup',
            className: 'bg-[#f6fabc] text-[#666c11] border border-[#c8e84a]/60',
        },
        completed: {
            label: 'Completed',
            className: 'bg-[#e8f5c8] text-[#3a7d44] border border-[#3a7d44]/20',
        },
        cancelled: {
            label: 'Cancelled',
            className: 'bg-red-50 text-red-500 border border-red-200',
        },
    }
    const c = config[status]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'ready_for_pickup' ? 'bg-[#c8e84a]' :
                status === 'completed' ? 'bg-[#3a7d44]' : 'bg-red-400'
                }`} />
            {c.label}
        </span>
    )
}

// ── Order Row ──────────────────────────────────────────────────────
function OrderRow({
    order,
    onConfirm,
    onUnconfirm,
    isUpdating,
}: {
    order: PickupOrder
    onConfirm: (id: string) => void
    onUnconfirm: (id: string) => void
    isUpdating: boolean
}) {
    const orderedTime = new Date(order.ordered_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const emoji =
        order.product_name?.toLowerCase().includes('bakso') ? '🍢' :
            order.product_name?.toLowerCase().includes('mie') || order.product_name?.toLowerCase().includes('bakmie') ? '🍜' :
                order.product_name?.toLowerCase().includes('nasi') || order.product_name?.toLowerCase().includes('rice') ? '🍚' :
                    order.product_name?.toLowerCase().includes('pangsit') ? '🥟' :
                        order.product_name?.toLowerCase().includes('ayam') ? '🍗' :
                            order.product_name?.toLowerCase().includes('kopi') ? '☕' : '🍱'

    return (
        <tr className="border-b border-gray-50 hover:bg-[#f6fabc]/20 transition-colors group">
            {/* Order ID */}
            <td className="px-4 py-3.5">
                <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                    {order.order_id}
                </span>
            </td>

            {/* Product */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f6fabc]/60 border border-[#c8e84a]/40 flex items-center justify-center shrink-0 text-base overflow-hidden">
                        {order.product_image_url
                            ? <img src={order.product_image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            : emoji
                        }
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{order.product_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {order.item_count} item{order.item_count > 1 ? 's' : ''} · Rp {(order.total_price).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </td>

            {/* Customer */}
            <td className="px-4 py-3.5">
                <p className="text-sm font-medium text-gray-800">{order.customer_name || '—'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Ordered at {orderedTime}</p>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <StatusBadge status={order.status} />
            </td>

            {/* Pickup ID */}
            <td className="px-4 py-3.5">
                <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                    {order.pickup_id || '—'}
                </span>
            </td>

            {/* Confirm Button */}
            <td className="px-4 py-3.5">
                {order.status === 'cancelled' ? (
                    <span className="text-xs text-gray-300 italic">—</span>
                ) : order.status === 'ready_for_pickup' ? (
                    <button
                        onClick={() => onConfirm(order.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3a7d44] text-white hover:bg-[#2d6435] disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                    >
                        Confirm Pickup
                    </button>
                ) : (
                    <button
                        onClick={() => onUnconfirm(order.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-500 border border-gray-200 hover:border-gray-300 disabled:opacity-50 transition-all"
                    >
                        Unconfirm
                    </button>
                )}
            </td>
        </tr>
    )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function PickupOrdersPage() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<PickupOrder[]>([])
    const [fetching, setFetching] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Filter state
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    })

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [notifOpen, setNotifOpen] = useState(false)

    // ── Fetch orders ───────────────────────────────────────────────
    const fetchOrders = useCallback(async (uid: string) => {
        setFetching(true)
        try {
            const { data, error } = await supabase
                .from('pickup_orders')
                .select('*')
                .eq('partner_id', uid)
                .order('ordered_at', { ascending: false })

            if (error) {
                console.error('Fetch error:', error)
            } else {
                setOrders(data || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFetching(false)
        }
    }, [])

    // ── Auth + init ────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', session.user.id).single()

            if (profileData?.role === 'customer') { router.push('/dashboard/customer'); return }

            const name = profileData?.full_name
                || session.user.user_metadata?.full_name
                || session.user.email?.split('@')[0]
                || 'Partner'

            setProfile({ ...profileData, full_name: name })
            setUserId(session.user.id)
            await fetchOrders(session.user.id)
            setLoading(false)
        }
        init()
    }, [])

    // ── Realtime subscription ──────────────────────────────────────
    useEffect(() => {
        if (!userId) return
        const channel = supabase
            .channel('pickup_orders_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'pickup_orders',
                filter: `partner_id=eq.${userId}`,
            }, () => {
                fetchOrders(userId)
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [userId, fetchOrders])

    // ── Handlers ──────────────────────────────────────────────────
    const handleConfirm = async (id: string) => {
        setUpdatingId(id)
        setOrders(prev => prev.map(o => o.id === id
            ? { ...o, status: 'completed', confirmed_at: new Date().toISOString() }
            : o
        ))
        await supabase.from('pickup_orders')
            .update({ status: 'completed', confirmed_at: new Date().toISOString() })
            .eq('id', id)
        setUpdatingId(null)
    }

    const handleUnconfirm = async (id: string) => {
        setUpdatingId(id)
        setOrders(prev => prev.map(o => o.id === id
            ? { ...o, status: 'ready_for_pickup', confirmed_at: null }
            : o
        ))
        await supabase.from('pickup_orders')
            .update({ status: 'ready_for_pickup', confirmed_at: null })
            .eq('id', id)
        setUpdatingId(null)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // ── Filtered + paginated orders ────────────────────────────────
    const filtered = orders.filter(o => {
        const matchTab = activeTab === 'all' || o.status === activeTab
        const orderDate = new Date(o.ordered_at).toISOString().split('T')[0]
        const matchDate = orderDate >= dateRange.from && orderDate <= dateRange.to
        return matchTab && matchDate
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    // Stats
    const todayStr = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(o => o.ordered_at.startsWith(todayStr))
    const totalRevenue = todayOrders
        .filter(o => o.status === 'completed')
        .reduce((s, o) => s + (o.total_price || 0), 0)

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'all', label: 'All Orders', count: orders.length },
        { key: 'ready_for_pickup', label: 'Ready for Pickup', count: orders.filter(o => o.status === 'ready_for_pickup').length },
        { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
    ]

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f0]">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Partner'
    const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'P'

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f0]">

            {/* HEADER */}
            <header className="w-full bg-white px-6 py-3 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-30">
                <Link href="/" className="shrink-0">
                    <Image src="/logo-plateup.png" alt="PlateUp!" width={110} height={34} className="object-contain" />
                </Link>
                <div className="flex-1 max-w-xl mx-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input type="text" placeholder="Find your food..."
                            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400" />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#d4e8c2] border-2 border-[#3a7d44] flex items-center justify-center text-[#3a7d44] text-sm font-bold">
                            {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-800 hidden md:block">{firstName}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR */}
                <aside className="w-52 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">
                    <div className="flex items-center gap-2 px-2 mb-5">
                        <div className="w-9 h-9 rounded-full bg-[#d4e8c2] flex items-center justify-center text-[#3a7d44] font-bold text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Hello, {firstName}!</p>
                            <p className="text-xs text-gray-400">Ready to save the planet?</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {MENU_ITEMS.map(item => {
                            const Icon = item.icon
                            const isActive = item.label === 'Pickup Orders'
                            return (
                                <Link key={item.label} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-[#c8e84a] text-[#2d5a1a] font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? 'text-[#2d5a1a]' : 'text-gray-500'} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="flex-1 overflow-y-auto p-6">

                    {/* Page Title + Stats */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Pickup Management</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Real-time oversight of your surplus inventory sales.<br />
                                Monitor active pickups and review transaction history.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Today Orders Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 text-center shadow-sm min-w-[130px]">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Today Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{todayOrders.length}</p>
                                <p className="text-[10px] text-[#3a7d44] font-semibold">Orders</p>
                            </div>
                            {/* Total Revenue Card */}
                            <div className="bg-[#c8e84a] border border-[#b5d43a] rounded-2xl px-5 py-3 text-center shadow-sm min-w-[150px]">
                                <p className="text-[10px] font-semibold text-[#3a5a10] uppercase tracking-widest mb-0.5">Total Revenue</p>
                                <p className="text-xl font-bold text-[#2d5a1a] leading-tight">
                                    Rp {totalRevenue.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[10px] text-[#3a5a10] font-semibold">Completed today</p>
                            </div>
                            {/* Refresh */}
                            <button
                                onClick={() => userId && fetchOrders(userId)}
                                disabled={fetching}
                                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50">
                                <RefreshCw size={15} className={`text-gray-400 ${fetching ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setActiveTab(tab.key); setCurrentPage(1) }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5
                                        ${activeTab === tab.key
                                            ? 'bg-[#c8e84a] text-[#2d5a1a]'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}>
                                    {tab.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                                        ${activeTab === tab.key ? 'bg-[#b5d43a] text-[#2d5a1a]' : 'bg-gray-100 text-gray-400'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={14} className="text-gray-400" />
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={e => { setDateRange(prev => ({ ...prev, from: e.target.value })); setCurrentPage(1) }}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#c8e84a] transition-colors"
                                style={{ colorScheme: 'light' }}
                            />
                            <span className="text-gray-300">—</span>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={e => { setDateRange(prev => ({ ...prev, to: e.target.value })); setCurrentPage(1) }}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#c8e84a] transition-colors"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/50">
                                        {['Order ID', 'Product', 'Customer', 'Status', 'Pickup ID', 'Confirm'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetching && orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                                                Loading orders...
                                            </td>
                                        </tr>
                                    ) : paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-14 text-center">
                                                <div className="w-12 h-12 rounded-full bg-[#f6fabc] flex items-center justify-center mx-auto mb-3">
                                                    <Truck size={20} className="text-[#666c11]" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-1">Tidak ada order ditemukan</p>
                                                <p className="text-xs text-gray-400">
                                                    {activeTab !== 'all' ? 'Coba ganti filter tab atau rentang tanggal' : 'Order akan muncul di sini saat customer melakukan pembelian'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map(order => (
                                            <OrderRow
                                                key={order.id}
                                                order={order}
                                                onConfirm={handleConfirm}
                                                onUnconfirm={handleUnconfirm}
                                                isUpdating={updatingId === order.id}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filtered.length > 0 && (
                            <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} orders
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors">
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                            if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                                                acc.push('...')
                                            }
                                            acc.push(p)
                                            return acc
                                        }, [])
                                        .map((p, idx) =>
                                            p === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="text-xs text-gray-300 px-1">...</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setCurrentPage(p as number)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all
                                                        ${currentPage === p
                                                            ? 'bg-[#c8e84a] text-[#2d5a1a]'
                                                            : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                                                        }`}>
                                                    {p}
                                                </button>
                                            )
                                        )}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}