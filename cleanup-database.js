const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'real_estate_chat.db');
const db = new Database(dbPath);

try {
  // Check current count
  const countResult = db.prepare('SELECT COUNT(*) as count FROM properties').get();
  console.log('Current properties count:', countResult.count);
  
  if (countResult.count > 50000) {
    console.log('⚠️  WARNING: Too many properties detected!');
    console.log('This suggests duplicate data from migration.');
    
    // Show sample of duplicate data
    const samples = db.prepare('SELECT id, title, price, location FROM properties LIMIT 10').all();
    console.log('\nSample properties:');
    samples.forEach(prop => {
      console.log(`- ID: ${prop.id}, Title: ${prop.title}, Price: ${prop.price}, Location: ${prop.location}`);
    });
    
    console.log('\nTo clean up the database, run:');
    console.log('node cleanup-database.js --clean');
  } else {
    console.log('✅ Properties count looks normal.');
  }
  
  // If --clean flag is provided, remove duplicate data
  if (process.argv.includes('--clean')) {
    console.log('\n🧹 Cleaning up duplicate data...');
    
    // Keep only the first 1000 properties (assuming they're the original ones)
    const deleteResult = db.prepare('DELETE FROM properties WHERE id > 1000').run();
    console.log(`Deleted ${deleteResult.changes} duplicate properties`);
    
    // Check final count
    const finalCount = db.prepare('SELECT COUNT(*) as count FROM properties').get();
    console.log('Final properties count:', finalCount.count);
  }
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
