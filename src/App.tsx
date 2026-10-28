import { useEffect } from "react";
import { initAmbient } from "@/lib/ambient";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Leadership } from "@/components/site/Leadership";
import { Spotlight } from "@/components/site/Spotlight";
import { AI } from "@/components/site/AI";
import { Experience } from "@/components/site/Experience";
import { AskTom } from "@/components/site/AskTom";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function App() {
  useEffect(() => {
    initAmbient();
  }, []);

  return (
    <>
      <a
        href="#experience"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <Experience />
        <Leadership />
        <AI />
        <Spotlight />
        <AskTom />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
