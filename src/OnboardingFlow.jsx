import React, { useState, useEffect } from "react";
import "./OnboardingFlow.css";
import "./doodles.css";
import { Doodles, ONBOARDING_SCATTER } from "./doodles";

/* OnboardingFlow Three screen intro for FutureScape */

const AUTO_MS = 10000;
const LAST = 2;

export default function OnboardingFlow({ onDone }) {
  const [step, setStep] = useState(0);

  // auto-advance after 10s if user doesn't click Next
  useEffect(() => {
    if (step >= LAST) return undefined;
    const t = setTimeout(() => setStep((s) => Math.min(LAST, s + 1)), AUTO_MS);
    return () => clearTimeout(t);
  }, [step]);

  const dots = (active) => (
    <div className="ob-dots">
      {[0, 1, 2].map((i) => (
        <i key={i} className={i === active ? "on" : ""} />
      ))}
    </div>
  );

  return (
    <div className="ob-root">
      <div className="ob-wordmark">
        <div className="ob-leaf">🌿</div>
        <span>FutureScape</span>
      </div>

      <Doodles scatter={ONBOARDING_SCATTER} />

      <div className="ob-stage">
        <div className="ob-deck">
          {/* Step 1 — Welcome */}
          <section className={`ob-step${step === 0 ? " ob-active" : ""}`}>
            {dots(0)}
            <p className="ob-eyebrow">Coastal North Carolina · 2030–2070</p>
            <h1>Welcome to FutureScape</h1>
            <p className="ob-body">
              Build North Carolina's coastal future, one turn at a time. Place
              pieces on the board, watch the land change, and see how every
              choice ripples across the map.
            </p>
            <div className="ob-nav">
              <button className="ob-skip" onClick={() => setStep(LAST)}>
                skip intro
              </button>
              <button className="ob-btn" onClick={() => setStep(1)}>
                Next →
              </button>
            </div>
          </section>

          {/* Step 2 — Facilitator */}
          <section className={`ob-step${step === 1 ? " ob-active" : ""}`}>
            {dots(1)}
            <p className="ob-eyebrow">Before you start</p>
            <h1>A quick note for facilitators</h1>
            <ol className="ob-list">
              <li>
                <span className="ob-num">1</span>
                <span>
                  Gather each table's board and confirm all pieces are sorted by
                  type before starting.
                </span>
              </li>
              <li>
                <span className="ob-num">2</span>
                <span>
                  Walk through one practice turn together so everyone understands
                  placement rules.
                </span>
              </li>
              <li>
                <span className="ob-num">3</span>
                <span>
                  Photograph the board at the end of every turn before pieces are
                  moved or added.
                </span>
              </li>
              <li>
                <span className="ob-num">4</span>
                <span>
                  Note the table number and time period (2030–2070) when
                  uploading each photo.
                </span>
              </li>
            </ol>
            <div className="ob-nav">
              <button className="ob-btn ob-back" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button className="ob-btn" onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          </section>

          {/* Step 3 — Let's start */}
          <section className={`ob-step${step === 2 ? " ob-active" : ""}`}>
            {dots(2)}
            <p className="ob-eyebrow">You're all set</p>
            <h1>Let's start</h1>
            <p className="ob-body">
              Time to capture your first board. Get ready — your table's turn is
              up.
            </p>
            <div className="ob-nav">
              <button className="ob-btn ob-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="ob-btn" onClick={() => onDone && onDone()}>
                Begin →
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
