import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItinerary } from '../../context/ItineraryContext';
import ItineraryDay from '../../components/ItineraryPlanner/ItineraryDay';
import { FaCalendarAlt, FaMoneyBillWave, FaUsers, FaPrint, FaSave, FaEdit, FaPlusCircle, FaHotel } from 'react-icons/fa';
import './ItineraryDetailsPage.css';

const ItineraryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchItinerary, saveItinerary } = useItinerary();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);

  // Handle saving the itinerary to user account
  const handleSaveItinerary = async () => {
    if (isSaving || !itinerary) return;
    
    try {
      setIsSaving(true);
      const name = customName || itinerary.name;
      const savedItinerary = await saveItinerary(itinerary._id, name);
      
      if (savedItinerary) {
        setSaveSuccess(true);
        // Update the itinerary in state to reflect changes
        setItinerary(savedItinerary);
        
        // Automatically navigate to my itineraries after short delay
        setTimeout(() => {
          navigate('/my-itineraries');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to save itinerary');
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    const getItinerary = async () => {
      try {
        setLoading(true);
        const data = await fetchItinerary(id);
        if (data) {
          setItinerary(data);
        } else {
          setError('Itinerary not found');
        }
      } catch (err) {
        setError('Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };

    getItinerary();
  }, [id, fetchItinerary]);

  if (loading) {
    return (
      <div className="itinerary-loading">
        <div className="spinner"></div>
        <p>Loading your personalized itinerary...</p>
        <p className="loading-subtitle">Crafting your perfect adventure</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="itinerary-error">
        <div className="error-icon">😕</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error || 'Unable to load itinerary'}</p>
        <Link to="/itinerary-planner" className="try-again-btn">
          <FaPlusCircle /> Create a New Itinerary
        </Link>
      </div>
    );
  }

  return (
    <div className="itinerary-details-page">
      <div className="itinerary-header">
        <div className="itinerary-title-wrapper">
          <h1>{itinerary.name}</h1>
          <div className="destination-badge">
            {itinerary.destination || 'Custom Trip'}
          </div>
        </div>
        
        <div className="itinerary-meta">
          <div className="meta-item">
            <FaCalendarAlt />
            <span>{itinerary.duration} days</span>
          </div>
          <div className="meta-item">
            <FaMoneyBillWave />
            <span>{itinerary.budget} budget</span>
          </div>
          <div className="meta-item">
            <FaUsers />
            <span>{itinerary.travelersType}</span>
          </div>
        </div>
      </div>
      
      {itinerary.hotel && (
        <div className="itinerary-hotel-section">
          <div className="section-header">
            <FaHotel className="section-icon" />
            <h2>Your Accommodation</h2>
          </div>
          <div className="hotel-card">
            <h3>{itinerary.hotel.place}</h3>
            <p>{itinerary.hotel.description}</p>
          </div>
        </div>
      )}
      
      <div className="day-navigation">
        <h2 className="section-title">Daily Schedule</h2>
        <div className="day-selector">
          {Array.from({ length: itinerary.duration }, (_, i) => (
            <button
              key={i + 1}
              className={`day-button ${activeDay === i + 1 ? 'active' : ''}`}
              onClick={() => setActiveDay(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      <div className="itinerary-content">
        {itinerary.days.map((day) => (
          <div
            key={day.day}
            className={`day-content ${day.day === activeDay ? 'active' : ''}`}
          >
            {day.day === activeDay && <ItineraryDay day={day} />}
          </div>
        ))}
      </div>
      
      <div className="itinerary-actions-wrapper">
        <div className="itinerary-actions">
          <Link to="/itinerary-planner" className="new-itinerary-btn">
            <FaPlusCircle className="btn-icon" />
            <span>Create New Itinerary</span>
          </Link>
          
          {itinerary.isTemporary && (
            <div className="save-itinerary-container">
              {showCustomNameInput ? (
                <div className="custom-name-input">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter custom name (optional)"
                    maxLength={50}
                  />
                  <div className="input-actions">
                    <button 
                      className="save-with-name-btn" 
                      onClick={handleSaveItinerary}
                      disabled={isSaving}
                    >
                      <FaSave className="btn-icon" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={() => setShowCustomNameInput(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="save-options">
                  <button 
                    className="save-itinerary-btn" 
                    onClick={() => handleSaveItinerary()}
                    disabled={isSaving || saveSuccess}
                  >
                    <FaSave className="btn-icon" />
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved! ✓' : 'Save to My Account'}
                  </button>
                  <button 
                    className="custom-name-btn" 
                    onClick={() => setShowCustomNameInput(true)}
                    disabled={isSaving || saveSuccess}
                  >
                    <FaEdit className="btn-icon" />
                    Save with Custom Name
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button className="print-itinerary-btn" onClick={() => window.print()}>
            <FaPrint className="btn-icon" />
            <span>Print Itinerary</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailsPage;
