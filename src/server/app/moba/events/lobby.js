const Config = require('../config')
const MobaGame = require('../Game')

const LobbyQueue = require('../lobby/queue')

const MODE_NAMES = Config.GAME_MODES.map((mode) => mode.name)

const createGame = function (io, socket, mode, size, map, joining, autoStart) {
	const response = {}
	if (socket.player) {
		response.error = 'Already in a game'
	} else if (mode !== 'tutorial' && !MODE_NAMES.includes(mode)) {
		response.error = 'Invalid game mode'
	} else if (!autoStart && !Config.GAME_SIZES.includes(size)) {
		response.error = 'Invalid game size'
	} else if (!map) {
		response.error = 'Please choose a map'
	} else {
		if (size < 0 || size > 25) { //TODO validate game settings
			response.error = 'Invalid game size'
		} else {
			const game = new MobaGame(io, mode, size, map, autoStart)
			if (joining) {
				const joinData = game.addSocket(socket)
				if (joinData.error) {
					game.destroy()
					response.error = joinData.error
					response.backToLobby = true
				}
			}
			if (!response.error) {
				LobbyQueue.broadcastWith(io, false, true)
				response.gid = game.id
			}
		}
	}
	return response
}

const quickJoin = function (io, socket, mode, size, map) {
	const games = MobaGame.all
	for (const game of games) {
		if (game.mode === game && game.size === size && game.map === map) {
			const gameData = game.addSocket(socket)
			if (!gameData.error) {
				return gameData
			}
		}
	}
	return createGame(io, socket, mode, size, map, true, true)
}

const join = function (socket, gid, callback) {
	const games = MobaGame.all
	for (const game of games) {
		if (game.id === gid) {
			const gameData = game.addSocket(socket)
			callback(gameData)
			return !gameData.error
		}
	}
	callback({error: "Game doesn't exist"})
}

module.exports = (io, socket) => {
	socket.on('start game', (data, callback) => {
		const user = socket.user
		const player = socket.player
		const response = {}
		if (!player) {
			response.error = 'Player not found'
		} else {
			const game = player.game
			if (game) {
				if (game.hostID === user.id) {
					if (game.canStart()) {
						game.start()
						LobbyQueue.broadcastWith(io, false, true)
					} else {
						response.error = 'Waiting for players to join'
					}
				} else {
					response.error = 'You are not the host'
				}
			} else {
				response.error = 'Game not found'
			}
		}
		callback(response)
	})

	socket.on('lobby action', (data, callback) => {
		const player = socket.player
		console.log('lobby action', player && player.user.id, data)
		if (player && data.gid !== player.game.id && player.game.isPlaying()) {
			console.log('reenter', player.game.id, data.gid)
			callback({ reenter: player.game.id })
			return
		}
		if (data.action !== 'queue') {
			LobbyQueue.removeSocket(socket)
		}
		if (data.action === 'enter') {
			if (player && data.gid) {
				player.game.remove(socket)
			}
			socket.join('lobby')
			callback({ online: LobbyQueue.playerCount, games: MobaGame.getList() })
		} else {
			socket.leave('lobby')
			if (data.action === 'queue') {
				LobbyQueue.add(socket, data)
			} else if (data.action === 'leave') {
				if (player && data.gid !== player.game.id) {
					player.game.remove(socket)
				}
			} else if (data.action === 'quick') {
				const gameResponse = quickJoin(io, socket, data.mode, data.size, data.map)
				callback(gameResponse)
			} else if (data.action === 'create') {
				const gameResponse = createGame(io, socket, data.mode, data.size, data.map, false, false)
				callback(gameResponse)
			} else if (data.action === 'join') {
				join(socket, data.gid, callback)
			} else {
				console.error('Unknown lobby action', data)
			}
		}
	})

	socket.on('queue', (data) => {
		LobbyQueue.updateSocket(socket, data)
	})

	socket.on('disconnect', () => {
		LobbyQueue.removeSocket(socket)
		LobbyQueue.broadcastWith(io, true, true)
	})
}
