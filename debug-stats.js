// Test file to verify API integration
async function testStatsAPI() {
    try {
        console.log('🧪 Testing stats API...');
        
        // Make the API call
        const response = await fetch('http://localhost:3001/api/stats');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Raw API response:', data);
        
        if (data.success && data.stats) {
            console.log('✅ Stats received:', data.stats.length, 'items');
            data.stats.forEach(stat => {
                console.log(`  📊 ${stat.property_type}: ${stat.count}`);
            });
            
            // Test the filtering logic used in HomePage
            const propertyFilters = [
                { id: 'all', label: 'All Properties' },
                { id: 'apartment', label: 'Apartments' },
                { id: 'villa', label: 'Villas' },
                { id: 'land', label: 'Land' },
                { id: 'office', label: 'Offices' },
                { id: 'warehouse', label: 'Warehouses' }
            ];
            
            console.log('\n🔍 Testing filter logic:');
            propertyFilters.forEach(filter => {
                if (filter.id === 'all') {
                    console.log(`  ${filter.label} (${filter.id}): [would show total messages]`);
                } else {
                    const stat = data.stats.find(s => s.property_type === filter.id);
                    const count = stat ? stat.count : 0;
                    console.log(`  ${filter.label} (${filter.id}): ${count}`);
                }
            });
        } else {
            console.error('❌ Invalid API response structure');
        }
        
        return data;
    } catch (error) {
        console.error('❌ API test failed:', error);
        return null;
    }
}

// Export for use in browser console
window.testStatsAPI = testStatsAPI;

// Auto-run when loaded
document.addEventListener('DOMContentLoaded', testStatsAPI);
