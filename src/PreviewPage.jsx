import React, { useState, useEffect } from "react";
import "./PreviewPage.css";
import "./doodles.css";
import { Doodles, PREVIEW_SCATTER } from "./doodles";

/* PreviewPage */

export default function PreviewPage({ file, imageUrl, onBack, onNext }) {
  const [table, setTable] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [action, setAction] = useState("");

  const ready = table.trim() !== "" && year.trim() !== "";

  const submit = () => {
    if (!ready) return;
    onNext({ table: table.trim(), year: year.trim(), date, action: action.trim() });
  };

  return (
    <div className="pv-page">
      <Doodles scatter={PREVIEW_SCATTER} />

      <div className="pv-inner">
        <p className="pv-eyebrow">Step 02 — Verify</p>
        <h1 className="pv-h1">Preview of game board photo</h1>
        <p className="pv-sub">Confirm the snapshot below is sharp and complete. Add details, then continue.</p>

        <div className="pv-grid">
          {/* image */}
          <div className="pv-card pv-imgwrap">
            {imageUrl ? (
              <img className="pv-img" src={imageUrl} alt="board capture" />
            ) : (
              <span className="pv-empty">No image — go back and capture one.</span>
            )}
          </div>

          {/* metadata form */}
          <div className="pv-form">
            <div className="pv-row">
              <div className="pv-field">
                <label className="pv-label" htmlFor="pv-table">Table ID</label>
                <input id="pv-table" className="pv-input" type="text" placeholder="#4" value={table} onChange={(e) => setTable(e.target.value)} />
              </div>
              <div className="pv-field">
                <label className="pv-label" htmlFor="pv-year">Year (Round)</label>
                <input id="pv-year" className="pv-input" type="text" placeholder="2040" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>

            <div className="pv-field">
              <label className="pv-label" htmlFor="pv-date">Date Played</label>
              <input id="pv-date" className="pv-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="pv-field">
              <label className="pv-label" htmlFor="pv-action">Action / Environment Task</label>
              <input id="pv-action" className="pv-input" type="text" placeholder="e.g. Reforest wetland" value={action} onChange={(e) => setAction(e.target.value)} />
            </div>

            <div className="pv-infobox">
              <div className="pv-infobox-title">Looks good?</div>
              <div className="pv-infobox-text">
                If the previewed image isn't right, hit <strong>Previous</strong> to re-capture. Otherwise click <strong>Next</strong> to head to your board.
              </div>
            </div>
          </div>
        </div>

        {/* Run pipeline button */}
        <div className="pv-nav">
          <button className="pv-btn" disabled={!ready} onClick={submit}>Run pipeline</button>
        </div>

        {/* Previous and Next links */}
        <div className="pv-prevnext">
          <button className="pv-link" onClick={onBack}>← Previous</button>
          <button className="pv-link" onClick={() => onNext({})}>Next →</button>
        </div>
      </div>
    </div>
  );
}
