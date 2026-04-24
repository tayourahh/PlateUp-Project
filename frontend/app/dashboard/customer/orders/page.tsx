'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ClipboardList, Settings, LogOut, Search, Bell, MapPin, Star } from 'lucide-react'

// ─── Config ───────────────────────────────────────────────────────────────────

const menuItems = [
    { label: 'Home', href: '/dashboard/customer', icon: Home },
    { label: 'My Orders', href: '/dashboard/customer/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/customer/settings', icon: Settings },
]

const categories = [
    { name: 'Noodles & Pasta', img: '/cat_noodles.png' },
    { name: 'Rice Meals', img: '/cat_rice.png' },
    { name: 'Bakery & Pastry', img: '/cat_bakery.png' },
    { name: 'Fried Snacks', img: '/cat_fried.png' },
    { name: 'Steamed Dimsum', img: '/cat_dimsum.png' },
    { name: 'Side Dishes', img: '/cat_side.png' },
    { name: 'Traditional Snacks', img: '/cat_trad.png' },
]

const forYouItems = [
    {
        name: 'Sushi Salmon Mentai',
        seller: 'Sushi Mate',
        dist: '0.4 km',
        rating: 4.9,
        img: '/food_sushi.png',
        tag: 'Ready to Eat',
        tagColor: 'bg-[#3a7d44]',
        pickup: '21.00',
    },
    {
        name: 'Nasi Ayam Bakar Madu',
        seller: 'Warung Bu Sri',
        dist: '1.1 km',
        rating: 4.8,
        img: '/food_ayambakar.png',
        tag: 'Ready to Eat',
        tagColor: 'bg-[#3a7d44]',
        pickup: '20.30',
    },
    {
        name: 'Mie Ayam Pangsit',
        seller: 'Bakmi Bangka',
        dist: '0.9 km',
        rating: 4.7,
        img: '/food_mieayam.png',
        tag: 'Heat & Eat',
        tagColor: 'bg-[#F59E0B]',
        pickup: '21.00',
    },
]

const upcomingItems = [
    {
        name: 'Salmon Teriyaki Bento',
        seller: 'Tokyo Soul',
        dist: '0.6 km',
        rating: 4.9,
        img: '/food_salmon.png',
        tag: 'Ready to Eat',
        tagColor: 'bg-[#3a7d44]',
        pickup: '21.00',
    },
    {
        name: 'Beef Kwetiau Siram',
        seller: 'Abang Seafood',
        dist: '1.1 km',
        rating: 4.7,
        img: '/food_kwetiau.png',
        tag: 'Ready to Eat',
        tagColor: 'bg-[#3a7d44]',
        pickup: '20.35',
    },
    {
        name: 'Ayam Geprek Sambal Matah',
        seller: 'Geprek Juara',
        dist: '0.8 km',
        rating: 4.8,
        img: '/food_geprek.png',
        tag: 'Heat & Eat',
        tagColor: 'bg-[#F59E0B]',
        pickup: '19.00',
    },
    {
        name: 'Lasagna Al Forno',
        seller: 'Mia Pasta',
        dist: '2.4 km',
        rating: 4.9,
        img: '/food_lasagna.png',
        tag: 'Ready to Eat',
        tagColor: 'bg-[#3a7d44]',
        pickup: '22.00',
    },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FoodTag({ label, color }: { label: string; color: string }) {
    return (
        <span className={`${color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full leading-none`}>
            {label}
        </span>
    )
}

function ForYouCard({ item }: { item: typeof forYouItems[0] }) {
    return (
        <div className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            {/* Thumbnail */}
            <div className="relative h-40 w-full">
                <Image src={item.img} alt={item.name} fill className="object-cover" />
                <div className="absolute top-3 left-3">
                    <FoodTag label={item.tag} color={item.tagColor} />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-1 rounded-full">
                    <MapPin size={10} className="text-gray-500" />
                    {item.dist}
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-sm font-bold text-gray-900 leading-snug">{item.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{item.seller}</p>
                <p className="text-[11px] text-gray-400 mb-2">Pick-up before {item.pickup} WIB</p>
                <div className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-[#3a7d44]">{item.rating}</span>
                </div>
            </div>
        </div>
    )
}

function UpcomingCard({ item }: { item: typeof upcomingItems[0] }) {
    return (
        <div className="flex gap-3 p-3 rounded-2xl border border-gray-100 items-center hover:shadow-sm transition-shadow cursor-pointer">
            {/* Thumbnail */}
            <div className="relative w-[88px] h-[88px] shrink-0 rounded-xl overflow-hidden">
                <Image src={item.img} alt={item.name} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <FoodTag label={item.tag} color={item.tagColor} />
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <MapPin size={9} />
                        {item.dist}
                    </div>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight mb-0.5">{item.name}</p>
                <p className="text-[10px] text-gray-400 mb-1">{item.seller}</p>
                <p className="text-[10px] text-gray-400 mb-1.5">Pick-up before {item.pickup} WIB</p>
                <div className="flex items-center gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px] font-bold text-[#3a7d44]">{item.rating}</span>
                </div>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState('Home')

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            setProfile(data)
            setLoading(false)
        }
        getProfile()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
                Loading…
            </div>
        )
    }

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Angel'
    const fullName = profile?.full_name ?? 'Angel'

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-[#1A1A1A]">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between gap-6">
                {/* Logo */}
                <Image
                    src="/logo-plateup.png"
                    alt="PlateUp!"
                    width={120}
                    height={36}
                    className="object-contain shrink-0"
                />

                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3a7d44] transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="What food is on your mind?"
                            className="w-full bg-[#F5F5F5] rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#3a7d44]/20 transition-all"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Notification bell */}
                    <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    {/* Profile */}
                    <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                        <p className="text-xs font-bold text-gray-900 hidden sm:block">{fullName}</p>
                        <div className="w-9 h-9 rounded-full bg-[#C8E84A] border-2 border-[#3a7d44] overflow-hidden shrink-0">
                            <Image src="/avatar_user.png" alt="Avatar" width={36} height={36} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* ── SIDEBAR ────────────────────────────────────────────── */}
                <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col py-8 px-5">

                    {/* User greeting */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-full bg-[#C8E84A] shrink-0 overflow-hidden">
                            <Image src="/avatar_user.png" alt="User" width={44} height={44} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Hello, {firstName}!</p>
                            <p className="text-[11px] text-gray-400 leading-tight">Ready to save the planet?</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex flex-col gap-1">
                        {menuItems.map(item => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setActiveMenu(item.label)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                                    ${activeMenu === item.label
                                        ? 'bg-[#C8E84A] text-[#2d5a1a] font-bold'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Hungry Points */}
                    <div className="mt-8 bg-[#F1F8E9] rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-[#3a7d44] uppercase tracking-widest mb-1">
                            Hungry Points
                        </p>
                        <p className="text-xl font-black text-[#2d5a1a]">1.250 Points</p>
                        <p className="text-[10px] text-[#5a7a2a] mt-1 leading-snug">
                            Nearly ready for your 50% OFF voucher!
                        </p>
                    </div>

                    {/* Logout */}
                    <div className="mt-auto pt-4">
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ── MAIN ───────────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto bg-white px-8 py-7">

                    {/* Banner Carousel */}
                    <div className="flex gap-4 mb-9 overflow-x-auto pb-1 scrollbar-hide">
                        {['/banner_1.png', '/banner_2.png', '/banner_3.png'].map((src, i) => (
                            <div key={i} className="relative w-[300px] h-[150px] shrink-0 rounded-2xl overflow-hidden">
                                <Image src={src} alt={`Promo ${i + 1}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Food Category */}
                    <section className="mb-9">
                        <h2 className="text-sm font-bold mb-5">Food Category</h2>
                        <div className="flex justify-between items-start gap-3">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    className="flex flex-col items-center gap-2 w-[72px] text-center group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                                        <Image src={cat.img} alt={cat.name} width={56} height={56} className="object-cover" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-tight font-medium">{cat.name}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* For You */}
                    <section className="mb-9">
                        <h2 className="text-sm font-bold mb-5">For You</h2>
                        <div className="grid grid-cols-3 gap-5">
                            {forYouItems.map((item, i) => (
                                <ForYouCard key={i} item={item} />
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Closing */}
                    <section className="mb-9">
                        <h2 className="text-sm font-bold mb-5">Upcoming Closing</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {upcomingItems.map((item, i) => (
                                <UpcomingCard key={i} item={item} />
                            ))}
                        </div>
                    </section>

                </main>
            </div>
        </div>
    )
}
