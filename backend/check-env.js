require('dotenv').config();

console.log('🔍 Environment variables check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

if (process.env.DATABASE_URL) {
  console.log('✅ Database URL is configured');
} else {
  console.log('❌ DATABASE_URL not found');
}
