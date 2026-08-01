import { useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import '../landing.css'

// 14 Animated Sections
import AnimatedHero from '../components/landing/AnimatedHero.jsx'
import TrustedBy from '../components/landing/TrustedBy.jsx'
import FeaturesGrid from '../components/landing/FeaturesGrid.jsx'
import AboutTimeline from '../components/landing/AboutTimeline.jsx'
import ServicesGrid from '../components/landing/ServicesGrid.jsx'
import WhyChooseUs from '../components/landing/WhyChooseUs.jsx'
import PortfolioMasonry from '../components/landing/PortfolioMasonry.jsx'
import TestimonialCarousel from '../components/landing/TestimonialCarousel.jsx'
import PricingToggle from '../components/landing/PricingToggle.jsx'
import FAQAccordion from '../components/landing/FAQAccordion.jsx'
import BlogPreview from '../components/landing/BlogPreview.jsx'
import NewsletterContact from '../components/landing/NewsletterContact.jsx'

export default function Landing() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
  }, [])

  return (
    <div className="landing-page" style={{ scrollBehavior: 'smooth' }}>
      <Header />
      <main style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
        <AnimatedHero />
        <TrustedBy />
        <FeaturesGrid />
        <AboutTimeline />
        <ServicesGrid />
        <WhyChooseUs />
        <PortfolioMasonry />
        <TestimonialCarousel />
        <PricingToggle />
        <FAQAccordion />
        <BlogPreview />
        <NewsletterContact />
      </main>
      <Footer />
    </div>
  )
}