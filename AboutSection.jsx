import React from "react";
import { personalInfo } from "../data/portfolioData";
import { Sparkles, Terminal, Code, Cpu, Target } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="portfolio-section reference-about-section">
      <div className="section-header-editorial">
        <span className="section-eyebrow">ABOUT ME</span>
        <h2 className="section-title-editorial">Beyond the Code</h2>
      </div>

      <div className="about-editorial-grid">
        {/* Left Column: Story & Vision */}
        <div className="about-narrative-card">
          <p className="narrative-lead-quote">
            "{personalInfo.bio}"
          </p>

          <div className="narrative-paragraphs">
            {personalInfo.aboutDetailed.map((paragraph, idx) => (
              <p key={idx} className="narrative-text">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="career-objective-callout">
            <div className="callout-icon">
              <Target size={20} />
            </div>
            <div className="callout-text">
              <strong>Career Objective:</strong> {personalInfo.careerObjective}
            </div>
          </div>
        </div>

        {/* Right Column: Key Pillars */}
        <div className="about-pillars-stack">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Terminal size={22} />
            </div>
            <div className="pillar-info">
              <h3 className="pillar-heading">Academic & Computational Rigor</h3>
              <p className="pillar-desc">
                Pursuing Bachelor of Engineering in CSE at <strong>{personalInfo.college}</strong> (2024–2028) with an outstanding <strong>{personalInfo.cgpa} CGPA</strong> and a strong foundation in core computer science principles.
              </p>
            </div>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Code size={22} />
            </div>
            <div className="pillar-info">
              <h3 className="pillar-heading">Algorithmic Problem Solving</h3>
              <p className="pillar-desc">
                Dedicated DSA practitioner with <strong>300+ LeetCode & HackerRank problems solved</strong> across trees, dynamic programming, graphs, and recursion.
              </p>
            </div>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Cpu size={22} />
            </div>
            <div className="pillar-info">
              <h3 className="pillar-heading">Intelligent Systems & Full Stack</h3>
              <p className="pillar-desc">
                Passionate about bridging backend computational logic with interactive modern web interfaces using React, Python, MySQL, and C++.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
