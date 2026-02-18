"use client";
import { useState, useMemo } from "react";

const BILLING_CODES = [
  {
    id: "commercial_mnt",
    label: "Commercial MNT",
    codes: "97802, 97803",
    reimbursement: 160,
    pomFee: 110,
    hoursPerYear: 12,
    insuranceMixDefault: 0.3,
    qualifyingDefault: 0.9,
    description: "Preventative care, wide range of conditions",
  },
  {
    id: "medicare_mnt",
    label: "Medicare MNT",
    codes: "97802, 97803",
    reimbursement: 135,
    pomFee: 110,
    hoursPerYear: 3,
    insuranceMixDefault: 0.65,
    qualifyingDefault: 0.3,
    description: "Patients with T2D and CKD",
  },
  {
    id: "medicare_obesity",
    label: "Medicare Obesity Counseling",
    codes: "G0447",
    reimbursement: 135,
    pomFee: 110,
    hoursPerYear: 5.5,
    insuranceMixDefault: 0.65,
    qualifyingDefault: 0.5,
    description: "Patients with BMI ≥30",
  },
  {
    id: "medicare_ccm",
    label: "Medicare CCM",
    codes: "99490, 99439",
    reimbursement: 163,
    pomFee: 110,
    hoursPerYear: 12,
    insuranceMixDefault: 0.65,
    qualifyingDefault: 0.8,
    description: "Patients with 2+ chronic conditions",
  },
];

const C = {
  indigo: "#2E1B8C",
  indigoDark: "#231465",
  indigoLight: "#3D2BA0",
  pomRed: "#E04832",
  pomRedLight: "#F06050",
  white: "#FFFFFF",
  offWhite: "#F6F4FB",
  lavender: "#EDEAFF",
  muted: "#9B93C4",
  mutedLight: "#B8B2D8",
  cardBg: "#FFFFFF",
  textDark: "#1A1145",
};

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtNum(n) {
  return Math.round(n).toLocaleString("en-US");
}

function Slider({ label, value, onChange, min, max, step = 1, format = "number", suffix = "" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayVal =
    format === "percent" ? `${Math.round(value * 100)}%` : format === "currency" ? fmt(value) : `${value}${suffix}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: C.textDark, fontWeight: 500 }}>{label}</span>
        <span
          style={{
            fontSize: 16,
            color: C.indigo,
            fontWeight: 700,
            background: C.lavender,
            padding: "2px 10px",
            borderRadius: 6,
          }}
        >
          {displayVal}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          appearance: "none",
          WebkitAppearance: "none",
          background: `linear-gradient(to right, ${C.indigo} 0%, ${C.indigo} ${pct}%, #E0DCEF ${pct}%, #E0DCEF 100%)`,
          cursor: "pointer",
          outline: "none",
        }}
      />
    </div>
  );
}

function ResultCard({ label, value, sublabel, accent = false }) {
  return (
    <div
      style={{
        padding: "22px 24px",
        borderRadius: 14,
        background: accent ? `linear-gradient(135deg, ${C.indigo} 0%, ${C.indigoLight} 100%)` : C.white,
        border: accent ? "none" : `1px solid ${C.lavender}`,
        flex: 1,
        minWidth: 200,
        boxShadow: accent ? "0 4px 20px rgba(46,27,140,0.25)" : "none",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: accent ? C.mutedLight : C.muted,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: accent ? C.white : C.textDark, lineHeight: 1.1 }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: accent ? C.mutedLight : C.muted, marginTop: 8 }}>{sublabel}</div>
      )}
    </div>
  );
}

function CodeBreakdown({ code, patients, revenue, ebitda }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr auto auto auto",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 10,
        background: C.offWhite,
        border: `1px solid ${C.lavender}`,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{code.label}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
          {code.codes} · {code.description}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Patients</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{fmtNum(patients)}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Revenue</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{fmt(revenue)}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>EBITDA</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.indigo }}>{fmt(ebitda)}</div>
      </div>
    </div>
  );
}

export default function PomRevenueCalculator() {
  const [numDoctors, setNumDoctors] = useState(5);
  const [patientsPerProvider, setPatientsPerProvider] = useState(1800);
  const [prescribeRate, setPrescribeRate] = useState(0.10);
  const [optInRate, setOptInRate] = useState(0.60);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalPatients = numDoctors * patientsPerProvider;

  const calculations = useMemo(() => {
    return BILLING_CODES.map((code) => {
      const eligible = totalPatients * code.insuranceMixDefault;
      const qualifying = eligible * code.qualifyingDefault;
      const prescribed = qualifying * prescribeRate;
      const patients = prescribed * optInRate;
      const revenue = patients * code.reimbursement * code.hoursPerYear;
      const ebitda = patients * (code.reimbursement - code.pomFee) * code.hoursPerYear;
      return { code, patients, revenue, ebitda };
    });
  }, [totalPatients, prescribeRate, optInRate]);

  const totals = useMemo(() => {
    const totalPts = calculations.reduce((sum, c) => sum + c.patients, 0);
    const totalRev = calculations.reduce((sum, c) => sum + c.revenue, 0);
    const totalEbitda = calculations.reduce((sum, c) => sum + c.ebitda, 0);
    return {
      patients: totalPts,
      revenue: totalRev,
      ebitda: totalEbitda,
      revenuePerDoctor: numDoctors > 0 ? totalRev / numDoctors : 0,
      ebitdaPerDoctor: numDoctors > 0 ? totalEbitda / numDoctors : 0,
    };
  }, [calculations, numDoctors]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.offWhite} 0%, #EEEBF8 40%, ${C.offWhite} 100%)`,
        padding: "40px 20px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 24,
              background: C.indigo,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.white, letterSpacing: "0.02em" }}>
              p<span style={{ color: C.pomRed }}>o</span>mhealth
            </span>
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: C.textDark,
              margin: "0 0 10px",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            Practice Revenue Calculator
          </h1>
          <p
            style={{
              fontSize: 15,
              color: C.muted,
              margin: 0,
              maxWidth: 460,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            See how much revenue embedded nutrition care could generate for your practice — at no cost to you.
          </p>
        </div>

        {/* Inputs */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 18,
            padding: "32px 32px 16px",
            boxShadow: "0 1px 3px rgba(46,27,140,0.04), 0 8px 30px rgba(46,27,140,0.06)",
            border: `1px solid ${C.lavender}`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.indigo,
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 4,
                height: 16,
                borderRadius: 2,
                background: C.pomRed,
                display: "inline-block",
              }}
            />
            Your Practice
          </div>
          <Slider label="Number of Providers" value={numDoctors} onChange={setNumDoctors} min={1} max={50} />
          <Slider
            label="Patients Seen Per Provider (Annual)"
            value={patientsPerProvider}
            onChange={setPatientsPerProvider}
            min={500}
            max={5000}
            step={100}
          />
          <Slider
            label="% of Patients Prescribed Nutrition Care"
            value={prescribeRate}
            onChange={setPrescribeRate}
            min={0.02}
            max={0.3}
            step={0.01}
            format="percent"
          />
          <Slider
            label="% of Patients that Opt In"
            value={optInRate}
            onChange={setOptInRate}
            min={0.1}
            max={0.8}
            step={0.05}
            format="percent"
          />
        </div>

        {/* Results */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 18,
            padding: 32,
            boxShadow: "0 1px 3px rgba(46,27,140,0.04), 0 8px 30px rgba(46,27,140,0.06)",
            border: `1px solid ${C.lavender}`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.indigo,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{ width: 4, height: 16, borderRadius: 2, background: C.pomRed, display: "inline-block" }}
            />
            Estimated Annual Opportunity
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
            <ResultCard
              label="Your Practice Revenue"
              value={fmt(totals.revenue)}
              sublabel={`${fmt(totals.revenuePerDoctor)} per provider`}
              accent
            />
            <ResultCard
              label="Your Practice EBITDA"
              value={fmt(totals.ebitda)}
              sublabel={`${fmt(totals.ebitdaPerDoctor)} per provider`}
            />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <ResultCard label="Patients Served" value={fmtNum(totals.patients)} sublabel="across all billing codes" />
            <ResultCard
              label="Total Providers"
              value={numDoctors}
              sublabel={`${fmtNum(totalPatients)} total patients`}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 18,
            padding: "18px 32px",
            boxShadow: "0 1px 3px rgba(46,27,140,0.04), 0 8px 30px rgba(46,27,140,0.06)",
            border: `1px solid ${C.lavender}`,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.indigo,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{ width: 4, height: 16, borderRadius: 2, background: C.pomRed, display: "inline-block" }}
              />
              Revenue by Billing Code
            </span>
            <span
              style={{
                fontSize: 16,
                color: C.indigo,
                transform: showBreakdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                display: "inline-block",
              }}
            >
              ▼
            </span>
          </button>

          {showBreakdown && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
              {calculations.map((calc) => (
                <CodeBreakdown
                  key={calc.code.id}
                  code={calc.code}
                  patients={calc.patients}
                  revenue={calc.revenue}
                  ebitda={calc.ebitda}
                />
              ))}
              <div
                style={{
                  marginTop: 12,
                  padding: "14px 18px",
                  borderRadius: 10,
                  background: C.lavender,
                  fontSize: 12,
                  color: C.muted,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: C.textDark }}>How it works:</strong> Pom Health bills under MNT, Obesity
                Counseling, and CCM codes. Your practice collects the full reimbursement and pays Pom a flat $110/hour
                fee. The difference is your margin — with zero staffing or overhead costs.
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          style={{
            textAlign: "center",
            padding: "36px 28px",
            background: `linear-gradient(135deg, ${C.indigoDark} 0%, ${C.indigo} 50%, ${C.indigoLight} 100%)`,
            borderRadius: 18,
            marginBottom: 28,
            boxShadow: "0 4px 24px rgba(46,27,140,0.3)",
          }}
        >
          <p style={{ fontSize: 18, color: C.white, margin: "0 0 6px", fontWeight: 700 }}>
            Want to see how this works at your practice?
          </p>
          <p style={{ fontSize: 14, color: C.mutedLight, margin: "0 0 24px" }}>
            We handle staffing, billing, and patient engagement. Zero cost to you.
          </p>
          <a
         href="mailto:misha@pomhealth.co?subject=Pom Health — Interested in a Walkthrough"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 10,
              background: C.pomRed,
              color: C.white,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(224,72,50,0.35)",
              marginBottom: 20,
              textDecoration: "none",
            }}
          >
            Schedule a Walkthrough →
          </a>
          <p style={{ fontSize: 13, color: C.mutedLight, margin: 0, lineHeight: 2 }}>
            Misha · CEO & Co-Founder
            <br />
            <span style={{ color: C.white }}>misha@pomhealth.co · 248-496-6886</span>
          </p>
        </div>

        {/* Footnote */}
        <p
          style={{
            fontSize: 11,
            color: C.muted,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 500,
            margin: "0 auto",
            paddingBottom: 20,
          }}
        >
          Estimates are illustrative and based on data from Pom Health partner practices. Actual results will vary based
          on practice size, patient mix, and payer contracts. Insurance mix, qualifying condition rates, and hours per
          year reflect published CMS guidelines and Pom Health internal data.
        </p>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${C.indigo};
          border: 3px solid ${C.white};
          box-shadow: 0 1px 6px rgba(46,27,140,0.3);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${C.indigo};
          border: 3px solid ${C.white};
          box-shadow: 0 1px 6px rgba(46,27,140,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
