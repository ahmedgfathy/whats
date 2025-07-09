const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper functions
function cleanInteger(value) {
  if (!value || value === '') return null;
  const num = parseInt(value.toString().replace(/[^0-9]/g, ''));
  return isNaN(num) ? null : num;
}

function cleanDecimal(value) {
  if (!value || value === '') return null;
  const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

function isCorruptedValue(value) {
  if (!value) return false;
  const lowerValue = value.toString().toLowerCase();
  return lowerValue.includes('.jpg') || 
         lowerValue.includes('.jpeg') || 
         lowerValue.includes('.png') ||
         lowerValue.includes('.gif');
}

async function getForeignKeyId(tableName, columnName, value) {
  if (!value || value === '' || isCorruptedValue(value)) {
    return null;
  }
  
  try {
    const result = await pool.query(
      `SELECT id FROM ${tableName} WHERE ${columnName} = $1`, 
      [value.toString().trim()]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    console.log(`Warning: Could not find ${tableName}.${columnName} = '${value}'`);
    return null;
  }
}

async function migratePropertiesData() {
  try {
    console.log('🚚 Starting database migration to normalized structure...');
    
    // Get total count first
    const totalQuery = `
      SELECT COUNT(*) as count 
      FROM properties 
      WHERE property_name IS NOT NULL 
        AND property_name != ''
        AND property_name NOT LIKE '%.jpg%'
        AND property_name NOT LIKE '%.jpeg%'
        AND property_name NOT LIKE '%.png%'
    `;
    const totalResult = await pool.query(totalQuery);
    const totalRecords = parseInt(totalResult.rows[0].count);
    console.log(`📊 Total clean records to migrate: ${totalRecords}`);
    
    // Process in batches
    const batchSize = 500;
    let offset = 0;
    let totalMigrated = 0;
    let errors = 0;
    
    while (offset < totalRecords) {
      console.log(`\n📈 Processing batch ${Math.floor(offset/batchSize) + 1} (records ${offset + 1}-${Math.min(offset + batchSize, totalRecords)})`);
      
      const batchQuery = `
        SELECT * FROM properties 
        WHERE property_name IS NOT NULL 
          AND property_name != ''
          AND property_name NOT LIKE '%.jpg%'
          AND property_name NOT LIKE '%.jpeg%'
          AND property_name NOT LIKE '%.png%'
        ORDER BY id
        LIMIT $1 OFFSET $2
      `;
      
      const batch = await pool.query(batchQuery, [batchSize, offset]);
      console.log(`   📦 Batch size: ${batch.rows.length} records`);
      
      for (const property of batch.rows) {
        try {
          // Get foreign key references
          const categoryId = await getForeignKeyId('property_categories', 'name_ar', property.property_category);
          const regionId = await getForeignKeyId('regions', 'name', property.regions);
          const floorId = await getForeignKeyId('floor_types', 'name', property.floor_no);
          const listingId = await getForeignKeyId('listing_types', 'name', property.property_type);
          const finishId = await getForeignKeyId('finish_types', 'name', property.finished);
          const offeredId = await getForeignKeyId('offered_by_types', 'name', property.property_offered_by);
          const paymentId = await getForeignKeyId('payment_types', 'name', property.payment_type);
          const frequencyId = await getForeignKeyId('payment_frequencies', 'name', property.paid_every);
          
          // Clean numeric data
          const areaSqm = cleanInteger(property.building);
          const bedrooms = cleanInteger(property.bedroom);
          const bathrooms = cleanInteger(property.bathroom);
          const unitPrice = cleanDecimal(property.unit_price);
          const deposit = cleanDecimal(property.deposit);
          const paymentAmount = cleanDecimal(property.payment);
          const totalAmount = cleanDecimal(property.amount);
          
          // Insert normalized record
          await pool.query(`
            INSERT INTO properties_normalized (
              property_name, property_number, property_category_id, region_id,
              floor_type_id, listing_type_id, finish_type_id, offered_by_id,
              payment_type_id, payment_frequency_id, area_sqm, bedrooms, bathrooms,
              unit_price, deposit, payment_amount, total_amount, building, land_garden,
              last_modified_by, update_unit, owner_name, mobile_no, telephone,
              description, sales_notes, sales, handler, property_image, imported_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
              $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
              $25, $26, $27, $28, $29, $30
            )
          `, [
            property.property_name,
            property.property_number,
            categoryId,
            regionId,
            floorId,
            listingId,
            finishId,
            offeredId,
            paymentId,
            frequencyId,
            areaSqm,
            bedrooms,
            bathrooms,
            unitPrice,
            deposit,
            paymentAmount,
            totalAmount,
            property.building,
            property.land_garden,
            property.last_modified_by,
            property.update_unit,
            property.name,
            property.mobile_no,
            property.tel,
            property.description,
            property.zain_house_sales_notes,
            property.sales,
            property.handler,
            property.property_image,
            property.imported_at
          ]);
          
          totalMigrated++;
          
        } catch (err) {
          errors++;
          if (errors <= 10) {
            console.log(`   ⚠️ Error migrating property ${property.id}: ${err.message}`);
          }
        }
      }
      
      offset += batchSize;
      console.log(`   ✅ Batch completed. Total migrated so far: ${totalMigrated}`);
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   ✅ Successfully migrated: ${totalMigrated} records`);
    console.log(`   ❌ Errors: ${errors} records`);
    console.log(`   📊 Success rate: ${Math.round((totalMigrated/(totalMigrated+errors))*100)}%`);
    
    // Verify migration
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM properties_normalized');
    console.log(`   📋 Final normalized table count: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migratePropertiesData().catch(console.error);
