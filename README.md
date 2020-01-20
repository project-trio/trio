# Trio

https://trio.suzu.online

Multiplayer game server and realtime frontend with community features.

## Clients

- [TD on GitHub](https://github.com/project-trio/td): Open-field Tower Defense
- [Moba on GitHub](https://github.com/project-trio/moba): Top-down strategy MOBA

New clients can be started with [trio-client](https://github.com/project-trio/trio-client).

## Tech

- UI with [Vue.js](https://vuejs.org)
- WebSocket networking with [socket.io](https://socket.io)
- Backend with Node.js+PostgreSQL

## Development

Run postgres server, and create a database named `trio`.

```sh
cd trio
# Install dependencies
npm install

# Import the DB structure
psql trio < db.sql

# Start the server
npm start

# Hot-reload dev environment
npm run serve

# Build for production
npm run build
```
