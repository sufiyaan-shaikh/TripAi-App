"use client"
import React from 'react';
import * as Icons from 'lucide-react';

const StatsCard = ({ label, value, iconName, color = "#f59e0b", delay = 0 }) => {
  const Icon = Icons[iconName] || Icons.HelpCircle;

  return (
    <div className="glass card-hover" style={{
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      animation: `fadeUp 0.4s ease ${delay}s both`,
      minWidth: 0
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyChild: "center",
        flexShrink: 0,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Icon size={24} />
      </div>
      <div style={{ overflow: "hidden" }}>
        <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--white)", margin: 0 }}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
