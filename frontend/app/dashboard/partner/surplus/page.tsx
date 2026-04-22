'use client'
// frontend/app/dashboard/partner/surplus/page.tsx
// REPLACE seluruh file ini

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut, Plus,
    Clock, AlertTriangle, CheckCircle2,
    Minus, Trash2, Edit3, ChevronDown,
    Sparkles, Upload, X
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface SurplusProduct {
    id: string
    product_name: string
    category: string
    original_price: number
    plate_up_price: number
    expiry_estimate: string       // e.g. "Konsumsi sebelum pukul 20.00"
    expiry_datetime: string       // ISO string untuk countdown
    production_time: string
    description: string
    image_url: string | null
    quantity: number
    status: 'active' | 'draft' | 'sold_out' | 'expired'
    is_draft: boolean
    created_at: string
}

// ── Dummy data — akan diganti dengan fetch Supabase ───────────────
const DUMMY_PRODUCTS: SurplusProduct[] = [
    {
        id: '1',
        product_name: 'Bakmie Komplit',
        category: 'Noodles & Pasta',
        original_price: 50000,
        plate_up_price: 25000,
        expiry_estimate: 'Konsumsi sebelum pukul 20.00',
        expiry_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2h dari sekarang
        production_time: '30 min - 1 hour ago',
        description: 'Bakmie segar dengan topping komplit',
        image_url: null,
        quantity: 12,
        status: 'active',
        is_draft: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        product_name: 'Croissant Butter',
        category: 'Bread & Pastry',
        original_price: 35000,
        plate_up_price: 18000,
        expiry_estimate: 'Konsumsi sebelum pukul 19.00',
        expiry_datetime: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 menit — warning!
        production_time: '2 - 3 hours ago',
        description: 'Croissant butter fresh dari oven',
        image_url: null,
        quantity: 6,
        status: 'active',
        is_draft: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '3',
        product_name: 'Nasi Gudeg Komplit',
        category: 'Rice Dishes',
        original_price: 45000,
        plate_up_price: 22000,
        expiry_estimate: 'Sudah melewati batas',
        expiry_datetime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // expired 30 menit lalu
        production_time: '3+ hours ago',
        description: 'Nasi gudeg dengan ayam dan krecek',
        image_url: null,
        quantity: 3,
        status: 'active',
        is_draft: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '4',
        product_name: 'Es Teh Manis',
        category: 'Beverages',
        original_price: 12000,
        plate_up_price: 7000,
        expiry_estimate: 'Konsumsi sebelum pukul 21.30',
        expiry_datetime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h
        production_time: 'Just cooked (< 30 min)',
        description: 'Es teh manis segar',
        image_url: null,
        quantity: 20,
        status: 'active',
        is_draft: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '5',
        product_name: 'Snack Box Mix',
        category: 'Snacks & Sides',
        original_price: 28000,
        plate_up_price: 15000,
        expiry_estimate: 'Konsumsi sebelum pukul 22.00',
        expiry_datetime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5h
        production_time: 'Just cooked (< 30 min)',
        description: 'Aneka snack dalam satu box',
        image_url: null,
        quantity: 8,
        status: 'active',
        is_draft: false,
        created_at: new Date().toISOString(),
    },
]

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Analysis', href: '/dashboard/partner/analysis', icon: BarChart2 },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

// ── Countdown Hook ────────────────────────────────────────────────
function useCountdown(expiryDatetime: string) {
    const [timeLeft, setTimeLeft] = useState('')
    const [status, setStatus] = useState<'ok' | 'warning' | 'expired'>('ok')

    useEffect(() => {
        const update = () => {
            const diff = new Date(expiryDatetime).getTime() - Date.now()

            if (diff <= 0) {
                // Sudah expired — hitung berapa lama
                const overBy = Math.abs(diff)
                const overMins = Math.floor(overBy / 60000)
                const overHrs = Math.floor(overMins / 60)
                const overMin = overMins % 60

                if (overHrs > 0) {
                    setTimeLeft(`+${overHrs}j ${overMin}m terlambat`)
                } else {
                    setTimeLeft(`+${overMins}m terlambat`)
                }
                setStatus('expired')
                return
            }

            const totalMins = Math.floor(diff / 60000)
            const hours = Math.floor(totalMins / 60)
            const mins = totalMins % 60
            const secs = Math.floor((diff % 60000) / 1000)

            if (diff < 30 * 60 * 1000) {
                // Kurang dari 30 menit — warning
                setTimeLeft(`${mins}m ${secs}s`)
                setStatus('warning')
            } else if (hours > 0) {
                setTimeLeft(`${hours}j ${mins}m`)
                setStatus('ok')
            } else {
                setTimeLeft(`${mins}m ${secs}s`)
                setStatus('ok')
            }
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [expiryDatetime])

    return { timeLeft, status }
}

// ── Product Row Component ─────────────────────────────────────────
function ProductRow({ product, onQuantityChange, onDelete }: {
    product: SurplusProduct
    onQuantityChange: (id: string, delta: number) => void
    onDelete: (id: string) => void
}) {
    const { timeLeft, status } = useCountdown(product.expiry_datetime)

    const timerColor = {
        ok: 'text-[#3a7d44] bg-[#e8f5c8]',
        warning: 'text-[#b45309] bg-[#fef3c7]',
        expired: 'text-red-600 bg-red-50',
    }[status]

    const timerIcon = {
        ok: <Clock size={13} className="text-[#3a7d44]" />,
        warning: <AlertTriangle size={13} className="text-[#b45309]" />,
        expired: <AlertTriangle size={13} className="text-red-500" />,
    }[status]

    return (
        <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors
            ${status === 'expired' ? 'opacity-75' : ''}`}>

            {/* Product */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f6fabc]/60 border border-[#c8e84a]/40 flex items-center justify-center shrink-0 text-lg">
                        {product.category.includes('Noodle') ? '🍜' :
                            product.category.includes('Rice') ? '🍚' :
                                product.category.includes('Bread') ? '🥐' :
                                    product.category.includes('Bever') ? '🧋' : '🍱'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{product.product_name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e8f5c8] text-[#3a7d44] font-medium">
                            {product.category}
                        </span>
                    </div>
                </div>
            </td>

            {/* Quantity */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onQuantityChange(product.id, -1)}
                        disabled={product.quantity <= 0}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <Minus size={11} />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-6 text-center">{product.quantity}</span>
                    <button
                        onClick={() => onQuantityChange(product.id, 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Plus size={11} />
                    </button>
                </div>
            </td>

            {/* Price Setting */}
            <td className="px-4 py-3">
                <div>
                    <p className="text-xs text-gray-400 line-through">Rp {product.original_price.toLocaleString('id-ID')}</p>
                    <p className="text-sm font-bold text-[#3a7d44]">Rp {product.plate_up_price.toLocaleString('id-ID')}</p>
                </div>
            </td>

            {/* Expires In — LIVE COUNTDOWN */}
            <td className="px-4 py-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${timerColor}`}>
                    {timerIcon}
                    <span className="font-mono">{timeLeft}</span>
                </div>
            </td>

            {/* Notes / Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg transition-colors">
                        Notes...
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                    </button>
                </div>
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
    const [products, setProducts] = useState<SurplusProduct[]>(DUMMY_PRODUCTS)
    const [notifOpen, setNotifOpen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('Manage Surplus')

    // Stats
    const activeCount = products.filter(p => p.status === 'active').length
    const totalValue = products.reduce((sum, p) => sum + p.plate_up_price * p.quantity, 0)
    const nearExpiryCount = products.filter(p => {
        const diff = new Date(p.expiry_datetime).getTime() - Date.now()
        return diff > 0 && diff < 30 * 60 * 1000
    }).length

    // ── Auth ──────────────────────────────────────────────────────
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

            // TODO: fetch real products from Supabase
            // const { data } = await supabase
            //     .from('surplus_products')
            //     .select('*')
            //     .eq('partner_id', session.user.id)
            //     .order('created_at', { ascending: false })
            // if (data) setProducts(data)

            setLoading(false)
        }
        init()
    }, [])

    const handleQuantityChange = (id: string, delta: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
        ))
    }

    const handleDelete = (id: string) => {
        if (confirm('Hapus produk ini dari inventory?')) {
            setProducts(prev => prev.filter(p => p.id !== id))
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

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
                        {/* Add New Surplus Button */}
                        <Link href="/dashboard/partner/surplus/add"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all
                                bg-[#3a7d44] hover:bg-[#2d6435] shadow-sm hover:shadow-md">
                            <Plus size={16} />
                            Add New Surplus
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#f6fabc]/70 border border-[#c8e84a]/60 rounded-2xl p-4">
                            <p className="text-xs font-medium text-[#666c11] uppercase tracking-wide mb-1">Active Listings</p>
                            <p className="text-2xl font-bold text-[#2d3a00]">{activeCount} <span className="text-sm font-medium">Product Live</span></p>
                            <p className="text-[10px] text-[#666c11] mt-1">Your delicious meals are now visible to students nearby.</p>
                        </div>
                        <div className="bg-[#f6fabc]/70 border border-[#c8e84a]/60 rounded-2xl p-4">
                            <p className="text-xs font-medium text-[#666c11] uppercase tracking-wide mb-1">Today Saved Value</p>
                            <p className="text-2xl font-bold text-[#2d3a00]">Rp {(totalValue / 1000).toFixed(0)}.<span className="text-sm">000</span></p>
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
                                {nearExpiryCount > 0 ? 'Sell these faster with a flash discount.' : 'All products are within safe time range.'}
                            </p>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-800">Inventory Breakdown</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#3a7d44]" />
                                    <span>Aman</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span>&lt; 30 menit</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <span>Expired</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Price Setting</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Expires In</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center">
                                                <div className="w-12 h-12 rounded-full bg-[#f6fabc] flex items-center justify-center mx-auto mb-3">
                                                    <Package size={20} className="text-[#666c11]" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-1">Belum ada produk surplus</p>
                                                <Link href="/dashboard/partner/surplus/add"
                                                    className="text-xs text-[#3a7d44] font-medium hover:underline">
                                                    + Tambah produk pertama
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(product => (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                onQuantityChange={handleQuantityChange}
                                                onDelete={handleDelete}
                                            />
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