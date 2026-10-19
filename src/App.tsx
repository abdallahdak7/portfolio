import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Experience } from "@/components/site/Experience";
import { Work } from "@/components/site/Work";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function App() {
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
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
