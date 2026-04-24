'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut,
} from 'lucide-react'

import {
    getStoreSetting,
    updateStoreProfile,
    updateOperatingHours,
    StoreProfile,
    OperatingHours,
    StoreSetting,
} from '@/lib/api'

import StoreProfileHeader from '@/components/setting/StoreProfileHeader'
import StoreProfileTab from '@/components/setting/StoreProfileTab'
import OperationalHoursTab from '@/components/setting/OperationalHoursTab'

// ─── Constants ──────────────────────────────────────────────────────

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

type SettingTab = 'store-profile' | 'operational-hours' | 'notification' | 'security'

const TABS: { id: SettingTab; label: string }[] = [
    { id: 'store-profile', label: 'Store Profile' },
    { id: 'operational-hours', label: 'Operational Hours' },
    { id: 'notification', label: 'Notification' },
    { id: 'security', label: 'Security' },
]

const DEFAULT_HOURS: OperatingHours = {
    monday: { enabled: false, open: '10:00', close: '17:00' },
    tuesday: { enabled: false, open: '10:00', close: '17:00' },
    wednesday: { enabled: false, open: '10:00', close: '17:00' },
    thursday: { enabled: false, open: '10:00', close: '17:00' },
    friday: { enabled: false, open: '10:00', close: '17:00' },
    saturday: { enabled: false, open: '10:00', close: '17:00' },
    sunday: { enabled: false, open: '10:00', close: '17:00' },
}

const DEFAULT_PROFILE: StoreProfile = {
    store_name: '', business_category: '',
    whatsapp_number: '', email: '', store_address: '',
}

// ─── Page ────────────────────────────────────────────────────────────

export default function SettingPage() {
    const supabase = createClient()
    const router = useRouter()

    const [profile, setUserProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<SettingTab>('store-profile')
    const [originalSetting, setOriginalSetting] = useState<StoreSetting | null>(null)
    const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_PROFILE)
    const [hours, setHours] = useState<OperatingHours>(DEFAULT_HOURS)
    const [isAutoActive, setIsAutoActive] = useState(true)
    const [lastEdited, setLastEdited] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    // ─── Auth + fetch setting ──────────────────────────────────────────
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

            setUserProfile({ ...profileData, full_name: name })

            // Fetch store setting
            // getStoreSetting()
            //   .then((data) => {
            //     setOriginalSetting(data)
            //     setStoreProfile(data.profile)
            //     setHours(data.hours)
            //     if (data.last_edited) setLastEdited(data.last_edited)
            //   })
            //   .catch((err) => console.error(err))

            // ← Hapus dummy ini kalau API sudah aktif
            setStoreProfile({
                store_name: 'Bakmie Apih Kelapa Dua',
                business_category: 'Warung Makan',
                whatsapp_number: '08123456789',
                email: 'apih2118@gmail.com',
                store_address: 'Jl. Margonda No. 123, Depok, Jawa Barat 16424',
                photo_url: '',
            })
            setLastEdited('April 23, 2025 at 22:45 PM')

            setLoading(false)
        }
        init()
    }, [])

    // ─── Save ──────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true)
        setSaveStatus('idle')
        setErrorMsg('')
        try {
            // await updateStoreProfile(storeProfile)
            // await updateOperatingHours(hours)
            const now = new Date().toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })
            setLastEdited(now)
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 2500)
        } catch (err: any) {
            setErrorMsg(err.message || 'Gagal menyimpan')
            setSaveStatus('error')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        if (originalSetting) {
            setStoreProfile(originalSetting.profile)
            setHours(originalSetting.hours)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // ─── Loading ──────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f0]">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Partner'
    const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'P'

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f0]">

            {/* ─── HEADER ─────────────────────────────────────────────────── */}
            <header className="w-full bg-white px-6 py-3 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-30">
                <Link href="/" className="shrink-0">
                    <Image src="/logo-plateup.png" alt="PlateUp!" width={110} height={34} className="object-contain" />
                </Link>
                <div className="flex-1 max-w-xl mx-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Find your food..."
                            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
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

                {/* ─── SIDEBAR ──────────────────────────────────────────────── */}
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
                            const isActive = item.label === 'Setting'
                            return (
                                <Link key={item.label} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                                            ? 'bg-[#c8e84a] text-[#2d5a1a] font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
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

                {/* ─── MAIN ─────────────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">

                        {/* Page Header */}
                        <div className="mb-5">
                            <h1 className="text-xl font-bold text-gray-900">Account Setting</h1>
                            <p className="text-sm text-gray-500">Manage your UMKM storefront, operational hours, and profile details.</p>
                        </div>

                        {/* Store Header */}
                        <StoreProfileHeader
                            profile={storeProfile}
                            onPhotoChange={(file) => {
                                // Handle upload ke server di sini
                                console.log('Photo selected:', file.name)
                            }}
                        />

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                            {/* Tabs */}
                            <div className="flex gap-6 border-b border-gray-100 mb-6">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-[#3a7d44] border-b-2 border-[#3a7d44]'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'store-profile' && (
                                <StoreProfileTab profile={storeProfile} onChange={setStoreProfile} />
                            )}
                            {activeTab === 'operational-hours' && (
                                <OperationalHoursTab
                                    hours={hours}
                                    isAutoActive={isAutoActive}
                                    onHoursChange={setHours}
                                    onAutoActiveToggle={setIsAutoActive}
                                />
                            )}
                            {activeTab === 'notification' && (
                                <div className="py-10 text-center text-sm text-gray-400">
                                    Notification settings coming soon
                                </div>
                            )}
                            {activeTab === 'security' && (
                                <div className="py-10 text-center text-sm text-gray-400">
                                    Security settings coming soon
                                </div>
                            )}

                            {/* Status messages */}
                            {saveStatus === 'success' && (
                                <div className="mt-4 flex items-center gap-2.5 bg-[#e8f5c8] border border-[#3a7d44]/30 rounded-xl px-4 py-3">
                                    <div className="w-4 h-4 rounded-full bg-[#3a7d44] flex items-center justify-center shrink-0">
                                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-[#2d5a1a] font-medium">Perubahan berhasil disimpan!</p>
                                </div>
                            )}
                            {saveStatus === 'error' && (
                                <div className="mt-4 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    <p className="text-sm text-red-600">{errorMsg || 'Gagal menyimpan. Coba lagi.'}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-end justify-between mt-6 pt-5 border-t border-gray-100">
                                <div>
                                    {lastEdited && (
                                        <>
                                            <p className="text-xs text-gray-400">Last Edited</p>
                                            <p className="text-xs text-gray-500 font-medium">{lastEdited}</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDiscard}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3a7d44] rounded-xl hover:bg-[#2d5a1a] disabled:opacity-60 transition-colors"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}