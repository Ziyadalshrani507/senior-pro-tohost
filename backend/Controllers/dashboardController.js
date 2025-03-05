const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');

// Helper function to build query based on filters
const buildQuery = (filters) => {
  const query = {};
  
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  
  if (filters.city) {
    query.locationCity = filters.city;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }

  return query;
};

// Helper function to build sort options
const buildSortOptions = (sortBy) => {
  switch (sortBy) {
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    default:
      return { name: 1 };
  }
};

// Get paginated and filtered items
exports.getItems = async (req, res) => {
  try {
    const { type, page = 1, limit = 12, search, city, sortBy } = req.query;
    const Model = type === 'destinations' ? Destination : Restaurant;
    
    // Build query
    const query = buildQuery({ search, city, type });
    const sort = buildSortOptions(sortBy);
    
    // Execute query with pagination
    const [items, total] = await Promise.all([
      Model.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name locationCity rating pictureUrls createdAt updatedAt')
        .lean(),
      Model.countDocuments(query)
    ]);

    // Get stats
    const stats = await Model.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          activeItems: { 
            $sum: { 
              $cond: [{ $eq: ['$isDeleted', true] }, 0, 1] 
            } 
          }
        }
      }
    ]);

    res.json({
      items,
      total,
      stats: stats[0] || { avgRating: 0, activeItems: 0 },
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching items', 
      error: error.message 
    });
  }
};

// Batch delete items
exports.batchDelete = async (req, res) => {
  try {
    const { type, ids } = req.body;
    const Model = type === 'destinations' ? Destination : Restaurant;

    // Use bulk operations for better performance
    const result = await Model.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `Successfully deleted ${result.deletedCount} items`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting items', 
      error: error.message 
    });
  }
};

// Get schema options
exports.getSchemaOptions = async (req, res) => {
  try {
    const { type } = req.query;
    const Model = type === 'destinations' ? Destination : Restaurant;
    const schema = Model.schema;

    const options = {
      cities: schema.path('locationCity').enumValues,
      types: type === 'destinations' ? schema.path('type').enumValues : [],
      categories: type === 'destinations' ? schema.path('categories.0').enumValues : []
    };

    res.json(options);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching schema options', 
      error: error.message 
    });
  }
};
