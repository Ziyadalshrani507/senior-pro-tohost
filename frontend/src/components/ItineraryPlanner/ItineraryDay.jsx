import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaUtensils, FaCloudSun, FaMoon, FaMapMarkerAlt, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import './ItineraryDay.css';

const ItineraryDay = ({ day }) => {
  const [itemLinks, setItemLinks] = useState({
    morning: null,
    lunch: null,
    afternoon: null,
    dinner: null
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      const apiBaseUrl = getApiBaseUrl();
      setLoading(true);
      
      try {
        // Create an object to store the links
        const links = {};
        
        // Find destination ID for morning activity
        if (day.morning?.activity) {
          const morningResponse = await axios.get(`${apiBaseUrl}/destinations/search?name=${encodeURIComponent(day.morning.activity)}`);
          if (morningResponse.data.data && morningResponse.data.data.length > 0) {
            links.morning = { 
              id: morningResponse.data.data[0]._id,
              type: 'destinations'
            };
          }
        }
        
        // Find destination ID for afternoon activity
        if (day.afternoon?.activity) {
          const afternoonResponse = await axios.get(`${apiBaseUrl}/destinations/search?name=${encodeURIComponent(day.afternoon.activity)}`);
          if (afternoonResponse.data.data && afternoonResponse.data.data.length > 0) {
            links.afternoon = { 
              id: afternoonResponse.data.data[0]._id,
              type: 'destinations'
            };
          }
        }
        
        // Find restaurant ID for lunch
        if (day.lunch?.restaurant) {
          const lunchResponse = await axios.get(`${apiBaseUrl}/restaurants/search?name=${encodeURIComponent(day.lunch.restaurant)}`);
          if (lunchResponse.data.data && lunchResponse.data.data.length > 0) {
            links.lunch = { 
              id: lunchResponse.data.data[0]._id,
              type: 'restaurants'
            };
          }
        }
        
        // Find restaurant ID for dinner
        if (day.dinner?.restaurant) {
          const dinnerResponse = await axios.get(`${apiBaseUrl}/restaurants/search?name=${encodeURIComponent(day.dinner.restaurant)}`);
          if (dinnerResponse.data.data && dinnerResponse.data.data.length > 0) {
            links.dinner = { 
              id: dinnerResponse.data.data[0]._id,
              type: 'restaurants'
            };
          }
        }
        
        setItemLinks(links);
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [day]);
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
                <h4>
                  {day.morning.activity}
                  {itemLinks.morning && (
                    <Link to={`/${itemLinks.morning.type}/${itemLinks.morning.id}`} className="item-link">
                      <FaExternalLinkAlt className="link-icon" />
                    </Link>
                  )}
                </h4>
                <div className="activity-tag">Activity</div>
              </div>
              <p>{day.morning.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 3 hours</span>
                {itemLinks.morning && (
                  <Link to={`/${itemLinks.morning.type}/${itemLinks.morning.id}`} className="view-details-link">
                    View Details
                  </Link>
                )}
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
                <h4>
                  {day.lunch.restaurant}
                  {itemLinks.lunch && (
                    <Link to={`/${itemLinks.lunch.type}/${itemLinks.lunch.id}`} className="item-link">
                      <FaExternalLinkAlt className="link-icon" />
                    </Link>
                  )}
                </h4>
                <div className="restaurant-tag">Restaurant</div>
              </div>
              <p>{day.lunch.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 1.5 hours</span>
                {itemLinks.lunch && (
                  <Link to={`/${itemLinks.lunch.type}/${itemLinks.lunch.id}`} className="view-details-link">
                    View Details
                  </Link>
                )}
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
                <h4>
                  {day.afternoon.activity}
                  {itemLinks.afternoon && (
                    <Link to={`/${itemLinks.afternoon.type}/${itemLinks.afternoon.id}`} className="item-link">
                      <FaExternalLinkAlt className="link-icon" />
                    </Link>
                  )}
                </h4>
                <div className="activity-tag">Activity</div>
              </div>
              <p>{day.afternoon.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 3 hours</span>
                {itemLinks.afternoon && (
                  <Link to={`/${itemLinks.afternoon.type}/${itemLinks.afternoon.id}`} className="view-details-link">
                    View Details
                  </Link>
                )}
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
                <h4>
                  {day.dinner.restaurant}
                  {itemLinks.dinner && (
                    <Link to={`/${itemLinks.dinner.type}/${itemLinks.dinner.id}`} className="item-link">
                      <FaExternalLinkAlt className="link-icon" />
                    </Link>
                  )}
                </h4>
                <div className="restaurant-tag">Restaurant</div>
              </div>
              <p>{day.dinner.description}</p>
              <div className="card-footer">
                <span className="duration"><FaClock /> 2 hours</span>
                {itemLinks.dinner && (
                  <Link to={`/${itemLinks.dinner.type}/${itemLinks.dinner.id}`} className="view-details-link">
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDay;
