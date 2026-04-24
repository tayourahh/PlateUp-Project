'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ClipboardList, Settings, LogOut, X, MapPin, Clock, Minus, Plus, ShoppingBag } from 'lucide-react'

const menuItems = [
    { label: 'Home', href: '/dashboard/customer', icon: Home },
    { label: 'My Orders', href: '/dashboard/customer/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/customer/settings', icon: Settings },
]

const statusStyle: Record<string, string> = {
    'Pickup Ready': 'bg-[#3a7d44] text-white',
    'Cancelled': 'bg-gray-100 text-gray-500',
    'Completed': 'bg-[#c8e6c9] text-[#2d6435]',
}

type PickupOrder = {
    id: string
    product_name: string
    product_image_url: string | null
    item_count: number
    total_price: number
    status: string
    ordered_at: string
}

type SurplusProduct = {
    id: string
    partner_id: string
    product_name: string
    category: string
    production_time: string
    expiry_estimate: string
    original_price: number
    plate_up_price: number
    description: string
    image_url: string | null
    status: string
    is_draft: boolean
    expiry_datetime: string
    quantity: number
}

// ── Food Order Modal ──────────────────────────────────────────────────────────
function FoodOrderModal({
    food, onClose, customerId, onOrderSuccess
}: {
    food: SurplusProduct
    onClose: () => void
    customerId: string
    onOrderSuccess: () => void
}) {
    const supabase = createClient()
    const [qty, setQty] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const totalPrice = food.plate_up_price * qty
    const discount = food.original_price > food.plate_up_price
        ? Math.round(((food.original_price - food.plate_up_price) / food.original_price) * 100)
        : 0

    const handleOrder = async () => {
        setLoading(true)
        try {
            const { error } = await supabase.from('pickup_orders').insert({
                order_id: crypto.randomUUID(),
                customer_id: customerId,
                partner_id: food.partner_id,
                product_name: food.product_name,
                product_image_url: food.image_url,
                item_count: qty,
                total_price: totalPrice,
                status: 'Pickup Ready',
                ordered_at: new Date().toISOString(),
            })
            if (error) throw error
            setSuccess(true)
            setTimeout(() => { onOrderSuccess(); onClose() }, 1800)
        } catch (err) {
            console.error(err)
            alert('Gagal membuat pesanan. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
                style={{ animation: 'slideUp .3s ease-out' }}>

                {/* Image */}
                <div className="relative h-56 w-full bg-gray-100">
                    {food.image_url
                        ? <Image src={food.image_url} alt={food.product_name} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">🍱</div>
                    }
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                        <X size={16} className="text-gray-700" />
                    </button>
                    <span className="absolute top-3 left-3 bg-[#3a7d44] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                        {food.status || 'Ready to Eat'}
                    </span>
                    {discount > 0 && (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                            -{discount}% OFF
                        </span>
                    )}
                </div>

                <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{food.product_name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xl font-bold text-[#3a7d44]">
                                Rp {Number(food.plate_up_price).toLocaleString('id-ID')}
                            </span>
                            {food.original_price > food.plate_up_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    Rp {Number(food.original_price).toLocaleString('id-ID')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {food.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{food.description}</p>
                    )}

                    {/* Expiry */}
                    {food.expiry_estimate && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                            <Clock size={14} className="text-red-400 shrink-0" />
                            <p className="text-xs text-red-500 font-medium">
                                Estimated Expiry: {food.expiry_estimate} — Order now to prevent waste
                            </p>
                        </div>
                    )}

                    {/* Pickup */}
                    {food.production_time && (
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">Pick-up Details</p>
                            <div className="flex items-center gap-2">
                                <Clock size={13} className="text-[#3a7d44] shrink-0" />
                                <p className="text-xs text-gray-600">Pick-up before {food.production_time}</p>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#3a7d44] hover:text-[#3a7d44] transition-colors">
                                <Minus size={14} />
                            </button>
                            <span className="text-lg font-bold text-gray-900 w-6 text-center">{qty}</span>
                            <button onClick={() => setQty(q => Math.min(food.quantity ?? 99, q + 1))}
                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#3a7d44] hover:text-[#3a7d44] transition-colors">
                                <Plus size={14} />
                            </button>
                            <span className="text-xs text-gray-400">{food.quantity} available</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-600">TOTAL PRICE</span>
                            <span className="font-bold text-[#3a7d44] text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        {success ? (
                            <div className="w-full py-3.5 bg-[#3a7d44] text-white rounded-2xl text-sm font-semibold text-center">
                                ✅ Order Placed!
                            </div>
                        ) : (
                            <button onClick={handleOrder} disabled={loading}
                                className="w-full py-3.5 bg-[#3a7d44] hover:bg-[#2d6435] text-white rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <span className="animate-pulse">Processing...</span> : <><ShoppingBag size={16} /> Claim & Secure Food</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
        </div>
    )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeMenu, setActiveMenu] = useState('Home')
    const [notifOpen, setNotifOpen] = useState(false)

    const [recentOrders, setRecentOrders] = useState<PickupOrder[]>([])
    const [ordersLoading, setOrdersLoading] = useState(true)

    const [forYouItems, setForYouItems] = useState<SurplusProduct[]>([])
    const [upcomingItems, setUpcomingItems] = useState<SurplusProduct[]>([])
    const [productsLoading, setProductsLoading] = useState(true)

    const [selectedFood, setSelectedFood] = useState<SurplusProduct | null>(null)
    const [stats, setStats] = useState({ mealsShared: 0, moneySaved: 0, hungryPoints: 0 })

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', session.user.id).single()

            if (profileData?.role === 'partner') { router.push('/dashboard/partner'); return }

            const name = profileData?.full_name
                || session.user.user_metadata?.full_name
                || session.user.user_metadata?.name
                || session.user.email?.split('@')[0] || 'User'

            setProfile({ ...profileData, full_name: name })
            setLoading(false)

            fetchRecentOrders(session.user.id)
            fetchStats(session.user.id)
            fetchSurplusProducts()
        }
        init()
    }, [])

    const fetchRecentOrders = async (userId: string) => {
        setOrdersLoading(true)
        const { data } = await supabase
            .from('pickup_orders')
            .select('id, product_name, product_image_url, item_count, total_price, status, ordered_at')
            .eq('customer_id', userId)
            .order('ordered_at', { ascending: false })
            .limit(4)
        if (data) setRecentOrders(data as PickupOrder[])
        setOrdersLoading(false)
    }

    const fetchStats = async (userId: string) => {
        const { data } = await supabase
            .from('pickup_orders')
            .select('item_count, total_price')
            .eq('customer_id', userId)
            .neq('status', 'Cancelled')
        if (data) {
            const mealsShared = data.reduce((s, o) => s + (o.item_count ?? 0), 0)
            const totalSpent = data.reduce((s, o) => s + Number(o.total_price ?? 0), 0)
            const moneySaved = Math.round(totalSpent * 0.4)
            const hungryPoints = Math.round(moneySaved / 100)
            setStats({ mealsShared, moneySaved, hungryPoints })
        }
    }

    const fetchSurplusProducts = async () => {
        setProductsLoading(true)
        const { data } = await supabase
            .from('surplus_products')
            .select('*')
            .eq('is_draft', false)
            .gt('quantity', 0)
            .order('created_at', { ascending: false })
        if (data) {
            const products = data as SurplusProduct[]
            setForYouItems(products.slice(0, 5))
            const sorted = [...products].sort((a, b) =>
                new Date(a.expiry_datetime).getTime() - new Date(b.expiry_datetime).getTime()
            )
            setUpcomingItems(sorted.slice(0, 4))
        }
        setProductsLoading(false)
    }

    const handleOrderSuccess = () => {
        if (profile?.id) { fetchRecentOrders(profile.id); fetchStats(profile.id) }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut(); router.push('/'); router.refresh()
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    const firstName = profile?.full_name?.split(' ')[0] ?? 'User'
    const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'

    const CardSkeleton = () => (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 w-52 animate-pulse">
            <div className="h-32 bg-gray-100" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-4/5" />
                <div className="h-2.5 bg-gray-100 rounded w-3/5" />
                <div className="h-2.5 bg-gray-100 rounded w-2/5" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f0]">

            {/* HEADER */}
            <header className="w-full bg-white px-6 py-3 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-40">
                <Link href="/" className="shrink-0">
                    <Image src="/logo-plateup.png" alt="PlateUp!" width={110} height={34} className="object-contain" />
                </Link>
                <div className="flex-1 max-w-xl mx-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input type="text" placeholder="Find your food..." value={search}
                            onChange={e => setSearch(e.target.value)}
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
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        {notifOpen && (
                            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 p-4">
                                <p className="text-sm font-medium text-gray-900 mb-3">Notifications</p>
                                <div className="text-xs text-gray-400 text-center py-4">No new notifications</div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
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
                            const isActive = activeMenu === item.label
                            return (
                                <Link key={item.label} href={item.href} onClick={() => setActiveMenu(item.label)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#c8e84a] text-[#2d5a1a] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
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

                    {/* ── Stats (dynamic) ── */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            {
                                label: 'MEALS SHARED',
                                value: `${stats.mealsShared} Meals`,
                                desc: stats.mealsShared > 0
                                    ? `You've saved ${stats.mealsShared} meals from going to waste!`
                                    : 'Order your first meal to start saving food!',
                            },
                            {
                                label: 'MONEY SAVED',
                                value: `Rp ${stats.moneySaved.toLocaleString('id-ID')}`,
                                desc: stats.moneySaved > 0
                                    ? 'Great savings from surplus food deals!'
                                    : 'Start ordering to see your savings here.',
                            },
                            {
                                label: 'HUNGRY POINTS',
                                value: `${stats.hungryPoints.toLocaleString('id-ID')} Points`,
                                desc: stats.hungryPoints >= 500
                                    ? 'Nearly ready for your 50% OFF voucher!'
                                    : `${Math.max(0, 500 - stats.hungryPoints)} more points to unlock your voucher!`,
                            },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#e8f5c8] rounded-2xl p-5">
                                <p className="text-[10px] font-semibold text-[#5a7a2a] uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-bold text-[#2d5a1a] mb-1">{stat.value}</p>
                                <p className="text-xs text-[#5a7a2a] leading-relaxed">{stat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── For You (from Supabase, clickable) ── */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">For You</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {productsLoading
                                ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                                : forYouItems.length === 0
                                    ? <p className="text-sm text-gray-400 py-4">No items available.</p>
                                    : forYouItems.map(food => (
                                        <div key={food.id} onClick={() => setSelectedFood(food)}
                                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex-shrink-0 w-52">
                                            <div className="h-32 bg-gray-100 relative">
                                                {food.image_url
                                                    ? <Image src={food.image_url} alt={food.product_name} fill className="object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-4xl">🍱</div>
                                                }
                                                <span className="absolute top-2 left-2 bg-[#3a7d44] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                    {food.status || 'Ready to Eat'}
                                                </span>
                                                <span className="absolute top-2 right-2 text-[10px] text-gray-700 bg-white/90 rounded-full px-2 py-0.5">
                                                    📍 — km
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{food.product_name}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Pick-up before {food.production_time || '21.00 WIB'}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-[11px] text-[#3a7d44] font-semibold">
                                                        Rp {Number(food.plate_up_price).toLocaleString('id-ID')}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">{food.quantity} left</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>

                    {/* ── Upcoming Closing (from Supabase, clickable) ── */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Closing</h2>
                        {productsLoading ? (
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
                                ))}
                            </div>
                        ) : upcomingItems.length === 0 ? (
                            <p className="text-sm text-gray-400">No upcoming closing items.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {upcomingItems.map(food => (
                                    <div key={food.id} onClick={() => setSelectedFood(food)}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-row">
                                        <div className="relative w-28 flex-shrink-0 min-h-[96px] bg-gray-100">
                                            {food.image_url
                                                ? <Image src={food.image_url} alt={food.product_name} fill className="object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-3xl">🍱</div>
                                            }
                                            <span className="absolute top-2 left-2 bg-[#3a7d44] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                {food.status || 'Ready to Eat'}
                                            </span>
                                        </div>
                                        <div className="p-3 flex flex-col justify-center">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{food.product_name}</p>
                                            <p className="text-[11px] text-gray-400 mt-1">📍 — km</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Pick-up before {food.production_time || '21.00 WIB'}</p>
                                            <p className="text-[11px] text-[#3a7d44] font-semibold mt-1">
                                                Rp {Number(food.plate_up_price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Recently Orders (from Supabase) ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 mb-6">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">Recently Orders</h2>
                            <Link href="/dashboard/customer/orders" className="text-xs text-[#3a7d44] font-medium hover:underline">See all</Link>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto max-h-64">
                            {ordersLoading && Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between px-5 py-3.5 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-44 bg-gray-100 rounded" />
                                            <div className="h-2.5 w-24 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                                </div>
                            ))}
                            {!ordersLoading && recentOrders.length === 0 && (
                                <div className="px-5 py-8 text-center">
                                    <p className="text-sm text-gray-400">Belum ada pesanan.</p>
                                </div>
                            )}
                            {!ordersLoading && recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {order.product_image_url
                                                ? <Image src={order.product_image_url} alt={order.product_name} width={36} height={36} className="object-cover w-full h-full" />
                                                : <span className="text-lg">🍜</span>
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.product_name}</p>
                                            <p className="text-xs text-gray-400">
                                                {order.item_count} Items · Rp {Number(order.total_price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ml-3 ${statusStyle[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            {/* ORDER MODAL */}
            {selectedFood && (
                <FoodOrderModal
                    food={selectedFood}
                    onClose={() => setSelectedFood(null)}
                    customerId={profile?.id}
                    onOrderSuccess={handleOrderSuccess}
                />
            )}

        </div>
    )
}