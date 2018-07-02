const { TESTING } = require.main.require('../common/constants')

const Game = require('../Game')

const QUEUE_WAIT = TESTING ? 6 : 20

const queuingSockets = []

let ioTD = null
let queueReadyTimer = null

const readySockets = () => {
	const result = []
	for (const socket of queuingSockets) {
		if (socket.queueReady) {
			result.push(socket)
		}
	}
	return result
}

const leaveQueue = (socket) => {
	socket.leave('queue')
	const index = queuingSockets.indexOf(socket)
	if (index !== -1) {
		queuingSockets.splice(index, 1)
	}
}

const popQueue = () => {
	queueReadyTimer = null
	const sockets = readySockets()
	if (sockets.length < 2) {
		return console.log('Queue not ready when popped')
	}
	const game = new Game(ioTD)
	for (const socket of sockets) {
		leaveQueue(socket)
		game.add(socket)
	}
}

const queueToggle = (io, socket, queuing) => {
	if (queueReadyTimer) {
		clearTimeout(queueReadyTimer)
		queueReadyTimer = null
	}
	socket.queued = queuing
	const name = socket.user.name
	if (queuing) {
		socket.join('queue')
		if (!queuingSockets.includes(socket)) {
			queuingSockets.push(socket)
		} else {
			console.log('Socket already in queue', name)
		}
	} else {
		leaveQueue(socket)
	}
	io.in('lobby').emit('queued', [ name, queuing ])

	if (queuingSockets.length >= 2) {
		queueReadyTimer = setTimeout(popQueue, QUEUE_WAIT * 1000)
	}
}

module.exports = (io, socket) => {
	ioTD = io
	socket.queued = false

	socket.on('lobby', (lobbying, callback) => {
		if (lobbying) {
			socket.join('lobby')
		} else {
			socket.leave('lobby')
		}
		callback && callback(queuingSockets.map(socket => socket.user.name))
	})

	socket.on('queue', (queuing, callback) => {
		socket.queueReady = false
		queueToggle(io, socket, queuing)
		callback(QUEUE_WAIT)
	})
	socket.on('queue ready', (queuing) => {
		socket.queueReady = queuing
	})

	socket.on('singleplayer', () => {
		const game = new Game(io)
		game.add(socket)
	})

	socket.on('join game', (gid) => {
		for (const game of Game.all) {
			if (game.id === gid) {
				return game.add(socket)
			}
		}
		socket.emit('joined game', { error: 'Game not found' })
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
