import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink, FaTrash } from 'react-icons/fa';
import './ItemModal.css';

const ItemModal = ({ isOpen, onClose, item, type, onSave, schemaOptions }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    pictureUrls: [],
    // Destination specific fields
    type: '',
    cost: '',
    categories: [],
    // Restaurant specific fields
    cuisine: '',
    priceRange: '',
    address: '',
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    openingHours: ''
  });

  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        categories: item.categories || [],
        contact: item.contact || { phone: '', email: '', website: '' }
      });
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      locationCity: '',
      pictureUrls: [],
      type: '',
      cost: '',
      categories: [],
      cuisine: '',
      priceRange: '',
      address: '',
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      openingHours: ''
    });
    setImageUrl('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.locationCity) newErrors.locationCity = 'City is required';

    if (type === 'destinations') {
      if (!formData.type) newErrors.type = 'Type is required';
      if (!formData.cost) newErrors.cost = 'Cost is required';
    } else {
      if (!formData.cuisine) newErrors.cuisine = 'Cuisine is required';
      if (!formData.priceRange) newErrors.priceRange = 'Price range is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.contact.phone) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUrlAdd = () => {
    if (!imageUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(imageUrl);
      setFormData(prev => ({
        ...prev,
        pictureUrls: [...prev.pictureUrls, imageUrl]
      }));
      setImageUrl('');
      setErrors(prev => ({ ...prev, imageUrl: '' }));
    } catch (e) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL' }));
    }
  };

  const handleImageDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(cat => cat !== value)
        : [...prev.categories, value]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>{item ? 'Edit' : 'Add New'} {type === 'destinations' ? 'Destination' : 'Restaurant'}</h2>
        
        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>City</label>
            <select
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              className={errors.locationCity ? 'error' : ''}
            >
              <option value="">Select a city</option>
              {(schemaOptions?.cities || []).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.locationCity && <span className="error-text">{errors.locationCity}</span>}
          </div>

          <div className="form-group">
            <label>Images</label>
            <div className="image-url-input">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className={errors.imageUrl ? 'error' : ''}
              />
              <button 
                type="button" 
                onClick={handleImageUrlAdd}
                className="add-image-button"
              >
                <FaLink /> Add
              </button>
            </div>
            {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            
            <div className="image-preview-list">
              {formData.pictureUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/no-image.jpg';
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => handleImageDelete(index)}
                    className="delete-image-button"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {type === 'destinations' ? (
            <>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Select type</option>
                  {(schemaOptions?.types || []).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Cost</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={errors.cost ? 'error' : ''}
                  min="0"
                />
                {errors.cost && <span className="error-text">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div className="categories-list">
                  {(schemaOptions?.categories || []).map(category => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        value={category}
                        checked={formData.categories.includes(category)}
                        onChange={handleCategoryChange}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className={errors.cuisine ? 'error' : ''}
                />
                {errors.cuisine && <span className="error-text">{errors.cuisine}</span>}
              </div>

              <div className="form-group">
                <label>Price Range</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleChange}
                  className={errors.priceRange ? 'error' : ''}
                >
                  <option value="">Select price range</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
                {errors.priceRange && <span className="error-text">{errors.priceRange}</span>}
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
                
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                
                <input
                  type="url"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  placeholder="Website"
                />
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri: 9 AM - 10 PM"
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
