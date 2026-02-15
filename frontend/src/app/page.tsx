import Navbar from '@/components/ui/Navbar';
import HeroScene from '@/components/3d/HeroScene';
import HeroContent from '@/components/ui/HeroContent';
import SectionReveal from '@/components/ui/SectionReveal';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import BlogSection from '@/components/sections/BlogSection';
import ThreatMap from '@/components/sections/ThreatMap';
import ContactSection from '@/components/sections/ContactSection';



export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-dark)] text-gray-200">
      <Navbar />


      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        <HeroContent />
      </section>

      {/* Content Sections with Scroll Reveal */}
      <SectionReveal>
        <AboutSection />
      </SectionReveal>

      <SectionReveal>
        <ExperienceSection />
      </SectionReveal>

      <SectionReveal>
        <SkillsSection />
      </SectionReveal>

      <SectionReveal>
        <ProjectsSection />
      </SectionReveal>

      <SectionReveal>
        <BlogSection />
      </SectionReveal>

      <SectionReveal>
        <ThreatMap />
      </SectionReveal>

      <SectionReveal>
        <ContactSection />
      </SectionReveal>

      <footer className="py-8 text-center text-gray-600 text-xs font-mono border-t border-cyan-900/20 mt-12 bg-black">
        <p>SYSTEM STATUS: ONLINE // © {new Date().getFullYear()} SALVIN. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
