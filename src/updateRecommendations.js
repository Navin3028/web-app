const { MongoClient } = require('mongodb');

async function updateRecommendations() {
  // Connection URI and database/collection setup
  const uri = 'mongodb+srv://navin280302:RA2PIT0n9oLH9nqL@cluster0.zzg1k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the MongoDB client
    await client.connect();

    // Define the database and collection
    const database = client.db('test');
    const collection = database.collection('responses');

    // Define the filter criteria for deletion
    const filter = { username: { $in: ["user2"] } };

    // Delete matching documents
    const result = await collection.deleteMany(filter);

    console.log(`${result.deletedCount} document(s) were deleted.`);
  } catch (error) {
    console.error('Error deleting responses:', error);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the delete function
updateRecommendations();
