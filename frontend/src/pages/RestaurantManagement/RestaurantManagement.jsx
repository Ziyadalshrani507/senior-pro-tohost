import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RestaurantManagement.css';

const RestaurantManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [schemaOptions, setSchemaOptions] = useState({
    cities: [],
    cuisines: [],
    categories: [],
    priceRanges: ['$', '$$', '$$$', '$$$$']
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    cuisine: '',
    priceRange: '',
    categories: [],
    pictureUrls: [''],
    rating: 0,
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    address: '',
    openingHours: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchRestaurants();
    fetchSchemaOptions();
  }, [user, navigate]);

  useEffect(() => {
    const filtered = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.locationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchTerm, restaurants]);

  const fetchSchemaOptions = async () => {
    try {
      const response = await fetch('/api/restaurants/schema-options');
      if (!response.ok) {
        throw new Error('Failed to fetch schema options');
      }
      const data = await response.json();
      setSchemaOptions(data);
    } catch (err) {
      setError('Failed to load schema options: ' + err.message);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      
      const data = await response.json();
      // Transform old restaurant data to new format
      const transformedData = data.map(restaurant => ({
        ...restaurant,
        description: restaurant.description || '',
        contact: {
          phone: restaurant.phone || restaurant.contact?.phone || '',
          email: restaurant.email || restaurant.contact?.email || '',
          website: restaurant.website || restaurant.contact?.website || ''
        },
        categories: restaurant.categories || [],
        pictureUrls: restaurant.pictureUrls || [],
        openingHours: restaurant.openingHours || ''
      }));
      
      setRestaurants(transformedData);
      setFilteredRestaurants(transformedData);
    } catch (err) {
      setError('Failed to load restaurants: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categories') {
      const category = value;
      setFormData(prev => ({
        ...prev,
        categories: checked
          ? [...prev.categories, category]
          : prev.categories.filter(c => c !== category)
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: [...prev.pictureUrls, '']
    }));
  };

  const handleRemoveImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleImageUrlChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Only validate required fields based on schema
    if (!formData.name || !formData.locationCity || !formData.cuisine || !formData.priceRange || !formData.address || !formData.contact.phone) {
      setError('Please fill in all required fields');
      return;
    }

    const cleanedFormData = {
      ...formData,
      pictureUrls: formData.pictureUrls.filter(url => url.trim() !== '')
    };

    try {
      const url = editingRestaurant
        ? `/api/restaurants/${editingRestaurant._id}`
        : '/api/restaurants';

      const response = await fetch(url, {
        method: editingRestaurant ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanedFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to save restaurant');
      }

      setSuccess(editingRestaurant ? 'Restaurant updated successfully!' : 'Restaurant added successfully!');
      fetchRestaurants();
      setEditingRestaurant(null);
      resetForm();
    } catch (err) {
      console.error('Error details:', err);
      setError('Error saving restaurant: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete restaurant');
      }

      setSuccess('Restaurant deleted successfully!');
      fetchRestaurants();
      if (editingRestaurant?._id === id) {
        setEditingRestaurant(null);
        resetForm();
      }
    } catch (err) {
      setError('Error deleting restaurant: ' + err.message);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      ...restaurant,
      pictureUrls: restaurant.pictureUrls || ['']
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      locationCity: '',
      cuisine: '',
      priceRange: '',
      categories: [],
      pictureUrls: [''],
      rating: 0,
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      address: '',
      openingHours: ''
    });
    setEditingRestaurant(null);
  };

  return (
    <div className="activity-management-container">
      <div className="activity-form-section">
        <h2>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-group">
            <label htmlFor="name">Restaurant Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationCity">City*</label>
            <select
              id="locationCity"
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a city</option>
              {schemaOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cuisine">Cuisine*</label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a cuisine</option>
              {schemaOptions.cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priceRange">Price Range*</label>
            <select
              id="priceRange"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select price range</option>
              {schemaOptions.priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Categories</label>
            <div className="checkbox-group">
              {schemaOptions.categories.map(category => (
                <div key={category} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    name="categories"
                    value={category}
                    checked={formData.categories.includes(category)}
                    onChange={handleChange}
                  />
                  <label htmlFor={`category-${category}`}>{category}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Image URLs:</label>
            <div className="image-urls-container">
              {formData.pictureUrls.map((url, index) => (
                <div key={index} className="image-url-input">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="Enter image URL"
                  />
                  {formData.pictureUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="remove-url-btn"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="add-url-btn"
              >
                <i className="bi bi-plus"></i> Add Another Image URL
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contact.phone">Phone*</label>
            <input
              type="tel"
              id="contact.phone"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact.email">Email</label>
            <input
              type="email"
              id="contact.email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact.website">Website</label>
            <input
              type="url"
              id="contact.website"
              name="contact.website"
              value={formData.contact.website}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-control"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="openingHours">Opening Hours</label>
            <input
              type="text"
              id="openingHours"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Mon-Fri: 9:00 AM - 10:00 PM"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
            </button>
            {editingRestaurant && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="activity-list-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="activity-list">
          {filteredRestaurants.map(restaurant => (
            <div key={restaurant._id} className="activity-item">
              <div className="activity-details">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.description}</p>
                <p>
                  <strong>Location:</strong> {restaurant.locationCity} | 
                  <strong> Cuisine:</strong> {restaurant.cuisine} |
                  <strong className="price-range"> {restaurant.priceRange}</strong>
                </p>
                <p>
                  <strong>Contact:</strong> {restaurant.contact.phone} | {restaurant.contact.email}
                </p>
              </div>
              <div className="activity-actions">
                <button
                  onClick={() => handleEdit(restaurant)}
                  className="btn-edit"
                >
                  <i className="bi bi-pencil"></i> Edit
                </button>
                <button
                  onClick={() => handleDelete(restaurant._id)}
                  className="btn-delete"
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantManagement;
