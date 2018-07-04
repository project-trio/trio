# Trio

https://trio.suzu.online

Multiplayer game server and realtime frontend with community features.

## Tech

- Client: [Vue.js](https://vuejs.org)
- WebSockets with [socket.io](https://socket.io)
- Node.js/PostgreSQL backend

## Games

The source for the [TD](https://github.com/ky-is/td) game is available to run alongside. Or you modify it to create your own game!

## Development

Install dependencies:
```console
cd trio
npm install
```

Run postgres server, and create a database named `trio`. Then import the structure file:
```console
psql trio < db.sql
```

Start the server:
```console
npm start
```

Hot-reload client:
```console
npm run serve
```

Production build:
```console
npm run build
```
