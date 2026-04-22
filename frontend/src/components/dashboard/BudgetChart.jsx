import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const BudgetChart = ({ data }) => {
  const DEFAULT_DATA = [
    { name: 'Flights', value: 40, color: '#3b82f6' },
    { name: 'Stay', value: 30, color: '#f59e0b' },
    { name: 'Food', value: 15, color: '#10b981' },
    { name: 'Activities', value: 10, color: '#8b5cf6' },
    { name: 'Transport', value: 5, color: '#ec4899' },
  ];

  const chartData = data || DEFAULT_DATA;

  return (
    <div className="glass" style={{
      borderRadius: 16,
      padding: 24,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 320
    }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: '0 0 20px 0' }}>
        Budget Overview
      </h3>
      
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
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Total Budget</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>₹1,00,000</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
