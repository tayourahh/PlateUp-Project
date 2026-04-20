import Footer from '@/components/landing/Footer'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#f0f4f0]">
            {children}
            <Footer />
        </div>
    )
}   