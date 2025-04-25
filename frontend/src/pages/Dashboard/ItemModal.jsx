import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapPicker from '../../components/MapPicker/MapPicker';
import './ItemModal.css';

const ItemModal = ({ item, type, onSave, onClose, schemaOptions }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    images: [], // Changed from pictureUrls to match Restaurant model
    coordinates: {
      type: 'Point',
      coordinates: null // [longitude, latitude]
    },
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
    openingHours: '',
    rating: {
      average: 0,
      count: 0
    },
    // Hotel specific fields
    hotelClass: '',
    amenities: [],
    roomTypes: [],
    checkInTime: '',
    checkOutTime: ''
  });

  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      // Debugging log to check what image data is coming in
      console.log('Editing item with images:', {
        images: item.images,
        pictureUrls: item.pictureUrls
      });
      
      // Get images from the item, handling both old and new formats for backward compatibility
      // This ensures we capture images regardless of where they're stored
      const allImages = [
        ...(Array.isArray(item.images) ? item.images : []),
        ...(Array.isArray(item.pictureUrls) ? item.pictureUrls : [])
      ].filter(url => url && typeof url === 'string' && url.trim());
      
      // Remove duplicates using Set
      const uniqueImages = [...new Set(allImages)];
      console.log('Images to load in form:', uniqueImages);
      
      setFormData({
        ...item,
        // Store the combined unique images
        images: uniqueImages,
        categories: item.categories || [],
        contact: item.contact || { phone: '', email: '', website: '' },
        coordinates: item.coordinates || { type: 'Point', coordinates: null },
        rating: item.rating || { average: 0, count: 0 },
        amenities: item.amenities || []
      });
      
      // Show the images in the UI
      if (uniqueImages.length > 0) {
        console.log('Setting images in form data:', uniqueImages);
      }
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      locationCity: '',
      images: [], // Changed from pictureUrls to match Restaurant model
      coordinates: {
        type: 'Point',
        coordinates: null
      },
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
      openingHours: '',
      rating: {
        average: 0,
        count: 0
      },
      hotelClass: '',
      amenities: [],
      roomTypes: [],
      checkInTime: '',
      checkOutTime: ''
    });
    setImageUrl('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.locationCity?.trim()) newErrors.locationCity = 'City is required';

    // Validate coordinates if provided for any item type
    if (formData.coordinates?.coordinates) {
      const [longitude, latitude] = formData.coordinates.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        newErrors.coordinates = 'Invalid coordinates. Longitude must be between -180 and 180, and latitude between -90 and 90';
      }
    }

    if (type === 'destinations') {
      if (!formData.type?.trim()) newErrors.type = 'Type is required';
      if (!formData.cost?.toString().trim()) newErrors.cost = 'Cost is required';
      if (!formData.coordinates?.coordinates) newErrors.coordinates = 'Location on map is required';
    } else if (type === 'restaurants') {
      if (!formData.cuisine?.trim()) newErrors.cuisine = 'Cuisine is required';
      if (!formData.priceRange?.trim()) newErrors.priceRange = 'Price range is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.contact?.phone?.trim()) newErrors.phone = 'Phone number is required';
      // Optional but recommended for restaurants
      // if (!formData.coordinates?.coordinates) newErrors.coordinates = 'Location on map is recommended';
    } else if (type === 'hotels') {
      if (!formData.hotelClass?.trim()) newErrors.hotelClass = 'Hotel class is required';
      if (!formData.priceRange?.trim()) newErrors.priceRange = 'Price range is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.contact?.phone?.trim()) newErrors.phone = 'Phone number is required';
      if (formData.amenities.length === 0) newErrors.amenities = 'At least one amenity is required';
      // Optional but recommended for hotels
      // if (!formData.coordinates?.coordinates) newErrors.coordinates = 'Location on map is recommended';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a properly formatted data object specifically for API compatibility
      let submissionData = {};
      
      // Copy only the fields that the backend expects
      if (type === 'restaurants') {
        // For restaurants, match exact field structure of Restaurant.js model
        submissionData = {
          ...(item?._id && { _id: item._id }),
          name: formData.name.trim(),
          description: formData.description.trim(),
          cuisine: formData.cuisine,
          priceRange: formData.priceRange,
          locationCity: formData.locationCity,
          address: formData.address.trim(),
          contact: {
            phone: formData.contact.phone.trim(),
            ...(formData.contact.email?.trim() ? { email: formData.contact.email.trim() } : {}),
            ...(formData.contact.website?.trim() ? { website: formData.contact.website.trim() } : {})
          },
          categories: formData.categories || [],
          // Use only the images field as per Restaurant schema
          images: formData.images || []
        };
        
        // Log to confirm images are being sent correctly
        console.log('Submitting restaurant with images:', {
          images: submissionData.images,
          pictureUrls: submissionData.pictureUrls
        });

        // Add coordinates only if they're valid
        if (formData.coordinates?.coordinates && 
            Array.isArray(formData.coordinates.coordinates) && 
            formData.coordinates.coordinates.length === 2) {
          const [longitude, latitude] = formData.coordinates.coordinates;
          // Only add if coordinates are valid numbers within range
          if (!isNaN(longitude) && !isNaN(latitude) &&
              longitude >= -180 && longitude <= 180 &&
              latitude >= -90 && latitude <= 90) {
            submissionData.coordinates = {
              type: 'Point',
              coordinates: [longitude, latitude]
            };
          }
        }
        
        // Initialize rating properties according to schema
        submissionData.rating = {
          average: 0,
          count: 0
        };
        submissionData.likeCount = 0;
      } else if (type === 'hotels') {
        // For hotels
        submissionData = {
          ...(item?._id && { _id: item._id }),
          name: formData.name,
          description: formData.description,
          locationCity: formData.locationCity,
          address: formData.address,
          hotelClass: formData.hotelClass,
          priceRange: formData.priceRange,
          amenities: formData.amenities || [],
          contact: {
            phone: formData.contact.phone.trim(),
            ...(formData.contact.email?.trim() ? { email: formData.contact.email.trim() } : {}),
            ...(formData.contact.website?.trim() ? { website: formData.contact.website.trim() } : {})
          },
          // Use images field
          images: formData.images || [],
          roomTypes: formData.roomTypes || [],
          checkInTime: formData.checkInTime || '',
          checkOutTime: formData.checkOutTime || ''
        };
        
        // Add coordinates only if they're valid
        if (formData.coordinates?.coordinates && 
            Array.isArray(formData.coordinates.coordinates) && 
            formData.coordinates.coordinates.length === 2) {
          const [longitude, latitude] = formData.coordinates.coordinates;
          // Only add if coordinates are valid numbers within range
          if (!isNaN(longitude) && !isNaN(latitude) &&
              longitude >= -180 && longitude <= 180 &&
              latitude >= -90 && latitude <= 90) {
            submissionData.coordinates = {
              type: 'Point',
              coordinates: [longitude, latitude]
            };
          }
        }
        
        // Initialize rating properties according to schema
        submissionData.rating = {
          average: 0,
          count: 0
        };
        submissionData.likeCount = 0;
      } else {
        // For all other types, pass data as is
        submissionData = {
          ...formData,
          ...(item?._id && { _id: item._id }),
          // Use only images field
          images: formData.images || []
        };
      }

      // Debug log the final data being sent to the API
      console.log(`Submitting ${type} data:`, submissionData);

      await onSave(submissionData);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      setErrors({ submit: 'Error saving item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
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

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };
  
  const handleAddRoomType = () => {
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, { name: '', capacity: 1, pricePerNight: 0, available: 0 }]
    }));
  };
  
  const handleRoomTypeChange = (index, field, value) => {
    setFormData(prev => {
      const updatedRoomTypes = [...prev.roomTypes];
      updatedRoomTypes[index] = { ...updatedRoomTypes[index], [field]: value };
      return { ...prev, roomTypes: updatedRoomTypes };
    });
  };
  
  const handleRemoveRoomType = (index) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const handleImageAdd = () => {
    if (imageUrl.trim()) {
      // Don't add duplicate images
      if (formData.images.includes(imageUrl.trim())) {
        toast.warning('This image URL already exists');
        setImageUrl('');
        return;
      }

      const newImages = [...formData.images, imageUrl.trim()];
      console.log('Adding image, new image array:', newImages);
      
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
      
      // Clear the input field
      setImageUrl('');
      
      // Show success message
      toast.success('Image added successfully');
    } else {
      toast.error('Please enter a valid image URL');
    }
  };

  const handleImageRemove = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
    toast.success('Image removed');
  };

  const handleMapPositionChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        type: 'Point',
        coordinates
      }
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>
          {item ? 'Edit' : 'Add New'} {
            type === 'destinations' ? 'Destination' : 
            type === 'restaurants' ? 'Restaurant' : 
            type === 'hotels' ? 'Hotel' : 'Tour'
          }
        </h2>
        
        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>City *</label>
            <select
              name="locationCity"
              value={formData.locationCity}
              onChange={handleInputChange}
              className={errors.locationCity ? 'error' : ''}
            >
              <option value="">Select a city</option>
              {schemaOptions?.cities?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.locationCity && <span className="error-message">{errors.locationCity}</span>}
          </div>

          {type === 'destinations' && (
            <>
              <div className="form-group">
                <label>Location on Map *</label>
                <MapPicker
                  position={formData.coordinates?.coordinates}
                  onPositionChange={handleMapPositionChange}
                />
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Select a type</option>
                  {schemaOptions?.types?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Cost (SAR) *</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className={errors.cost ? 'error' : ''}
                  min="0"
                />
                {errors.cost && <span className="error-message">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div className="categories-grid">
                  {schemaOptions?.categories?.map(category => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'restaurants' && (
            <>
              <div className="form-group">
                <label>Cuisine *</label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className={errors.cuisine ? 'error' : ''}
                >
                  <option value="">Select cuisine</option>
                  {schemaOptions?.cuisines?.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                {errors.cuisine && <span className="error-message">{errors.cuisine}</span>}
              </div>

              <div className="form-group">
                <label>Price Range *</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className={errors.priceRange ? 'error' : ''}
                >
                  <option value="">Select price range</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>
                {errors.priceRange && <span className="error-message">{errors.priceRange}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Location on Map</label>
                <MapPicker
                  position={formData.coordinates?.coordinates}
                  onPositionChange={handleMapPositionChange}
                />
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div className="categories-grid">
                  {['Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe', 'Street Food', 'Traditional'].map(category => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <div className="contact-fields">
                  <input
                    type="tel"
                    name="contact.phone"
                    placeholder="Phone *"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                  
                  <input
                    type="email"
                    name="contact.email"
                    placeholder="Email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                  />
                  
                  <input
                    type="url"
                    name="contact.website"
                    placeholder="Website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <textarea
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {type === 'hotels' && (
            <>
              <div className="form-group">
                <label>Hotel Class *</label>
                <select
                  name="hotelClass"
                  value={formData.hotelClass}
                  onChange={handleInputChange}
                  className={errors.hotelClass ? 'error' : ''}
                >
                  <option value="">Select hotel class</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
                {errors.hotelClass && <span className="error-message">{errors.hotelClass}</span>}
              </div>

              <div className="form-group">
                <label>Amenities *</label>
                <div className="categories-grid">
                  {schemaOptions?.amenities?.map(amenity => (
                    <label key={amenity} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      {amenity}
                    </label>
                  )) || [
                    'Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant',
                    'Room Service', 'Airport Shuttle', 'Parking', 'Air Conditioning',
                    'Laundry Service', 'Business Center', 'Pet Friendly'
                  ].map(amenity => (
                    <label key={amenity} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
                {errors.amenities && <span className="error-message">{errors.amenities}</span>}
              </div>

              <div className="form-group">
                <label>Price Range *</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className={errors.priceRange ? 'error' : ''}
                >
                  <option value="">Select price range</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>
                {errors.priceRange && <span className="error-message">{errors.priceRange}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Location on Map</label>
                <MapPicker
                  position={formData.coordinates?.coordinates}
                  onPositionChange={handleMapPositionChange}
                />
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>

              <div className="form-group">
                <label>Check-in/Check-out Times</label>
                <div className="time-inputs">
                  <div>
                    <label>Check-in</label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Check-out</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Room Types</label>
                <button type="button" onClick={handleAddRoomType} className="add-btn">
                  Add Room Type
                </button>
                
                {formData.roomTypes.map((room, index) => (
                  <div key={index} className="room-type-item">
                    <div className="room-type-header">
                      <input
                        type="text"
                        placeholder="Room name"
                        value={room.name}
                        onChange={(e) => handleRoomTypeChange(index, 'name', e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRoomType(index)}
                        className="remove-btn"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="room-type-details">
                      <div>
                        <label>Capacity</label>
                        <input
                          type="number"
                          min="1"
                          value={room.capacity}
                          onChange={(e) => handleRoomTypeChange(index, 'capacity', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label>Price per Night (SAR)</label>
                        <input
                          type="number"
                          min="0"
                          value={room.pricePerNight}
                          onChange={(e) => handleRoomTypeChange(index, 'pricePerNight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <label>Available Rooms</label>
                        <input
                          type="number"
                          min="0"
                          value={room.available}
                          onChange={(e) => handleRoomTypeChange(index, 'available', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <div className="contact-fields">
                  <input
                    type="tel"
                    name="contact.phone"
                    placeholder="Phone"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                  
                  <input
                    type="email"
                    name="contact.email"
                    placeholder="Email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                  />
                  
                  <input
                    type="url"
                    name="contact.website"
                    placeholder="Website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Images</label>
            <div className="image-input">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className={errors.imageUrl ? 'error' : ''}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImageAdd();
                  }
                }}
              />
              <button type="button" onClick={handleImageAdd}>
                <FaLink /> Add
              </button>
            </div>
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
            
            <div className="image-list">
              {formData.images && formData.images.length > 0 ? (
                formData.images.map((url, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={url} 
                      alt={`${formData.name || 'Image'} ${index + 1}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/100x100?text=Invalid+Image';
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleImageRemove(index)}
                      className="delete-image-button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-images-message">No images added yet. Add image URLs above.</p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
