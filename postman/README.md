# Postman Collection

This folder contains the Postman visualizer script used for the interactive UI.

## Usage

1. Open Postman and create a new GET request to:
   ```
   https://chaturbate.com/follow/api/online_followed_rooms/
   ```

2. Add the required headers (copy from browser DevTools):
   - `Cookie` - Must include `sessionid` and `csrftoken`
   - `X-Requested-With: XMLHttpRequest`
   - `Referer: https://chaturbate.com/followed-cams/`

3. Copy the contents of `visualizer-script.js` into the **Post-response** script tab

4. Send the request and click **Visualize** to see the interactive UI

## Features

- **Crimson/Red Theme** - Dark mode with red accents
- **Pagination** - 25/50/100/All per page options
- **Search** - Filter rooms by name in real-time
- **Responsive Grid** - Adapts to screen size
- **Live Indicator** - Animated pulse showing live status

## Theme Colors

| Variable | Color | Usage |
|----------|-------|-------|
| `--accent` | `#dc2626` | Primary crimson |
| `--accent-hover` | `#ef4444` | Hover state |
| `--accent-2` | `#b91c1c` | Secondary red |
| `--bg` | `#0b0b0d` | Background |
| `--panel` | `#15161a` | Panel background |
| `--border` | `#2a2d34` | Borders |
