import Image from 'next/image'

const missions = [
    {
        icon: '/icons/icon-food-waste.svg',
        title: 'Minimizing Food Waste',
        description: 'Redirecting quality surplus meals from local SMEs to prevent food from ending up in landfills.',
    },
    {
        icon: '/icons/icon-umkm.svg',
        title: 'Empowering Local UMKM',
        description: "Supporting mid-scale businesses to minimize losses using smart, AI-driven surplus management.",
    },
    {
        icon: '/icons/icon-environment.svg',
        title: 'Environmental Responsibility',
        description: "Reducing methane emissions by preventing food decay and supporting Indonesia's climate goals.",
    },
    {
        icon: '/icons/icon-student.svg',
        title: 'Ensuring Student Accessibility',
        description: 'Providing students with access to high-quality, nutritious meals at prices that fit their budget.',
    },
]

export default function MissionsSection() {
    return (
        <section className="w-full">

            {/* Background Image — lebih tinggi supaya cards bisa overlap */}
            <div className="relative w-full h-[420px]">
                <Image
                    src="/images/missions-bg.jpg"
                    alt="Our Missions Background"
                    fill
                    className="object-cover"
                />
                {/* Overlay tipis saja supaya teks terbaca, tapi foto tetap natural */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 pb-32">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Our Missions
                    </h2>
                    <p className="text-white/90 text-base max-w-2xl">
                        Driving change through technology to build a sustainable food ecosystem.
                    </p>
                </div>

                {/* Cards */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-6 md:px-16">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {missions.map((mission, index) => (
                            <div
                                key={index}
                                className="bg-brand-sprout rounded-2xl p-6 flex flex-col gap-4 shadow-md"
                            >
                                <div className="w-12 h-12">
                                    <Image
                                        src={mission.icon}
                                        alt={mission.title}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-contain"
                                        style={{ filter: 'invert(28%) sepia(50%) saturate(500%) hue-rotate(120deg) brightness(80%)' }}
                                    />
                                </div>
                                <h3 className="text-brand-teal font-bold text-lg leading-snug">
                                    {mission.title}
                                </h3>
                                <p className="text-brand-dark text-sm leading-relaxed">
                                    {mission.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Spacer — kasih ruang untuk cards yang overlap */}
            <div className="h-64 bg-white" />

        </section>
    )
}