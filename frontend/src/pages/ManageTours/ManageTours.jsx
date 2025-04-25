import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ManageTours.css';

const ManageTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTour, setEditingTour] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
        toast.error('Failed to load tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleSave = async (tour) => {
    try {
      const method = tour._id ? 'PUT' : 'POST';
      const url = tour._id ? `/api/tours/${tour._id}` : '/api/tours';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tour)
      });

      if (!response.ok) {
        throw new Error('Failed to save tour');
      }

      const savedTour = await response.json();

      if (tour._id) {
        setTours((prev) => prev.map((t) => (t._id === savedTour._id ? savedTour : t)));
      } else {
        setTours((prev) => [...prev, savedTour]);
      }

      toast.success('Tour saved successfully');
      setEditingTour(null);
    } catch (error) {
      console.error('Error saving tour:', error);
      toast.error('Failed to save tour');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/tours/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      setTours((prev) => prev.filter((t) => t._id !== id));
      toast.success('Tour deleted successfully');
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast.error('Failed to delete tour');
    }
  };

  return (
    <div className="manage-tours">
      <h1>Manage Tours</h1>

      {loading ? (
        <p>Loading tours...</p>
      ) : (
        <div className="tours-list">
          {tours.map((tour) => (
            <div key={tour._id} className="tour-item">
              <h2>{tour.title}</h2>
              <p>{tour.description}</p>
              <button onClick={() => setEditingTour(tour)}>Edit</button>
              <button onClick={() => handleDelete(tour._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {editingTour && (
        <div className="edit-form">
          <h2>{editingTour._id ? 'Edit Tour' : 'Add Tour'}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editingTour);
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={editingTour.title || ''}
              onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={editingTour.description || ''}
              onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Level"
              value={editingTour.level || ''}
              onChange={(e) => setEditingTour({ ...editingTour, level: e.target.value })}
            />
            <input
              type="text"
              placeholder="Duration"
              value={editingTour.duration || ''}
              onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
            />
            <input
              type="text"
              placeholder="Length"
              value={editingTour.length || ''}
              onChange={(e) => setEditingTour({ ...editingTour, length: e.target.value })}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={editingTour.image || ''}
              onChange={(e) => setEditingTour({ ...editingTour, image: e.target.value })}
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingTour(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageTours;