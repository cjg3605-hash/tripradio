import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { DestinationsSection } from "./components/DestinationsSection";
import { Footer } from "./components/Footer";
import { GuidePageContent } from "./components/GuidePageContent";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'guide'>('home');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentPage('guide');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedDestination('');
  };

  if (currentPage === 'guide') {
    return <GuidePageContent onBackToHome={handleBackToHome} destination={selectedDestination} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection onDestinationClick={handleDestinationClick} />
        <DestinationsSection onDestinationClick={handleDestinationClick} />
      </main>
      <Footer />
    </div>
  );
}