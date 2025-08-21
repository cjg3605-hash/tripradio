import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { DestinationsSection } from "./components/DestinationsSection";
import { Footer } from "./components/Footer";
import { GuidePageContent } from "./components/GuidePageContent";
import { LoginPage } from "./components/LoginPage";
import { MyPage } from "./components/MyPage";
import { TripPlannerPage } from "./components/TripPlannerPage";
import { NomadCalculatorPage } from "./components/NomadCalculatorPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'guide' | 'login' | 'signup' | 'mypage' | 'trip-planner' | 'nomad-calculator'>('home');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentPage('guide');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedDestination('');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleSignUpClick = () => {
    setCurrentPage('signup');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('mypage');
  };

  const handleMyPageClick = () => {
    setCurrentPage('mypage');
  };

  const handleTripPlannerClick = () => {
    setCurrentPage('trip-planner');
  };

  const handleNomadCalculatorClick = () => {
    setCurrentPage('nomad-calculator');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        {currentPage === 'guide' && (
          <GuidePageContent onBackToHome={handleBackToHome} destination={selectedDestination} />
        )}

        {currentPage === 'login' && (
          <LoginPage 
            onBackToHome={handleBackToHome} 
            onSignUpClick={handleSignUpClick}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'signup' && (
          <LoginPage 
            onBackToHome={handleBackToHome} 
            onSignUpClick={handleSignUpClick}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'mypage' && (
          <MyPage onBackToHome={handleBackToHome} />
        )}

        {currentPage === 'trip-planner' && (
          <TripPlannerPage onBackToHome={handleBackToHome} />
        )}

        {currentPage === 'nomad-calculator' && (
          <NomadCalculatorPage onBackToHome={handleBackToHome} />
        )}

        {currentPage === 'home' && (
          <>
            <Header 
              onLoginClick={handleLoginClick} 
              onMyPageClick={handleMyPageClick}
            />
            <main>
              <HeroSection onDestinationClick={handleDestinationClick} />
              <DestinationsSection onDestinationClick={handleDestinationClick} />
            </main>
            <Footer 
              onTripPlannerClick={handleTripPlannerClick}
              onNomadCalculatorClick={handleNomadCalculatorClick}
            />
          </>
        )}
      </div>
    </AuthProvider>
  );
}