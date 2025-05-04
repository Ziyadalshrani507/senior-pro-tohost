import React from 'react';
import { FaSun, FaUtensils, FaCloudSun, FaMoon, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './ItineraryDay.css';

const ItineraryDay = ({ day }) => {
  return (
    <div className="itinerary-day">
      <div className="day-header">
        <span className="day-number">{day.day}</span>
        <h2>Day {day.day}</h2>
      </div>
      
      {day.notes && (
        <div className="day-notes">
          <div className="note-icon"><FaMapMarkerAlt /></div>
          <p>{day.notes}</p>
        </div>
      )}
      
      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-icon morning">
            <FaSun />
            <span className="time-label">09:00</span>
          </div>
          <div className="timeline-content">
            <h3>Morning</h3>
            <div className="activity-card">
              <div className="card-header">
                <h4>{day.morning.activity}</h4>
                <div className="activity-tag">Activity</div>
              </div>
              <p>{day.morning.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 3 hours</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon lunch">
            <FaUtensils />
            <span className="time-label">12:30</span>
          </div>
          <div className="timeline-content">
            <h3>Lunch</h3>
            <div className="restaurant-card">
              <div className="card-header">
                <h4>{day.lunch.restaurant}</h4>
                <div className="restaurant-tag">Restaurant</div>
              </div>
              <p>{day.lunch.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 1.5 hours</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon afternoon">
            <FaCloudSun />
            <span className="time-label">14:00</span>
          </div>
          <div className="timeline-content">
            <h3>Afternoon</h3>
            <div className="activity-card">
              <div className="card-header">
                <h4>{day.afternoon.activity}</h4>
                <div className="activity-tag">Activity</div>
              </div>
              <p>{day.afternoon.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 3 hours</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon dinner">
            <FaMoon />
            <span className="time-label">19:00</span>
          </div>
          <div className="timeline-content">
            <h3>Dinner</h3>
            <div className="restaurant-card">
              <div className="card-header">
                <h4>{day.dinner.restaurant}</h4>
                <div className="restaurant-tag">Restaurant</div>
              </div>
              <p>{day.dinner.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDay;
