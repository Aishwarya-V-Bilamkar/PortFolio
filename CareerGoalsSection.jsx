import React from "react";
import { personalInfo } from "../data/portfolioData";
import { Compass, Sparkles, Building2, Terminal, Code2, Rocket } from "lucide-react";

export default function CareerGoalsSection() {
  const { careerGoals } = personalInfo;

  return (
    <section className="portfolio-section reference-career-goals-section">
      <div className="section-header-editorial">
        <span className="section-eyebrow">AMBITION & TRAJECTORY</span>
        <h2 className="section-title-editorial">{careerGoals.heading}</h2>
      </div>

      <div className="career-goals-container">
        {/* Central Vision Statement */}
        <div className="goals-statement-banner">
          <div className="goals-sparkle-badge">
            <Sparkles size={18} />
            <span>Target Role: Software Development Engineer (SDE)</span>
          </div>
          <blockquote className="goals-quote-text">
            "{careerGoals.statement}"
          </blockquote>
          <p className="goals-subtext">
            Eager to contribute high-impact engineering solutions, solve mission-critical computational challenges, and innovate alongside world-class engineering teams at premier product-based organizations.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="goals-pillars-grid">
          {careerGoals.focusAreas.map((area, idx) => (
            <div key={idx} className="goal-pillar-item">
              <div className="goal-pillar-num">0{idx + 1}</div>
              <h3 className="goal-pillar-title">{area.title}</h3>
              <p className="goal-pillar-desc">{area.desc}</p>
            </div>
          ))}
        </div>

        {/* Target Organizations Tag Ribbon */}
        <div className="target-companies-ribbon">
          <div className="ribbon-label">
            <Building2 size={16} />
            <span>Target Product Organizations & Technology Hubs:</span>
          </div>
          <div className="ribbon-chips">
            <span className="company-chip">Microsoft</span>
            <span className="company-chip">Google</span>
            <span className="company-chip">Amazon</span>
            <span className="company-chip">Adobe</span>
            <span className="company-chip">Oracle</span>
            <span className="company-chip">High-Growth Tech Startups</span>
          </div>
        </div>
      </div>
    </section>
  );
}

