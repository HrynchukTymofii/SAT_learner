import HeroSection from "@/components/home-ui/hero-section"
import TasteFirstSection from "@/components/home-ui/taste-first-section"
import AboutCourseSection from "@/components/home-ui/about-course-section"
import AboutSatSection from "@/components/home-ui/about-sat-section"
import { ReviewsSection } from "@/components/home-ui/reviews-section"
import { TipsSection } from "@/components/home-ui/tips-section"
import { FAQSection } from "@/components/home-ui/faq-section"
import { PricingSection } from "@/components/home-ui/pricing-section"
import { CTASection } from "@/components/home-ui/cta-section"
import { ContactSection } from "@/components/home-ui/contact-section"
import { Footer } from "@/components/footer"

export default function SATHomepage() {
  return (
    <div className="min-h-screen max-w-7xl w-full mt-4">
      <HeroSection />
      <TasteFirstSection />
      <AboutCourseSection />
      <AboutSatSection />
      <ReviewsSection />
      <TipsSection />
      <FAQSection />
      <PricingSection />
      <CTASection />
      <ContactSection />
      <Footer />

    </div>
  )
}
