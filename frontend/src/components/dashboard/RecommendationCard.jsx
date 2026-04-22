import React from 'react';

const RecommendationCard = ({ city, country, days, price, imageUrl, delay = 0 }) => {
  return (
    <div className="glass card-hover" style={{
      borderRadius: 16,
      overflow: "hidden",
      animation: `fadeUp 0.4s ease ${delay}s both`,
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
        <img 
          src={imageUrl} 
          alt={city} 
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "4px 10px", borderRadius: 20,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          fontSize: 10, fontWeight: 600, color: "var(--white)"
        }}>
          Featured
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--white)" }}>{city}, {country}</h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{days} Days Trip</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--gold)" }}>₹{price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
