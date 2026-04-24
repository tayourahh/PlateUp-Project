'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface SurplusProduct {
    id: string
    product_name: string
    category: string
    plate_up_price: number
    expiry_datetime: string | null
    quantity: number
    is_draft: boolean
    status: string
    image_url: string | null
}

interface PickupOrder {
    id: string
    product_name: string
    product_image_url: string | null
    customer_name: string
    item_count: number
    total_price: number
    status: 'ready_for_pickup' | 'completed' | 'cancelled'
    ordered_at: string
}

// ── Constants ─────────────────────────────────────────────────────
const menuItems = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Analysis', href: '/dashboard/partner/analysis', icon: BarChart2 },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

const statusStyle: Record<string, string> = {
    'completed': 'bg-[#c8e6c9] text-[#2d6435]',
    'ready_for_pickup': 'bg-[#3a7d44] text-white',
    'cancelled': 'bg-red-100 text-red-500',
}

const statusLabel: Record<string, string> = {
    'completed': 'Completed',
    'ready_for_pickup': 'Pickup Ready',
    'cancelled': 'Cancelled',
}

// ── Helpers ───────────────────────────────────────────────────────
function getTimeLeft(expiryDatetime: string): { label: string; progress: number } {
    const diff = new Date(expiryDatetime).getTime() - Date.now()
    if (diff <= 0) return { label: 'Expired', progress: 0 }
    const totalMins = Math.floor(diff / 60000)
    const hours = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    const label = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`
    // progress = sisa waktu relatif, max 4 jam = 100%
    const maxMs = 4 * 60 * 60 * 1000
    const progress = Math.min(100, Math.round((diff / maxMs) * 100))
    return { label, progress }
}

function getProductEmoji(name: string, category?: string): string {
    const n = (name + (category || '')).toLowerCase()
    if (n.includes('bakmie') || n.includes('mie') || n.includes('noodle')) return '🍜'
    if (n.includes('nasi') || n.includes('rice')) return '🍚'
    if (n.includes('pangsit')) return '🥟'
    if (n.includes('ayam') || n.includes('chicken')) return '🍗'
    if (n.includes('kopi') || n.includes('coffee')) return '☕'
    if (n.includes('roti') || n.includes('bread')) return '🥐'
    if (n.includes('snack')) return '🍱'
    return '🍴'
}

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 11) return 'Good Morning'
    if (h < 15) return 'Good Afternoon'
    if (h < 19) return 'Good Evening'
    return 'Good Night'
}

// ── Main Component ────────────────────────────────────────────────
export default function PartnerDashboard() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notifOpen, setNotifOpen] = useState(false)
    const [search, setSearch] = useState('')

    const [surplusProducts, setSurplusProducts] = useState<SurplusProduct[]>([])
    const [recentOrders, setRecentOrders] = useState<PickupOrder[]>([])
    const [userId, setUserId] = useState<string | null>(null)

    // ── Fetch data ────────────────────────────────────────────────
    const fetchData = useCallback(async (uid: string) => {
        const [{ data: surplus }, { data: orders }] = await Promise.all([
            supabase
                .from('surplus_products')
                .select('id, product_name, category, plate_up_price, expiry_datetime, quantity, is_draft, status, image_url')
                .eq('partner_id', uid)
                .order('created_at', { ascending: false }),
            supabase
                .from('pickup_orders')
                .select('id, product_name, product_image_url, customer_name, item_count, total_price, status, ordered_at')
                .eq('partner_id', uid)
                .order('ordered_at', { ascending: false })
                .limit(10),
        ])
        if (surplus) setSurplusProducts(surplus)
        if (orders) setRecentOrders(orders)
    }, [])

    // ── Auth ──────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data: profileData } = await supabase
                .from('profiles').select('*')
                .eq('id', session.user.id).single()

            if (profileData?.role === 'customer') {
                router.push('/dashboard/customer'); return
            }

            const name = profileData?.full_name
                || session.user.user_metadata?.full_name
                || session.user.user_metadata?.name
                || session.user.email?.split('@')[0]
                || 'Partner'

            setProfile({ ...profileData, full_name: name })
            setUserId(session.user.id)
            await fetchData(session.user.id)
            setLoading(false)
        }
        init()
    }, [])

    // ── Realtime subscriptions ────────────────────────────────────
    useEffect(() => {
        if (!userId) return
        const ch1 = supabase.channel('dashboard_surplus')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'surplus_products', filter: `partner_id=eq.${userId}` },
                () => fetchData(userId))
            .subscribe()
        const ch2 = supabase.channel('dashboard_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_orders', filter: `partner_id=eq.${userId}` },
                () => fetchData(userId))
            .subscribe()
        return () => {
            supabase.removeChannel(ch1)
            supabase.removeChannel(ch2)
        }
    }, [userId, fetchData])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // ── Derived stats ─────────────────────────────────────────────
    const activeProducts = surplusProducts.filter(p => !p.is_draft && p.status !== 'expired')
    const totalActivePortion = activeProducts.reduce((s, p) => s + (p.quantity || 0), 0)

    // Near-expiry = expiry_datetime ada, belum expired, dan < 2 jam lagi
    const nearExpiry = surplusProducts
        .filter(p => {
            if (!p.expiry_datetime) return false
            const diff = new Date(p.expiry_datetime).getTime() - Date.now()
            return diff > 0 && diff < 2 * 60 * 60 * 1000
        })
        .sort((a, b) =>
            new Date(a.expiry_datetime!).getTime() - new Date(b.expiry_datetime!).getTime()
        )

    const todayStr = new Date().toISOString().split('T')[0]
    const todayOrders = recentOrders.filter(o => o.ordered_at.startsWith(todayStr))
    const incomingOrders = recentOrders.filter(o => o.status === 'ready_for_pickup')
    const todayEarnings = recentOrders
        .filter(o => o.ordered_at.startsWith(todayStr) && o.status === 'completed')
        .reduce((s, o) => s + (o.total_price || 0), 0)
    const storeRating = profile?.store_rating ?? null

    // ── Banner text — dinamis ─────────────────────────────────────
    // "Ready to clear your shelves?" section
    let bannerBody = 'Semua surplus terdaftar sudah! Pantau terus stok kamu ya.'
    if (nearExpiry.length > 0) {
        const names = nearExpiry.slice(0, 2).map(p => p.product_name).join(' dan ')
        bannerBody = `${nearExpiry.length} produk kamu hampir kedaluwarsa — ${names}. Yuk segera jual sebelum terbuang!`
    } else if (totalActivePortion > 0) {
        bannerBody = `Kamu punya ${totalActivePortion} porsi aktif siap diselamatkan. Ayo ubah surplus jadi cuan hari ini!`
    }

    // AI Insight — dinamis dari near-expiry terbanyak kuantitasnya
    const topProduct = nearExpiry.length > 0
        ? nearExpiry.reduce((a, b) => (a.quantity > b.quantity ? a : b))
        : activeProducts.length > 0
            ? activeProducts.reduce((a, b) => (a.quantity > b.quantity ? a : b))
            : null

    let aiInsightText = 'Tambah produk surplus kamu untuk mendapat insight AI yang lebih akurat!'
    if (topProduct) {
        const { label: timeLeftLabel } = topProduct.expiry_datetime
            ? getTimeLeft(topProduct.expiry_datetime)
            : { label: '' }
        const isNearExpiry = nearExpiry.find(p => p.id === topProduct.id)
        if (isNearExpiry) {
            aiInsightText = `"${topProduct.product_name}" tinggal ${timeLeftLabel} — diskon 30–40% sekarang untuk habis lebih cepat!`
        } else {
            aiInsightText = `"${topProduct.product_name}" punya stok ${topProduct.quantity} porsi. Tambah listing surplus baru untuk jangkau lebih banyak pembeli!`
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
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
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400" />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="relative">
                        <button onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {incomingOrders.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 p-4">
                                <p className="text-sm font-medium text-gray-900 mb-3">Notifications</p>
                                {incomingOrders.length === 0 ? (
                                    <div className="text-xs text-gray-400 text-center py-4">No new notifications</div>
                                ) : (
                                    <div className="space-y-2">
                                        {incomingOrders.slice(0, 4).map(o => (
                                            <div key={o.id} className="flex items-start gap-2 p-2 rounded-xl bg-[#f6fabc]/50">
                                                <span className="text-base mt-0.5">{getProductEmoji(o.product_name)}</span>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-800 leading-tight">{o.customer_name} pesan {o.product_name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Siap diambil</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#d4e8c2] border-2 border-[#3a7d44] flex items-center justify-center text-[#3a7d44] text-sm font-bold">
                            {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-800 hidden md:block">{firstName}</span>
                    </div>
                </div>
            </header>

            {/* BODY */}
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
                        {menuItems.map(item => {
                            const Icon = item.icon
                            const isActive = item.label === 'Dashboard'
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

                    {/* AI Cards Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">

                        {/* Good Morning Card */}
                        <div className="bg-[#e8f5c8] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-[#2d5a1a]">
                                    {getGreeting()}, {firstName}! ✏️
                                </p>
                            </div>
                            <p className="text-xs text-[#3a7d44] font-medium mb-2">
                                Ready to clear your shelves?
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                {bannerBody}
                            </p>
                            {/* ← Link ke Manage Surplus */}
                            <Link href="/dashboard/partner/surplus"
                                className="inline-block px-4 py-2 bg-[#3a7d44] text-white text-xs font-medium rounded-full hover:bg-[#2d6435] transition-colors">
                                Manage Today's Surplus
                            </Link>
                        </div>

                        {/* AI Insight Card */}
                        <div className="bg-[#e8f5c8] rounded-2xl p-5">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs text-[#3a7d44]">✦</span>
                                <p className="text-xs font-semibold text-[#3a7d44] uppercase tracking-wide">AI Insight</p>
                            </div>
                            <p className="text-sm font-bold text-[#2d5a1a] mb-2">
                                Hot Tip for {firstName}!
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                {aiInsightText}
                            </p>
                            {/* ← Link ke Add Surplus */}
                            <Link href="/dashboard/partner/surplus/add"
                                className="inline-block px-4 py-2 bg-[#3a7d44] text-white text-xs font-medium rounded-full hover:bg-[#2d6435] transition-colors">
                                Apply Now
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-[#e8f5c8] flex items-center justify-center text-lg mb-2">📦</div>
                            <p className="text-xs text-gray-500 mb-1">Incoming Orders</p>
                            <p className="text-base font-bold text-gray-900">
                                {incomingOrders.length} Orders{' '}
                                {todayOrders.length > 0 && (
                                    <span className="text-xs font-medium text-[#3a7d44]">+{todayOrders.length} today</span>
                                )}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-[#e8f5c8] flex items-center justify-center text-lg mb-2">🥗</div>
                            <p className="text-xs text-gray-500 mb-1">Active Surplus</p>
                            <p className="text-base font-bold text-gray-900">
                                {totalActivePortion} Portions{' '}
                                {nearExpiry.length > 0 && (
                                    <span className="text-xs font-medium text-amber-500">⚠ {nearExpiry.length} near expiry</span>
                                )}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-[#e8f5c8] flex items-center justify-center text-lg mb-2">💰</div>
                            <p className="text-xs text-gray-500 mb-1">Today's Earnings</p>
                            <p className="text-base font-bold text-gray-900">
                                Rp {(todayEarnings / 1000).toFixed(0)}k
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-[#e8f5c8] flex items-center justify-center text-lg mb-2">⭐</div>
                            <p className="text-xs text-gray-500 mb-1">Store Rating</p>
                            <p className="text-base font-bold text-gray-900">
                                {storeRating ? (
                                    <>{storeRating} <span className="text-xs font-medium text-[#3a7d44]">/5.0</span></>
                                ) : (
                                    <span className="text-sm text-gray-400">Belum ada</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Recent Activity + Expiring Soon */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-200">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
                                <Link href="/dashboard/partner/orders"
                                    className="text-xs text-[#3a7d44] font-medium hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50 overflow-y-auto max-h-64">
                                {recentOrders.length === 0 ? (
                                    <div className="px-5 py-10 text-center text-xs text-gray-400">
                                        Belum ada aktivitas. Order akan muncul di sini.
                                    </div>
                                ) : (
                                    recentOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm shrink-0 overflow-hidden">
                                                    {order.product_image_url
                                                        ? <img src={order.product_image_url} alt="" className="w-full h-full object-cover" />
                                                        : getProductEmoji(order.product_name)
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900 line-clamp-1">
                                                        {order.customer_name} ordered {order.item_count}x {order.product_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {order.item_count} Items · Rp {order.total_price.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                                {statusLabel[order.status] ?? order.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Expiring Soon */}
                        <div className="bg-white rounded-2xl border border-gray-200">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">Expiring Soon</h2>
                                <Link href="/dashboard/partner/surplus"
                                    className="text-xs text-[#3a7d44] font-medium hover:underline">
                                    Manage
                                </Link>
                            </div>
                            <div className="px-5 py-3 space-y-4 overflow-y-auto max-h-64">
                                {nearExpiry.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-gray-400">
                                        🎉 Tidak ada produk yang hampir kedaluwarsa
                                    </div>
                                ) : (
                                    nearExpiry.slice(0, 5).map((item) => {
                                        const { label: timeLeft, progress } = getTimeLeft(item.expiry_datetime!)
                                        const progressColor = progress > 50
                                            ? 'bg-[#3a7d44]'
                                            : progress > 20
                                                ? 'bg-amber-400'
                                                : 'bg-red-400'
                                        return (
                                            <div key={item.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm shrink-0 overflow-hidden">
                                                            {item.image_url
                                                                ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                                : getProductEmoji(item.product_name, item.category)
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-900">{item.product_name}</p>
                                                            <p className="text-[10px] text-gray-400">{item.quantity} units remaining</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">{timeLeft}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 ml-9">
                                                    <div
                                                        className={`${progressColor} h-1.5 rounded-full transition-all`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}