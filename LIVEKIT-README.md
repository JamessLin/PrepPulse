# LiveKit Video Conferencing Setup Guide

This guide explains how to set up and use LiveKit video conferencing in the PrepPulse application.

## Local Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Node.js and npm/yarn

### Step 1: Start the LiveKit Server

We've included a Docker Compose configuration for running a local LiveKit server. To start it:

```bash
# From the project root
docker-compose up -d
```

This will start a LiveKit server running on the following ports:
- HTTP API: `http://localhost:7880`
- WebSocket: `ws://localhost:7880`
- WebRTC: `UDP port 7882`

### Step 2: Configure Environment Variables

Create or update your `.env.local` file in the `prep-frontend` directory with:

```
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

For production, this will be changed to your LiveKit Cloud URL.

### Step 3: Backend Integration

You'll need to add an endpoint in your backend API to generate LiveKit tokens. The endpoint should:

1. Authenticate the user
2. Generate a LiveKit token with the appropriate permissions
3. Return the token to the frontend

Example Node.js endpoint:

```javascript
import { AccessToken } from 'livekit-server-sdk';

app.post('/api/livekit/token', authenticateUser, (req, res) => {
  const { roomName, participantName } = req.body;
  const userId = req.user.id;

  // Create a new AccessToken
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,     // 'prepapp' from livekit.yaml
    process.env.LIVEKIT_API_SECRET,  // 'devsecret123' from livekit.yaml
    {
      identity: userId,
      name: participantName,
    }
  );

  // Grant permissions
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = at.toJwt();
  res.json({ token });
});
```

## Production Setup

For production, you should use LiveKit Cloud or a properly secured LiveKit server.

### LiveKit Cloud Setup

1. Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. Create a new project
3. Get your API key and secret
4. Update your environment variables:

```
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_cloud_api_key
LIVEKIT_API_SECRET=your_cloud_api_secret
```

## Architecture Overview

Our LiveKit integration consists of:

1. **livekitService.ts** - Frontend service to request tokens and manage LiveKit connections
2. **Backend API endpoint** - Generates secure LiveKit tokens
3. **Interview Room Component** - Uses LiveKit React components to render the video conferencing UI

## Troubleshooting

### Video/Audio Not Working

- Check browser permissions for camera and microphone
- Ensure you're using HTTPS in production
- Verify your TURN server configuration

### Connection Issues

- Check WebRTC connectivity (firewalls, NAT traversal)
- Ensure tokens are being generated correctly
- Verify the LiveKit server is reachable

## Resources

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit React Components](https://github.com/livekit/components-js)
- [LiveKit Server API](https://docs.livekit.io/server-api/) 