const Game = require('../Game')

const queuingNames = []

const queueToggle = (io, socket, queuing) => {
	if (socket.queued !== queuing) {
		socket.queued = queuing
		const name = socket.user.name
		if (queuing) {
			socket.join('queue')
			queuingNames.push(name)
		} else {
			socket.leave('queue')
			queuingNames.splice(queuingNames.indexOf(name), 1)
		}
		io.in('lobby').emit(`queue ${queuing ? 'join' : 'leave'}`, name)
		console.log(new Date().toLocaleTimeString(), `queue ${queuing ? 'join' : 'leave'}`, name)
	}
}

module.exports = (io, socket) => {
	socket.queued = false

	socket.on('lobby', (lobbying, callback) => {
		if (lobbying) {
			socket.join('lobby')
		} else {
			socket.leave('lobby')
		}
		callback && callback(queuingNames)
	})

	socket.on('queue', (queuing) => {
		queueToggle(io, socket, queuing)
	})

	socket.on('singleplayer', (data, callback) => {
		const game = new Game(io)
		game.add(socket, callback)
	})

	socket.on('join game', (gid, callback) => {
		for (const game of Game.all) {
			if (game.id === gid) {
				game.add(socket, callback)
			}
		}
		callback({ error: 'Game not found' })
	})

	socket.on('ready', () => {
		if (socket.game) {
			socket.game.ready(socket)
		}
	})

	socket.on('disconnect', () => {
		queueToggle(io, socket, false)
	})
}