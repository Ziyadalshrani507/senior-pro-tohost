import React from 'react';
import { FaMapMarkerAlt, FaUtensils, FaStar } from 'react-icons/fa';

const DashboardStats = ({ stats, activeTab }) => {
  const currentStats = stats[activeTab];
  
  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon">
          {activeTab === 'destinations' ? <FaMapMarkerAlt /> : <FaUtensils />}
        </div>
        <div className="stat-info">
          <h3>Total {activeTab}</h3>
          <p>{currentStats.total}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaStar />
        </div>
        <div className="stat-info">
          <h3>Average Rating</h3>
          <p>{currentStats.avgRating.toFixed(1)}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          {activeTab === 'destinations' ? <FaMapMarkerAlt /> : <FaUtensils />}
        </div>
        <div className="stat-info">
          <h3>Active Items</h3>
          <p>{currentStats.activeItems}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
