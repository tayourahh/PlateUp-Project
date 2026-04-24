'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function CustomerSettingPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // State untuk form
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        email: '',
    })

    // State untuk food preferences (array of string)
    const [selectedPrefs, setSelectedPrefs] = useState<string[]>([])

    const [loading, setLoading] = useState(false)

    // Fetch existing data saat komponen mount
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('users')           // sesuaikan nama tabel kamu
                .select('name, phone, email, food_preferences')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Fetch error:', error.message)
                return
            }

            setProfile({
                name: data.name ?? '',
                phone: data.phone ?? '',
                email: data.email ?? '',
            })
            setSelectedPrefs(data.food_preferences ?? [])
        }

        fetchProfile()
    }, [])
    const ALL_PREFERENCES = [
        'Noodles', 'Bakery', 'Rice', 'Dessert', 'Salads', 'Beverages'
    ]

    // Toggle: kalau sudah dipilih → hapus, kalau belum → tambah
    const togglePref = (pref: string) => {
        setSelectedPrefs(prev =>
            prev.includes(pref)
                ? prev.filter(p => p !== pref)   // remove
                : [...prev, pref]                 // add
        )
    }
    const handleSave = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('users')
            .update({
                name: profile.name,
                phone: profile.phone,
                food_preferences: selectedPrefs,
                // email biasanya tidak diubah langsung karena butuh verifikasi
            })
            .eq('id', user.id)

        if (error) {
            console.error('Update error:', error.message)
            alert('Gagal menyimpan. Coba lagi.')
        } else {
            alert('Profil berhasil disimpan!')
        }
        setLoading(false)
    }
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">Profile & Preference</h1>
            <p className="text-gray-500 mb-6 text-sm">
                Manage your profile and preferences details.
            </p>

            {/* Account Profile */}
            <section className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                <h2 className="font-semibold mb-4">Account Profile</h2>

                {['Name', 'Phone Number', 'Email Address'].map((label, i) => {
                    const key = ['name', 'phone', 'email'][i] as keyof typeof profile
                    return (
                        <div key={label} className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">{label}</label>
                            <input
                                type="text"
                                value={profile[key]}
                                onChange={e => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                                disabled={label === 'Email Address'} // email read-only
                                className="w-full border-b border-gray-300 py-1 text-sm outline-none
                           focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400"
                            />
                        </div>
                    )
                })}
            </section>

            {/* Food Preferences */}
            <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <h2 className="font-semibold mb-1">Food Preferences</h2>
                <p className="text-sm text-gray-400 mb-3">I'm Craving...</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_PREFERENCES.map(pref => (
                        <button
                            key={pref}
                            onClick={() => togglePref(pref)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedPrefs.includes(pref)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {pref}
                        </button>
                    ))}
                </div>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => window.location.reload()} // Discard = reload ulang
                    className="px-6 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                    Discard
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm
                     hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}