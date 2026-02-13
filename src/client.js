/**
 * CB Followed Rooms Client
 * 
 * A comprehensive client for the Chaturbate Followed Online Rooms API.
 * Provides pagination, search, and async iteration capabilities.
 * 
 * @class CBFollowedRoomsClient
 */

const API_URL = 'https://chaturbate.com/follow/api/online_followed_rooms/';

export class CBFollowedRoomsClient {
  /**
   * Create a new CBFollowedRoomsClient instance
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.sessionId - Chaturbate session ID cookie
   * @param {string} options.csrfToken - CSRF token cookie
   * @param {Object} [options.additionalCookies] - Additional cookies as key-value pairs
   * @param {number} [options.defaultPageSize=25] - Default page size for pagination
   * 
   * @example
   * const client = new CBFollowedRoomsClient({
   *   sessionId: 'your-session-id',
   *   csrfToken: 'your-csrf-token',
   *   defaultPageSize: 50
   * });
   */
  constructor(options = {}) {
    if (!options.sessionId) {
      throw new Error('sessionId is required for authentication');
    }
    if (!options.csrfToken) {
      throw new Error('csrfToken is required for authentication');
    }
    
    this.sessionId = options.sessionId;
    this.csrfToken = options.csrfToken;
    this.additionalCookies = options.additionalCookies || {};
    this.defaultPageSize = options.defaultPageSize || 25;
    this._cache = null;
    this._cacheTimestamp = null;
    this._cacheTTL = 30000; // 30 seconds cache
  }

  /**
   * Build the cookie string for authentication
   * @private
   * @returns {string} Cookie header value
   */
  _buildCookieString() {
    const cookies = {
      sessionid: this.sessionId,
      csrftoken: this.csrfToken,
      agreeterms: '1',
      ...this.additionalCookies
    };
    
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  /**
   * Build request headers mimicking browser behavior
   * @private
   * @returns {Object} Headers object
   */
  _buildHeaders() {
    return {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'referer': 'https://chaturbate.com/followed-cams/',
      'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
      'cookie': this._buildCookieString()
    };
  }

  /**
   * Check if cache is valid
   * @private
   * @returns {boolean}
   */
  _isCacheValid() {
    return this._cache && 
           this._cacheTimestamp && 
           (Date.now() - this._cacheTimestamp) < this._cacheTTL;
  }

  /**
   * Fetch all online followed rooms from the API
   * Returns the raw API response with online count, total count, and rooms array.
   * 
   * @param {Object} [options] - Fetch options
   * @param {boolean} [options.useCache=true] - Whether to use cached results
   * @returns {Promise<Object>} API response { online, total, online_rooms }
   * 
   * @example
   * const data = await client.fetchAll();
   * console.log(`${data.online} of ${data.total} rooms online`);
   */
  async fetchAll(options = {}) {
    const useCache = options.useCache !== false;
    
    if (useCache && this._isCacheValid()) {
      return this._cache;
    }
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: this._buildHeaders()
    });
    
    if (!response.ok) {
      const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    const data = await response.json();
    
    // Validate response shape
    if (typeof data.online !== 'number') {
      throw new Error('Invalid response: missing online count');
    }
    if (typeof data.total !== 'number') {
      throw new Error('Invalid response: missing total count');
    }
    if (!Array.isArray(data.online_rooms)) {
      throw new Error('Invalid response: online_rooms is not an array');
    }
    
    // Update cache
    this._cache = data;
    this._cacheTimestamp = Date.now();
    
    return data;
  }

  /**
   * Fetch paginated results from online followed rooms
   * 
   * @param {Object} [options] - Pagination options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.pageSize] - Items per page (defaults to defaultPageSize)
   * @returns {Promise<Object>} Paginated response
   * 
   * @example
   * const page1 = await client.fetchPaginated({ page: 1, pageSize: 25 });
   * console.log(`Page 1 of ${page1.pagination.totalPages}`);
   */
  async fetchPaginated(options = {}) {
    const page = Math.max(1, options.page || 1);
    const pageSize = options.pageSize || this.defaultPageSize;
    
    const data = await this.fetchAll();
    const rooms = data.online_rooms;
    
    // Handle "all" page size
    if (pageSize === 'all' || pageSize >= rooms.length) {
      return {
        online: data.online,
        total: data.total,
        rooms: rooms,
        pagination: {
          page: 1,
          pageSize: rooms.length,
          totalPages: 1,
          totalItems: rooms.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
    
    const totalPages = Math.ceil(rooms.length / pageSize);
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageRooms = rooms.slice(startIndex, endIndex);
    
    return {
      online: data.online,
      total: data.total,
      rooms: pageRooms,
      pagination: {
        page: safePage,
        pageSize: pageSize,
        totalPages: totalPages,
        totalItems: rooms.length,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, rooms.length)
      }
    };
  }

  /**
   * Search online rooms by name with pagination
   * 
   * @param {string} query - Search query (case-insensitive)
   * @param {Object} [options] - Search options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize] - Items per page
   * @returns {Promise<Object>} Search results with pagination
   * 
   * @example
   * const results = await client.search('bella', { page: 1, pageSize: 10 });
   * console.log(`Found ${results.pagination.totalItems} matches`);
   */
  async search(query, options = {}) {
    const page = Math.max(1, options.page || 1);
    const pageSize = options.pageSize || this.defaultPageSize;
    const searchQuery = (query || '').toLowerCase().trim();
    
    const data = await this.fetchAll();
    
    // Filter rooms by search query
    const filteredRooms = searchQuery
      ? data.online_rooms.filter(room => 
          room.room.toLowerCase().includes(searchQuery)
        )
      : data.online_rooms;
    
    // Handle "all" page size
    if (pageSize === 'all' || pageSize >= filteredRooms.length) {
      return {
        online: data.online,
        total: data.total,
        query: query,
        rooms: filteredRooms,
        pagination: {
          page: 1,
          pageSize: filteredRooms.length,
          totalPages: 1,
          totalItems: filteredRooms.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
    
    const totalPages = Math.ceil(filteredRooms.length / pageSize) || 1;
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageRooms = filteredRooms.slice(startIndex, endIndex);
    
    return {
      online: data.online,
      total: data.total,
      query: query,
      rooms: pageRooms,
      pagination: {
        page: safePage,
        pageSize: pageSize,
        totalPages: totalPages,
        totalItems: filteredRooms.length,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, filteredRooms.length)
      }
    };
  }

  /**
   * Async generator for iterating through all pages
   * Useful for processing large result sets without loading all into memory.
   * 
   * @param {number} [pageSize] - Items per page
   * @yields {Object} Each page of results
   * 
   * @example
   * for await (const page of client.paginate(50)) {
   *   console.log(`Processing page ${page.pagination.page}`);
   *   page.rooms.forEach(room => console.log(room.room));
   * }
   */
  async *paginate(pageSize) {
    const size = pageSize || this.defaultPageSize;
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const result = await this.fetchPaginated({ page, pageSize: size });
      yield result;
      
      hasMore = result.pagination.hasNextPage;
      page++;
    }
  }

  /**
   * Get a specific room by name
   * 
   * @param {string} roomName - Exact room name to find
   * @returns {Promise<Object|null>} Room object or null if not found
   * 
   * @example
   * const room = await client.getRoom('example_room');
   * if (room) console.log(`Found: ${room.room}`);
   */
  async getRoom(roomName) {
    const data = await this.fetchAll();
    return data.online_rooms.find(
      room => room.room.toLowerCase() === roomName.toLowerCase()
    ) || null;
  }

  /**
   * Get statistics about followed rooms
   * 
   * @returns {Promise<Object>} Statistics object
   * 
   * @example
   * const stats = await client.getStats();
   * console.log(`${stats.onlinePercentage}% of followed rooms are online`);
   */
  async getStats() {
    const data = await this.fetchAll();
    
    return {
      online: data.online,
      total: data.total,
      offline: data.total - data.online,
      onlinePercentage: ((data.online / data.total) * 100).toFixed(2),
      roomCount: data.online_rooms.length
    };
  }

  /**
   * Clear the internal cache
   * Forces next request to fetch fresh data from API.
   * 
   * @example
   * client.clearCache();
   * const freshData = await client.fetchAll();
   */
  clearCache() {
    this._cache = null;
    this._cacheTimestamp = null;
  }

  /**
   * Set cache TTL (time-to-live)
   * 
   * @param {number} ttlMs - Cache TTL in milliseconds
   * 
   * @example
   * client.setCacheTTL(60000); // 1 minute cache
   */
  setCacheTTL(ttlMs) {
    this._cacheTTL = ttlMs;
  }
}

export default CBFollowedRoomsClient;
