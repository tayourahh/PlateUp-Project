'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ClipboardList, Settings, LogOut, Search, Bell } from 'lucide-react'

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
    { name: 'Breakfast Dimsum', img: '/cat_dimsum.png' },
    { name: 'Side Dishes', img: '/cat_side.png' },
    { name: 'Traditional Snacks', img: '/cat_trad.png' },
]

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
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
            setProfile(profileData)
            setLoading(false)
        }
        getProfile()
    }, [])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-[#1A1A1A]">
            {/* HEADER */}
            <header className="w-full bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <Image src="/logo-plateup.png" alt="PlateUp!" width={120} height={40} className="object-contain" />

                <div className="flex-1 max-w-2xl mx-10">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3a7d44]" size={18} />
                        <input
                            type="text"
                            placeholder="What food is on your mind?"
                            className="w-full bg-[#F5F5F5] border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#3a7d44]/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 leading-tight">{profile?.full_name || 'Angel'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#C8E84A] border-2 border-[#3a7d44] flex items-center justify-center overflow-hidden">
                            <Image src="/avatar_user.png" alt="Profile" width={40} height={40} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 px-6 shrink-0">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-full bg-[#C8E84A] shrink-0 overflow-hidden">
                            <Image src="/avatar_user.png" alt="User" width={48} height={48} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Hello, {profile?.full_name?.split(' ')[0] || 'Angel'}!</p>
                            <p className="text-[11px] text-gray-500">Ready to save the planet?</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {menuItems.map(item => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setActiveMenu(item.label)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeMenu === item.label ? 'bg-[#C8E84A] text-[#2d5a1a] font-bold' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-10 mb-6 bg-[#F1F8E9] rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-[#3a7d44] uppercase tracking-wider mb-1">Hungry Points</p>
                        <p className="text-lg font-black text-[#2d5a1a]">1.250 Points</p>
                        <p className="text-[10px] text-[#5a7a2a] mt-1 leading-tight">Nearly ready for your 50% OFF voucher!</p>
                    </div>

                    <div className="mt-auto">
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-8 bg-white">
                    {/* Banner Section */}
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                        <Image src="/banner_1.png" alt="Promo" width={300} height={150} className="rounded-3xl object-cover shrink-0" />
                        <Image src="/banner_2.png" alt="Promo" width={300} height={150} className="rounded-3xl object-cover shrink-0" />
                        <Image src="/banner_3.png" alt="Promo" width={300} height={150} className="rounded-3xl object-cover shrink-0" />
                    </div>

                    {/* Categories */}
                    <section className="mb-10">
                        <h2 className="text-base font-bold mb-5">Food Category</h2>
                        <div className="flex justify-between items-start gap-4">
                            {categories.map((cat, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 w-20 text-center cursor-pointer group">
                                    <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                                        <Image src={cat.img} alt={cat.name} width={56} height={56} className="object-cover" />
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-600 leading-tight">{cat.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* For You */}
                    <section className="mb-10">
                        <h2 className="text-base font-bold mb-5">For You</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { name: 'Sushi Salmon Mentai, Sushi Mate', dist: '0.4 km', rating: 4.9, img: '/food_sushi.png', tag: 'Ready to Eat', color: 'bg-[#3a7d44]' },
                                { name: 'Nasi Ayam Bakar Madu, Warung Bu Sri', dist: '1.1 km', rating: 4.8, img: '/food_ayambakar.png', tag: 'Ready to Eat', color: 'bg-[#3a7d44]' },
                                { name: 'Mie Ayam Pangsit, Bakmi Bangka', dist: '0.9 km', rating: 4.7, img: '/food_mieayam.png', tag: 'Heat & Eat', color: 'bg-[#F59E0B]' },
                            ].map((food, i) => (
                                <div key={i} className="rounded-3xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="relative h-40">
                                        <Image src={food.img} alt={food.name} fill className="object-cover" />
                                        <span className={`absolute top-3 left-3 ${food.color} text-white text-[10px] px-3 py-1 rounded-full font-bold`}>{food.tag}</span>
                                        <span className="absolute top-3 right-3 bg-white/90 text-[10px] px-2 py-1 rounded-full font-bold">📍 {food.dist}</span>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-bold text-gray-900 mb-1 leading-snug">{food.name}</p>
                                        <p className="text-[11px] text-gray-400 mb-2">Pick-up before 21.00 WIB</p>
                                        <p className="text-xs font-bold text-[#3a7d44]">⭐ {food.rating}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Closing */}
                    <section className="mb-10">
                        <h2 className="text-base font-bold mb-5">Upcoming Closing</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { name: 'Salmon Teriyaki Bento, Tokyo Soul', dist: '0.6 km', rating: 4.9, img: '/food_salmon.png', tag: 'Ready to Eat', color: 'bg-[#3a7d44]' },
                                { name: 'Beef Kwetiau Siram, Abang Seafood', dist: '1.1 km', rating: 4.7, img: '/food_kwetiau.png', tag: 'Ready to Eat', color: 'bg-[#3a7d44]' },
                                { name: 'Ayam Geprek Sambal Matah, Geprek Juara', dist: '0.8 km', rating: 4.8, img: '/food_geprek.png', tag: 'Heat & Eat', color: 'bg-[#F59E0B]' },
                                { name: 'Lasagna Al Forno mmm, Mia Pasta', dist: '2.4 km', rating: 4.9, img: '/food_lasagna.png', tag: 'Ready to Eat', color: 'bg-[#3a7d44]' },
                            ].map((food, i) => (
                                <div key={i} className="flex gap-4 p-3 rounded-3xl border border-gray-100 items-center">
                                    <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-2xl">
                                        <Image src={food.img} alt={food.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`${food.color} text-white text-[9px] px-2 py-0.5 rounded-full font-bold`}>{food.tag}</span>
                                            <span className="text-[9px] font-bold text-gray-500">📍 {food.dist}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 mb-1 leading-tight">{food.name}</p>
                                        <p className="text-[10px] text-gray-400 mb-1">Pick-up before 20.00 WIB</p>
                                        <p className="text-[11px] font-bold text-[#3a7d44]">⭐ {food.rating}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}