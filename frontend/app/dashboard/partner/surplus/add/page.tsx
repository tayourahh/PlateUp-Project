'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard, Package, ClipboardList,
    BarChart2, Settings, LogOut,
    Sparkles, Upload, ChevronDown, X,
    CheckCircle, AlertCircle, ArrowLeft, Clock
} from 'lucide-react'

interface FormState {
    product_name: string
    category: string
    production_time: string
    expiry_time: string
    original_price: string
    plate_up_price: string
    description: string
    quantity: string
}

interface AILoadingState {
    expiry: boolean
    price: boolean
    description: boolean
}

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
    { label: 'Manage Surplus', href: '/dashboard/partner/surplus', icon: Package },
    { label: 'Pickup Orders', href: '/dashboard/partner/orders', icon: ClipboardList },
    { label: 'Setting', href: '/dashboard/partner/settings', icon: Settings },
]

const FOOD_CATEGORIES = [
    'Noodles & Pasta', 'Rice Dishes', 'Snacks & Sides',
    'Beverages', 'Desserts', 'Bread & Pastry', 'Other',
]

const INITIAL_FORM: FormState = {
    product_name: '',
    category: '',
    production_time: '',
    expiry_time: '',
    original_price: '',
    plate_up_price: '',
    description: '',
    quantity: '1',
}

const inputBase = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#c8e84a] focus:ring-2 focus:ring-[#c8e84a]/20 transition-all placeholder-gray-400"

// ─── Helper: ambil Bearer token dari Supabase session ───────────────
const getAuthHeader = async (supabase: any): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { 'Authorization': `Bearer ${session.access_token}` } : {}
}

export default function AddSurplusPage() {
    const supabase = createClient()
    const router = useRouter()
    const fileRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [aiLoading, setAiLoading] = useState<AILoadingState>({ expiry: false, price: false, description: false })
    const [catOpen, setCatOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

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

            const now = new Date()
            const hh = String(now.getHours()).padStart(2, '0')
            const mm = String(now.getMinutes()).padStart(2, '0')
            setForm(prev => ({ ...prev, production_time: `${hh}:${mm}` }))

            setLoading(false)
        }
        init()
    }, [])

    const updateForm = (field: keyof FormState, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const processImage = (file: File) => {
        if (!file.type.startsWith('image/')) { alert('File harus gambar'); return }
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processImage(file)
    }, [])

    const timeToISO = (timeStr: string): string => {
        const [h, m] = timeStr.split(':').map(Number)
        const d = new Date()
        d.setHours(h, m, 0, 0)
        return d.toISOString()
    }

    // ─── Generate Expiry + Price ─────────────────────────────────────
    const handleGenerateExpiry = async () => {
        if (!form.product_name || !form.category || !form.production_time) {
            alert('Isi Product Name, Category, dan Production Time dulu!')
            return
        }
        if (!form.original_price) {
            alert('Isi Original Price dulu supaya AI bisa hitung Plate Up Price!')
            return
        }
        setAiLoading(prev => ({ ...prev, expiry: true, price: true }))
        try {
            const authHeaders = await getAuthHeader(supabase)
            const res = await fetch('/api/ai/generate-expiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    product_name: form.product_name,
                    category: form.category,
                    production_time: form.production_time,
                    original_price: Number(form.original_price) || 0,
                })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Generate gagal')

            setForm(prev => ({
                ...prev,
                expiry_time: result.expiry_time || prev.expiry_time,
                plate_up_price: String(result.plate_up_price || ''),
            }))
        } catch (err: any) {
            console.error(err)
            alert(`AI generate gagal: ${err.message}`)
        } finally {
            setAiLoading(prev => ({ ...prev, expiry: false, price: false }))
        }
    }

    // ─── Generate Description ────────────────────────────────────────
    const handleGenerateDescription = async () => {
        if (!form.product_name || !form.category) {
            alert('Isi Product Name dan Category dulu!')
            return
        }
        setAiLoading(prev => ({ ...prev, description: true }))
        try {
            const authHeaders = await getAuthHeader(supabase)
            const res = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    product_name: form.product_name,
                    category: form.category,
                    original_price: Number(form.original_price) || 0,
                    plate_up_price: Number(form.plate_up_price) || 0,
                    expiry_time: form.expiry_time || '',
                })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Generate gagal')

            setForm(prev => ({ ...prev, description: result.description || '' }))
        } catch (err: any) {
            console.error(err)
            alert(`AI generate gagal: ${err.message}`)
        } finally {
            setAiLoading(prev => ({ ...prev, description: false }))
        }
    }

    const handleSubmit = async (isDraft: boolean) => {
        if (!form.product_name) {
            setErrorMsg('Product name tidak boleh kosong!')
            setSubmitStatus('error')
            return
        }

        setIsSubmitting(true)
        setSubmitStatus('idle')
        setErrorMsg('')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const expiryDatetime = form.expiry_time ? timeToISO(form.expiry_time) : null

            const { error } = await supabase.from('surplus_products').insert({
                partner_id: session.user.id,
                product_name: form.product_name,
                category: form.category,
                production_time: form.production_time,
                expiry_estimate: form.expiry_time ? `Konsumsi sebelum pukul ${form.expiry_time}` : '',
                expiry_datetime: expiryDatetime,
                original_price: Number(form.original_price) || 0,
                plate_up_price: Number(form.plate_up_price) || 0,
                description: form.description,
                quantity: Number(form.quantity) || 1,
                is_draft: isDraft,
                status: isDraft ? 'draft' : 'active',
            })

            if (error) throw error

            setSubmitStatus('success')
            setTimeout(() => router.push('/dashboard/partner/surplus'), 1500)

        } catch (err: any) {
            console.error(err)
            setSubmitStatus('error')
            setErrorMsg(err.message || 'Terjadi kesalahan. Coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const AIButton = ({ onClick, isLoading, label = 'Generate AI' }: {
        onClick: () => void
        isLoading: boolean
        label?: string
    }) => (
        <button type="button" onClick={onClick} disabled={isLoading}
            className="flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed group">
            <Sparkles size={11} className="text-[#3a7d44] group-hover:scale-110 transition-transform" />
            <span className="text-gradient-login text-xs font-semibold">
                {isLoading ? 'Generating...' : label}
            </span>
        </button>
    )

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
                    <div className="w-8 h-8 rounded-full bg-[#d4e8c2] border-2 border-[#3a7d44] flex items-center justify-center text-[#3a7d44] text-sm font-bold">
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-gray-800 hidden md:block">{firstName}</span>
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
                    <div className="max-w-3xl mx-auto">

                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href="/dashboard/partner/surplus"
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#3a7d44] transition-colors">
                                    <ArrowLeft size={12} />
                                    Kembali ke Manage Surplus
                                </Link>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Add Surplus Product</h1>
                            <p className="text-sm text-gray-500">Upload your surplus food before it goes to waste</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

                            {/* AI Tip Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { title: 'Generate with AI', desc: 'Optimize your detail product automatically' },
                                    { title: 'Pro Tips!', desc: 'AI ensures food safety & quality for customers' },
                                ].map(card => (
                                    <div key={card.title} className="bg-[#f6fabc]/50 border border-[#c8e84a]/60 rounded-xl p-3.5 flex items-start gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-[#c8e84a]/40 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles size={13} className="text-[#666c11]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#666c11] mb-0.5">{card.title}</p>
                                            <p className="text-[10px] text-gray-500 leading-relaxed">{card.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Product Image</label>
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                                        ${isDragging ? 'border-[#c8e84a] bg-[#f6fabc]/40' : 'border-gray-200 bg-[#f6fabc]/15 hover:border-[#c8e84a] hover:bg-[#f6fabc]/25'}`}>
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="max-h-52 mx-auto rounded-xl object-cover shadow-sm" />
                                            <button type="button"
                                                onClick={e => { e.stopPropagation(); setImagePreview(null); setImageFile(null) }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-gray-200 hover:bg-red-50">
                                                <X size={12} className="text-gray-500" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-[#e8f5c8] flex items-center justify-center mx-auto mb-3">
                                                <Upload size={22} className="text-[#3a7d44]" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Upload Product Image</p>
                                            <p className="text-xs text-gray-400">Drag and drop or click to browse</p>
                                            <p className="text-[10px] text-gray-300 mt-1">JPG, PNG, WEBP — Max 5MB</p>
                                        </>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => { if (e.target.files?.[0]) processImage(e.target.files[0]) }} />
                                </div>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Product Name</label>
                                <input type="text" placeholder="e.g., Honey Grilled Chicken Rice"
                                    value={form.product_name} onChange={e => updateForm('product_name', e.target.value)}
                                    className={inputBase} />
                            </div>

                            {/* Category + Quantity */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Product Category</label>
                                    <div className="relative">
                                        <button type="button" onClick={() => setCatOpen(!catOpen)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-left flex items-center justify-between bg-white hover:border-[#c8e84a] transition-all">
                                            <span className={form.category ? 'text-gray-800' : 'text-gray-400'}>
                                                {form.category || 'Select food category'}
                                            </span>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {catOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                                                {FOOD_CATEGORIES.map(cat => (
                                                    <button key={cat} type="button"
                                                        onClick={() => { updateForm('category', cat); setCatOpen(false) }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                                            ${form.category === cat ? 'bg-[#f6fabc] text-[#666c11] font-medium' : 'hover:bg-[#f6fabc]/50 text-gray-700'}`}>
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Quantity</label>
                                    <input type="number" min="1" placeholder="1"
                                        value={form.quantity} onChange={e => updateForm('quantity', e.target.value)}
                                        className={inputBase} />
                                </div>
                            </div>

                            {/* Production Time + Expiry Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                        Production Time
                                        <span className="ml-1 text-xs text-gray-400 font-normal">(Format 24h)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Clock size={15} className="text-gray-400" />
                                        </div>
                                        <input type="time" value={form.production_time}
                                            onChange={e => updateForm('production_time', e.target.value)}
                                            className={`${inputBase} pl-10`} style={{ colorScheme: 'light' }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Jam berapa makanan ini diproduksi</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-sm font-semibold text-gray-800">
                                            Expiry Time
                                            <span className="ml-1 text-xs text-gray-400 font-normal">(Format 24h)</span>
                                        </label>
                                        <AIButton onClick={handleGenerateExpiry} isLoading={aiLoading.expiry} />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Clock size={15} className={aiLoading.expiry ? 'text-[#c8e84a]' : 'text-gray-400'} />
                                        </div>
                                        <input type="time" value={form.expiry_time}
                                            onChange={e => updateForm('expiry_time', e.target.value)}
                                            className={`${inputBase} pl-10 ${aiLoading.expiry ? 'ai-loading' : ''}`}
                                            style={{ colorScheme: 'light' }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Batas aman konsumsi (jam)</p>
                                </div>
                            </div>

                            {/* Original Price + PlateUp Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Original Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">Rp</span>
                                        <input type="number" min="0" placeholder="15000"
                                            value={form.original_price} onChange={e => updateForm('original_price', e.target.value)}
                                            className={`${inputBase} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-sm font-semibold text-gray-800">Plate Up Price</label>
                                        {/* Tombol ini trigger handleGenerateExpiry karena price dihasilkan barengan expiry */}
                                        <AIButton onClick={handleGenerateExpiry} isLoading={aiLoading.price} />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">Rp</span>
                                        <input type="number" min="0" placeholder="0"
                                            value={form.plate_up_price} onChange={e => updateForm('plate_up_price', e.target.value)}
                                            className={`${inputBase} pl-10 ${aiLoading.price ? 'ai-loading' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Product Description</label>
                                    <AIButton onClick={handleGenerateDescription} isLoading={aiLoading.description} />
                                </div>
                                <textarea rows={3} placeholder="Briefly describe the food's condition (e.g., Kept in chiller)"
                                    value={form.description} onChange={e => updateForm('description', e.target.value)}
                                    className={`${inputBase} resize-none ${aiLoading.description ? 'ai-loading' : ''}`} />
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-2.5 bg-[#e8f5c8] border border-[#3a7d44]/30 rounded-xl px-4 py-3">
                                    <CheckCircle size={16} className="text-[#3a7d44] shrink-0" />
                                    <p className="text-sm text-[#2d5a1a] font-medium">Produk berhasil ditambahkan! Redirecting...</p>
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <p className="text-sm text-red-600">{errorMsg || 'Terjadi kesalahan.'}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => handleSubmit(true)} disabled={isSubmitting}
                                    className="btn-save-draft flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Menyimpan...' : 'Save Draft'}
                                </button>
                                <button type="button" onClick={() => handleSubmit(false)} disabled={isSubmitting}
                                    className="btn-upload-product flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Mengupload...' : 'Upload Product'}
                                </button>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}