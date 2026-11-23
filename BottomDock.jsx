import React from "react";
import { ArrowUpRight, Search, RotateCcw } from "lucide-react";
import { sounds } from "../utils/audio";

export default function BottomDock({ 
  slides, 
  activeIndex, 
  onSelectSlide, 
  onOpenCaseStudy,
  onRotatePortrait
}) {
  const handleVisitClick = () => {
    sounds.playOpen();
    onOpenCaseStudy();
  };

  const handleThumbClick = (index) => {
    sounds.playSlide();
    onSelectSlide(index);
  };

  return (
    <footer className="card-bottom-bar" aria-label="Project dock and carousel">
      {/* Left Pitch-Black Capsule: 'more >' / 'Visit site ↗' */}
      <div 
        className="dock-left-block" 
        onClick={handleVisitClick}
        title="Explore full project case study & metrics"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleVisitClick();
        }}
      >
        <span className="dock-more-label">
          more &gt;
        </span>
        <div className="dock-visit-btn">
          <span>Visit site</span>
          <span className="dock-visit-icon">
            <ArrowUpRight size={18} strokeWidth={2.4} />
          </span>
        </div>
      </div>

      {/* Center Carousel Strip: Dark frosted glass dock with items */}
      <div className="dock-carousel-strip">
        <div className="carousel-items-track" role="tablist">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                className={`carousel-thumb-item ${isActive ? "active" : ""}`}
                onClick={() => handleThumbClick(idx)}
                title={`Switch to ${slide.thumbTitle}`}
              >
                {/* Circular Avatar */}
                <div className="carousel-avatar-wrapper">
                  <img 
                    src={slide.avatar} 
                    alt={slide.thumbTitle} 
                    className="carousel-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = "/aishwarya_studio.jpg";
                    }}
                  />
                </div>

                {/* Text meta */}
                <div className="carousel-text-meta">
                  <span className="carousel-title-line">
                    {slide.thumbTitle}
                  </span>
                  <span className="carousel-sub-line">
                    {slide.thumbSubtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Dock Controls: Active Dot & Action Button */}
        <div className="dock-right-controls">
          <div className="dock-pill-indicator" title="Active indicator" />
          <button 
            className="dock-action-btn" 
            onClick={() => {
              sounds.playClick();
              if (onRotatePortrait) onRotatePortrait();
            }}
            title="Toggle Studio / Original Portrait photo"
            aria-label="Toggle portrait photo"
          >
            <RotateCcw size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </footer>
  );
}
