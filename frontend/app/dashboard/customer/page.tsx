'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ClipboardList, BarChart2, Settings, LogOut } from 'lucide-react'

const menuItems = [
    { label: 'Home', href: '/dashboard/customer', icon: Home },
    { label: 'My Orders', href: '/dashboard/customer/orders', icon: ClipboardList },
    { label: 'Impact History', href: '/dashboard/customer/impact', icon: BarChart2 },
    { label: 'Setting', href: '/dashboard/customer/settings', icon: Settings },
]

const recentOrders = [
    { name: 'Bakmie Lebar Pangsit Komplit, Bakmie Apih', items: 3, price: 60000, status: 'Pickup Ready' },
    { name: 'Nasi Gila Menteng, Pak Kumis', items: 2, price: 45000, status: 'Cancelled' },
    { name: 'Sate Ayam Madura, Cak Malik', items: 10, price: 30000, status: 'Completed' },
    { name: 'Bubur Ayam Cianjur, Mang Oleh', items: 1, price: 15000, status: 'Cancelled' },
]

const statusStyle: Record<string, string> = {
    'Pickup Ready': 'bg-[#3a7d44] text-white',
    'Cancelled': 'bg-gray-100 text-gray-500',
    'Completed': 'bg-[#c8e6c9] text-[#2d6435]',
}

export default function CustomerDashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeMenu, setActiveMenu] = useState('Home')
    const [notifOpen, setNotifOpen] = useState(false)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data: profileData } = await supabase
                .from('profiles').select('*')
                .eq('id', session.user.id).single()

            if (profileData?.role === 'partner') {
                router.push('/dashboard/partner'); return
            }

            const name = profileData?.full_name
                || session.user.user_metadata?.full_name
                || session.user.user_metadata?.name
                || session.user.email?.split('@')[0]
                || 'User'

            setProfile({ ...profileData, full_name: name })
            setLoading(false)
        }
        getProfile()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    const firstName = profile?.full_name?.split(' ')[0] ?? 'User'
    const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f0]">

            {/* HEADER */}
            <header className="w-full bg-white px-6 py-3 flex items-center gap-4 border-b border-gray-100">
                <Link href="/" className="shrink-0">
                    <Image src="/logo-plateup.png" alt="PlateUp!" width={110} height={34} className="object-contain" />
                </Link>

                <div className="flex-1 max-w-xl mx-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text" placeholder="Find your food..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="relative">
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
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

                    {/* Greeting */}
                    <div className="flex items-center gap-2 px-2 mb-5">
                        <div className="w-9 h-9 rounded-full bg-[#d4e8c2] flex items-center justify-center text-[#3a7d44] font-bold text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Hello, {firstName}!</p>
                            <p className="text-xs text-gray-400">Ready to save the planet?</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <nav className="flex flex-col gap-1">
                        {menuItems.map(item => {
                            const Icon = item.icon
                            const isActive = activeMenu === item.label
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setActiveMenu(item.label)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-[#c8e84a] text-[#2d5a1a] font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? 'text-[#2d5a1a]' : 'text-gray-500'} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                </aside>
                {/* END SIDEBAR */}

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-6">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'MEALS SHARED', value: '12 Sharing', desc: "You've helped 8 friends find affordable meals." },
                            { label: 'MONEY SAVED', value: 'Rp 250.000', desc: 'Extra savings secured for next week.' },
                            { label: 'HUNGRY POINTS', value: '1.250 Points', desc: 'Nearly ready for your 50% OFF voucher!' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#e8f5c8] rounded-2xl p-5">
                                <p className="text-[10px] font-semibold text-[#5a7a2a] uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-bold text-[#2d5a1a] mb-1">{stat.value}</p>
                                <p className="text-xs text-[#5a7a2a] leading-relaxed">{stat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* For You */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">For You</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { name: 'Sushi Salmon Mentai, Sushi Mate', dist: '0.4 km', rating: 4.9, tag: 'Ready to Eat', tagColor: 'bg-[#3a7d44]' },
                                { name: 'Nasi Ayam Bakar Madu, Warung Bu Sri', dist: '1.1 km', rating: 4.8, tag: 'Ready to Eat', tagColor: 'bg-[#3a7d44]' },
                                { name: 'Mie Ayam Pangsit, Bakmi Bangka', dist: '0.9 km', rating: 4.7, tag: 'Heat & Eat', tagColor: 'bg-[#f59e0b]' },
                                { name: 'Nasi Goreng Spesial, Pak Budi', dist: '0.6 km', rating: 4.6, tag: 'Ready to Eat', tagColor: 'bg-[#3a7d44]' },
                                { name: 'Ayam Geprek Sambal Bawang', dist: '1.3 km', rating: 4.5, tag: 'Heat & Eat', tagColor: 'bg-[#f59e0b]' },
                            ].map((food, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer flex-shrink-0 w-52">
                                    <div className="h-32 bg-gray-100 relative flex items-center justify-center">
                                        <span className="text-3xl">🍱</span>
                                        <span className={`absolute top-2 left-2 text-white text-[10px] font-medium px-2 py-0.5 rounded-full ${food.tagColor}`}>
                                            {food.tag}
                                        </span>
                                        <span className="absolute top-2 right-2 text-[10px] text-gray-600 bg-white/90 rounded-full px-2 py-0.5">
                                            📍 {food.dist}
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{food.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Pick-up before 21.00 WIB</p>
                                        <p className="text-[11px] text-[#3a7d44] font-medium mt-1">⭐ {food.rating}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recently Orders */}
                    <div className="bg-white rounded-2xl border border-gray-200 mb-6">
                        <div className="px-5 py-4 border-b border-gray-50">
                            <h2 className="text-sm font-semibold text-gray-700">Recently Orders</h2>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto max-h-64">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center text-lg shrink-0">
                                            🍜
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {order.items} Items · Rp {order.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ml-3 ${statusStyle[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
                {/* END MAIN */}

            </div>
            {/* END BODY */}

        </div>
    )
}