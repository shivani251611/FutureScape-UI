import React, { useRef, useState, useEffect, useCallback } from "react";
import "./UploadPage.css";
import "./doodles.css";
import { Doodles, UPLOAD_SCATTER } from "./doodles";

/* Board validation */
function validateBoardImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratio = w / h;
      const errors = [];
      if (w < 400 || h < 400)
        errors.push("Image is too small (minimum 400 * 400 px). Make sure you're photographing the full board.");
      if (ratio > 3.5 || ratio < 0.28)
        errors.push("The aspect ratio doesn't look like a board photo. Please capture the full board from above.");
      if (file.size < 15000)
        errors.push("File size is very small. Please use a higher quality photo of the board.");
      URL.revokeObjectURL(img.src);
      resolve({ valid: errors.length === 0, errors, width: w, height: h });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ valid: false, errors: ["Could not read this image. Please try a different file."], width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}

/* Camera */
function Camera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setReady(true);
      })
      .catch(() => { if (!cancelled) setError("Camera access denied or not available."); });
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
        onCapture(file);
      }
    }, "image/png");
  }, [onCapture]);

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cam-close" onClick={onClose}>✕</button>
        {error ? (
          <div className="cam-error">
            <p>{error}</p>
            <button className="up-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
            {!ready && <div className="cam-loading">Starting camera…</div>}
            <div className="cam-controls">
              <button className="cam-shutter" onClick={snap} disabled={!ready}>
                <span className="cam-shutter-inner" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Upload Page */
export default function UploadPage({ onPreview }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [drag, setDrag] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejection, setRejection] = useState(null);
  const [processing, setProcessing] = useState(false);
  const browseRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  const accept = useCallback(async (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setRejection(null); setFile(null); setUrl(null); setValidating(true);
    const result = await validateBoardImage(f);
    setValidating(false);
    if (!result.valid) { setRejection({ errors: result.errors }); return; }
    const u = URL.createObjectURL(f);
    setFile(f); setUrl(u);
  }, []);

  const reset = () => { setFile(null); setUrl(null); setRejection(null); setValidating(false); };
  const handleCameraCapture = (capturedFile) => { setShowCamera(false); accept(capturedFile); };
  const handleProcess = async () => {
  if (!file) return;
  setProcessing(true);
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await fetch("http://localhost:5000/detect", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!data.detected) {
      alert("⚠️ " + data.message);
    } else {
      onPreview(file, url, data.boxes);
    }
  } catch (err) {
    alert("Could not connect to detection server. Make sure server.py is running.");
  } finally {
    setProcessing(false);
  }
};

  /* Window level drag & drop */
  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      setDrag(true);
    };
    const onDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setDrag(false);
      }
    };
    const onDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDrag(false);
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) accept(f);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [accept]);

  const renderContent = () => {
    if (validating) {
      return (
        <div className="up-drop">
          <div className="up-validating">
            <div className="up-spinner"></div>
            <div className="up-drophint">Checking your image…</div>
          </div>
        </div>
      );
    }
    if (rejection) {
      return (
        <div className="up-error-card">
          <div className="up-error-icon">⚠️</div>
          <div className="up-error-title">That doesn't look like a game board</div>
          {rejection.errors.map((e, i) => (<div className="up-error-msg" key={i}>{e}</div>))}
          <div className="up-btnrow" style={{ marginTop: 12 }}>
            <button className="up-btn" onClick={() => browseRef.current.click()}>⬆ Browse Image</button>
            <button className="up-btn ghost" onClick={() => { reset(); setShowCamera(true); }}>📷 Retake Photo</button>
          </div>
        </div>
      );
    }
    if (file) {
      return (
        <div className="up-drop">
            <div className="up-preview">
            <img className="up-thumb" src={url} alt="board capture" />
            <div className="up-filename">{file.name}</div>
            <div className="up-btnrow">
              <button className="up-btn ghost" onClick={reset}>↺ Choose another</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`up-drop${drag ? " drag" : ""}`}>
        <div className="up-dropicon">🖼️</div>
        <div className="up-droptitle">Drag &amp; drop your image</div>
        <div className="up-drophint">or browse / snap a photo</div>
        <div className="up-btnrow">
          <button className="up-btn" onClick={() => browseRef.current.click()}>⬆ Browse Image</button>
          <button className="up-btn ghost" onClick={() => setShowCamera(true)}>📷 Take Photo</button>
        </div>
      </div>
    );
  };

  return (
    <div className="up-page">
      {drag && <div className="up-drag-overlay">Drop your board photo here</div>}

      <Doodles scatter={UPLOAD_SCATTER} />
      <div className="up-inner">
        <p className="up-eyebrow">Step 01 — Capture</p>
        <h1 className="up-h1">Upload your board photo</h1>
        <p className="up-sub">
          Drag &amp; drop a snapshot of your FutureScape board, browse from your device, or use your camera to capture one fresh.
        </p>
        {renderContent()}
        <input
          ref={browseRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { if (e.target.files[0]) accept(e.target.files[0]); e.target.value = ""; }}
        />
        <div className="up-badges">
          {["PNG", "JPG / JPEG", "WEBP", "HEIC"].map((b) => (<span className="up-badge" key={b}>{b}</span>))}
        </div>
        <div className="up-cta">
          <button className="up-btn" disabled={!file || processing} onClick={handleProcess}>
           {processing ? "Detecting…" : "Process →"}
          </button>
        </div>
      </div>
      {showCamera && <Camera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
    </div>
  );
}
