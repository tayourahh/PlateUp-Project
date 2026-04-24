'use client'

import { StoreProfile } from '@/lib/api'

const BUSINESS_CATEGORIES = [
  'Makanan & Minuman', 'Bakery & Pastry', 'Catering',
  'Warung Makan', 'Restoran', 'Kafe', 'Lainnya',
]

const inputBase = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#c8e84a] focus:ring-2 focus:ring-[#c8e84a]/20 transition-all placeholder-gray-400"

interface StoreProfileTabProps {
  profile: StoreProfile
  onChange: (updated: StoreProfile) => void
}

export default function StoreProfileTab({ profile, onChange }: StoreProfileTabProps) {
  const update = (field: keyof StoreProfile, value: string) =>
    onChange({ ...profile, [field]: value })

  return (
    <div className="space-y-5">

      {/* Store Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Store Name</label>
        <input
          type="text"
          placeholder="e.g., Bakmie Apih Kelapa Dua"
          value={profile.store_name}
          onChange={(e) => update('store_name', e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Business Category + WhatsApp */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Business Category</label>
          <select
            value={profile.business_category}
            onChange={(e) => update('business_category', e.target.value)}
            className={`${inputBase} bg-white`}
          >
            <option value="">Select business category</option>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Whatsapp Number</label>
          <input
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={profile.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email Address</label>
        <input
          type="email"
          placeholder="store@email.com"
          value={profile.email}
          onChange={(e) => update('email', e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Store Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Store Address</label>
        <textarea
          rows={3}
          placeholder="Jl. ..."
          value={profile.store_address}
          onChange={(e) => update('store_address', e.target.value)}
          className={`${inputBase} resize-none`}
        />
      </div>

    </div>
  )
}
