'use client'
import { useEffect, useState } from 'react'
import { getProfile } from '@/lib/api'  // ← import dari file tadi

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // getProfile()  ← comment ini dulu
        //   .then(data => setProfile(data))
        //   .catch(err => console.error(err))
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <h1>Welcome, {profile?.full_name}</h1>
            <p>Phone: {profile?.phone_number}</p>
        </div>
    )
}