# Trio

https://trio.suzu.online

Multiplayer game server and realtime frontend with community features.

## Games

- [TD on GitHub](https://github.com/project-trio/td): Open-field Tower Defense
- [Moba on GitHub](https://github.com/project-trio/moba): Top-down strategy MOBA

## Tech

- Client: [Vue.js](https://vuejs.org)
- WebSockets with [socket.io](https://socket.io)
- Node.js/PostgreSQL backend

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

# Production build
npm run build
```
