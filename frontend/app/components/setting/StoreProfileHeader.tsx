'use client'

import Image from 'next/image'
import { Upload } from 'lucide-react'
import { StoreProfile } from '@/lib/api'

interface StoreProfileHeaderProps {
  profile: StoreProfile
  onPhotoChange?: (file: File) => void
}

export default function StoreProfileHeader({ profile, onPhotoChange }: StoreProfileHeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onPhotoChange) onPhotoChange(file)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">

      {/* Store Photo */}
      <div className="relative w-full md:w-1/2 h-48 rounded-2xl overflow-hidden bg-gray-100 group border border-gray-100">
        {profile.photo_url ? (
          <Image src={profile.photo_url} alt="Store photo" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-10 h-10 rounded-full bg-[#e8f5c8] flex items-center justify-center">
              <Upload size={18} className="text-[#3a7d44]" />
            </div>
            <p className="text-xs text-gray-400">No photo yet</p>
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
          <span className="text-white text-sm font-semibold">Change Photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* Store Info + Map */}
      <div className="flex flex-col gap-3 w-full md:w-1/2">

        {/* Store name & address card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4e8c2] flex items-center justify-center text-[#3a7d44] font-bold text-sm shrink-0">
            {profile.store_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile.store_name || '—'}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile.store_address || '—'}</p>
          </div>
        </div>

        {/* Pickup Pin Location */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 pt-3 pb-2">
            Pickup Pin Location
          </p>
          {profile.pickup_lat && profile.pickup_lng ? (
            <iframe
              src={`https://maps.google.com/maps?q=${profile.pickup_lat},${profile.pickup_lng}&z=15&output=embed`}
              className="w-full h-28 border-0"
              loading="lazy"
            />
          ) : (
            <div className="h-28 flex items-center justify-center text-xs text-gray-400 bg-gray-50 mx-3 mb-3 rounded-xl">
              No location set
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
