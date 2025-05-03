/**
 * Utility functions for database operations in tests
 */

/**
 * Creates a test document in the specified collection
 * @param {mongoose.Model} Model - The Mongoose model
 * @param {Object} data - The data to create the document with
 * @returns {Promise<Document>} The created document
 */
const createTestDocument = async (Model, data) => {
  const document = new Model(data);
  await document.save();
  return document;
};

/**
 * Clears a specific collection
 * @param {mongoose.Model} Model - The Mongoose model whose collection to clear
 */
const clearCollection = async (Model) => {
  await Model.deleteMany({});
};

/**
 * Creates multiple test documents in the specified collection
 * @param {mongoose.Model} Model - The Mongoose model
 * @param {Array<Object>} dataArray - Array of data objects to create documents with
 * @returns {Promise<Array<Document>>} The created documents
 */
const createManyTestDocuments = async (Model, dataArray) => {
  const documents = await Model.insertMany(dataArray);
  return documents;
};

module.exports = {
  createTestDocument,
  clearCollection,
  createManyTestDocuments
};
