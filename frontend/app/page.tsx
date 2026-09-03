// app/page.tsx
import Navbar from './components/landing/Navbar'
import HeroSection from './components/landing/HeroSection'
import HowItWorks from './components/landing/HowItWorks'
import FAQSection from './components/landing/FAQSection'
import BackStory from './components/landing/BackStory'
import MissionsSection from './components/landing/MissionsSection'
import Footer from './components/landing/Footer'
import TrustedBy from './components/landing/TrustedBy'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <div id="home" className="scroll-mt-28">
        <HeroSection />
      </div>
      <TrustedBy />
      <div id="about" className="scroll-mt-28">
        <BackStory />
      </div>
      <div id="impact" className="scroll-mt-28">
        <MissionsSection />
      </div>
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  )
}