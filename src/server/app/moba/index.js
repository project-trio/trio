const middleware = require.main.require('./helpers/middleware')

// const { VERSION } = require('./config')

const LobbyQueue = require('./lobby/queue')

const MobaGame = require('./Game')

module.exports = (io) => {
	const moba = middleware.namespace(io, 'moba', (socket) => {
		const user = socket.user
		const userID = user.id
		const player = MobaGame.findPlayerForUserID(userID)
		if (player) {
			socket.player = player
			player.socket = socket
			//TODO rejoin
		}
		LobbyQueue.broadcastWith(moba, true, false)

		require('./events/lobby')(moba, socket)
		require('./events/play')(moba, socket)
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
