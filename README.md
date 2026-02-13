# CB Followed Rooms

Node.js client for the Chaturbate Followed Online Rooms API with pagination, search, and visualization support.

## Features

- 🔐 **Authenticated API Access** - Uses session cookies for authentication
- 📄 **Pagination** - Built-in pagination with configurable page sizes (25/50/100/All)
- 🔍 **Search** - Filter rooms by name with paginated results
- 🔄 **Async Iterator** - Process large result sets efficiently
- 💾 **Caching** - Automatic response caching with configurable TTL
- ✅ **Validation** - Response shape validation for reliability

## Installation

```bash
git clone https://github.com/gemicunt/cb-followed-rooms.git
cd cb-followed-rooms
npm install
```

## Quick Start

```javascript
import { CBFollowedRoomsClient } from './src/index.js';

const client = new CBFollowedRoomsClient({
  sessionId: 'your-session-id',
  csrfToken: 'your-csrf-token'
});

// Fetch all online rooms
const data = await client.fetchAll();
console.log(`${data.online} rooms online`);

// Paginated results
const page = await client.fetchPaginated({ page: 1, pageSize: 25 });
console.log(`Page ${page.pagination.page} of ${page.pagination.totalPages}`);

// Search rooms
const results = await client.search('bella', { pageSize: 10 });
console.log(`Found ${results.pagination.totalItems} matches`);
```

## Getting Your Credentials

1. Log into Chaturbate in your browser
2. Open Developer Tools (F12) → Application → Cookies
3. Find and copy:
   - `sessionid` → Use as `sessionId`
   - `csrftoken` → Use as `csrfToken`

## API Reference

### Constructor

```javascript
new CBFollowedRoomsClient(options)
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `sessionId` | string | Yes | Chaturbate session ID cookie |
| `csrfToken` | string | Yes | CSRF token cookie |
| `additionalCookies` | object | No | Additional cookies as key-value pairs |
| `defaultPageSize` | number | No | Default page size (default: 25) |

### Methods

#### `fetchAll(options?)`
Fetch all online followed rooms.

```javascript
const data = await client.fetchAll();
// Returns: { online, total, online_rooms[] }
```

#### `fetchPaginated(options?)`
Fetch paginated results.

```javascript
const page = await client.fetchPaginated({ page: 1, pageSize: 50 });
// Returns: { online, total, rooms[], pagination }
```

#### `search(query, options?)`
Search rooms by name.

```javascript
const results = await client.search('name', { page: 1, pageSize: 25 });
// Returns: { online, total, query, rooms[], pagination }
```

#### `paginate(pageSize?)`
Async generator for iterating all pages.

```javascript
for await (const page of client.paginate(50)) {
  console.log(`Page ${page.pagination.page}`);
}
```

#### `getRoom(roomName)`
Find a specific room by name.

```javascript
const room = await client.getRoom('example');
// Returns: { room, image } or null
```

#### `getStats()`
Get statistics about followed rooms.

```javascript
const stats = await client.getStats();
// Returns: { online, total, offline, onlinePercentage, roomCount }
```

#### `clearCache()`
Clear the internal response cache.

#### `setCacheTTL(ttlMs)`
Set cache time-to-live in milliseconds.

## Pagination Object

All paginated responses include:

```javascript
{
  page: 1,           // Current page number
  pageSize: 25,      // Items per page
  totalPages: 20,    // Total number of pages
  totalItems: 496,   // Total items available
  hasNextPage: true, // Whether next page exists
  hasPrevPage: false,// Whether previous page exists
  startIndex: 1,     // First item index (1-based)
  endIndex: 25       // Last item index
}
```

## Environment Variables

You can set credentials via environment variables:

```bash
export CB_SESSION_ID="your-session-id"
export CB_CSRF_TOKEN="your-csrf-token"
npm start
```

## Postman Collection

This package was developed alongside a Postman collection that includes:
- Pre-configured request with authentication headers
- Response validation tests
- Interactive visualizer with crimson theme
- Pagination and search UI

Import the collection from the Postman workspace to use the visual interface.

## License

MIT

## Author

Alleycat Development
