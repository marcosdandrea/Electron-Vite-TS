# Electron-Vite-TS Boilerplate

A modern Electron application boilerplate with Vite, TypeScript, React, and integrated Express server with Socket.IO support.

## Features

- 🚀 **Electron + Vite**: Fast development and build process
- ⚡ **TypeScript**: Full type safety across the application
- ⚛️ **React**: Modern UI framework
- 🌐 **Express Server**: Built-in HTTP server
- 🔌 **Socket.IO**: Real-time communication
- 🔒 **Server Isolation**: Security feature to restrict server access
- 📦 **Dual Mode**: Runs in both Electron and Headless modes

## Server Isolation Feature 🔒

### Overview
The server isolation feature provides an additional security layer by restricting server access to localhost connections only. This is particularly useful in production environments or when you want to prevent external access to your application server.

### Configuration
Add the following environment variable to your `.env` file:

```env
# Enable server isolation (recommended for production)
MAIN_SERVER_ISOLATION=true

# Disable server isolation (allows all connections)
MAIN_SERVER_ISOLATION=false
```

### How It Works
When `MAIN_SERVER_ISOLATION=true`:

- **HTTP Requests**: Only requests from localhost (127.0.0.1, ::1) are accepted
- **Socket.IO Connections**: Only WebSocket connections from localhost origins are allowed
- **Security Logging**: All rejected connection attempts are logged
- **Error Responses**: Rejected requests receive proper 403 Forbidden responses

### Dynamic Port Configuration
The Socket.IO connection automatically adapts to the configured server port:

- **Development Mode**: Detects if running on Vite dev server (port 5123) and connects to the backend server
- **Production Mode**: Connects to the same host and port serving the application
- **Configuration API**: Uses `/api/config` endpoint to get the current server configuration

### Testing Isolation
Run the isolation test to verify the feature is working:

```bash
npm run test:isolation
```

This test will automatically detect the server port and isolation settings.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
MAIN_SERVER_PORT=3000
MAIN_SERVER_ISOLATION=true

# Logging Configuration
WRITE_LOG_TO_FILE=true
WRITE_LOG_LEVEL=info
WRITE_LOG_DIR_PATH=logs
WRITE_LOG_MAX_FILE_COUNT=50
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Electron-Vite-TS

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Development

#### Electron Mode (Desktop Application)
```bash
# Start development with hot reload
npm run dev:electron

# Build for production
npm run build:electron

# Create distribution packages
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

#### Headless Mode (Server Only)
```bash
# Start headless development
npm run dev:headless

# Build headless for production
npm run build:headless
```

#### React Only (UI Development)
```bash
# Start Vite dev server for UI development
npm run dev:react
```

## Project Structure

```
src/
├── app/                    # Main application logic
│   ├── main.ts            # Application entry point
│   └── src/
│       ├── domain/        # Business logic
│       ├── main/          # Core processes
│       ├── services/      # Server and Socket.IO services
│       └── utils/         # Utilities and helpers
├── common/                # Shared types and utilities
├── ui/                    # React frontend
│   ├── App.tsx           # Main React component
│   ├── main.tsx          # React entry point
│   └── src/              # UI components and logic
└── types.d.ts            # Global type definitions
```

## Security Features

### Server Isolation
- Configurable localhost-only access
- HTTP and WebSocket protection
- Connection attempt logging
- Production-ready security

### Best Practices
1. Enable `MAIN_SERVER_ISOLATION=true` in production
2. Monitor logs for rejected connection attempts
3. Use HTTPS in production environments
4. Regularly update dependencies

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev:electron` | Start Electron development mode |
| `npm run dev:headless` | Start headless development mode |
| `npm run dev:react` | Start React development server |
| `npm run build:electron` | Build Electron application |
| `npm run build:headless` | Build headless application |
| `npm run build:vite` | Build React frontend |
| `npm run dist:win` | Create Windows distribution |
| `npm run dist:mac` | Create macOS distribution |
| `npm run dist:linux` | Create Linux distribution |
| `npm run test:isolation` | Test server isolation feature |

## Architecture

### Core Processes
1. **Server Initialization**: Express server with static file serving
2. **Socket.IO Setup**: Real-time communication layer
3. **Window Management**: Electron window lifecycle management
4. **Security Layer**: Optional server isolation

### Communication Flow
```
React UI ↔ Socket.IO ↔ Express Server ↔ Electron Main Process
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` directory
- Review the server isolation guide: `docs/server-isolation.md`