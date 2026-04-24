'use client'
// frontend/app/dashboard/partner/surplus/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut, Plus,
    Clock, AlertTriangle, Minus, Trash2,
    RefreshCw
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface SurplusProduct {
    id: string
    product_name: string
    category: string
    original_price: number
    plate_up_price: number
    expiry_estimate: string
    expiry_datetime: string | null
    production_time: string
    description: string
    image_url: string | null
    quantity: number
    status: 'active' | 'draft' | 'sold_out' | 'expired'
    is_draft: boolean
    created_at: string
}

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

// ── Live Countdown Hook ───────────────────────────────────────────
function useCountdown(expiryDatetime: string | null) {
    const [timeLeft, setTimeLeft] = useState('—')
    const [status, setStatus] = useState<'ok' | 'warning' | 'expired'>('ok')

    useEffect(() => {
        if (!expiryDatetime) {
            setTimeLeft('—')
            setStatus('ok')
            return
        }

        const update = () => {
            const diff = new Date(expiryDatetime).getTime() - Date.now()

            if (diff <= 0) {
                const overMins = Math.floor(Math.abs(diff) / 60000)
                const overHrs = Math.floor(overMins / 60)
                const overMin = overMins % 60
                setTimeLeft(overHrs > 0 ? `+${overHrs}j ${overMin}m terlambat` : `+${overMins}m terlambat`)
                setStatus('expired')
                return
            }

            const totalMins = Math.floor(diff / 60000)
            const hours = Math.floor(totalMins / 60)
            const mins = totalMins % 60
            const secs = Math.floor((diff % 60000) / 1000)

            if (diff < 30 * 60 * 1000) {
                setTimeLeft(`${mins}m ${secs}s`)
                setStatus('warning')
            } else {
                setTimeLeft(hours > 0 ? `${hours}j ${mins}m` : `${mins}m ${secs}s`)
                setStatus('ok')
            }
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [expiryDatetime])

    return { timeLeft, status }
}

// ── Product Row ───────────────────────────────────────────────────
function ProductRow({ product, onQuantityChange, onDelete }: {
    product: SurplusProduct
    onQuantityChange: (id: string, delta: number) => void
    onDelete: (id: string) => void
}) {
    const { timeLeft, status } = useCountdown(product.expiry_datetime)

    const timerStyle = {
        ok: 'text-[#3a7d44] bg-[#e8f5c8]',
        warning: 'text-[#b45309] bg-[#fef3c7]',
        expired: 'text-red-600 bg-red-50',
    }[status]

    const timerIcon = {
        ok: <Clock size={13} className="text-[#3a7d44]" />,
        warning: <AlertTriangle size={13} className="text-[#b45309]" />,
        expired: <AlertTriangle size={13} className="text-red-500" />,
    }[status]

    const emoji =
        product.category?.includes('Noodle') ? '🍜' :
            product.category?.includes('Rice') ? '🍚' :
                product.category?.includes('Bread') ? '🥐' :
                    product.category?.includes('Bever') ? '🧋' :
                        product.category?.includes('Snack') ? '🍱' :
                            product.category?.includes('Dess') ? '🍮' : '🍴'

    return (
        <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${status === 'expired' ? 'opacity-70' : ''}`}>

            {/* Product */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f6fabc]/60 border border-[#c8e84a]/40 flex items-center justify-center shrink-0 text-lg overflow-hidden">
                        {product.image_url
                            ? <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            : emoji
                        }
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{product.product_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e8f5c8] text-[#3a7d44] font-medium">
                                {product.category || '—'}
                            </span>
                            {product.is_draft && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                    Draft
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {/* Quantity */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button onClick={() => onQuantityChange(product.id, -1)} disabled={product.quantity <= 0}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <Minus size={11} />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-6 text-center">{product.quantity ?? 0}</span>
                    <button onClick={() => onQuantityChange(product.id, 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Plus size={11} />
                    </button>
                </div>
            </td>

            {/* Price */}
            <td className="px-4 py-3">
                <p className="text-xs text-gray-400 line-through">Rp {(product.original_price || 0).toLocaleString('id-ID')}</p>
                <p className="text-sm font-bold text-[#3a7d44]">Rp {(product.plate_up_price || 0).toLocaleString('id-ID')}</p>
            </td>

            {/* Expires In */}
            <td className="px-4 py-3">
                {product.expiry_datetime ? (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${timerStyle}`}>
                        {timerIcon}
                        <span className="font-mono">{timeLeft}</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">
                        {product.expiry_estimate || '—'}
                    </span>
                )}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <button onClick={() => onDelete(product.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    )
}

// ── Main Component ────────────────────────────────────────────────
export default function ManageSurplusDashboard() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<SurplusProduct[]>([])
    const [fetching, setFetching] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // ── Fetch products dari Supabase ──────────────────────────────
    const fetchProducts = useCallback(async (uid: string) => {
        setFetching(true)
        try {
            const { data, error } = await supabase
                .from('surplus_products')
                .select('*')
                .eq('partner_id', uid)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Fetch error:', error)
            } else {
                setProducts(data || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFetching(false)
        }
    }, [])

    // ── Auth + initial fetch ──────────────────────────────────────
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

            await fetchProducts(session.user.id)
            setLoading(false)
        }
        init()
    }, [])

    // ── Realtime subscription — auto update saat ada produk baru ──
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel('surplus_products_changes')
            .on('postgres_changes', {
                event: '*',                    // INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'surplus_products',
                filter: `partner_id=eq.${userId}`
            }, () => {
                // Refetch saat ada perubahan
                fetchProducts(userId)
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [userId, fetchProducts])

    // ── Handlers ─────────────────────────────────────────────────
    const handleQuantityChange = async (id: string, delta: number) => {
        const product = products.find(p => p.id === id)
        if (!product) return
        const newQty = Math.max(0, (product.quantity || 0) + delta)

        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: newQty } : p))

        // Sync ke Supabase
        await supabase.from('surplus_products').update({ quantity: newQty }).eq('id', id)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus produk ini dari inventory?')) return

        // Optimistic update
        setProducts(prev => prev.filter(p => p.id !== id))

        // Delete dari Supabase
        await supabase.from('surplus_products').delete().eq('id', id)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // ── Stats ────────────────────────────────────────────────────
    const activeProducts = products.filter(p => !p.is_draft)
    const totalValue = products.reduce((s, p) => s + (p.plate_up_price || 0) * (p.quantity || 0), 0)
    const nearExpiryCount = products.filter(p => {
        if (!p.expiry_datetime) return false
        const diff = new Date(p.expiry_datetime).getTime() - Date.now()
        return diff > 0 && diff < 30 * 60 * 1000
    }).length

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
                    <div className="relative">
                        <button onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                    </div>
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
                            const isActive = item.label === 'Manage Surplus'
                            return (
                                <Link key={item.label} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive ? 'bg-[#c8e84a] text-[#2d5a1a] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#2d5a1a]' : 'text-gray-500'} />
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

                    {/* Page Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Surplus Inventory</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage your surplus meals and turn waste into impact.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Manual refresh button */}
                            <button onClick={() => userId && fetchProducts(userId)} disabled={fetching}
                                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50">
                                <RefreshCw size={15} className={`text-gray-400 ${fetching ? 'animate-spin' : ''}`} />
                            </button>
                            <Link href="/dashboard/partner/surplus/add"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3a7d44] hover:bg-[#2d6435] shadow-sm hover:shadow-md transition-all">
                                <Plus size={16} />
                                Add New Surplus
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#f6fabc]/70 border border-[#c8e84a]/60 rounded-2xl p-4">
                            <p className="text-xs font-medium text-[#666c11] uppercase tracking-wide mb-1">Active Listings</p>
                            <p className="text-2xl font-bold text-[#2d3a00]">
                                {activeProducts.length} <span className="text-sm font-medium">Product Live</span>
                            </p>
                            <p className="text-[10px] text-[#666c11] mt-1">Your delicious meals are now visible to students nearby.</p>
                        </div>
                        <div className="bg-[#f6fabc]/70 border border-[#c8e84a]/60 rounded-2xl p-4">
                            <p className="text-xs font-medium text-[#666c11] uppercase tracking-wide mb-1">Today Saved Value</p>
                            <p className="text-2xl font-bold text-[#2d3a00]">
                                Rp {totalValue.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-[#666c11] mt-1">Total earnings from rescued meals.</p>
                        </div>
                        <div className={`border rounded-2xl p-4 ${nearExpiryCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-[#f6fabc]/70 border-[#c8e84a]/60'}`}>
                            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${nearExpiryCount > 0 ? 'text-amber-600' : 'text-[#666c11]'}`}>
                                Total Near Expiry
                            </p>
                            <p className={`text-2xl font-bold ${nearExpiryCount > 0 ? 'text-amber-700' : 'text-[#2d3a00]'}`}>
                                {nearExpiryCount} <span className="text-sm font-medium">Units Flagged</span>
                            </p>
                            <p className={`text-[10px] mt-1 ${nearExpiryCount > 0 ? 'text-amber-600' : 'text-[#666c11]'}`}>
                                {nearExpiryCount > 0 ? 'Sell these faster with a flash discount.' : 'All products within safe time range.'}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-800">Inventory Breakdown</h2>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3a7d44] inline-block" />Aman</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{'< 30 menit'}</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Expired</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        {['Product', 'Quantity', 'Price Setting', 'Expires In', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetching && products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                                                Loading inventory...
                                            </td>
                                        </tr>
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center">
                                                <div className="w-12 h-12 rounded-full bg-[#f6fabc] flex items-center justify-center mx-auto mb-3">
                                                    <Package size={20} className="text-[#666c11]" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">Belum ada produk surplus</p>
                                                <Link href="/dashboard/partner/surplus/add"
                                                    className="text-xs text-[#3a7d44] font-semibold hover:underline">
                                                    + Tambah produk pertama
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(p => (
                                            <ProductRow key={p.id} product={p}
                                                onQuantityChange={handleQuantityChange}
                                                onDelete={handleDelete} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}