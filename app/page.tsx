import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { Semaforo } from "@/components/landing/Semaforo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeedPreview } from "@/components/landing/FeedPreview";
import { ExamplesGallery } from "@/components/landing/ExamplesGallery";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";

export default function Home() {
  return (
    <div className="theme-light">
      <Nav />
      <main>
        <Hero />
        <Reveal>
          <ValueProps />
        </Reveal>
        <Reveal>
          <Semaforo />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <FeedPreview />
        </Reveal>
        <Reveal>
          <ExamplesGallery />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
