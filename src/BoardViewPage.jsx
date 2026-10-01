import React, { useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import "./BoardViewPage.css";
import "./doodles.css";
import { Doodles } from "./doodles";

/*    BOARD LAYOUT — 32 rows × 22 columns, 435 hexes */
const ROW_ORDER = [
  "AG","AF","AE","AD","AC","AB","AA","Z","Y","X","W","V","U","T",
  "S","R","Q","P","O","N","M","L","K","J","I","H","G","F","E","D","C","B"
];
const RI = Object.fromEntries(ROW_ORDER.map((r, i) => [r, i]));

const ALL_IDS = "AG-6,AG-7,AG-8,AG-9,AG-10,AG-11,AF-5,AF-6,AF-7,AF-8,AF-9,AF-10,AF-11,AF-12,AE-2,AE-3,AE-4,AE-5,AE-6,AE-7,AE-8,AE-9,AE-10,AE-11,AE-12,AD-1,AD-2,AD-3,AD-4,AD-5,AD-6,AD-7,AD-8,AD-9,AD-10,AD-11,AD-12,AD-13,AC-1,AC-2,AC-3,AC-4,AC-5,AC-6,AC-7,AC-8,AC-9,AC-10,AC-11,AC-12,AC-13,AB-2,AB-3,AB-4,AB-5,AB-6,AB-7,AB-8,AB-9,AB-10,AB-11,AB-12,AB-13,AB-14,AB-15,AA-1,AA-2,AA-3,AA-4,AA-5,AA-6,AA-7,AA-8,AA-9,AA-10,AA-11,AA-12,AA-13,AA-14,AA-15,Z-2,Z-3,Z-4,Z-5,Z-6,Z-7,Z-8,Z-9,Z-10,Z-11,Z-12,Z-13,Z-14,Z-15,Z-16,Y-1,Y-2,Y-3,Y-4,Y-5,Y-6,Y-7,Y-8,Y-9,Y-10,Y-11,Y-12,Y-13,Y-14,Y-15,Y-16,X-2,X-3,X-4,X-5,X-6,X-7,X-8,X-9,X-10,X-11,X-12,X-13,X-14,X-15,X-16,X-17,W-1,W-2,W-3,W-4,W-5,W-6,W-7,W-8,W-9,W-10,W-11,W-12,W-13,W-14,W-15,W-16,V-2,V-3,V-4,V-5,V-6,V-7,V-8,V-9,V-10,V-11,V-12,V-13,V-14,V-15,V-16,V-17,U-1,U-2,U-3,U-4,U-5,U-6,U-7,U-8,U-9,U-10,U-11,U-12,U-13,U-14,U-15,U-16,T-2,T-3,T-4,T-5,T-6,T-7,T-8,T-9,T-10,T-11,T-12,T-13,T-14,T-15,T-16,T-17,S-1,S-2,S-3,S-4,S-5,S-6,S-7,S-8,S-9,S-10,S-11,S-12,S-13,S-14,S-15,S-16,S-17,R-2,R-3,R-4,R-5,R-6,R-7,R-8,R-9,R-10,R-11,R-12,R-13,R-14,R-15,R-16,R-17,R-18,Q-1,Q-2,Q-3,Q-4,Q-5,Q-6,Q-7,Q-8,Q-9,Q-10,Q-11,Q-12,Q-13,Q-14,Q-15,Q-16,Q-17,Q-18,Q-19,P-2,P-3,P-4,P-5,P-6,P-7,P-8,P-9,P-10,P-11,P-12,P-13,P-14,P-15,P-16,P-17,P-18,P-19,P-20,O-1,O-2,O-3,O-4,O-5,O-6,O-7,O-8,O-9,O-10,O-11,O-12,O-13,O-14,O-15,O-16,O-17,O-18,O-19,O-20,O-21,O-22,N-4,N-5,N-6,N-7,N-8,N-9,N-10,N-11,N-12,N-13,N-14,N-15,N-16,N-17,N-18,N-19,N-20,N-21,N-22,M-5,M-6,M-7,M-8,M-9,M-10,M-11,M-12,M-13,M-14,M-15,M-16,M-17,M-18,M-19,M-20,M-21,L-7,L-8,L-9,L-10,L-11,L-12,L-13,L-14,L-15,L-16,L-17,L-18,L-19,L-20,L-21,L-22,K-7,K-8,K-9,K-10,K-11,K-12,K-13,K-14,K-15,K-16,K-17,K-18,K-19,K-20,K-21,J-8,J-9,J-10,J-11,J-12,J-13,J-14,J-15,J-16,J-17,J-18,J-19,J-20,J-21,J-22,I-9,I-10,I-11,I-12,I-13,I-14,I-15,I-16,I-17,I-18,I-19,I-20,I-21,H-10,H-11,H-12,H-13,H-14,H-15,H-16,H-17,H-18,H-19,H-20,H-21,G-9,G-10,G-11,G-12,G-13,G-14,G-15,G-16,G-17,G-18,G-19,G-20,F-10,F-11,F-12,F-13,F-14,F-15,F-16,F-17,F-18,F-19,E-11,E-12,E-13,E-14,E-15,E-16,E-17,E-18,D-12,D-13,D-14,D-15,D-16,D-17,C-13,C-14,C-15,C-16,B-14,B-15,B-16".split(",");

/*  435 hexes: 144 Agriculture - 143 Wetland - 78 Forest - 54 Water - 16 Developed */

const T_KEY = { d: "Developed", f: "Forest", a: "Agriculture", w: "Wetland", W: "Water" };
const TERRAIN_RAW = {
"AG-6":"W","AG-7":"W","AG-8":"W","AG-9":"W","AG-10":"W","AG-11":"W",
"AF-5":"W","AF-6":"W","AF-7":"w","AF-8":"w","AF-9":"d","AF-10":"w","AF-11":"d","AF-12":"W",
"AE-2":"W","AE-3":"W","AE-4":"W","AE-5":"d","AE-6":"w","AE-7":"W","AE-8":"W","AE-9":"W","AE-10":"W","AE-11":"w","AE-12":"W",
"AD-1":"W","AD-2":"W","AD-3":"d","AD-4":"w","AD-5":"w","AD-6":"w","AD-7":"w","AD-8":"w","AD-9":"w","AD-10":"W","AD-11":"W","AD-12":"w","AD-13":"W",
"AC-1":"w","AC-2":"w","AC-3":"w","AC-4":"W","AC-5":"W","AC-6":"w","AC-7":"w","AC-8":"w","AC-9":"w","AC-10":"W","AC-11":"W","AC-12":"w","AC-13":"W",
"AB-2":"w","AB-3":"w","AB-4":"w","AB-5":"W","AB-6":"w","AB-7":"w","AB-8":"w","AB-9":"a","AB-10":"w","AB-11":"W","AB-12":"W","AB-13":"w","AB-14":"W","AB-15":"W",
"AA-1":"a","AA-2":"a","AA-3":"a","AA-4":"a","AA-5":"W","AA-6":"w","AA-7":"w","AA-8":"w","AA-9":"a","AA-10":"w","AA-11":"W","AA-12":"W","AA-13":"w","AA-14":"w","AA-15":"W",
"Z-2":"a","Z-3":"a","Z-4":"a","Z-5":"w","Z-6":"w","Z-7":"w","Z-8":"w","Z-9":"w","Z-10":"w","Z-11":"w","Z-12":"W","Z-13":"W","Z-14":"w","Z-15":"w","Z-16":"W",
"Y-1":"w","Y-2":"w","Y-3":"a","Y-4":"a","Y-5":"w","Y-6":"a","Y-7":"w","Y-8":"w","Y-9":"w","Y-10":"w","Y-11":"w","Y-12":"W","Y-13":"w","Y-14":"a","Y-15":"w","Y-16":"W",
"X-2":"f","X-3":"a","X-4":"a","X-5":"a","X-6":"a","X-7":"a","X-8":"a","X-9":"w","X-10":"f","X-11":"w","X-12":"w","X-13":"f","X-14":"w","X-15":"a","X-16":"w","X-17":"W",
"W-1":"f","W-2":"w","W-3":"a","W-4":"a","W-5":"f","W-6":"w","W-7":"a","W-8":"a","W-9":"a","W-10":"w","W-11":"w","W-12":"w","W-13":"f","W-14":"w","W-15":"w","W-16":"W",
"V-2":"f","V-3":"f","V-4":"a","V-5":"f","V-6":"w","V-7":"w","V-8":"f","V-9":"f","V-10":"f","V-11":"f","V-12":"w","V-13":"w","V-14":"f","V-15":"w","V-16":"d","V-17":"W",
"U-1":"f","U-2":"f","U-3":"f","U-4":"f","U-5":"f","U-6":"w","U-7":"f","U-8":"f","U-9":"w","U-10":"f","U-11":"f","U-12":"w","U-13":"f","U-14":"w","U-15":"w","U-16":"W",
"T-2":"a","T-3":"f","T-4":"f","T-5":"w","T-6":"w","T-7":"a","T-8":"f","T-9":"w","T-10":"w","T-11":"w","T-12":"w","T-13":"f","T-14":"w","T-15":"w","T-16":"d","T-17":"W",
"S-1":"a","S-2":"a","S-3":"f","S-4":"w","S-5":"w","S-6":"a","S-7":"a","S-8":"a","S-9":"a","S-10":"a","S-11":"w","S-12":"f","S-13":"f","S-14":"w","S-15":"f","S-16":"w","S-17":"W",
"R-2":"a","R-3":"a","R-4":"w","R-5":"a","R-6":"a","R-7":"a","R-8":"a","R-9":"d","R-10":"a","R-11":"a","R-12":"w","R-13":"w","R-14":"w","R-15":"d","R-16":"f","R-17":"w","R-18":"W",
"Q-1":"f","Q-2":"a","Q-3":"w","Q-4":"a","Q-5":"a","Q-6":"a","Q-7":"a","Q-8":"a","Q-9":"a","Q-10":"a","Q-11":"a","Q-12":"a","Q-13":"w","Q-14":"a","Q-15":"f","Q-16":"w","Q-17":"w","Q-18":"W","Q-19":"W",
"P-2":"f","P-3":"a","P-4":"a","P-5":"a","P-6":"a","P-7":"a","P-8":"a","P-9":"a","P-10":"a","P-11":"a","P-12":"a","P-13":"a","P-14":"a","P-15":"f","P-16":"f","P-17":"w","P-18":"w","P-19":"w","P-20":"W",
"O-1":"f","O-2":"f","O-3":"f","O-4":"a","O-5":"a","O-6":"a","O-7":"a","O-8":"a","O-9":"a","O-10":"a","O-11":"a","O-12":"a","O-13":"a","O-14":"a","O-15":"w","O-16":"w","O-17":"w","O-18":"w","O-19":"d","O-20":"W","O-21":"W","O-22":"W",
"N-4":"f","N-5":"f","N-6":"a","N-7":"a","N-8":"d","N-9":"a","N-10":"a","N-11":"a","N-12":"a","N-13":"a","N-14":"a","N-15":"a","N-16":"w","N-17":"f","N-18":"w","N-19":"w","N-20":"d","N-21":"w","N-22":"w",
"M-5":"f","M-6":"a","M-7":"a","M-8":"a","M-9":"a","M-10":"a","M-11":"a","M-12":"a","M-13":"a","M-14":"f","M-15":"a","M-16":"f","M-17":"f","M-18":"w","M-19":"f","M-20":"w","M-21":"w",
"L-7":"f","L-8":"a","L-9":"a","L-10":"a","L-11":"a","L-12":"a","L-13":"a","L-14":"a","L-15":"f","L-16":"f","L-17":"f","L-18":"w","L-19":"f","L-20":"w","L-21":"f","L-22":"d",
"K-7":"f","K-8":"f","K-9":"a","K-10":"w","K-11":"a","K-12":"a","K-13":"a","K-14":"a","K-15":"w","K-16":"w","K-17":"w","K-18":"f","K-19":"w","K-20":"w","K-21":"f",
"J-8":"f","J-9":"f","J-10":"a","J-11":"a","J-12":"a","J-13":"a","J-14":"a","J-15":"w","J-16":"w","J-17":"w","J-18":"f","J-19":"w","J-20":"w","J-21":"w","J-22":"d",
"I-9":"a","I-10":"a","I-11":"a","I-12":"a","I-13":"a","I-14":"w","I-15":"w","I-16":"f","I-17":"a","I-18":"f","I-19":"w","I-20":"w","I-21":"w",
"H-10":"a","H-11":"f","H-12":"a","H-13":"a","H-14":"w","H-15":"w","H-16":"w","H-17":"a","H-18":"a","H-19":"a","H-20":"w","H-21":"w",
"G-9":"f","G-10":"f","G-11":"f","G-12":"d","G-13":"d","G-14":"a","G-15":"a","G-16":"w","G-17":"w","G-18":"a","G-19":"a","G-20":"a",
"F-10":"f","F-11":"f","F-12":"f","F-13":"d","F-14":"a","F-15":"a","F-16":"a","F-17":"a","F-18":"w","F-19":"w",
"E-11":"f","E-12":"f","E-13":"f","E-14":"a","E-15":"a","E-16":"a","E-17":"a","E-18":"w",
"D-12":"f","D-13":"f","D-14":"a","D-15":"a","D-16":"a","D-17":"a",
"C-13":"f","C-14":"w","C-15":"a","C-16":"a",
"B-14":"f","B-15":"w","B-16":"a"
};
const TERRAIN = Object.fromEntries(Object.entries(TERRAIN_RAW).map(([k,v]) => [k, T_KEY[v]]));

/* Colors for the hexes */
const TCOLOR = {
  Developed:   "#8A8D9E",
  Forest:      "#5C7B5E",
  Agriculture: "#FFCB77",
  Wetland:     "#634749",
  Water:       "#0C4767",
};

/* HEX GEOMETRY (D3) - diagonal layout */
const HS = 18;                        // hex radius 
const XSPACE = 1.5 * HS;              // horizontal step per letter-column
const YSPACE = (Math.sqrt(3) / 2) * HS; // vertical step per half-row
const PAD = 24;

/* Flat-top hexagon path centred on (0,0) */
const HEX_PATH = d3.line().curve(d3.curveLinearClosed)(
  d3.range(6).map(i => {
    const a = (Math.PI / 3) * i;
    return [HS * Math.cos(a), HS * Math.sin(a)];
  })
);

function parseId(id) {
  const d = id.lastIndexOf("-");
  return [id.slice(0, d), parseInt(id.slice(d + 1))];
}

function hexCenter(row, col) {
  const k = 31 - RI[row];
  const m = 2 * (col - 1) + (k % 2 === 0 ? -1 : 0);
  return [PAD + k * XSPACE, PAD + (m + 1) * YSPACE];
}

const GEO_SEEDS = {
  "AD-5":"South Rosemary","AD-6":"South Rosemary",
  "AA-8":"Rocky Mount","Z-8":"Rocky Mount","Z-9":"Rocky Mount",
  "W-10":"Greenville","V-10":"Greenville","V-11":"Greenville",
  "R-5":"Fayetteville","R-6":"Fayetteville","S-5":"Fayetteville","S-6":"Fayetteville",
  "Q-14":"New Bern","Q-15":"New Bern","P-15":"New Bern",
  "N-8":"Lumberton","O-8":"Lumberton",
  "N-17":"Morehead City","N-18":"Morehead City",
  "I-17":"Wilmington","I-18":"Wilmington","H-17":"Wilmington","J-17":"Wilmington",
  "AC-12":"Nags Head",
};

/* For each town, we take the (x, y) positions of its few seed hexes and average them 
 //this gives one single point per town: its centroid
//for each of the 435 hexes, we measure the straight-line distance from that hex to all
// 9 town anchors, and assign the hex to whichever town is closest
//every hex gets claimed by whichever town's sign is physically closest to it on the printed board.
const GEO_LABELS = (() => {
  const townCentroids = {};
  const counts = {};
  for (const [id, town] of Object.entries(GEO_SEEDS)) {
    const [row, col] = parseId(id);
    const [x, y] = hexCenter(row, col);
    if (!townCentroids[town]) { townCentroids[town] = [0, 0]; counts[town] = 0; }
    townCentroids[town][0] += x; townCentroids[town][1] += y; counts[town]++;
  }
  for (const t in townCentroids) {
    townCentroids[t][0] /= counts[t]; townCentroids[t][1] /= counts[t];
  }

  const result = {};
  for (const id of ALL_IDS) {
    const [row, col] = parseId(id);
    const [x, y] = hexCenter(row, col);
    let best = null, bestD = Infinity;
    for (const [t, [tx, ty]] of Object.entries(townCentroids)) {
      const d = (x - tx) ** 2 + (y - ty) ** 2;
      if (d < bestD) { bestD = d; best = t; }
    }
    result[id] = best;
  }
  return result;
})();

/* PIECE DATA */
const PIECE_KEYS = [
  { key: "aquatic_life",             label: "Aquatic Life",             color: "#2471A3" },
  { key: "wildlife",                 label: "Wildlife",                 color: "#2E8B57" },
  { key: "population_resilient_more",label: "More Resilient Population",color: "#1a4a2e" },
  { key: "population_resilient_less",label: "Less Resilient Population",color: "#c0392b" },
  { key: "military_installation",    label: "Military Installation",    color: "#4a4a4a" },
  { key: "yellow_agriculture_piece", label: "Agribusiness Centers",     color: "#B8860B" },
  { key: "site_intervention",        label: "Site Intervention",        color: "#8E44AD" },
];

function totalPieces(d) {
  if (!d) return 0;
  return PIECE_KEYS.reduce((s, p) => s + (d[p.key] || 0), 0);
}

function dominantColor(d) {
  if (!d) return null;
  let best = null, max = 0;
  PIECE_KEYS.forEach(p => { if ((d[p.key] || 0) > max) { max = d[p.key]; best = p.color; } });
  return best;
}

/* Data — Need to replace with real API calls */
function checkBoardAvailability(tableNum, year) {
  const MOCK_AVAILABLE = {
    "1-2030": true, "1-2040": true, "1-2050": true,
    "2-2030": true, "2-2040": true,
    "3-2030": true,
  };
  return !!MOCK_AVAILABLE[`${tableNum}-${year}`];
}

function fetchPieceData(tableNum, year) {
  return {};
}

/* CONSTANTS */
const YEARS = [2030, 2040, 2050, 2060, 2070];
const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

const BV_SCATTER = [
  { t: "fish", c: "#6B7568", x: 3, y: 8, s: 44, r: -10, o: 0.45 },
  { t: "bird", c: "#2C5A36", x: 88, y: 5, s: 40, r: 8, o: 0.5 },
  { t: "sprout", c: "#D4845A", x: 7, y: 55, s: 36, r: -6, o: 0.4 },
  { t: "leaf", c: "#2C5A36", x: 92, y: 42, s: 28, r: 20, o: 0.45 },
  { t: "fish", c: "#D4A843", x: 14, y: 82, s: 38, r: 12, o: 0.4 },
  { t: "bird", c: "#6B7568", x: 78, y: 78, s: 34, r: -14, o: 0.4 },
  { t: "sprout", c: "#2C5A36", x: 50, y: 3, s: 32, r: 4, o: 0.35 },
  { t: "leaf", c: "#D4845A", x: 70, y: 90, s: 30, r: -8, o: 0.4 },
];

/* COMPONENT */
export default function BoardViewPage({ onBack }) {
  const [tableNum, setTableNum] = useState("");
  const [yearIdx, setYearIdx] = useState(null);
  const year = yearIdx !== null ? YEARS[yearIdx] : null;
  const fill = yearIdx !== null ? ((yearIdx / (YEARS.length - 1)) * 100) + "%" : "0%";

  const [selHex, setSelHex] = useState(null);
  const [hovHex, setHovHex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const bothSelected = tableNum !== "" && year !== null;
  const isAvailable = bothSelected ? checkBoardAvailability(Number(tableNum), year) : false;

  const pieceData = useMemo(() => {
    if (!isAvailable) return {};
    return fetchPieceData(Number(tableNum), year);
  }, [isAvailable, tableNum, year]);

  const handleYearChange = useCallback((idx) => {
    setYearIdx(idx);
    setSelHex(null);
    const y = YEARS[idx];
    if (tableNum !== "") {
      if (!checkBoardAvailability(Number(tableNum), y)) {
        setPopupMsg(`There is no image for Table ${tableNum} for year ${y}.`);
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    }
  }, [tableNum]);

  const handleTableChange = useCallback((val) => {
    setTableNum(val);
    setSelHex(null);
    if (val !== "" && year !== null) {
      if (!checkBoardAvailability(Number(val), year)) {
        setPopupMsg(`There is no image for Table ${val} for year ${year}.`);
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    }
  }, [year]);

  const hexes = useMemo(() =>
    ALL_IDS.map(id => {
      const [row, col] = parseId(id);
      const [x, y] = hexCenter(row, col);
      return { id, row, col, x, y };
    }), []);

  const svgW = useMemo(() => d3.max(hexes, h => h.x) + PAD + HS + 8, [hexes]);
  const svgH = useMemo(() => d3.max(hexes, h => h.y) + PAD + HS + 8, [hexes]);

  const selData = selHex ? (pieceData[selHex] || null) : null;
  const selTerrain = selHex ? (TERRAIN[selHex] || null) : null;
  const selGeo = selHex ? (GEO_LABELS[selHex] || null) : null;

  const totals = useMemo(() => {
    const t = {};
    PIECE_KEYS.forEach(p => t[p.key] = 0);
    Object.values(pieceData).forEach(d => {
      PIECE_KEYS.forEach(p => t[p.key] += (d[p.key] || 0));
    });
    return t;
  }, [pieceData]);

  return (
    <div className="bv-page">
      <Doodles scatter={BV_SCATTER} />

      {/* Popup modal */}
      {showPopup && (
        <div className="bv-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="bv-popup" onClick={e => e.stopPropagation()}>
            <p className="bv-popup-msg">{popupMsg}</p>
            <button className="bv-popup-btn" onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}

      <div className="bv-inner">
        {/* Table selector */}
        <div className="bv-table-row">
          <span className="bv-table-label">TABLE</span>
          <select
            className="bv-table-select"
            value={tableNum}
            onChange={e => handleTableChange(e.target.value)}
          >
            <option value="">No tables selected</option>
            {TABLES.map(t => (
              <option key={t} value={t}>Table {t}</option>
            ))}
          </select>
        </div>

        {/* Board + sidebar (2-column) */}
        <div className="bv-content">

          {/* LEFT — Board */}
          <div className="bv-board bv-board-hex">
            {!bothSelected ? (
              <span className="bv-board-empty">
                {tableNum === "" && yearIdx === null
                  ? "Select a Table and Year to view the board."
                  : tableNum === ""
                  ? "Select a Table to view the board."
                  : "Select a Year to view the board."}
              </span>
            ) : !isAvailable ? (
              <span className="bv-board-empty">
                No board image uploaded yet for Table {tableNum} — {year}
              </span>
            ) : (
              <div style={{ position: "relative" }}>
                <svg width={svgW} height={svgH} style={{ display: "block" }}>
                  <rect x="0" y="0" width={svgW} height={svgH} fill="#3d7594" rx="10" />
                  {hexes.map(h => {
                    const terrain = TERRAIN[h.id] || "Agriculture";
                    const tFill = TCOLOR[terrain];
                    const isSel = selHex === h.id;
                    const nr = pieceData[h.id]?.needs_review;
                    const d = pieceData[h.id];
                    const tp = totalPieces(d);
                    const dc = dominantColor(d);
                    return (
                      <g key={h.id}>
                        <path
                          d={HEX_PATH}
                          transform={`translate(${h.x},${h.y})`}
                          fill={tFill}
                          stroke={isSel ? "#2C5A36" : nr ? "#e67e22" : "#FFFFFF"}
                          strokeWidth={isSel ? 3 : nr ? 2.5 : 1.5}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelHex(h.id)}
                          onMouseEnter={() => setHovHex(h.id)}
                          onMouseLeave={() => setHovHex(null)}
                        />
                        {hovHex === h.id && (
                          <path
                            d={HEX_PATH}
                            transform={`translate(${h.x},${h.y})`}
                            fill="rgba(255,255,255,0.25)"
                            style={{ pointerEvents: "none" }}
                          />
                        )}
                        {tp > 0 && dc && (
                          <>
                            <circle cx={h.x} cy={h.y} r={6} fill={dc} stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: "none" }} />
                            {tp > 1 && <text x={h.x} y={h.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize={8} fontWeight={700} fill="#fff" style={{ pointerEvents: "none" }}>{tp}</text>}
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
                {hovHex && (() => {
                  const h = hexes.find(x => x.id === hovHex);
                  if (!h) return null;
                  const geo = GEO_LABELS[hovHex];
                  const tp = totalPieces(pieceData[hovHex]);
                  return (
                    <div className="bv-hex-tooltip" style={{ left: Math.min(h.x + 20, svgW - 150), top: h.y - 16 }}>
                      <div style={{ fontWeight: 700 }}>{hovHex}</div>
                      {geo && <div style={{ opacity: 0.9 }}>{geo}</div>}
                      <div style={{ opacity: 0.7 }}>{TERRAIN[hovHex]}{tp > 0 ? ` · ${tp} piece${tp > 1 ? "s" : ""}` : ""}</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="bv-sidebar">
            {/* Selected Hex Details */}
            <div className="bv-sidebar-section">
              <h3 className="bv-sidebar-title">Selected Hex Details</h3>
              {!selHex ? (
                <p className="bv-sidebar-subtitle">No hex selected.</p>
              ) : (
                <>
                  <p className="bv-sidebar-subtitle">{selHex}</p>
                  {selGeo && <p className="bv-hex-terrain">{selGeo}</p>}
                  {selTerrain && <p className="bv-hex-terrain">{selTerrain}</p>}
                  <div className="bv-stat-list">
                    {PIECE_KEYS.map(p => (
                      <div className="bv-stat-row" key={p.key}>
                        <span className="bv-stat-label">
                          <span className="bv-piece-dot" style={{ background: p.color }} />
                          {p.label}
                        </span>
                        <span className={`bv-stat-value${(selData?.[p.key] || 0) > 0 ? " has-value" : ""}`}>
                          {selData?.[p.key] || 0}
                        </span>
                      </div>
                    ))}
                    <div className="bv-stat-row">
                      <span className="bv-stat-label highlight">Turn</span>
                      <span className="bv-stat-value highlight">{year}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Board Totals */}
            <div className="bv-sidebar-section">
              <h3 className="bv-sidebar-title">Board Totals (This Turn)</h3>
              <div className="bv-stat-list">
                {[
                  { label: "Total Population", value: totals.population_resilient_more + totals.population_resilient_less },
                  { label: "Wildlife", value: totals.wildlife },
                  { label: "Aquatic", value: totals.aquatic_life },
                  { label: "Military", value: totals.military_installation },
                  { label: "Eco Drivers", value: totals.yellow_agriculture_piece },
                ].map(d => (
                  <div className="bv-stat-row" key={d.label}>
                    <span className="bv-stat-label">{d.label}</span>
                    <span className={`bv-stat-value${d.value > 0 ? " has-value" : ""}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Time Period Slider */}
        <div className="bv-slider-area">
          <div className="bv-slider-title">Time Period Slider</div>
          <input
            type="range"
            className="bv-slider"
            min={0}
            max={YEARS.length - 1}
            step={1}
            value={yearIdx !== null ? yearIdx : 0}
            style={{ "--fill": fill }}
            onChange={e => handleYearChange(Number(e.target.value))}
          />
          <div className="bv-slider-labels">
            {YEARS.map((y, i) => (
              <span
                key={y}
                className={`bv-slider-label${yearIdx === i ? " active" : ""}`}
                onClick={() => handleYearChange(i)}
                style={{ cursor: "pointer" }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="bv-back-row">
          <button className="bv-link" onClick={onBack}>← Back to Preview</button>
        </div>
      </div>
    </div>
  );
}
