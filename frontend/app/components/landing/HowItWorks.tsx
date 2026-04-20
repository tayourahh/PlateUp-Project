// components/landing/HowItWorks.tsx
'use client'

import { useState, useRef } from 'react'
import { howItWorksData, Step } from '@/lib/howItWorksData'

type TabKey = 'umkm' | 'student'

export default function HowItWorks() {
    const [activeTab, setActiveTab] = useState<TabKey>('umkm')
    const [animClass, setAnimClass] = useState('')
    // Track tab sebelumnya untuk tentukan arah slide
    const prevTabRef = useRef<TabKey>('umkm')

    const handleTabSwitch = (tab: TabKey) => {
        if (tab === activeTab) return // klik tab yang sama → tidak perlu apa-apa

        // Tentukan arah: tabs berurutan [umkm=0, student=1]
        const tabOrder: TabKey[] = ['umkm', 'student']
        const currentIndex = tabOrder.indexOf(activeTab)
        const nextIndex = tabOrder.indexOf(tab)

        // Konten baru datang dari kanan jika maju, dari kiri jika mundur
        const direction = nextIndex > currentIndex ? 'slide-from-right' : 'slide-from-left'

        prevTabRef.current = activeTab
        setAnimClass(direction)
        setActiveTab(tab)

        // Reset animClass setelah animasi selesai (350ms)
        // Supaya animasi bisa trigger ulang kalau switch tab lagi
        setTimeout(() => setAnimClass(''), 350)
    }

    return (
        <section className="w-full py-16 px-6 md:px-16 bg-brand-cream">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-3">
                    How It Works
                </h2>
                <p className="text-brand-dark/70 text-base">
                    A simple and transparent process to rescue food and save money.
                </p>
            </div>

            {/* Tab Buttons */}
            {/* Tab Buttons */}
            <div className="flex justify-center gap-3 mb-10">
                {(['umkm', 'student'] as TabKey[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabSwitch(tab)}
                        className={`
        px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200
        ${activeTab === tab
                                ? 'bg-brand-lime text-brand-forest shadow-md'
                                : 'bg-white text-brand-dark border border-brand-lime hover:bg-brand-lime/20'
                            }
      `}
                    >
                        {tab === 'umkm' ? 'For UMKM' : 'For Student'}
                    </button>
                ))}
            </div>

            {/* Steps Container — overflow-hidden penting untuk clip slide animation */}
            <div className="overflow-hidden">
                <div
                    key={activeTab}          // key change → React remount → animasi trigger ulang
                    className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${animClass}`}
                >
                    {howItWorksData[activeTab].map((step: Step) => (
                        <StepCard key={step.number} step={step} />
                    ))}
                </div>
            </div>
        </section>
    )
}

// Sub-component: kartu per step
function StepCard({ step }: { step: Step }) {
    return (
        <div className="flex flex-col items-center text-center gap-4 p-6">
            {/* Number circle — lime sesuai Figma */}
            <div className="w-12 h-12 rounded-full bg-brand-lime flex items-center justify-center text-brand-forest font-bold text-lg">
                {step.number}
            </div>
            <h3 className="font-bold text-brand-dark text-base">{step.title}</h3>
            <p className="text-brand-dark/70 text-sm leading-relaxed">
                {step.description}
            </p>
        </div>
    )
}