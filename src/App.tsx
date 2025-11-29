import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { About } from "@/components/About/About";
import { Portfolio } from "@/components/Portfolio/Portfolio";
import { CaseStudies } from "@/components/CaseStudies/CaseStudies";
import { Contact } from "@/components/Contact/Contact";
import { Footer } from "@/components/Footer/Footer";
import { PortfolioProvider } from "@/data/portfolio";

export default function App() {
  return (
    <PortfolioProvider>
      <div className="app">
        <Header />
        <Hero />
        <About />
        <Portfolio />
        <CaseStudies />
        <Contact />
        <Footer />
      </div>
    </PortfolioProvider>
  );
}
