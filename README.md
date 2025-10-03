# ScreenShare Web Application

## Overview

This project is a web application that allows users to share their screen using the Screen Capture API. It captures the user's screen, provides a local preview, and sends periodic snapshots to a configurable REST API. Additionally, it supports streaming via WebSocket if enabled.

## Features

- **Screen Sharing**: Start and stop screen sharing with a simple button.
- **Local Preview**: View the shared screen in real-time using a video element.
- **Snapshot Capture**: Capture frames at a configurable interval and send them to a backend API.
- **WebSocket Support**: Optionally stream frames to a WebSocket server.
- **User Controls**: Adjust capture interval, JPEG quality, and target resolution.
- **Error Handling**: User-friendly error messages and event management.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/screenshare-web.git
   cd screenshare-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your API URLs in the `.env` file:
   ```
   VITE_API_BASE_URL=http://your-api-url
   VITE_WS_API_URL=ws://your-websocket-url
   ```

## Development

To start the development server, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

## Testing

To run the tests, use:
```bash
npm run test
```

## Building

To build the application for production, run:
```bash
npm run build
```

## Docker

To build and run the application using Docker, execute:
```bash
docker build -t screenshare-web .
docker run -p 80:80 screenshare-web
```

### Docker Compose (Optional)

If you have a backend service, you can use Docker Compose to run both the web and backend together. Ensure your `docker-compose.yml` is configured correctly and run:
```bash
docker-compose up
```

## Limitations

- The Screen Capture API may not be supported in all browsers. Please check compatibility before use.
- Permissions for screen sharing must be granted by the user.

## Usage

- Click the "Share Screen" button to start capturing your screen.
- Use the controls to adjust the capture interval, JPEG quality, and resolution.
- Toggle the "WebSocket Mode" to enable streaming via WebSocket.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.