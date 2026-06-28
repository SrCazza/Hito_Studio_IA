import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { Semaforo } from "@/components/landing/Semaforo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeedPreview } from "@/components/landing/FeedPreview";
import { ExamplesGallery } from "@/components/landing/ExamplesGallery";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ValueProps />
        <Semaforo />
        <HowItWorks />
        <FeedPreview />
        <ExamplesGallery />
      </main>
      <Footer />
    </>
  );
}
