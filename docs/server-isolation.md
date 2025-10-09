# Server Isolation Feature

## Overview

The server isolation feature allows you to restrict server access to localhost connections only. This is useful for security purposes when you want to ensure that your application server only accepts connections from the local machine.

## Configuration

The isolation is controlled by the environment variable `MAIN_SERVER_ISOLATION` in your `.env` file:

```env
MAIN_SERVER_ISOLATION=true  # Enable isolation (only localhost connections)
MAIN_SERVER_ISOLATION=false # Disable isolation (all connections allowed)
```

## How it works

When `MAIN_SERVER_ISOLATION=true`:

### HTTP Server (Express)
- A middleware checks the remote address of incoming HTTP requests
- Only requests from localhost (127.0.0.1, ::1, ::ffff:127.0.0.1) are allowed
- Rejected requests receive a 403 Forbidden response with an appropriate error message
- All rejected attempts are logged for monitoring

### WebSocket Server (Socket.IO)
- CORS is configured to only allow connections from localhost origins
- A connection middleware verifies the client address and origin header
- Only connections from localhost addresses and origins are accepted
- Rejected connections receive an authentication error
- All connection attempts are logged

### Supported localhost addresses
- IPv4: `127.0.0.1`
- IPv6: `::1`
- IPv6-mapped IPv4: `::ffff:127.0.0.1`
- Hostname resolution: `localhost`

## Security Benefits

1. **Prevents remote access**: External attackers cannot connect to your server
2. **Reduces attack surface**: Only local processes can interact with the server
3. **Development safety**: Prevents accidental exposure during development
4. **Logging**: All rejected attempts are logged for security monitoring

## Usage Examples

### Enable isolation for production
```env
MAIN_SERVER_ISOLATION=true
```

### Disable isolation for development with external testing
```env
MAIN_SERVER_ISOLATION=false
```

## Logging

When isolation is enabled, the system logs:
- Server startup with isolation status
- Rejected HTTP requests with source IP
- Rejected Socket.IO connections with source IP and origin
- Accepted Socket.IO connections
- Connection/disconnection events

## Testing

To test the isolation feature:

1. Set `MAIN_SERVER_ISOLATION=true`
2. Try accessing the server from another machine on the network
3. Connections should be rejected with appropriate error messages
4. Check logs to verify rejection is working properly

## Notes

- This feature works in both Electron and headless modes
- The isolation check happens before any route processing
- Performance impact is minimal as it's a simple IP address check
- The feature is backward compatible - existing applications continue to work when isolation is disabled