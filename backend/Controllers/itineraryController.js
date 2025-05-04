const Itinerary = require("../Models/Itinerary");
const Destination = require("../Models/Destination");
const Hotel = require("../Models/Hotel");
const { Restaurant, CUISINES, CATEGORIES } = require("../Models/Restaurant");
const openai = require("../config/openai");

// Helper function to construct prompt for OpenAI
const constructPrompt = (userData, places) => {
  const { destination, duration, interests, budget, travelersType, foodPreferences } = userData;
  const { destinations, hotels, restaurants } = places;
  
  // Format destinations, hotels, and restaurants for the prompt
  const destinationsList = destinations.map(d => `${d.name} (${d.description.substring(0, 50)}...)`).join('\n');
  const hotelsList = hotels.map(h => `${h.name} (${h.priceRange})`).join('\n');
  const restaurantsList = restaurants.map(r => `${r.name} (${r.cuisine})`).join('\n');
  
  return `You are a travel expert AI. Based on the following user preferences, create a ${duration}-day itinerary for ${destination}.
Interests: ${interests.join(', ')}.
Budget: ${budget}.
Travelers: ${travelersType}.
Food Preferences: ${foodPreferences && foodPreferences.cuisines ? `Cuisines: ${foodPreferences.cuisines.join(', ')}, Categories: ${foodPreferences.categories.join(', ')}` : 'No specific preferences'}.

Create a day-by-day itinerary with the following structure for each day:
- Morning: Activity and brief description
- Lunch: Restaurant recommendation and brief description
- Afternoon: Activity and brief description
- Dinner: Restaurant recommendation and brief description

Additionally, recommend ONE hotel for the entire stay.

Suggest activities, restaurants, and hotels. Pick only from the following options:

Destinations/Activities:
${destinationsList}

Restaurants:
${restaurantsList}

Hotels:
${hotelsList}

IMPORTANT: Use the exact names of places listed above. Recommend only ONE hotel for the entire stay. Ensure activities and restaurants align with the user's interests and budget. Format your response as JSON with the following structure:
{
  "hotel": { "place": "EXACT_NAME", "description": "Brief description about why this hotel is recommended for the entire stay" },
  "days": [
    {
      "day": 1,
      "morning": { "activity": "EXACT_NAME", "description": "Brief description" },
      "lunch": { "restaurant": "EXACT_NAME", "description": "Brief description" },
      "afternoon": { "activity": "EXACT_NAME", "description": "Brief description" },
      "dinner": { "restaurant": "EXACT_NAME", "description": "Brief description" },
      "notes": "Any additional tips for this day"
    },
    ...
  ]
}`;
};

// Generate a new itinerary - temporarily stored until user decides to save it
const generateItinerary = async (req, res) => {
  try {
    const { city, duration, interests, budget, travelersType, foodPreferences } = req.body;
    
    if (!city || !duration || !interests || !budget || !travelersType) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // We're now using city name directly instead of looking up a destination by ID

    // Log the search criteria for debugging
    console.log(`Searching for activities in ${city} with interests: ${interests}`);

    // First, check what categories actually exist for this city
    const availableCategories = await Destination.distinct('categories', { locationCity: city });
    console.log(`Available categories in ${city}: ${availableCategories.join(', ')}`);

    // Find activities in the selected city - but ignore interests if we can't find any matches
    let activities = await Destination.find({ 
      locationCity: city,
      categories: { $in: interests }
    }).limit(10);

    // If no activities found with the specified interests, get any activities in this city
    if (activities.length === 0) {
      console.log(`No activities found with specified interests. Getting any activities in ${city}...`);
      activities = await Destination.find({ 
        locationCity: city,
        type: { $ne: "restaurant" } // Exclude restaurants
      }).limit(10);
    }

    // Find hotels in the selected city based on budget
    let priceRange;
    switch(budget) {
      case "Low":
        priceRange = { $in: ["$", "$$"] };
        break;
      case "Medium":
        priceRange = { $in: ["$$", "$$$"] };
        break;
      case "Luxury":
        priceRange = { $in: ["$$$", "$$$$"] };
        break;
      default:
        priceRange = { $exists: true };
    }

    console.log(`Searching for hotels in ${city} with price range: ${priceRange}`);

    // Get all hotels in this city regardless of price range first
    let allHotelsInCity = await Hotel.find({ 
      locationCity: city
    });
    console.log(`Found ${allHotelsInCity.length} hotels in ${city}`);

    // Then filter by price range
    let hotels = await Hotel.find({ 
      locationCity: city,
      priceRange: priceRange
    }).limit(5);

    // If no hotels found with the specified price range, get any hotels in this city
    if (hotels.length === 0 && allHotelsInCity.length > 0) {
      console.log(`No hotels found with specified price range. Using any hotels in ${city}...`);
      hotels = allHotelsInCity.slice(0, 5);
    }

    // Explore what destination types exist for debugging
    const availableTypes = await Destination.distinct('type', { locationCity: city });
    console.log(`Available destination types in ${city}: ${availableTypes.join(', ')}`);
    
    // Find restaurants in the selected city using the Restaurant model and food preferences
    console.log(`Searching for restaurants in ${city} with user food preferences...`);
    
    // Extract food preferences if they exist
    const preferredCuisines = req.body.foodPreferences?.cuisines || [];
    const preferredCategories = req.body.foodPreferences?.categories || [];
    
    console.log('Preferred cuisines:', preferredCuisines);
    console.log('Preferred dining categories:', preferredCategories);
    
    // Build the query based on user preferences
    const restaurantQuery = { locationCity: city };
    
    // Add cuisine preferences if specified
    if (preferredCuisines.length > 0) {
      // Use cuisines from the Restaurant model
      console.log('Available cuisines from model:', CUISINES);
      
      // Map cuisine codes to actual cuisine names
      const cuisineMapping = {};
      
      // Create a mapping of lowercase cuisine names to their properly cased versions
      CUISINES.forEach(cuisine => {
        cuisineMapping[cuisine.toLowerCase().replace(/\s+/g, '_')] = cuisine;
      });
      
      // Also add some common alias mappings
      cuisineMapping['saudi_arabian'] = 'Saudi Arabian';
      cuisineMapping['middle_eastern'] = 'Middle Eastern';
      
      console.log('Using cuisine mapping:', cuisineMapping);
      
      const mappedCuisines = preferredCuisines
        .map(id => cuisineMapping[id])
        .filter(cuisine => cuisine); // Filter out any undefined values
      
      if (mappedCuisines.length > 0) {
        restaurantQuery.cuisine = { $in: mappedCuisines };
      }
    }
    
    // Add category preferences if specified
    if (preferredCategories.length > 0) {
      // Use categories from the Restaurant model
      console.log('Available categories from model:', CATEGORIES);
      
      // Map category codes to actual category names
      const categoryMapping = {};
      
      // Create a mapping of lowercase category names to their properly cased versions
      CATEGORIES.forEach(category => {
        categoryMapping[category.toLowerCase().replace(/\s+/g, '_')] = category;
      });
      
      // Also add common alias mappings for compatibility
      categoryMapping['family_friendly'] = 'Family Style';
      categoryMapping['outdoor_seating'] = 'Outdoor';
      
      // Convert IDs to actual category names
      const mappedCategories = preferredCategories
        .map(id => categoryMapping[id])
        .filter(category => category); // Filter out any undefined values
      
      if (mappedCategories.length > 0) {
        restaurantQuery.categories = { $in: mappedCategories };
      }
    }
    
    // Query the Restaurant collection with preferences
    let restaurants = await Restaurant.find(restaurantQuery).limit(10);
    
    console.log(`Found ${restaurants.length} restaurants in ${city} matching user preferences`);
    
    // If we have restaurants, display their cuisine and category information
    if (restaurants.length > 0) {
      console.log('Available restaurant cuisines:', restaurants.map(r => r.cuisine).join(', '));
      const categories = restaurants.flatMap(r => r.categories || []);
      const uniqueCategories = [...new Set(categories)];
      console.log('Available restaurant categories:', uniqueCategories.join(', '));
    }
    
    // If no restaurants found in the Restaurant collection, create custom entries
    if (restaurants.length === 0) {
      console.log('No restaurants found in database. Creating custom restaurant entries for the itinerary...');
      
      // Create realistic Saudi restaurant suggestions based on common cuisines and categories
      restaurants = [
        {
          name: `${city} Traditional Restaurant`,
          description: 'Experience authentic Saudi cuisine in a traditional setting',
          cuisine: 'Saudi Arabian',
          categories: ['Fine Dining', 'Halal'],
          priceRange: budget === 'Low' ? '$' : budget === 'Medium' ? '$$' : '$$$',
          locationCity: city
        },
        {
          name: 'Al-Bayt Café',
          description: 'A cozy café serving local coffee, tea, and light meals',
          cuisine: 'Middle Eastern',
          categories: ['Cafe', 'Casual Dining'],
          priceRange: budget === 'Low' ? '$' : '$$',
          locationCity: city
        },
        {
          name: 'Najd House',
          description: 'Authentic Saudi dishes from the central Najd region',
          cuisine: 'Saudi Arabian',
          categories: ['Family Style', 'Halal'],
          priceRange: budget === 'Low' ? '$' : budget === 'Medium' ? '$$' : '$$$',
          locationCity: city
        },
        {
          name: 'Royal Dining Palace',
          description: 'Elegant restaurant featuring Saudi and international cuisines',
          cuisine: budget === 'Luxury' ? 'French' : 'Middle Eastern',
          categories: ['Fine Dining', 'Rooftop'],
          priceRange: budget === 'Low' ? '$$' : budget === 'Medium' ? '$$$' : '$$$$',
          locationCity: city
        },
        {
          name: 'Heritage Grill',
          description: 'Traditional grilled meats and local specialties',
          cuisine: 'Middle Eastern',
          categories: ['Barbecue', 'Casual Dining'],
          priceRange: budget === 'Low' ? '$' : '$$',
          locationCity: city
        }
      ];
    }

    // Check if we have at least some data to work with
    const hasActivities = activities.length > 0;
    const hasHotels = hotels.length > 0;
    const hasRestaurants = restaurants.length > 0;
    
    // Log what data we found for debugging
    console.log(`Itinerary data for ${city}:\n` +
                `- Activities: ${activities.length}\n` +
                `- Hotels: ${hotels.length}\n` +
                `- Restaurants: ${restaurants.length}`);

    // If we have no data at all for this city, return an error
    if (!hasActivities && !hasHotels && !hasRestaurants) {
      return res.status(404).json({
        success: false,
        message: "No data available for the selected destination"
      });
    }
    
    // If we're missing just one or two types of data, we can still generate a partial itinerary
    // We'll create placeholder data for missing types
    if (!hasActivities) {
      activities = [{
        name: "Explore the city",
        description: "Take a self-guided tour of the city's landmarks and attractions"
      }];
    }
    
    if (!hasHotels) {
      hotels = [{
        name: "Recommended Hotel",
        priceRange: budget === "Low" ? "$" : budget === "Medium" ? "$$" : "$$$",
        description: "We recommend finding accommodations through popular booking sites"
      }];
    }
    
    if (!hasRestaurants) {
      restaurants = [{
        name: "Local Restaurant",
        cuisine: "Saudi",
        description: "Try the local cuisine at one of the many restaurants in the area"
      }];
    }

    // Function to generate a simple itinerary when OpenAI is unavailable
    const generateFallbackItinerary = (city, duration, interests, budget, travelersType, foodPreferences, places) => {
      console.log('Using fallback itinerary generator...');
      const { destinations: activities, hotels, restaurants } = places;
      const days = [];

      // Select a single hotel for the entire stay
      const hotelPlace = hotels.length > 0 
        ? hotels[Math.floor(Math.random() * hotels.length)] 
        : { name: 'Recommended Accommodation', description: 'Find a comfortable place to stay' };

      // Create the specified number of days
      for (let i = 1; i <= duration; i++) {
        // Pick random activities, trying not to repeat if possible
        const availableActivities = [...activities];
        const morningActivity = availableActivities.length > 0 
          ? availableActivities.splice(Math.floor(Math.random() * availableActivities.length), 1)[0] 
          : { name: 'Explore the city', description: 'Discover the local attractions' };
        
        const afternoonActivity = availableActivities.length > 0 
          ? availableActivities.splice(Math.floor(Math.random() * availableActivities.length), 1)[0] 
          : { name: 'Cultural visit', description: 'Experience the local culture' };

        // Filter restaurants based on food preferences if available
        let availableRestaurants = [...restaurants];
        
        if (foodPreferences && foodPreferences.cuisines && foodPreferences.cuisines.length > 0) {
          // Use cuisines from the Restaurant model
          console.log('Available cuisines from model:', CUISINES);
          
          // Map cuisine codes to actual cuisine names
          const cuisineMapping = {};
          
          // Create a mapping of lowercase cuisine names to their properly cased versions
          CUISINES.forEach(cuisine => {
            cuisineMapping[cuisine.toLowerCase().replace(/\s+/g, '_')] = cuisine;
          });
          
          // Also add some common alias mappings
          cuisineMapping['saudi_arabian'] = 'Saudi Arabian';
          cuisineMapping['middle_eastern'] = 'Lebanese';
          
          console.log('Using cuisine mapping:', cuisineMapping);
          
          const preferredCuisineNames = foodPreferences.cuisines
            .map(code => cuisineMapping[code])
            .filter(name => name); // Remove undefined values
            
          console.log('Preferred cuisine names:', preferredCuisineNames);
            
          if (preferredCuisineNames.length > 0) {
            availableRestaurants = availableRestaurants.filter(r => 
              preferredCuisineNames.includes(r.cuisine)
            );
          }
        }
        
        // If no restaurants match preferences, use all available
        if (availableRestaurants.length === 0) {
          availableRestaurants = [...restaurants];
        }

        // Pick random restaurants or use placeholders
        const lunchPlace = availableRestaurants.length > 0 
          ? availableRestaurants.splice(Math.floor(Math.random() * availableRestaurants.length), 1)[0] 
          : { name: 'Local Restaurant', description: 'Try the local cuisine' };
        
        const dinnerPlace = availableRestaurants.length > 0 
          ? availableRestaurants.splice(Math.floor(Math.random() * availableRestaurants.length), 1)[0] 
          : { name: 'Traditional Dining', description: 'Experience traditional Saudi dishes' };


        // Create the day entry
        days.push({
          day: i,
          morning: { 
            activity: morningActivity.name, 
            description: morningActivity.description || 'Enjoy this popular attraction'
          },
          lunch: { 
            restaurant: lunchPlace.name, 
            description: lunchPlace.description || 'Enjoy a delicious meal'
          },
          afternoon: { 
            activity: afternoonActivity.name, 
            description: afternoonActivity.description || 'Enjoy this popular attraction'
          },
          dinner: { 
            restaurant: dinnerPlace.name, 
            description: dinnerPlace.description || 'Enjoy a delicious meal'
          },
          notes: `Day ${i} in ${city}: Focus on ${interests.length > 0 ? interests[0] : 'local experiences'}`
        });
      }

      return { 
        days,
        hotel: {
          place: hotelPlace.name,
          description: hotelPlace.description || `A comfortable place to stay during your ${duration}-day trip to ${city}`
        }
      };
    };

    // Try to use OpenAI to generate the itinerary
    try {
      console.log('Attempting to generate itinerary using OpenAI...');
      
      // Construct the prompt with all user preferences including food preferences
      const prompt = constructPrompt(
        { 
          destination: city, 
          duration: parseInt(duration), 
          interests, 
          budget, 
          travelersType,
          foodPreferences: foodPreferences || { cuisines: [], categories: [] }
        },
        { destinations: activities, hotels, restaurants }
      );
      
      console.log('Using food preferences in OpenAI prompt:', foodPreferences || 'None provided');
      
      let itineraryData;
      let usingFallback = false;
      
      try {
        // Try to get a response from OpenAI
        const completion = await openai.createChatCompletion({
          model: "anthropic/claude-3-opus:beta", // Using Claude 3 Opus through OpenRouter
          messages: [
            { role: "system", content: "You are a travel expert specialized in Saudi Arabian tourism, with deep knowledge of local culture, attractions, and dining options." },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });
        
        // Parse the response
        const content = completion.data.choices[0].message.content;
        
        try {
          itineraryData = JSON.parse(content);
          console.log('Successfully generated itinerary with OpenAI');
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
          throw new Error('Failed to parse OpenAI response');
        }
      } catch (openaiError) {
        // Handle OpenAI API errors (including rate limits)
        console.error("OpenAI API error:", openaiError.message);
        console.log("Using fallback itinerary generator due to OpenAI error");
        
        // Use our fallback generator instead
        itineraryData = generateFallbackItinerary(
          city, 
          parseInt(duration), 
          interests, 
          budget, 
          travelersType,
          foodPreferences,
          {
            destinations: activities,
            hotels,
            restaurants
          }
        );
        usingFallback = true;
      }
      
      // Extract data from the generated itinerary
      const { hotel, days } = itineraryData;
      
      // Create the new itinerary document
      const itineraryDoc = {
        name: `${duration}-Day Trip to ${city}`,
        city: city,
        destination: city,
        duration: duration,
        hotel: hotel,
        days: days,
        interests: interests,
        budget: budget,
        travelersType: travelersType,
        foodPreferences: foodPreferences,
        isAIGenerated: true,
        isTemporary: !req.user, // Mark as temporary if no user
        usingFallbackGenerator: usingFallback,
        generatedAt: new Date()
      };
      
      // Add user if authenticated
      if (req.user && req.user._id) {
        itineraryDoc.user = req.user._id;
      }
      
      // Add expiration if temporary
      if (!req.user) {
        itineraryDoc.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      }
      
      // Create the itinerary in the database
      const newItinerary = await Itinerary.create(itineraryDoc);
      
      return res.status(201).json({
        success: true,
        message: "Itinerary generated successfully",
        data: newItinerary
      });
    } catch (error) {
      console.error("Error in itinerary generation process:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate itinerary",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Error in itinerary generation process:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate itinerary",
      error: error.message
    });
  }
};

// Get all itineraries for a user
const getUserItineraries = async (req, res) => {
  try {
    // Only fetch non-temporary itineraries that belong to the user
    const itineraries = await Itinerary.find({ 
      user: req.user._id,
      isTemporary: false,
      expiresAt: undefined
    })
    .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch itineraries",
      error: error.message
    });
  }
};

// Get a single itinerary by ID
const getItinerary = async (req, res) => {
  try {
    console.log(`Fetching itinerary with ID: ${req.params.id}`);
    
    // Try to fetch the itinerary without populate first
    let itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found"
      });
    }

    // Only try to populate if the fields exist
    try {
      if (itinerary.destination) {
        itinerary = await Itinerary.findById(req.params.id)
          .populate('destination', 'name image');
      }
      
      if (itinerary.user) {
        itinerary = await Itinerary.findById(req.params.id)
          .populate('user', 'name');
      }
    } catch (populateError) {
      console.log('Error during population, continuing with unpopulated document:', populateError.message);
      // Continue with the unpopulated document if population fails
    }
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found"
      });
    }

    // Check ownership only if authentication info is available
    if (req.user) {
      const isOwner = itinerary.user && 
                     itinerary.user._id && 
                     req.user._id && 
                     itinerary.user._id.toString() === req.user._id.toString();
      
      const isAdmin = req.user.role === 'admin';
      
      // Only enforce authorization if we have user data and the itinerary has an owner
      if (itinerary.user && itinerary.user._id && !isOwner && !isAdmin) {
        console.log(`Authorization failed: User ${req.user._id} attempted to access itinerary owned by ${itinerary.user._id}`);
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this itinerary"
        });
      }
    } else {
      console.log('No authentication data provided, continuing as public access');
      // If no authentication, allow viewing freshly generated itineraries
      // This lets users view their itineraries right after generation
    }

    return res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch itinerary",
      error: error.message
    });
  }
};

// Update itinerary
const updateItinerary = async (req, res) => {
  try {
    const { name, days } = req.body;
    
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found"
      });
    }
    
    // Check if the itinerary belongs to the user
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this itinerary"
      });
    }
    
    // Update fields if provided
    if (name) itinerary.name = name;
    if (days) itinerary.days = days;
    
    itinerary.lastUpdated = Date.now();
    
    await itinerary.save();
    
    return res.status(200).json({
      success: true,
      message: "Itinerary updated successfully",
      data: itinerary
    });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update itinerary",
      error: error.message
    });
  }
};

// Delete itinerary
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found"
      });
    }
    
    // Check if the itinerary belongs to the user
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this itinerary"
      });
    }
    
    await Itinerary.deleteOne({ _id: req.params.id });
    
    return res.status(200).json({
      success: true,
      message: "Itinerary deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete itinerary",
      error: error.message
    });
  }
};

// Save itinerary to user account
const saveItinerary = async (req, res) => {
  try {
    const { itineraryId, name } = req.body;
    
    if (!itineraryId) {
      return res.status(400).json({
        success: false,
        message: "Itinerary ID is required"
      });
    }
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in to save this itinerary"
      });
    }
    
    // Find the itinerary
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found"
      });
    }
    
    // Create a new itinerary document for the user
    const savedItinerary = new Itinerary({
      ...itinerary.toObject(),
      _id: undefined, // Let MongoDB generate a new ID
      user: req.user._id,
      name: name || itinerary.name,
      isTemporary: false,
      expiresAt: undefined,
      createdAt: new Date()
    });
    
    // Save the new itinerary
    await savedItinerary.save();
    
    // Get all saved itineraries for this user
    const userItineraries = await Itinerary.find({
      user: req.user._id,
      isTemporary: false
    }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      message: "Itinerary saved successfully",
      data: savedItinerary,
      userItineraries: userItineraries
    });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save itinerary",
      error: error.message
    });
  }
};

// Setup automatic cleanup of temporary itineraries
const setupTemporaryItineraryCleanup = () => {
  // Run once a day to clean up expired temporary itineraries
  setInterval(async () => {
    try {
      const result = await Itinerary.deleteMany({
        isTemporary: true,
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired temporary itineraries`);
    } catch (error) {
      console.error('Error cleaning up temporary itineraries:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run once every 24 hours
};

// Start the cleanup process
setupTemporaryItineraryCleanup();

module.exports = {
  generateItinerary,
  getUserItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  saveItinerary
};
