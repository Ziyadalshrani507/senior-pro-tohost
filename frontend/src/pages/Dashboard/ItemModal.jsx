import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapPicker from '../../components/MapPicker/MapPicker';
import './ItemModal.css';

const ItemModal = ({ item, type, onSave, onClose, schemaOptions }) => {
  const initialFormState = {
    name: '',
    description: '',
    locationCity: '',
    images: [], // Changed from pictureUrls to match Restaurant model
    coordinates: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
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
    openingHours: {
      open: {
        hour: 9,
        minute: 0,
        period: 'AM'
      },
      close: {
        hour: 10,
        minute: 0,
        period: 'PM'
      }
    },
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
  };

  const [formData, setFormData] = useState(initialFormState);

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
        amenities: item.amenities || [],
        openingHours: item.openingHours || initialFormState.openingHours
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
    setFormData(initialFormState);
    setImageUrl('');
    setErrors({});
  };

  const checkNameUniquenessForCity = async () => {
    // Only run this check if we have both a name and city
    if (!formData.name?.trim() || !formData.locationCity?.trim()) {
      return true; // Skip uniqueness check if either field is empty
    }

    try {
      // Search in the items from the same API endpoint but filter by name and city in memory
      // Note: We're targeting the existing listing endpoints rather than a dedicated search endpoint
      // This approach works with existing APIs without requiring backend changes
      let endpoint;
      
      if (type === 'destinations') {
        endpoint = '/api/destinations';
      } else if (type === 'restaurants') {
        endpoint = '/api/restaurants';
      } else if (type === 'hotels') {
        endpoint = '/api/hotels';
      } else {
        return true; // Skip for other item types
      }

      // Fetch all items from the endpoint
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.data || [];
      
      // Filter for items with the same name in the same city, but exclude the current item if editing
      const matchingItems = items.filter(i => 
        i.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        i.locationCity === formData.locationCity &&
        (!item || i._id !== item._id)
      );
      
      return matchingItems.length === 0; // Return true if no duplicates found
    } catch (error) {
      console.error('Error checking name uniqueness:', error);
      // Toast notification about the error but don't block submission
      toast.warning('Could not check for duplicate names due to an error. Your submission will continue, but it may be rejected if a duplicate exists.');
      return true; // In case of error, allow submission to proceed
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.locationCity?.trim()) newErrors.locationCity = 'City is required';
    
    // Check for uniqueness of name within the same city
    const isNameUnique = await checkNameUniquenessForCity();
    if (!isNameUnique) {
      newErrors.name = `A ${type.slice(0, -1)} with this name already exists in ${formData.locationCity}. Names must be unique within each city.`;
      toast.error(`Duplicate name error: ${newErrors.name}`);
    }

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
      
      // Validate opening hours
      if (!formData.openingHours?.open?.hour || !formData.openingHours?.close?.hour) {
        newErrors.openHour = 'Opening hours are required';
      } else {
        // Convert times to 24-hour format for comparison
        const openHour = formData.openingHours.open.hour + (formData.openingHours.open.period === 'PM' && formData.openingHours.open.hour !== 12 ? 12 : 0);
        const closeHour = formData.openingHours.close.hour + (formData.openingHours.close.period === 'PM' && formData.openingHours.close.hour !== 12 ? 12 : 0);
        const openMinute = formData.openingHours.open.minute;
        const closeMinute = formData.openingHours.close.minute;
        
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;
        
        if (closeTime <= openTime) {
          newErrors.openHour = 'Closing time must be after opening time';
        }
      }
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
    
    // validateForm is now async, so we need to await its result
    const isValid = await validateForm();
    if (!isValid) {
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
          images: formData.images || [],
          openingHours: formData.openingHours
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
            // Ensure we preserve 7 decimal places precision for coordinates
            submissionData.coordinates = {
              type: 'Point',
              coordinates: [
                Number(parseFloat(longitude).toFixed(7)),
                Number(parseFloat(latitude).toFixed(7))
              ]
            };
            
            console.log('Using coordinates with 7 decimal precision:', submissionData.coordinates.coordinates);
          }
        }
        
        // Initialize rating properties according to schema
        submissionData.rating = {
          average: 0,
          count: 0
        };
        submissionData.likeCount = 0;
      } else if (type === 'destinations') {
        // For destinations we must use pictureUrls not images field
        // Create a properly formatted object that matches the destination model exactly
        submissionData = {
          ...(item?._id && { _id: item._id }),
          name: formData.name.trim(),
          description: formData.description.trim(),
          locationCity: formData.locationCity,
          type: formData.type,
          // Ensure cost is a number
          cost: parseFloat(formData.cost) || 0,
          categories: formData.categories || [],
          // IMPORTANT: Use pictureUrls for Destination model (not images field)
          pictureUrls: formData.images || [],
          // NOTE: Destination model does not have contact field
          // so we don't include it
          
          // Handle coordinates field correctly
          coordinates: formData.coordinates?.coordinates && 
            Array.isArray(formData.coordinates.coordinates) && 
            formData.coordinates.coordinates.length === 2 ? {
              type: 'Point',
              coordinates: [
                Number(parseFloat(formData.coordinates.coordinates[0]).toFixed(7)),
                Number(parseFloat(formData.coordinates.coordinates[1]).toFixed(7))
              ]
            } : undefined
        };
        
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
            // Ensure we preserve 7 decimal places precision for coordinates
            submissionData.coordinates = {
              type: 'Point',
              coordinates: [
                Number(parseFloat(longitude).toFixed(7)),
                Number(parseFloat(latitude).toFixed(7))
              ]
            };
            
            console.log('Using coordinates with 7 decimal precision:', submissionData.coordinates.coordinates);
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
      // Log the final data being sent
      console.log(`Submitting ${type} data:`, JSON.stringify(submissionData, null, 2));

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
    console.log('Map position changed to:', coordinates);
    // Ensure coordinates are valid numbers with 7 decimal places precision
    const formattedCoordinates = [
      Number(parseFloat(coordinates[0]).toFixed(7)),
      Number(parseFloat(coordinates[1]).toFixed(7))
    ];
    console.log('Formatted coordinates:', formattedCoordinates);
    
    setFormData(prev => ({
      ...prev,
      coordinates: {
        type: 'Point',
        coordinates: formattedCoordinates
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
                  {(schemaOptions?.categories || ['Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe', 'Street Food', 'Traditional']).map(category => (
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
                <label>Opening Hours *</label>
                <div className="time-selectors">
                  <div className="time-group">
                    <label>Opening Time:</label>
                    <div className="time-input-group">
                      <select
                        value={formData.openingHours.open.hour}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            open: {
                              ...prev.openingHours.open,
                              hour: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className={errors.openHour ? 'error' : ''}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={`open-hour-${hour}`} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        value={formData.openingHours.open.minute}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            open: {
                              ...prev.openingHours.open,
                              minute: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className={errors.openMinute ? 'error' : ''}
                      >
                        {[0, 15, 30, 45].map(minute => (
                          <option key={`open-minute-${minute}`} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={formData.openingHours.open.period}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            open: {
                              ...prev.openingHours.open,
                              period: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="time-group">
                    <label>Closing Time:</label>
                    <div className="time-input-group">
                      <select
                        value={formData.openingHours.close.hour}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            close: {
                              ...prev.openingHours.close,
                              hour: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className={errors.closeHour ? 'error' : ''}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={`close-hour-${hour}`} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        value={formData.openingHours.close.minute}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            close: {
                              ...prev.openingHours.close,
                              minute: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className={errors.closeMinute ? 'error' : ''}
                      >
                        {[0, 15, 30, 45].map(minute => (
                          <option key={`close-minute-${minute}`} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={formData.openingHours.close.period}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: {
                            ...prev.openingHours,
                            close: {
                              ...prev.openingHours.close,
                              period: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                {(errors.openHour || errors.openMinute || errors.closeHour || errors.closeMinute) && (
                  <span className="error-message">
                    {errors.openHour || errors.openMinute || errors.closeHour || errors.closeMinute}
                  </span>
                )}
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
