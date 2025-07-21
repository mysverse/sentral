# Live Leaderboard System

A real-time leaderboard system built for IRL racing events with Roblox game integration.

## Features

- 🏁 Real-time updates via Server-Sent Events (SSE)
- 🎮 Game integration API for Roblox and other platforms
- 🏆 Animated position changes and visual feedback
- 📱 Responsive design for displays and mobile devices
- 🔄 Automatic reconnection and error handling
- 🎯 Multiple event support with unique event IDs

## API Endpoints

### Add/Update Player Score

```http
POST /api/leaderboard/{eventId}
Content-Type: application/json
x-api-key: YOUR_API_KEY

{
  "playerName": "Player123",
  "lapTime": 125.456,
  "eventName": "Racing Championship 2024" // optional
}
```

**Headers:**

- `x-api-key` (required): Your API key for authentication
- `Content-Type`: application/json

**Response:**

```json
{
  "id": "uuid",
  "playerName": "Player123",
  "lapTime": 125.456,
  "position": 3,
  "isNewRecord": false,
  "isPersonalBest": true,
  "eventId": "demo-race-2024",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:01:00Z"
}
```

### Get Leaderboard

```http
GET /api/leaderboard/{eventId}
```

**Response:**

```json
[
  {
    "id": "uuid",
    "playerName": "SpeedRacer",
    "lapTime": 118.234,
    "position": 1,
    "eventId": "demo-race-2024",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Real-time Updates (SSE)

```http
GET /api/leaderboard/{eventId}/events
```

Connect to this endpoint to receive real-time leaderboard updates.

## Roblox Integration

### In your Roblox game server script

```lua
local HttpService = game:GetService("HttpService")

-- Configuration
local LEADERBOARD_URL = "https://your-domain.com/api/leaderboard/"
local EVENT_ID = "your-event-id"
local API_KEY = "your-api-key"

-- Function to submit lap time
function submitLapTime(playerName, lapTimeSeconds)
    local data = {
        playerName = playerName,
        lapTime = lapTimeSeconds
    }

    local success, response = pcall(function()
        return HttpService:PostAsync(
            LEADERBOARD_URL .. EVENT_ID,
            HttpService:JSONEncode(data),
            Enum.HttpContentType.ApplicationJson,
            false,
            {
                ["x-api-key"] = API_KEY
            }
        )
    end)    if success then
        local result = HttpService:JSONDecode(response)
        print("Lap time submitted:", result.position)
        return result
    else
        warn("Failed to submit lap time:", response)
        return nil
    end
end

-- Example usage when player finishes a lap
game.Players.PlayerAdded:Connect(function(player)
    -- Your race completion logic here
    local playerName = player.Name -- or get from input
    local lapTime = 125.456 -- your calculated lap time

    submitLapTime(playerName, lapTime)
end)
```

## Frontend Usage

Visit `/leaderboard/{eventId}` to view the live leaderboard for any event.

Examples:

- `/leaderboard/demo-race-2024`
- `/leaderboard/speed-trial-1`

## Database Schema

The system uses a `Leaderboard` model with the following structure:

```prisma
model Leaderboard {
  id        String   @id @default(uuid())
  eventId   String   // Allows multiple events
  eventName String   // Human-readable event name
  playerName String  // Player's chosen name
  lapTime   Float    // Lap time in seconds
  position  Int?     // Current position (calculated)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([eventId, playerName], name: "unique_player_per_event")
  @@index([eventId, lapTime])
}
```

## Features in Detail

### Real-time Updates

- Uses Server-Sent Events for live updates
- Automatically shows new entries and time improvements
- Visual animations for position changes
- Toast notifications for important events

### Position Management

- Automatic position calculation based on lap time
- Shows position changes with visual indicators (↗️ ↘️ ✨)
- Highlights top 3 positions with special styling

### Error Handling

- Graceful handling of network disconnections
- Automatic reconnection attempts
- Data validation for API requests

## Testing

To test the system, you can use the test endpoint:

```bash
curl -X POST http://localhost:4300/api/leaderboard/test \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "demo-race-2024",
    "playerName": "TestPlayer",
    "lapTime": 123.456
  }'
```

## Deployment Notes

- Works on serverless platforms (Vercel, Netlify, etc.)
- Requires PostgreSQL database
- Environment variables needed: `DATABASE_URL`, `DIRECT_URL`, `LEADERBOARD_API_KEY`
- SSE connections are memory-based and will reset on server restarts

## Security

The API is secured with an API key. Set the `LEADERBOARD_API_KEY` environment variable to secure your API endpoints.

```bash
# Add to your .env.local file
LEADERBOARD_API_KEY=your-secure-api-key-here
```

If no API key is set, the system will work in development mode (insecure).

## Customization

The leaderboard UI can be customized by modifying:

- Color schemes in the Tailwind classes
- Animation timings in motion/react components
- Toast messages and positioning
- Display formats for times and names
