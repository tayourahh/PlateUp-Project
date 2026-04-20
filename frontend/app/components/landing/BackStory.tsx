import Image from 'next/image'

export default function BackStory() {
    return (
        <section className="w-full bg-brand-cream py-16 px-6 md:px-16">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-start">

                {/* ===== KIRI: Gambar + SDG ===== */}
                <div className="flex-1 flex flex-col gap-3 max-w-[480px]">

                    {/* Baris atas: foto + SDG 12 & 8 */}
                    <div className="flex gap-3 items-stretch">
                        <Image
                            src="/images/backstory-food-1.png"
                            alt="Food waste"
                            width={370}
                            height={220}
                            className="flex-1 h-[220px] object-cover rounded-2xl"
                        />
                        <div className="flex flex-col gap-3">
                            <Image src="/icons/sdg-12.png" alt="SDG 12" width={72} height={72} className="rounded-xl" />
                            <Image src="/icons/sdg-8.png" alt="SDG 8" width={72} height={72} className="rounded-xl" />
                        </div>
                    </div>

                    {/* Baris bawah: SDG 13 & 2 + foto */}
                    <div className="flex gap-3 items-stretch">
                        <div className="flex flex-col gap-3">
                            <Image src="/icons/sdg-13.png" alt="SDG 13" width={72} height={72} className="rounded-xl" />
                            <Image src="/icons/sdg-2.png" alt="SDG 2" width={72} height={72} className="rounded-xl" />
                        </div>
                        <Image
                            src="/images/backstory-food-2.png"
                            alt="Food preparation"
                            width={370}
                            height={190}
                            className="flex-1 h-[190px] object-cover rounded-2xl"
                        />
                    </div>

                </div>

                {/* ===== KANAN: Text Content ===== */}
                <div className="flex-1 flex flex-col gap-4 pt-2">

                    {/* Tag — center di Figma */}
                    <p className="text-brand-teal font-bold text-base text-center">
                        #Our Back Story
                    </p>

                    {/* Heading — lime, center */}
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-lime leading-tight text-center">
                        The Hidden Crisis on Our Plates
                    </h2>

                    {/* Intro */}
                    <p className="text-brand-dark text-sm leading-relaxed">
                        <strong>Indonesia</strong> is currently facing{' '}
                        <strong>a critical food waste challenge</strong> that{' '}
                        <strong>impacts</strong> both our society and our planet.{' '}
                        <strong>PlateUp!</strong> was founded to tackle these pressing issues:
                    </p>

                    {/* Bullet points */}
                    <ul className="flex flex-col gap-2 text-brand-dark text-sm list-disc list-inside">
                        <li>
                            <strong>World's #2 Waster:</strong> Indonesia is among the world's
                            largest contributors to food waste, losing up to 48 million tons annually.
                        </li>
                        <li>
                            <strong>Economic Impact:</strong> This waste costs the nation up to
                            IDR 551 trillion per year, nearly 5% of our total GDP.
                        </li>
                        <li>
                            <strong>Climate Threat:</strong> Rotting food in landfills produces
                            methane, contributing significantly to Indonesia's greenhouse gas emissions.
                        </li>
                        <li>
                            <strong>Unsold Surplus:</strong> Local culinary SMEs (UMKM) often have
                            no choice but to discard unsold, high-quality meals at the end of the day.
                        </li>
                    </ul>

                    {/* Closing */}
                    <p className="text-brand-dark text-sm leading-relaxed">
                        <strong>PlateUp!</strong> bridges this gap, turning potential waste into
                        affordable opportunities for the community.
                    </p>

                </div>

            </div>
        </section>
    )
}