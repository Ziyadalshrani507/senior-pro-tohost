import React from 'react';
import './ItineraryDay.css';

const ItineraryDay = ({ day }) => {
  return (
    <div className="itinerary-day">
      <h2>Day {day.day}</h2>
      
      {day.notes && (
        <div className="day-notes">
          <p>{day.notes}</p>
        </div>
      )}
      
      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-icon morning">🌅</div>
          <div className="timeline-content">
            <h3>Morning</h3>
            <div className="activity-card">
              <h4>{day.morning.activity}</h4>
              <p>{day.morning.description}</p>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon lunch">🍽️</div>
          <div className="timeline-content">
            <h3>Lunch</h3>
            <div className="restaurant-card">
              <h4>{day.lunch.restaurant}</h4>
              <p>{day.lunch.description}</p>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon afternoon">☀️</div>
          <div className="timeline-content">
            <h3>Afternoon</h3>
            <div className="activity-card">
              <h4>{day.afternoon.activity}</h4>
              <p>{day.afternoon.description}</p>
            </div>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon dinner">🌙</div>
          <div className="timeline-content">
            <h3>Dinner</h3>
            <div className="restaurant-card">
              <h4>{day.dinner.restaurant}</h4>
              <p>{day.dinner.description}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItineraryDay;
