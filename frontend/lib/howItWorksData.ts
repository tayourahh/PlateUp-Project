// lib/howItWorksData.ts
export type Step = {
    number: string
    title: string
    description: string
}

export type TabData = {
    umkm: Step[]
    student: Step[]
}

export const howItWorksData: TabData = {
    umkm: [
        {
            number: '01',
            title: 'Simple Registration',
            description:
                'Register your business and upload the required feasibility documents. Our system ensures a secure and verified onboarding process via Supabase Auth.',
        },
        {
            number: '02',
            title: 'List Your Surplus',
            description:
                'Input your unsold products. Our Gemini-powered AI will automatically generate product descriptions and estimate safe consumption time limits for you.',
        },
        {
            number: '03',
            title: 'Monitor & Sell',
            description:
                'Watch your surplus turn into revenue. Track real-time freshness countdowns on your dashboard while students discover and reserve your meals.',
        },
    ],
    student: [
        {
            number: '01',
            title: 'Create Your Account',
            description:
                'Sign up with your student email or Google account. Verify your student status to unlock exclusive discounted surplus meals near your campus.',
        },
        {
            number: '02',
            title: 'Browse & Order',
            description:
                'Explore available surplus meals from local culinary partners. Filter by location, price, or food type and place your order before stock runs out.',
        },
        {
            number: '03',
            title: 'Pick Up & Enjoy',
            description:
                'Get notified when your order is ready. Pick up your affordable, quality meal directly from the partner and help reduce food waste at the same time.',
        },
    ],
}