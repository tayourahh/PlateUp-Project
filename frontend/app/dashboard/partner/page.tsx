'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut
} from 'lucide-react'

const menuItems = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Analysis', href: '/dashboard/partner/analysis', icon: BarChart2 },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

const recentActivity = [
    { name: 'Angel ordered 2x Bakmie Lebar Pangsit', items: 2, price: 45000, status: 'Completed' },
    { name: 'Budi ordered 2x Bakmie Ayam Jamur', items: 2, price: 50000, status: 'Pickup Ready' },
    { name: 'Siti ordered 1x Bakmie Lebar Pangsit', items: 1, price: 22000, status: 'Completed' },
    { name: 'Joko picked up 3x Bakmie Komplit', items: 3, price: 60000, status: 'New Order' },
    { name: 'Dedi ordered 2x Paket Kenyang Apih', items: 2, price: 38000, status: 'Completed' },
]

const expiringSoon = [
    { name: 'Bakmie Ayam Jamur', units: 2, timeLeft: '30m left', progress: 85 },
    { name: 'Bakmie Lebar Pangsit', units: 5, timeLeft: '1h 15m left', progress: 60 },
    { name: 'Pangsit Kuah (isi 5)', units: 10, timeLeft: '2h left', progress: 40 },
]

const statusStyle: Record<string, string> = {
    'Completed': 'bg-[#c8e6c9] text-[#2d6435]',
    'Pickup Ready': 'bg-[#3a7d44] text-white',
    'New Order': 'bg-[#fff9c4] text-[#666c11]',
}

export default function PartnerDashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState('Dashboard')
    const [notifOpen, setNotifOpen] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const getProfile = async () => {
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

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Partner'
    const businessName = profile?.full_name ?? 'Partner'
    const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'P'

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
                                <Link key={item.label} href={item.href}
                                    onClick={() => setActiveMenu(item.label)}
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
                                    Good Morning, {businessName}! ✏️
                                </p>
                            </div>
                            <p className="text-xs text-[#3a7d44] font-medium mb-2">
                                Ready to clear your shelves?
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                You have 5 portions of surplus noodles ready to be rescued. Let's turn those leftovers into smiles (and revenue!) today!
                            </p>
                            <button className="px-4 py-2 bg-[#3a7d44] text-white text-xs font-medium rounded-full hover:bg-[#2d6435] transition-colors">
                                Manage Today's Surplus
                            </button>
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
                                Student traffic spikes at 4 PM. List your Mushroom Noodles now for a 40% discount to sell out faster!
                            </p>
                            <button className="px-4 py-2 bg-[#3a7d44] text-white text-xs font-medium rounded-full hover:bg-[#2d6435] transition-colors">
                                Apply Now
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: '📦', label: 'Incoming Orders', value: '8 Orders', sub: '+4' },
                            { icon: '🥗', label: 'Active Surplus', value: '12 Portions', sub: '+2' },
                            { icon: '💰', label: "Today's Earnings", value: 'Rp 185k', sub: '+ Rp 65k' },
                            { icon: '⭐', label: 'Store Rating', value: '4.8', sub: '(120+ Reviews)' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                                <div className="w-9 h-9 rounded-full bg-[#e8f5c8] flex items-center justify-center text-lg mb-2">
                                    {stat.icon}
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-base font-bold text-gray-900">
                                    {stat.value}{' '}
                                    <span className="text-xs font-medium text-[#3a7d44]">{stat.sub}</span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity + Expiring Soon */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-200">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
                                <button className="text-xs text-[#3a7d44] font-medium hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-gray-50 overflow-y-auto max-h-64">
                                {recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm shrink-0">
                                                🍜
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">
                                                    {item.items} Items · Rp {item.price.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusStyle[item.status]}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expiring Soon */}
                        <div className="bg-white rounded-2xl border border-gray-200">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Expiring Soon</h2>
                            </div>
                            <div className="px-5 py-3 space-y-4 overflow-y-auto max-h-64">
                                {expiringSoon.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm shrink-0">
                                                    🍜
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400">{item.units} units remaining</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">{item.timeLeft}</span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 ml-9">
                                            <div
                                                className="bg-[#3a7d44] h-1.5 rounded-full transition-all"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}