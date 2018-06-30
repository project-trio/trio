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
yarn
```

Run postgres server, and create a database named `trio`. Then import the structure file:
```console
psql trio < db.sql
```

Start the server:
```console
yarn start
```

Hot-reload client:
```console
yarn serve
```

Production build:
```console
yarn build
```
