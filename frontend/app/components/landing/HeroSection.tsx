// components/landing/HeroSection.tsx
import Image from 'next/image'
import Button from '../ui/Button'

export default function HeroSection() {
    return (
        <section className="w-full px-6 md:px-16 py-16 flex flex-col md:flex-row items-center gap-10 bg-white">

            {/* Kiri: Text Content */}
            <div className="flex-1 flex flex-col gap-6">
                <h1 className="text-4xl md:text-5xl font-bold text-brand-teal leading-tight">
                    Smart Solutions for{' '}
                    <span className="block">Quality Surplus Food.</span>
                </h1>

                <p className="text-brand-dark text-base leading-relaxed max-w-md">
                    Empowering local culinary businesses to efficiently distribute surplus
                    food to the student community. Effective, transparent, and making a
                    real impact on the environment.
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-4 flex-wrap">
                    <Button href="/register?role=partner" variant="primary">
                        Become a Partner
                    </Button>
                    <Button href="/register?role=customer" variant="outline">
                        Find Affordable Food
                    </Button>
                </div>
            </div>

            {/* Kanan: Image */}
            <div className="flex-1 w-full max-w-md">
                <Image
                    src="/images/hero-food.jpg"
                    alt="Surplus food being handled"
                    width={600}
                    height={450}
                    className="rounded-2xl object-cover w-full h-auto"
                    priority
                />
            </div>

        </section>
    )
}