'use client'

import { useState } from 'react'
import { faqData, type FAQItem } from '@/lib/faqData'

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="w-full py-16 px-6 md:px-16 bg-white">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">

                {/* Kiri: Title */}
                <div className="md:w-1/3">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">
                        Frequently Asked Question
                    </h2>
                    <p className="text-brand-dark text-sm leading-relaxed opacity-60">
                        Find quick answers to common questions about our platform, food
                        safety, and how you can start making an impact with PlateUp!
                    </p>
                </div>

                {/* Kanan: Accordion */}
                <div className="md:w-2/3 max-h-[420px] overflow-y-auto pr-2 flex flex-col gap-3">
                    {faqData.map((item: FAQItem, index: number) => (
                        <FAQAccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>

            </div>
        </section>
    )
}

function FAQAccordionItem({
    item,
    isOpen,
    onToggle,
}: {
    item: FAQItem
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div
            className={`
        rounded-xl border transition-all duration-200
        ${isOpen
                    ? 'border-brand-sprout bg-brand-sprout'
                    : 'border-brand-sprout bg-brand-sprout/40'
                }
      `}
        >
            {/* Question Row */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <span className="font-semibold text-brand-dark text-sm pr-4">
                    {item.question}
                </span>

                {/* Chevron button — bulat, background teal */}
                <span
                    className={`
            flex-shrink-0 w-8 h-8 rounded-full bg-brand-teal
            flex items-center justify-center
            transition-transform duration-300
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
                >
                    <svg
                        width="16" height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                    >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {/* Answer */}
            <div
                className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
        `}
            >
                <p className="px-5 pb-4 text-sm text-brand-dark/70 leading-relaxed">
                    {item.answer}
                </p>
            </div>
        </div>
    )
}