// components/ui/Button.tsx
import Link from 'next/link'

type ButtonProps = {
    children: React.ReactNode
    variant?: 'primary' | 'outline' | 'lime'
    href?: string
    onClick?: () => void
    className?: string
}

export default function Button({
    children,
    variant = 'primary',
    href,
    onClick,
    className = '',
}: ButtonProps) {

    const base = 'px-6 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer inline-block text-center'

    const variants = {
        // Become a Partner → lime background, dark text
        primary: 'bg-brand-lime text-brand-forest hover:bg-brand-lime-dark',
        // Find Affordable Food → lime muda/outline
        outline: 'bg-brand-lime/60 text-brand-forest border-2 border-brand-lime hover:bg-brand-lime',
        // Get Started di navbar → teal
        lime: 'bg-brand-teal text-white hover:bg-brand-teal-dark',
    }

    const classes = `${base} ${variants[variant]} ${className}`

    if (href) {
        return <Link href={href} className={classes}>{children}</Link>
    }

    return (
        <button onClick={onClick} className={classes}>
            {children}
        </button>
    )
}