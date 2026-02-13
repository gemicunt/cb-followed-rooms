/**
 * CB Followed Rooms - Basic Usage Examples
 * 
 * This file demonstrates all the main features of the client.
 * Replace the session credentials with your own to run.
 */

import { CBFollowedRoomsClient } from '../src/index.js';

// ============================================================
// CONFIGURATION
// ============================================================
// Get these values from your browser cookies when logged into Chaturbate
const SESSION_ID = process.env.CB_SESSION_ID || 'your-session-id-here';
const CSRF_TOKEN = process.env.CB_CSRF_TOKEN || 'your-csrf-token-here';

// Create client instance
const client = new CBFollowedRoomsClient({
  sessionId: SESSION_ID,
  csrfToken: CSRF_TOKEN,
  defaultPageSize: 25
});

// ============================================================
// EXAMPLE 1: Fetch All Rooms
// ============================================================
async function exampleFetchAll() {
  console.log('\n=== Example 1: Fetch All Rooms ===');
  
  try {
    const data = await client.fetchAll();
    console.log(`Online: ${data.online}`);
    console.log(`Total Followed: ${data.total}`);
    console.log(`Rooms in response: ${data.online_rooms.length}`);
    console.log('First 5 rooms:', data.online_rooms.slice(0, 5).map(r => r.room));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// EXAMPLE 2: Paginated Results
// ============================================================
async function examplePagination() {
  console.log('\n=== Example 2: Paginated Results ===');
  
  try {
    // Get first page with 10 items
    const page1 = await client.fetchPaginated({ page: 1, pageSize: 10 });
    console.log(`Page ${page1.pagination.page} of ${page1.pagination.totalPages}`);
    console.log(`Showing ${page1.pagination.startIndex}-${page1.pagination.endIndex} of ${page1.pagination.totalItems}`);
    console.log('Rooms:', page1.rooms.map(r => r.room));
    
    // Get second page
    if (page1.pagination.hasNextPage) {
      const page2 = await client.fetchPaginated({ page: 2, pageSize: 10 });
      console.log(`\nPage ${page2.pagination.page}:`, page2.rooms.map(r => r.room));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// EXAMPLE 3: Search Rooms
// ============================================================
async function exampleSearch() {
  console.log('\n=== Example 3: Search Rooms ===');
  
  try {
    const results = await client.search('a', { page: 1, pageSize: 5 });
    console.log(`Search query: "${results.query}"`);
    console.log(`Found ${results.pagination.totalItems} matches`);
    console.log('Results:', results.rooms.map(r => r.room));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// EXAMPLE 4: Async Iterator (Process All Pages)
// ============================================================
async function exampleAsyncIterator() {
  console.log('\n=== Example 4: Async Iterator ===');
  
  try {
    let totalProcessed = 0;
    
    for await (const page of client.paginate(50)) {
      console.log(`Processing page ${page.pagination.page}/${page.pagination.totalPages}`);
      totalProcessed += page.rooms.length;
      
      // Just process first 3 pages for demo
      if (page.pagination.page >= 3) {
        console.log('(Stopping after 3 pages for demo)');
        break;
      }
    }
    
    console.log(`Total processed: ${totalProcessed} rooms`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// EXAMPLE 5: Get Statistics
// ============================================================
async function exampleStats() {
  console.log('\n=== Example 5: Statistics ===');
  
  try {
    const stats = await client.getStats();
    console.log(`Online: ${stats.online}`);
    console.log(`Offline: ${stats.offline}`);
    console.log(`Total: ${stats.total}`);
    console.log(`Online %: ${stats.onlinePercentage}%`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// EXAMPLE 6: Find Specific Room
// ============================================================
async function exampleFindRoom() {
  console.log('\n=== Example 6: Find Specific Room ===');
  
  try {
    const data = await client.fetchAll();
    if (data.online_rooms.length > 0) {
      const roomName = data.online_rooms[0].room;
      const room = await client.getRoom(roomName);
      
      if (room) {
        console.log(`Found room: ${room.room}`);
        console.log(`Thumbnail: ${room.image}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================
// RUN ALL EXAMPLES
// ============================================================
async function runAllExamples() {
  console.log('CB Followed Rooms - Examples');
  console.log('============================');
  
  await exampleFetchAll();
  await examplePagination();
  await exampleSearch();
  await exampleAsyncIterator();
  await exampleStats();
  await exampleFindRoom();
  
  console.log('\n============================');
  console.log('Examples complete!');
}

// Run if executed directly
runAllExamples().catch(console.error);
