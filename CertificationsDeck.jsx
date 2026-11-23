import React, { useState, useEffect, useRef } from "react";
import certificationsData from "../data/certifications.json";
import { IssuerLogo } from "./IssuerLogos";
import { 
  Award, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Calendar, 
  Eye, 
  X,
  Layers
} from "lucide-react";
import { sounds } from "../utils/audio";
import "./CertificationsDeck.css";

// Fixed positions for the 7 logos inside the deck badge cluster
const CLUSTER_POSITIONS = [
  { top: "6px", left: "16px", rotate: -10, zIndex: 3 },
  { top: "4px", right: "16px", rotate: 8, zIndex: 4 },
  { bottom: "8px", left: "14px", rotate: 12, zIndex: 2 },
  { bottom: "6px", right: "14px", rotate: -8, zIndex: 5 },
  { top: "-6px", left: "84px", rotate: 3, zIndex: 6 },
  { bottom: "-6px", left: "84px", rotate: -4, zIndex: 1 },
  { top: "54px", left: "84px", rotate: 0, zIndex: 8 },
];

export default function CertificationsDeck() {
  const [isSpread, setIsSpread] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flyingLogos, setFlyingLogos] = useState([]);
  const [settledCards, setSettledCards] = useState(new Set());
  const [selectedCert, setSelectedCert] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const deckRef = useRef(null);
  const deckLogoRefs = useRef({});
  const cardRefs = useRef({});
  const cardBadgeRefs = useRef({});
  const animationFrameRef = useRef(null);

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Keyboard accessibility for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedCert) {
        setSelectedCert(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCert]);

  // Cubic bezier ease-out approximation for organic motion
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // Spread the deck into the responsive grid (FLIP animation)
  const handleSpreadDeck = () => {
    if (isAnimating || isSpread) return;
    sounds.playClick();

    if (reducedMotion) {
      setIsSpread(true);
      setSettledCards(new Set(certificationsData.map((c) => c.id)));
      return;
    }

    // 1. Capture origin positions of all logos on the deck
    const origins = {};
    certificationsData.forEach((cert) => {
      const el = deckLogoRefs.current[cert.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        origins[cert.id] = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        };
      } else if (deckRef.current) {
        const dRect = deckRef.current.getBoundingClientRect();
        origins[cert.id] = {
          x: dRect.left + dRect.width / 2 - 24,
          y: dRect.top + dRect.height / 2 - 24,
          width: 48,
          height: 48,
        };
      }
    });

    setIsSpread(true);
    setIsAnimating(true);
    setSettledCards(new Set());

    // 2. Wait one animation tick for grid to render so destination badges exist
    requestAnimationFrame(() => {
      const destinations = {};
      certificationsData.forEach((cert) => {
        const targetEl = cardBadgeRefs.current[cert.id];
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          destinations[cert.id] = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          };
        }
      });

      // 3. Launch flying logo projectiles along curved trajectories
      const startTime = performance.now();
      const duration = 750; // ms
      const staggerDelay = 55; // ms per card

      const activeFlying = certificationsData.map((cert, idx) => {
        const origin = origins[cert.id] || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const dest = destinations[cert.id] || origin;
        const dx = dest.x - origin.x;
        const dy = dest.y - origin.y;
        const arcHeight = Math.min(180, Math.max(70, Math.abs(dx) * 0.22));

        return {
          cert,
          idx,
          origin,
          dest,
          arcHeight,
          delay: idx * staggerDelay,
          currentX: origin.x,
          currentY: origin.y,
          currentScale: 1,
          currentRotate: (idx % 2 === 0 ? 1 : -1) * (15 - idx * 3),
          opacity: 1,
          isDone: false,
        };
      });

      setFlyingLogos(activeFlying);

      // Animation Loop with requestAnimationFrame
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        let allCompleted = true;
        const newSettled = new Set();

        const updated = activeFlying.map((item) => {
          const itemElapsed = elapsed - item.delay;

          if (itemElapsed <= 0) {
            allCompleted = false;
            return {
              ...item,
              currentX: item.origin.x,
              currentY: item.origin.y,
              opacity: 0.95,
            };
          }

          const rawProgress = Math.min(1, itemElapsed / duration);
          const t = easeOutCubic(rawProgress);

          if (rawProgress < 1) {
            allCompleted = false;
            const x = item.origin.x + (item.dest.x - item.origin.x) * t;
            // Upward parabolic arc
            const yArc = -item.arcHeight * Math.sin(t * Math.PI);
            const y = item.origin.y + (item.dest.y - item.origin.y) * t + yArc;
            // Slight scale up mid-flight and settle
            const scale = 1.0 + 0.22 * Math.sin(t * Math.PI);
            const rotate = item.currentRotate * (1 - t);

            return {
              ...item,
              currentX: x,
              currentY: y,
              currentScale: scale,
              currentRotate: rotate,
              opacity: 1,
            };
          } else {
            // Reached destination!
            newSettled.add(item.cert.id);
            return {
              ...item,
              currentX: item.dest.x,
              currentY: item.dest.y,
              currentScale: 1,
              currentRotate: 0,
              opacity: 0, // Hidden once landed
              isDone: true,
            };
          }
        });

        setFlyingLogos(updated);
        setSettledCards((prev) => new Set([...prev, ...newSettled]));

        if (!allCompleted) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Finished flight!
          setIsAnimating(false);
          setFlyingLogos([]);
          setSettledCards(new Set(certificationsData.map((c) => c.id)));
          sounds.playSuccess();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    });
  };

  // Stack all cards back into the center deck
  const handleStackBack = () => {
    if (isAnimating || !isSpread) return;
    sounds.playClick();

    if (reducedMotion) {
      setIsSpread(false);
      setSettledCards(new Set());
      return;
    }

    setIsAnimating(true);
    setSettledCards(new Set());

    // Fade cards and smoothly collapse to deck
    setTimeout(() => {
      setIsSpread(false);
      setIsAnimating(false);
      setFlyingLogos([]);
      sounds.playClick();
    }, 450);
  };

  // Open Certificate in Lightbox
  const handleOpenLightbox = (cert) => {
    sounds.playClick();
    setSelectedCert(cert);
  };

  const handleCloseLightbox = () => {
    sounds.playClick();
    setSelectedCert(null);
  };

  return (
    <section className="cert-deck-page-wrapper" aria-label="Certifications Gallery">
      {/* Top-Right Action Controls when Grid is Spread (Minimal Vertical Space) */}
      {isSpread && (
        <div className="cert-top-controls-bar">
          <div className="cert-header-actions">
            <span className="cert-count-badge">
              {certificationsData.length} Credentials
            </span>
            <button
              className="cert-stack-back-btn"
              onClick={handleStackBack}
              disabled={isAnimating}
              title="Return cards to the deck"
              aria-label="Stack certifications back into deck"
            >
              <RotateCcw size={15} />
              <span>Stack them back</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          STATE 1: THE FLOATING 3D CARD DECK
          =================================================================== */}
      {!isSpread && (
        <div className="deck-stage-container">
          <div
            ref={deckRef}
            className="deck-interactive-stack"
            onClick={handleSpreadDeck}
            role="button"
            tabIndex={0}
            aria-label="Interactive Certifications Deck. Tap to explore."
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSpreadDeck();
              }
            }}
          >
            {/* 3D Stacked backing cards with realistic angle offsets */}
            <div className="deck-backing-card deck-backing-3" aria-hidden="true" />
            <div className="deck-backing-card deck-backing-2" aria-hidden="true" />
            <div className="deck-backing-card deck-backing-1" aria-hidden="true" />

            {/* Main Front Cover Card */}
            <div className="deck-front-card">
              <div className="deck-card-top-header">
                <div className="deck-card-eyebrow">PORTFOLIO VAULT</div>
                <h3 className="deck-card-title">My Certifications</h3>
                <p className="deck-card-subtitle">
                  Oracle, Red Hat, Cisco, CodeChef & NCET
                </p>
              </div>

              {/* Symmetrical Badge Cluster in Card Center */}
              <div className="deck-badge-cluster">
                {certificationsData.map((cert, idx) => {
                  const pos = CLUSTER_POSITIONS[idx] || CLUSTER_POSITIONS[0];
                  return (
                    <div
                      key={cert.id}
                      ref={(el) => (deckLogoRefs.current[cert.id] = el)}
                      className="cluster-logo-wrapper"
                      style={{
                        top: pos.top,
                        bottom: pos.bottom,
                        left: pos.left,
                        right: pos.right,
                        transform: `rotate(${pos.rotate}deg)`,
                        zIndex: pos.zIndex,
                      }}
                      title={`${cert.title} (${cert.issuerShort})`}
                    >
                      <div className="cluster-logo-item">
                        <IssuerLogo
                          logoKey={cert.logoKey}
                          issuerShort={cert.issuerShort}
                          size={36}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Center Cluster Sparkle Accent */}
                <div className="cluster-center-badge" aria-hidden="true">
                  <Sparkles size={18} />
                </div>
              </div>

              {/* Bottom Interactive Tap Hint */}
              <div className="deck-explore-pill">
                <span className="pill-sparkle">✨</span>
                <span>Tap to explore deck</span>
                <span className="pill-sparkle">→</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          STATE 2: THE RESPONSIVE CERTIFICATIONS GRID
          =================================================================== */}
      {isSpread && (
        <div className="cert-grid-layout">
          {certificationsData.map((cert, idx) => {
            const isSettled = settledCards.has(cert.id) || reducedMotion;

            return (
              <article
                key={cert.id}
                ref={(el) => (cardRefs.current[cert.id] = el)}
                className={`cert-grid-card ${isSettled ? "is-card-settled" : ""}`}
                onClick={() => handleOpenLightbox(cert)}
                tabIndex={0}
                role="button"
                aria-label={`View full certificate for ${cert.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenLightbox(cert);
                  }
                }}
              >
                {/* Certificate Thumbnail Preview Container */}
                <div className="cert-card-preview-wrapper">
                  <img
                    src={cert.image}
                    alt={`${cert.title} Certificate`}
                    className="cert-card-img"
                    loading="lazy"
                  />
                  <div className="cert-hover-zoom-overlay">
                    <Eye size={17} />
                    <span>View Certificate</span>
                  </div>

                  {/* Corner Issuer Logo Badge: Where Flying Logo Lands */}
                  <div
                    ref={(el) => (cardBadgeRefs.current[cert.id] = el)}
                    className={`cert-card-badge-target ${isSettled ? "has-bounced" : ""}`}
                    title={cert.issuer}
                    aria-label={`${cert.issuer} Badge`}
                  >
                    <IssuerLogo
                      logoKey={cert.logoKey}
                      issuerShort={cert.issuerShort}
                      size={34}
                    />
                  </div>
                </div>

                {/* Card Meta & Header */}
                <div className="cert-card-meta-top">
                  <span className="cert-status-pill">{cert.date}</span>
                  <span className="cert-id-tag">
                    <ShieldCheck size={12} style={{ display: "inline", marginRight: "3px" }} />
                    {cert.credentialId}
                  </span>
                </div>

                <h3 className="cert-card-title">{cert.title}</h3>
                <div className="cert-card-issuer">{cert.issuer}</div>

                {/* "What I Learned" Key Points List (Streamlined to 2 punchy takeaways) */}
                <div className="cert-learned-section">
                  <div className="cert-learned-heading">
                    <Award size={13} className="cert-learned-heading-icon" />
                    <span>What I Learned</span>
                  </div>
                  <ul className="cert-learned-list">
                    {cert.learnedPoints.slice(0, 2).map((point, pIdx) => (
                      <li
                        key={pIdx}
                        className={`cert-learned-item ${isSettled ? "is-visible" : ""}`}
                        style={{
                          transitionDelay: isSettled ? `${pIdx * 70 + 80}ms` : "0ms",
                        }}
                      >
                        <span className="cert-learned-dot" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Actions Row */}
                <div className="cert-card-bottom-actions">
                  <button
                    className="cert-view-modal-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLightbox(cert);
                    }}
                    title="Open certificate in full resolution"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>

                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-verify-link-btn"
                    onClick={(e) => e.stopPropagation()}
                    title="Verify credential online"
                  >
                    <span>Verify</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          3. FLYING LOGOS OVERLAY PORTAL (FLIP TRAJECTORIES)
          =================================================================== */}
      {flyingLogos.length > 0 && (
        <div className="flying-logos-overlay-portal" aria-hidden="true">
          {flyingLogos.map((item) => {
            if (item.opacity <= 0) return null;
            return (
              <div
                key={item.cert.id}
                className="flying-logo-projectile"
                style={{
                  transform: `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(${item.currentScale}) rotate(${item.currentRotate}deg)`,
                  opacity: item.opacity,
                }}
              >
                <IssuerLogo
                  logoKey={item.cert.logoKey}
                  issuerShort={item.cert.issuerShort}
                  size={34}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          4. HIGH RESOLUTION LIGHTBOX MODAL
          =================================================================== */}
      {selectedCert && (
        <div
          className="cert-lightbox-backdrop"
          onClick={handleCloseLightbox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          <div
            className="cert-lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cert-lightbox-header">
              <div className="cert-lightbox-header-left">
                <IssuerLogo
                  logoKey={selectedCert.logoKey}
                  issuerShort={selectedCert.issuerShort}
                  size={32}
                />
                <div>
                  <h3 id="lightbox-title" className="cert-lightbox-title">
                    {selectedCert.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {selectedCert.issuer} • {selectedCert.credentialId}
                  </div>
                </div>
              </div>

              <button
                className="cert-lightbox-close-btn"
                onClick={handleCloseLightbox}
                aria-label="Close certificate lightbox"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="cert-lightbox-body">
              <img
                src={selectedCert.image}
                alt={`${selectedCert.title} High Resolution Certificate`}
                className="cert-lightbox-full-img"
              />
            </div>

            {/* Modal Footer */}
            <div className="cert-lightbox-footer">
              <div className="cert-lightbox-credential-meta">
                Verified Credential ID: <strong>{selectedCert.credentialId}</strong>
              </div>

              <a
                href={selectedCert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-lightbox-verify-btn"
                onClick={() => sounds.playClick()}
                title="Verify on official issuer portal"
              >
                <span>Verify Credential Online</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

