// lib/faqData.ts
export type FAQItem = {
    question: string
    answer: string
}

export const faqData: FAQItem[] = [
    {
        question: 'How does PlateUp! ensure food quality and safety?',
        answer:
            'All partner businesses undergo a verification process and must comply with food safety standards. Our AI system also tracks freshness countdowns for every listed item, ensuring students only order food within safe consumption windows.',
    },
    {
        question: 'How do I register as a culinary partner?',
        answer:
            'Click "Become a Partner" on the homepage, fill in your business details, and upload the required feasibility documents. Our team will review and verify your application within 1-3 business days.',
    },
    {
        question: 'Who can buy food on PlateUp!?',
        answer:
            'PlateUp! is primarily designed for students looking for affordable, quality meals. You can sign up with your student email or Google account to start browsing available surplus food near your campus.',
    },
    {
        question: 'What happens if I want to cancel my order?',
        answer:
            'Orders can be cancelled up to 30 minutes after placement. After that window, cancellations are subject to partner approval since the food has likely already been prepared.',
    },
    {
        question: 'Is PlateUp! available outside Jabodetabek?',
        answer:
            'Currently we are piloting in the Jabodetabek area. We plan to expand to other major university cities in Indonesia throughout 2026. Stay tuned for announcements!',
    },
    {
        question: 'How does PlateUp! help reduce food waste?',
        answer:
            'By connecting culinary businesses with surplus food directly to students who need affordable meals, we divert quality food from landfills. Every order placed on PlateUp! contributes to reducing Indonesia\'s food waste footprint.',
    },
]