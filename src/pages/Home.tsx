import { useEffect } from "react";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Work } from "@/sections/Work";
import { Services } from "@/sections/Services";
import { Skills } from "@/sections/Skills";
import { Design } from "@/sections/Design";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";
import { ScrollTrigger } from "@/lib/gsap";

export default function Home() {
  // recalcula gatilhos quando imagens tardias mudam a altura da página
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const id = setTimeout(onLoad, 1200);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(id);
    };
  }, []);

  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Services />
      <Skills />
      <Design />
      <Contact />
      <Footer />
    </main>
  );
}
