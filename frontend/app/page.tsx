// app/page.tsx
import Navbar from './components/landing/Navbar'
import HeroSection from './components/landing/HeroSection'
import HowItWorks from './components/landing/HowItWorks'
import FAQSection from './components/landing/FAQSection'
import BackStory from './components/landing/BackStory'
import MissionsSection from './components/landing/MissionsSection'
import Footer from './components/landing/Footer'
import TrustedBy from './components/landing/TrustedBy'
import Link from 'next/link'

// Ganti button Find Affordable Food jadi:
<Link
  href="/register"
  className="px-6 py-3 bg-[#3a7d44] hover:bg-[#2d6435] text-white
             text-sm font-medium rounded-full transition-colors"
>
  Find Affordable Food
</Link>
// sections lain menyusul

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrustedBy />
      <BackStory />
      <MissionsSection />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  )
}