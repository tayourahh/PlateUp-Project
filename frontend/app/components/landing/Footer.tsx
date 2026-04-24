import Image from 'next/image'
import Link from 'next/link'

const navCol1 = [
    { label: 'Our Project', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact US', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'FAQ', href: '#' },
]

const navCol2 = [
    { label: 'Partner Dashboard', href: '#' },
    { label: 'Explore Food', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
]

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-brand-grey">

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 md:px-16 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-10">

                    {/* ===== KIRI: Logo + Social ===== */}
                    <div className="flex flex-col gap-4 min-w-[200px]">
                        {/* Logo */}
                        <Image
                            src="/logo-plateup.png"
                            alt="PlateUp!"
                            width={167}
                            height={54}
                            className="object-contain"
                        />

                        {/* Divider */}
                        <div className="w-full h-[1px] bg-brand-grey" />

                        {/* Social Icons — horizontal row, di bawah logo */}
                        <div className="flex gap-3">
                            <Link href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" /></svg>
                            </Link>
                        </div>
                    </div>

                    {/* ===== KANAN: Nav Links 2 kolom ===== */}
                    <div className="flex gap-16 md:gap-24">
                        {/* Kolom 1 */}
                        <div className="flex flex-col gap-3">
                            {navCol1.map((item) => (
                                <Link key={item.label} href={item.href}
                                    className="text-brand-dark text-sm hover:text-brand-teal transition-colors">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        {/* Kolom 2 */}
                        <div className="flex flex-col gap-3">
                            {navCol2.map((item) => (
                                <Link key={item.label} href={item.href}
                                    className="text-brand-dark text-sm hover:text-brand-teal transition-colors">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-brand-grey">
                <div className="max-w-6xl mx-auto px-6 md:px-16 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <p className="text-brand-grey-dark text-xs leading-relaxed">
                        © 2026 PlateUp! | Developed by PlateUp! - Team 3 | Compete Mate 2026 |<br />
                        Google Developer Community on Gunadarma University
                    </p>
                    <div className="flex gap-4 text-xs text-brand-grey-dark">
                        <Link href="#" className="hover:text-brand-teal transition-colors">Terms</Link>
                        <span>|</span>
                        <Link href="#" className="hover:text-brand-teal transition-colors">Rules</Link>
                    </div>
                </div>
            </div>

        </footer>
    )
}