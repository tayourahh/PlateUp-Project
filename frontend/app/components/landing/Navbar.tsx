'use client'

import Link from 'next/link'
import Image from 'next/image'
import Button from '../ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Order', href: '/order' },
    { label: 'Impact & Metrics', href: '/impact' },
    { label: 'About Us', href: '/about' },
]

export default function Navbar() {
    const supabase = createClient()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(!!session)
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="w-full sticky top-0 z-50 py-3 px-6 md:px-16">
            <nav className="max-w-6xl mx-auto bg-white rounded-full shadow-md px-6 py-3 flex items-center justify-between border border-brand-grey">

                {/* Logo */}
                <Link href="/">
                    <Image
                        src="/logo-plateup.png"
                        alt="PlateUp!"
                        width={150}
                        height={48}
                        className="object-contain"
                    />
                </Link>

                {/* Desktop Nav Links */}
                <ul className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-brand-dark hover:text-brand-teal transition-colors text-sm font-medium"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop CTA — Get Started atau Logout */}
                <div className="hidden md:flex items-center gap-3">
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 text-sm font-medium text-red-500 
                                       border border-red-200 rounded-full hover:bg-red-50 
                                       transition-colors"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link href="/choose-role">
                            <Image
                                src="/images/btn-get-started.png"
                                alt="Get Started"
                                width={130}
                                height={38}
                                className="object-contain hover:opacity-90 transition-opacity cursor-pointer"
                            />
                        </Link>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="w-6 h-0.5 bg-brand-dark block" />
                    <span className="w-6 h-0.5 bg-brand-dark block" />
                    <span className="w-6 h-0.5 bg-brand-dark block" />
                </button>

            </nav>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="max-w-6xl mx-auto mt-2 bg-white rounded-2xl shadow-md flex flex-col items-start px-6 py-4 gap-4 md:hidden">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-brand-dark hover:text-brand-teal text-sm font-medium transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-500"
                        >
                            Logout
                        </button>
                    ) : (
                        <Button href="/register" variant="lime">
                            Get Started
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}