"use client"
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Edit2, Check, X } from "lucide-react";

/**
 * BudgetChart — Enhanced with manual budget setting and percentage labels.
 */
const BudgetChart = ({ data }) => {
  const [totalBudget, setTotalBudget] = useState(100000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState("100000");

  useEffect(() => {
    const saved = localStorage.getItem("tripai_budget_goal");
    if (saved) {
      setTotalBudget(parseInt(saved, 10));
      setTempBudget(saved);
    }
  }, []);

  const handleSaveBudget = () => {
    const num = parseInt(tempBudget.replace(/,/g, ''), 10);
    if (!isNaN(num)) {
      setTotalBudget(num);
      localStorage.setItem("tripai_budget_goal", num.toString());
    }
    setIsEditing(false);
  };

  const DEFAULT_DATA = [
    { name: 'Flights', value: 40, color: '#3b82f6' },
    { name: 'Stay', value: 30, color: '#f59e0b' },
    { name: 'Food', value: 15, color: '#10b981' },
    { name: 'Activities', value: 10, color: '#8b5cf6' },
    { name: 'Transport', value: 5, color: '#ec4899' },
  ];

  const chartData = data || DEFAULT_DATA;
  
  // Custom label to show percentages on the chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 10, fontWeight: 700 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="glass" style={{
      borderRadius: 16,
      padding: 24,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 320
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: 0 }}>
          Budget Overview
        </h3>
        {!isEditing ? (
          <button 
            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
            style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}
          >
            <Edit2 size={12} /> Set Goal
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveBudget} style={{ background: "none", border: "none", color: "#4ade80", cursor: "pointer" }}><Check size={16} /></button>
            <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><X size={16} /></button>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100
        }}>
          <p style={{ 
            margin: 0, fontSize: 10, color: 'var(--muted)', 
            textTransform: 'uppercase', letterSpacing: "0.08em", fontWeight: 600 
          }}>
            Goal
          </p>
          {isEditing ? (
            <input 
              autoFocus
              type="text"
              value={tempBudget}
              onChange={e => setTempBudget(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-gold)",
                borderRadius: 4, width: 80, fontSize: 13, color: "white", textAlign: "center",
                marginTop: 4, pointerEvents: "all", outline: "none"
              }}
            />
          ) : (
            <p style={{ 
              margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--white)', 
              fontFamily: "var(--font-display)", letterSpacing: "-0.01em" 
            }}>
              ₹{totalBudget.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
