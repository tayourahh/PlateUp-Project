'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'  // ← SAMA dengan partner
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ShoppingBag, Settings, LogOut } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────
const MENU_ITEMS = [
    { label: 'Home', href: '/dashboard/customer', icon: Home },
    { label: 'My Orders', href: '/dashboard/customer/orders', icon: ShoppingBag },
    { label: 'Setting', href: '/dashboard/customer/settings', icon: Settings },
]

const ALL_PREFERENCES = [
    'Noodles', 'Bakery', 'Rice', 'Dessert', 'Salads', 'Beverages'
]

// ─── Page ─────────────────────────────────────────────────
export default function CustomerSettingPage() {
    const supabase = createClient()   // ← SAMA dengan partner
    const router = useRouter()

    const [userProfile, setUserProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [profile, setProfile] = useState({
        name: '', phone: '', email: '',
    })
    const [selectedPrefs, setSelectedPrefs] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [lastEdited, setLastEdited] = useState<string | null>(null)

    // ─── Auth + Fetch ────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            // Pola SAMA dengan partner — pakai getSession()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/auth/login'); return }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            // Guard: kalau partner, redirect ke partner dashboard
            if (profileData?.role === 'partner') {
                router.push('/dashboard/partner')
                return
            }

            const name = profileData?.full_name
                || session.user.user_metadata?.full_name
                || session.user.email?.split('@')[0]
                || 'Customer'

            setUserProfile({ ...profileData, full_name: name })

            // Isi form dengan data yang ada
            setProfile({
                name: profileData?.full_name ?? '',
                phone: profileData?.phone ?? '',
                email: session.user.email ?? '',
            })
            setSelectedPrefs(profileData?.food_preferences ?? [])
            setLoading(false)
        }
        init()
    }, [])

    // ─── Toggle Food Preference ───────────────────────────────
    const togglePref = (pref: string) => {
        setSelectedPrefs(prev =>
            prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
        )
    }

    // ─── Save ─────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true)
        setSaveStatus('idle')

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.name,
                phone: profile.phone,
                food_preferences: selectedPrefs,
            })
            .eq('id', session.user.id)

        if (error) {
            console.error('Save error:', error.message)
            setSaveStatus('error')
        } else {
            const now = new Date().toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })
            setLastEdited(now)
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 2500)
        }
        setSaving(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // ─── Loading ──────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f0]">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    const firstName = userProfile?.full_name?.split(' ')[0] ?? 'Customer'
    const initials = userProfile?.full_name?.charAt(0)?.toUpperCase() ?? 'C'

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f0]">

            {/* ─── HEADER ─────────────────────────────────────────── */}
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
                    <div className="w-8 h-8 rounded-full bg-[#d4e8c2] border-2 border-[#3a7d44] flex items-center justify-center text-[#3a7d44] text-sm font-bold">
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-gray-800 hidden md:block">{firstName}</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* ─── SIDEBAR ──────────────────────────────────────── */}
                <aside className="w-52 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">
                    <div className="flex items-center gap-2 px-2 mb-5">
                        <div className="w-9 h-9 rounded-full bg-[#d4e8c2] flex items-center justify-center text-[#3a7d44] font-bold text-sm">
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
                            const isActive = item.label === 'Setting'
                            return (
                                <Link key={item.label} href={item.href}
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
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </aside>

                {/* ─── MAIN ─────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">

                        <div className="mb-5">
                            <h1 className="text-xl font-bold text-gray-900">Profile & Preference</h1>
                            <p className="text-sm text-gray-500">Manage your profile and preferences details.</p>
                        </div>

                        {/* Account Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                            <h2 className="font-semibold text-gray-800 mb-4">Account Profile</h2>
                            {[
                                { label: 'Name', key: 'name', type: 'text', disabled: false },
                                { label: 'Phone Number', key: 'phone', type: 'text', disabled: false },
                                { label: 'Email Address', key: 'email', type: 'email', disabled: true },
                            ].map(field => (
                                <div key={field.key} className="mb-4">
                                    <label className="block text-sm text-black mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={profile[field.key as keyof typeof profile]}
                                        disabled={field.disabled}
                                        onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full border-b border-gray-200 py-1.5 text-sm outline-none
                               focus:border-[#3a7d44] disabled:text-gray-400 bg-transparent"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Food Preferences Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            <h2 className="font-semibold text-gray-800 mb-1">Food Preferences</h2>
                            <p className="text-sm text-gray-400 mb-3">I'm Craving...</p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_PREFERENCES.map(pref => (
                                    <button key={pref} onClick={() => togglePref(pref)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${selectedPrefs.includes(pref)
                                                ? 'bg-[#3a7d44] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status messages — SAMA dengan partner */}
                        {saveStatus === 'success' && (
                            <div className="mb-4 flex items-center gap-2.5 bg-[#e8f5c8] border border-[#3a7d44]/30 rounded-xl px-4 py-3">
                                <p className="text-sm text-[#2d5a1a] font-medium">Profil berhasil disimpan!</p>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <p className="text-sm text-red-600">Gagal menyimpan. Coba lagi.</p>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-end justify-between">
                            <div>
                                {lastEdited && (
                                    <>
                                        <p className="text-xs text-gray-400">Last Edited</p>
                                        <p className="text-xs text-gray-500 font-medium">{lastEdited}</p>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => window.location.reload()}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                                    Discard
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3a7d44] rounded-xl hover:bg-[#2d5a1a] disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}