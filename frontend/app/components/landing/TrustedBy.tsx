// components/landing/TrustedBy.tsx
import Image from 'next/image'

const partners = [
    { src: '/logos/logo-holland.png', alt: 'Holland Bakery' },
    { src: '/logos/logo-eatlah.png', alt: 'Eatlah' },
    { src: '/logos/logo-sederhana.png', alt: 'Sederhana' },
    { src: '/logos/logo-sushimate.png', alt: 'Sushimate' },
    { src: '/logos/logo-kopi.png', alt: 'Kopi Kenangan' },
]

export default function TrustedBy() {
    return (
        <section className="w-full bg-white py-10 px-6 md:px-16">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">

                {/* Label */}
                <p className="text-brand-grey-dark text-sm font-medium tracking-wide">
                    Trusted by Local Culinary Partners
                </p>

                {/* Logo row */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                    {partners.map((partner) => (
                        <div key={partner.alt} className="relative h-12 w-32">
                            <Image
                                src={partner.src}
                                alt={partner.alt}
                                fill
                                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}