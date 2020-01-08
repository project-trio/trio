const middleware = require.main.require('./helpers/middleware')

// const { VERSION } = require('./config')

const Lobby = require('./lobby')
const LobbyQueue = require('./lobby/queue')

const Player = require('./Game/Player')

const lobbyEvents = require('./events/lobby')
const playEvents = require('./events/play')

const clientPlayers = {}

module.exports = (io) => {
	const moba = middleware.namespace(io, 'moba', (socket) => {
		const user = socket.user
		const userID = user.id
		let player = clientPlayers[userID]
		if (player) {
			player.socket = socket
		} else {
			player = new Player(socket, user)
			clientPlayers[userID] = player
			Lobby.broadcastWith(moba, true, false)
		}
		socket.player = player

		lobbyEvents(moba, socket)
		playEvents(moba, socket)

		socket.on('disconnect', () => {
			const removePlayerPermanently = player.disconnect()
			if (clientPlayers[userID]) {
				if (removePlayerPermanently) {
					delete clientPlayers[userID]
					player = null
				} else {
					player.socket = null
				}
			}
			Lobby.broadcastWith(moba, true, removePlayerPermanently)
		})
	})

	// moba.use((socket, next) => { //TODO
	// 	const query = socket.handshake.query
	// 	if (query.v === VERSION) {
	// 		next()
	// 	} else {
	// 		socket.emit('reload', {v: VERSION})
	// 	}
	// })

	require('./Game/loop')(moba)
	LobbyQueue.init(moba)

	return moba
}
