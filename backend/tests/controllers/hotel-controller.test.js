const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Hotel = require('../../Models/Hotel');
const hotelController = require('../../Controllers/hotelController');

// Create test user ID
const testUserId = new mongoose.Types.ObjectId();

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    _id: testUserId,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin' // For testing admin-only routes like hardDeleteHotel
  };
  next();
};

// Set up express app for testing
const app = express();
app.use(express.json());

// Set up routes
app.get('/api/hotels', hotelController.getHotels);
app.get('/api/hotels/schema-options', hotelController.getSchemaOptions);
app.get('/api/hotels/:id', hotelController.getHotelById);
app.post('/api/hotels', mockAuthMiddleware, hotelController.createHotel);
app.put('/api/hotels/:id', mockAuthMiddleware, hotelController.updateHotel);
app.delete('/api/hotels/:id', mockAuthMiddleware, hotelController.deleteHotel);
app.delete('/api/hotels/:id/hard', mockAuthMiddleware, hotelController.hardDeleteHotel);

describe('Hotel Controller Tests', () => {
  // Test hotels
  let luxuryHotel, budgetHotel, businessHotel;
  
  beforeEach(async () => {
    // Clear the database before each test
    await Hotel.deleteMany({});
    
    // Create test hotels
    luxuryHotel = await Hotel.create({
      name: 'Luxury Palace Hotel',
      description: 'A luxury hotel for testing',
      locationCity: 'Riyadh',
      address: '123 Luxury Ave, Riyadh',
      hotelClass: '5',
      priceRange: '$$$$',
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552] // Riyadh coordinates
      },
      amenities: ['Wi-Fi', 'Swimming Pool', 'Spa', 'Restaurant', 'Room Service'],
      roomTypes: [
        {
          name: 'Deluxe Suite',
          capacity: 2,
          pricePerNight: 1500,
          available: 5
        },
        {
          name: 'Presidential Suite',
          capacity: 4,
          pricePerNight: 3000,
          available: 1
        }
      ],
      contact: {
        phone: '+966123456789',
        email: 'luxury@example.com',
        website: 'https://luxury-palace.example.com'
      },
      featured: true,
      country: 'Saudi Arabia'
    });
    
    budgetHotel = await Hotel.create({
      name: 'Budget Stay Inn',
      description: 'An affordable hotel for testing',
      locationCity: 'Jeddah',
      address: '456 Budget St, Jeddah',
      hotelClass: '3',
      priceRange: '$$',
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811] // Jeddah coordinates
      },
      amenities: ['Wi-Fi', 'Breakfast Included'],
      roomTypes: [
        {
          name: 'Standard Room',
          capacity: 2,
          pricePerNight: 300,
          available: 20
        },
        {
          name: 'Family Room',
          capacity: 4,
          pricePerNight: 500,
          available: 10
        }
      ],
      contact: {
        phone: '+966123456790',
        email: 'budget@example.com',
        website: 'https://budget-stay.example.com'
      },
      featured: false,
      country: 'Saudi Arabia'
    });
    
    businessHotel = await Hotel.create({
      name: 'Business Traveler Hotel',
      description: 'A hotel for business travelers',
      locationCity: 'Riyadh',
      address: '789 Business Blvd, Riyadh',
      hotelClass: '4',
      priceRange: '$$$',
      coordinates: {
        type: 'Point',
        coordinates: [46.690090, 24.727491] // Different Riyadh location
      },
      amenities: ['Wi-Fi', 'Business Center', 'Conference Rooms', 'Restaurant'],
      roomTypes: [
        {
          name: 'Business Suite',
          capacity: 1,
          pricePerNight: 800,
          available: 15
        }
      ],
      contact: {
        phone: '+966123456791',
        email: 'business@example.com',
        website: 'https://business-traveler.example.com'
      },
      featured: false,
      country: 'Saudi Arabia'
    });
  });
  
  afterEach(async () => {
    await Hotel.deleteMany({});
  });
  
  describe('GET /api/hotels', () => {
    test('Should return all hotels that are not deleted', async () => {
      const response = await request(app).get('/api/hotels');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check if the hotels include our test hotels
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).toContain('Budget Stay Inn');
      expect(names).toContain('Business Traveler Hotel');
    });
    
    test('Should filter hotels by city', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ city: 'Riyadh' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned hotels should be in Riyadh
      response.body.forEach(hotel => {
        expect(hotel.locationCity).toBe('Riyadh');
      });
      
      // Should include both Riyadh hotels
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).toContain('Business Traveler Hotel');
      expect(names).not.toContain('Budget Stay Inn');
    });
    
    test('Should filter hotels by price range', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ priceRange: '$$$$' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned hotels should have the specified price range
      response.body.forEach(hotel => {
        expect(hotel.priceRange).toBe('$$$$');
      });
      
      // Should include only the luxury hotel
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).not.toContain('Budget Stay Inn');
      expect(names).not.toContain('Business Traveler Hotel');
    });
    
    test('Should filter hotels by hotel class', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ hotelClass: '5' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned hotels should have the specified hotel class
      response.body.forEach(hotel => {
        expect(hotel.hotelClass).toBe('5');
      });
      
      // Should include only the luxury hotel
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).not.toContain('Budget Stay Inn');
      expect(names).not.toContain('Business Traveler Hotel');
    });
    
    test('Should filter hotels by amenities', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ amenities: 'Spa' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned hotels should have the specified amenity
      response.body.forEach(hotel => {
        expect(hotel.amenities).toContain('Spa');
      });
      
      // Should include only the luxury hotel
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
    });
    
    test('Should filter hotels by featured flag', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ featured: 'true' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned hotels should be featured
      response.body.forEach(hotel => {
        expect(hotel.featured).toBe(true);
      });
      
      // Should include only the luxury hotel
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).not.toContain('Budget Stay Inn');
      expect(names).not.toContain('Business Traveler Hotel');
    });
    
    test('Should limit the number of returned hotels', async () => {
      const response = await request(app)
        .get('/api/hotels')
        .query({ limit: '2' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });
    
    test('Should sort hotels by rating', async () => {
      // First, let's update a hotel to have a higher rating
      await Hotel.findByIdAndUpdate(luxuryHotel._id, {
        'rating.average': 4.8,
        'rating.count': 50
      });
      
      await Hotel.findByIdAndUpdate(budgetHotel._id, {
        'rating.average': 3.5,
        'rating.count': 30
      });
      
      const response = await request(app)
        .get('/api/hotels')
        .query({ sort: 'rating' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Check if the hotels are sorted by rating (highest first)
      if (response.body.length >= 2) {
        const ratings = response.body.map(h => h.rating.average);
        for (let i = 0; i < ratings.length - 1; i++) {
          expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
        }
      }
    });
  });
  
  describe('GET /api/hotels/schema-options', () => {
    test('Should return schema options with enum values', async () => {
      const response = await request(app).get('/api/hotels/schema-options');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('hotelClasses');
      expect(response.body).toHaveProperty('priceRanges');
      expect(response.body).toHaveProperty('amenities');
      
      // Verify the schema options contain expected values
      expect(response.body.cities).toContain('Riyadh');
      expect(response.body.hotelClasses).toContain('5');
      expect(response.body.priceRanges).toContain('$$$$');
      expect(response.body.amenities).toContain('Wi-Fi');
    });
  });
  
  describe('GET /api/hotels/:id', () => {
    test('Should return a single hotel by ID', async () => {
      const response = await request(app).get(`/api/hotels/${luxuryHotel._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', luxuryHotel._id.toString());
      expect(response.body.name).toBe('Luxury Palace Hotel');
      expect(response.body.hotelClass).toBe('5');
      
      // Check if room types are included
      expect(response.body.roomTypes).toHaveLength(2);
      expect(response.body.roomTypes[0].name).toBe('Deluxe Suite');
    });
    
    test('Should return 404 for non-existent hotel', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/hotels/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
  
  describe('POST /api/hotels', () => {
    test('Should create a new hotel with valid data', async () => {
      const newHotelData = {
        name: 'New Test Hotel',
        description: 'A new hotel for testing',
        locationCity: 'Mecca',
        address: '123 Test St, Mecca',
        hotelClass: '4',
        priceRange: '$$$',
        coordinates: {
          type: 'Point',
          coordinates: [39.826168, 21.422510] // Mecca coordinates
        },
        amenities: ['Wi-Fi', 'Swimming Pool', 'Breakfast Included'],
        roomTypes: [
          {
            name: 'Standard Room',
            capacity: 2,
            pricePerNight: 600,
            available: 10
          }
        ],
        contact: {
          phone: '+966123456792',
          email: 'test@example.com',
          website: 'https://test-hotel.example.com'
        }
      };
      
      const response = await request(app)
        .post('/api/hotels')
        .send(newHotelData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Test Hotel');
      expect(response.body.locationCity).toBe('Mecca');
      
      // Verify it was saved to the database
      const savedHotel = await Hotel.findById(response.body._id);
      expect(savedHotel).toBeTruthy();
      expect(savedHotel.name).toBe('New Test Hotel');
      expect(savedHotel.roomTypes).toHaveLength(1);
    });
    
    test('Should reject creating hotel with missing required fields', async () => {
      const invalidData = {
        name: 'Incomplete Hotel',
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/hotels')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
    });
    
    test('Should reject creating hotel with missing contact information', async () => {
      const invalidData = {
        name: 'Hotel With Missing Contact',
        description: 'A test hotel',
        locationCity: 'Riyadh',
        address: '123 Test St, Riyadh',
        // Missing contact information
      };
      
      const response = await request(app)
        .post('/api/hotels')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toContain('Contact information is required');
    });
  });
  
  describe('PUT /api/hotels/:id', () => {
    test('Should update a hotel with valid data', async () => {
      const updateData = {
        name: 'Updated Luxury Palace',
        description: 'Updated luxury hotel description',
        hotelClass: '5'
      };
      
      const response = await request(app)
        .put(`/api/hotels/${luxuryHotel._id}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Luxury Palace');
      expect(response.body.description).toBe('Updated luxury hotel description');
      
      // Verify it was updated in the database
      const updatedHotel = await Hotel.findById(luxuryHotel._id);
      expect(updatedHotel.name).toBe('Updated Luxury Palace');
    });
    
    test('Should return 404 for non-existent hotel', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/hotels/${fakeId}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
  
  describe('DELETE /api/hotels/:id (Soft Delete)', () => {
    test('Should soft delete a hotel', async () => {
      const response = await request(app)
        .delete(`/api/hotels/${luxuryHotel._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hotel deleted successfully');
      
      // Verify it was soft deleted (isDeleted = true)
      const deletedHotel = await Hotel.findById(luxuryHotel._id);
      expect(deletedHotel).toBeTruthy();
      expect(deletedHotel.isDeleted).toBe(true);
      
      // Soft deleted hotels should not appear in regular GET requests
      const getResponse = await request(app).get('/api/hotels');
      const hotelNames = getResponse.body.map(h => h.name);
      expect(hotelNames).not.toContain('Luxury Palace Hotel');
    });
    
    test('Should return 404 for non-existent hotel', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/hotels/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
  
  describe('DELETE /api/hotels/:id/hard (Hard Delete)', () => {
    test('Should permanently delete a hotel', async () => {
      const response = await request(app)
        .delete(`/api/hotels/${luxuryHotel._id}/hard`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hotel permanently deleted');
      
      // Verify it was completely removed from the database
      const deletedHotel = await Hotel.findById(luxuryHotel._id);
      expect(deletedHotel).toBeFalsy();
    });
    
    test('Should return 404 for non-existent hotel', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/hotels/${fakeId}/hard`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
});
