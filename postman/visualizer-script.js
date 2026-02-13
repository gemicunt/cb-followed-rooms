/**
 * Postman Visualizer Script - Crimson Theme
 * 
 * This script is used in the Postman post-response script to render
 * an interactive UI for browsing followed rooms.
 * 
 * Features:
 * - Crimson/Dark Gray/Red theme
 * - Pagination (25/50/100/All per page)
 * - Search filtering
 * - Responsive card grid
 * - Live status indicator
 */

// ============================================================
// ASSERTIONS: Verify response shape required by visualizer
// ============================================================

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is valid JSON", function () {
    pm.response.to.be.json;
});

pm.test("Response has required 'online' count (number)", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('online');
    pm.expect(jsonData.online).to.be.a('number');
});

pm.test("Response has required 'total' count (number)", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('total');
    pm.expect(jsonData.total).to.be.a('number');
});

pm.test("Response has 'online_rooms' array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('online_rooms');
    pm.expect(jsonData.online_rooms).to.be.an('array');
});

pm.test("Each online_room has required fields (room, image)", function () {
    const jsonData = pm.response.json();
    if (jsonData.online_rooms && jsonData.online_rooms.length > 0) {
        jsonData.online_rooms.forEach((room, index) => {
            pm.expect(room, `Room at index ${index}`).to.have.property('room');
            pm.expect(room.room, `room.room at index ${index}`).to.be.a('string');
            pm.expect(room, `Room at index ${index}`).to.have.property('image');
            pm.expect(room.image, `room.image at index ${index}`).to.be.a('string');
        });
    }
});

// ============================================================
// VISUALIZATION: Interactive UI for followed rooms
// Theme: Crimson / Dark Gray / Red
// Features: Pagination, Search, Responsive Grid
// ============================================================

const template = `
<style>
  :root {
    --bg: #0b0b0d;
    --panel: #15161a;
    --text: #e5e7eb;
    --muted: #9ca3af;
    --border: #2a2d34;
    --accent: #dc2626;
    --accent-hover: #ef4444;
    --accent-glow: rgba(220, 38, 38, 0.3);
    --accent-2: #b91c1c;
    --success: #22c55e;
    --card-bg: #1a1b1f;
  }
  @media (prefers-color-scheme: light) {
    :root { 
      --bg: #f8f8f8; 
      --panel: #ffffff; 
      --text: #111827; 
      --muted: #6b7280; 
      --border: #e5e7eb;
      --card-bg: #ffffff;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.5;
  }
  
  .wrap { padding: 16px; max-width: 1400px; margin: 0 auto; }
  
  /* Header Section */
  .header { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 16px; 
    align-items: center; 
    justify-content: space-between; 
    background: var(--panel); 
    border: 1px solid var(--border); 
    padding: 16px; 
    border-radius: 12px; 
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  .title-section { display: flex; align-items: center; gap: 12px; }
  .title { font-size: 20px; font-weight: 700; color: var(--text); }
  .live-dot {
    width: 10px;
    height: 10px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
    box-shadow: 0 0 8px var(--accent-glow);
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
  
  /* Metrics */
  .metrics { display: flex; gap: 12px; flex-wrap: wrap; }
  .badge { 
    background: linear-gradient(135deg, #1a1a1a 0%, #2d1a1a 100%);
    border: 1px solid var(--border); 
    padding: 8px 14px; 
    border-radius: 999px; 
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge span { font-weight: 700; color: var(--accent); }
  
  /* Controls */
  .controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  
  input[type="search"] { 
    background: var(--bg); 
    color: var(--text); 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    padding: 10px 14px; 
    min-width: 200px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input[type="search"]:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  input[type="search"]::placeholder { color: var(--muted); }
  
  select { 
    background: var(--bg); 
    color: var(--text); 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    padding: 10px 14px;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  select:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  /* Pagination Controls */
  .pagination { 
    display: flex; 
    align-items: center; 
    gap: 8px;
    margin-top: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .page-btn {
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .page-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }
  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .page-info {
    color: var(--muted);
    font-size: 14px;
    padding: 0 12px;
  }
  
  /* Grid */
  .grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
    gap: 12px;
  }
  
  /* Cards */
  .card { 
    background: var(--card-bg); 
    border: 1px solid var(--border); 
    border-radius: 12px; 
    overflow: hidden; 
    display: flex; 
    flex-direction: column; 
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .card:hover { 
    transform: translateY(-4px); 
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
    border-color: var(--accent);
  }
  
  .thumb { 
    aspect-ratio: 4/3; 
    width: 100%; 
    background: #0f1115; 
    display: block; 
    object-fit: cover;
  }
  
  .fallback { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    height: 100%; 
    color: var(--muted); 
    font-size: 12px; 
    aspect-ratio: 4/3; 
    background: linear-gradient(135deg, #0f1115 0%, #1a1a1a 100%);
  }
  
  .room-info { padding: 10px 12px; }
  
  .room-name { 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text); 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
  }
  
  .room-link { 
    color: inherit; 
    text-decoration: none; 
    transition: color 0.2s;
  }
  .room-link:hover { color: var(--accent); }
  
  .no-results { 
    text-align: center; 
    padding: 60px 20px; 
    color: var(--muted);
    font-size: 16px;
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .header { flex-direction: column; align-items: stretch; }
    .controls { justify-content: center; }
    .grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  }
</style>

<div class="wrap">
  <div class="header">
    <div class="title-section">
      <div class="live-dot"></div>
      <h1 class="title">Followed Rooms</h1>
    </div>
    
    <div class="metrics">
      <div class="badge">🟢 Online: <span id="onlineCount">{{online}}</span></div>
      <div class="badge">📚 Total: <span>{{total}}</span></div>
      <div class="badge">👁️ Showing: <span id="showingCount">0</span></div>
    </div>
    
    <div class="controls">
      <input type="search" id="searchInput" placeholder="Search rooms..." />
      <select id="pageSizeSelect">
        <option value="25">25 per page</option>
        <option value="50">50 per page</option>
        <option value="100" selected>100 per page</option>
        <option value="all">Show All</option>
      </select>
    </div>
  </div>
  
  <div class="grid" id="roomGrid"></div>
  
  <div class="pagination" id="paginationControls">
    <button class="page-btn" id="prevBtn">← Previous</button>
    <span class="page-info" id="pageInfo">Page 1 of 1</span>
    <button class="page-btn" id="nextBtn">Next →</button>
  </div>
</div>

<script>
  pm.getData(function(err, data) {
    if (err || !data) return;
    
    const allRooms = data.rooms || [];
    let filteredRooms = [...allRooms];
    let currentPage = 1;
    let pageSize = 100;
    
    const grid = document.getElementById('roomGrid');
    const searchInput = document.getElementById('searchInput');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const showingCount = document.getElementById('showingCount');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    function renderCards(rooms) {
      grid.innerHTML = rooms.length === 0 
        ? '<div class="no-results">No rooms found</div>'
        : rooms.map(room => \`
          <div class="card">
            <img class="thumb" src="\${room.image}" alt="\${room.room}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="fallback" style="display:none;">No Preview</div>
            <div class="room-info">
              <a class="room-link" href="https://chaturbate.com/\${room.room}/" target="_blank">
                <div class="room-name">\${room.room}</div>
              </a>
            </div>
          </div>
        \`).join('');
    }
    
    function updatePagination() {
      const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredRooms.length / pageSize) || 1;
      currentPage = Math.min(currentPage, totalPages);
      
      const start = pageSize === 'all' ? 0 : (currentPage - 1) * pageSize;
      const end = pageSize === 'all' ? filteredRooms.length : start + pageSize;
      const pageRooms = filteredRooms.slice(start, end);
      
      renderCards(pageRooms);
      showingCount.textContent = pageRooms.length;
      pageInfo.textContent = \`Page \${currentPage} of \${totalPages}\`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
    }
    
    function applyFilter() {
      const query = searchInput.value.toLowerCase().trim();
      filteredRooms = query 
        ? allRooms.filter(r => r.room.toLowerCase().includes(query))
        : [...allRooms];
      currentPage = 1;
      updatePagination();
    }
    
    searchInput.addEventListener('input', applyFilter);
    
    pageSizeSelect.addEventListener('change', function() {
      pageSize = this.value === 'all' ? 'all' : parseInt(this.value);
      currentPage = 1;
      updatePagination();
    });
    
    prevBtn.addEventListener('click', function() {
      if (currentPage > 1) { currentPage--; updatePagination(); }
    });
    
    nextBtn.addEventListener('click', function() {
      const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredRooms.length / pageSize);
      if (currentPage < totalPages) { currentPage++; updatePagination(); }
    });
    
    // Initial render
    updatePagination();
  });
</script>
`;

function createPayload() {
    let jsonData = {};
    try {
        jsonData = pm.response.json();
    } catch (e) {
        console.error("Failed to parse response JSON:", e);
        return { online: 0, total: 0, rooms: [] };
    }
    
    return {
        online: jsonData.online || 0,
        total: jsonData.total || 0,
        rooms: (jsonData.online_rooms || []).map(r => ({
            room: r.room || 'Unknown',
            image: r.image || ''
        }))
    };
}

pm.visualizer.set(template, createPayload());
