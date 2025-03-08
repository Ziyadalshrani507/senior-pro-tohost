import React from 'react';
import { FaMapMarkerAlt, FaUtensils, FaStar } from 'react-icons/fa';
import './DashboardStats.css';

const DashboardStats = ({ stats, type }) => {
  if (!stats) return null;

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon">
          {type === 'destinations' ? <FaMapMarkerAlt /> : <FaUtensils />}
        </div>
        <div className="stat-info">
          <h3>Total {type}</h3>
          <p>{stats.total || 0}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaStar />
        </div>
        <div className="stat-info">
          <h3>Average Rating</h3>
          <p>{(stats.avgRating || 0).toFixed(1)}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          {type === 'destinations' ? <FaMapMarkerAlt /> : <FaUtensils />}
        </div>
        <div className="stat-info">
          <h3>Active Items</h3>
          <p>{stats.activeItems || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
