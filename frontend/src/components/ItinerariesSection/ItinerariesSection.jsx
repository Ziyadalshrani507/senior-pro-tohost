import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItinerary } from '../../context/ItineraryContext';
import { formatDate } from '../../utils/dateUtils';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ItinerariesSection.css';

const ItinerariesSection = () => {
  const { userItineraries, fetchUserItineraries, deleteItinerary } = useItinerary();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUserItineraries();
  }, []);

  const handleDelete = async (itineraryId) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteItinerary(itineraryId);
      toast.success('Itinerary deleted successfully');
    } catch (error) {
      toast.error('Failed to delete itinerary');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!userItineraries || userItineraries.length === 0) {
    return (
      <div className="itineraries-section empty">
        <h2>My Saved Itineraries</h2>
        <p>You haven't saved any itineraries yet.</p>
        <Link to="/itinerary-planner" className="create-itinerary-btn">
          Create New Itinerary
        </Link>
      </div>
    );
  }

  return (
    <div className="itineraries-section">
      <h2>My Saved Itineraries</h2>
      <div className="itineraries-grid">
        {userItineraries.map((itinerary) => (
          <div key={itinerary._id} className="itinerary-card">
            <div className="itinerary-card-content">
              <h3>{itinerary.name || `${itinerary.duration}-Day Trip to ${itinerary.destination || 'Unknown'}`}</h3>
              <div className="itinerary-meta">
                <p>Duration: {itinerary.duration} days</p>
                <p>Budget: {itinerary.budget}</p>
                <p>Created: {formatDate(itinerary.createdAt)}</p>
              </div>
              <div className="itinerary-actions">
                <Link to={`/itinerary/${itinerary._id}`} className="view-itinerary-btn">
                  View Details
                </Link>
                <button 
                  onClick={() => handleDelete(itinerary._id)} 
                  className="delete-itinerary-btn"
                  disabled={isDeleting}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItinerariesSection;
