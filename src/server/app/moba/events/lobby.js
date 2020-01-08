const Config = require('../config')
const Game = require('../Game')

const Lobby = require('../lobby')
const Queue = require('../lobby/queue')

const MODE_NAMES = Config.GAME_MODES.map((mode) => mode.name)

const createGame = function (io, player, mode, size, map, joining, autoStart) {
	const response = {}
	if (player.game) {
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
			const game = new Game(io, mode, size, map, autoStart)
			if (joining) {
				const joinData = game.add(player)
				if (joinData.error) {
					game.destroy()
					response.error = joinData.error
					response.backToLobby = true
				}
			}
			if (!response.error) {
				Lobby.broadcastWith(io, false, true)
				response.gid = game.id
			}
		}
	}
	return response
}

const quickJoin = function (io, player, mode, size, map) {
	const games = Game.all
	for (const game of games) {
		if (game.mode === game && game.size === size && game.map === map) {
			const gameData = game.add(player)
			if (!gameData.error) {
				return { gid: game.id }
			}
		}
	}
	return createGame(io, player, mode, size, map, true, true)
}

const join = function (player, gid, callback) {
	const games = Game.all
	for (const game of games) {
		if (game.id === gid) {
			const gameData = game.add(player)
			if (gameData.error) {
				callback({ error: gameData.error })
				return false
			}
			callback(gameData)
			return true
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
				if (game.hostId === user.id) {
					if (game.canStart()) {
						game.start()
						Lobby.broadcastWith(io, false, true)
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
		console.log('lobby action', data)
		const player = socket.player
		if (player.game && data.gid !== player.game.id) {
			console.log('reenter', player.game.id, data.gid)
			callback({ reenter: player.game.id })
			return
		}
		if (data.action !== 'queue') {
			Queue.remove(player)
		}
		if (data.action === 'enter') {
			if (player.game && data.gid) {
				player.leaveGame()
			}
			socket.join('lobby')
			callback({ online: Lobby.playerCount, games: Game.getList() })
		} else {
			socket.leave('lobby')
			if (data.action === 'queue') {
				Queue.add(player, data)
			} else if (data.action === 'leave') {
				player.leaveGame()
			} else if (data.action === 'quick') {
				const gameResponse = quickJoin(io, player, data.mode, data.size, data.map)
				callback(gameResponse)
			} else if (data.action === 'create') {
				const gameResponse = createGame(io, player, data.mode, data.size, data.map, false, false)
				callback(gameResponse)
			} else if (data.action === 'join') {
				join(player, data.gid, callback)
			} else {
				console.error('Unknown lobby action', data)
			}
		}
	})

	socket.on('queue', (data, callback) => {
		const player = socket.player
		Queue.updatePlayer(player, data)
	})
}
