import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EducationSection from "./components/EducationSection";
import CertificationsSection from "./components/CertificationsSection";
import MenuOverlay from "./components/MenuOverlay";
import { sounds } from "./utils/audio";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const validTabs = ["home", "education", "certifications", "achievements"];
    const rawHash = window.location.hash.replace("#", "").toLowerCase();
    const hash = rawHash === "achievements" ? "certifications" : rawHash;
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }

    const handleHashChange = () => {
      const currentRaw = window.location.hash.replace("#", "").toLowerCase();
      const currentHash = currentRaw === "achievements" ? "certifications" : currentRaw;
      if (currentHash && validTabs.includes(currentHash)) {
        setActiveTab(currentHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (tab) => {
    sounds.playClick();
    const targetTab = tab === "achievements" ? "certifications" : tab;
    setActiveTab(targetTab);
    window.location.hash = targetTab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case "home":
        return <HeroSection onNavigate={handleNavigate} />;
      case "education":
        return <EducationSection onNavigate={handleNavigate} />;
      case "certifications":
      case "achievements":
        return (
          <div className="achievements-page-stack">
            <CertificationsSection />
          </div>
        );
      default:
        return <HeroSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="portfolio-scroll-page">
      <div className="editorial-canvas-wrapper">
        {/* The Single Executive Card Frame */}
        <main className={`editorial-hero-card editorial-app-card page-view-${activeTab}`}>
          {/* Top Persistent Horizontal Navigation Dock */}
          <Navbar 
            activeTab={activeTab} 
            onNavigate={handleNavigate} 
            onToggleMenu={() => setIsMenuOpen(true)} 
          />

          {/* Active Page View */}
          <div className="editorial-page-view-container" key={activeTab}>
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Quick Menu Overlay Drawer */}
      <MenuOverlay 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
