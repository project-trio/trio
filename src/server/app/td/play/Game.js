const { TESTING } = require.main.require('../common/constants')

const { uid } = require.main.require('./helpers/util')

const { TICK_DURATION, UPDATE_DURATION } = require('./config')

//CONSTRUCTOR

const games = []

class Game {

	constructor (io) {
		this.players = []
		this.id = uid()
		this.io = io.to(this.id)
		this.game = null
		this.started = false
		this.finished = false
		this.serverUpdate = 0
		this.idleCount = 0
		this.updatesUntilStart = (TESTING ? 5 : 15) * 1000 / UPDATE_DURATION

		console.log('Created td', this.id)
		games.push(this)
	}

//PRIVATE

	playerById (id) {
		for (const socket of this.players) {
			if (socket.user.id === id) {
				return socket
			}
		}
		return null
	}

	playerCount () {
		return this.players.length
	}

	activePlayerCount () {
		let result = 0
		for (const player of this.players) {
			if (player.isActive) {
				result += 1
			}
		}
		return result
	}

//JOIN

	formattedPlayers () {
		const broadcastPlayers = []
		for (const socket of this.players) {
			broadcastPlayers.push({
				id: socket.user.id,
				name: socket.user.name,
			})
		}
		return broadcastPlayers
	}

	ready (socket) {
		if (this.started) {
			return
		}
		socket.ready = true
		for (const socket of this.players) {
			if (!socket.ready) {
				return
			}
		}
		this.started = true
		this.broadcast('start game', {
			gid: this.id,
			players: this.formattedPlayers(),
			tickDuration: TICK_DURATION,
			updateDuration: UPDATE_DURATION,
			updatesUntilStart: this.updatesUntilStart,
		})
		console.log('Started game', this.id)
	}

	add (socket, callback) {
		const pid = socket.user.id
		let data
		if (this.playerById(pid)) {
			socket.isActive = true
			this.broadcast('update player', { pid: pid, joined: true })
			data = {
				gid: this.id,
				players: this.formattedPlayers(),
				tickDuration: TICK_DURATION,
				updateDuration: UPDATE_DURATION,
				updatesUntilStart: this.updatesUntilStart,
				// history: this.history, //TODO
			}
		} else {
			if (this.started) {
				return callback({ error: `Already started ${this.id}` })
			}
			socket.ready = false
			socket.isActive = true
			socket.game = this
			this.players.push(socket)
			data = { gid: this.id }
		}
		socket.join(this.id, () => {
			callback(data)
		})
	}

	destroy () {
		this.finished = true
		for (const socket of this.players) {
			socket.isActive = false
			socket.leave(this.id)
			socket.game = null
		}

		for (let idx = games.length - 1; idx >= 0; idx -= 1) {
			if (this === games[idx]) {
				games.splice(idx, 1)
				return
			}
		}
		console.log('ERR unable to remove deleted game', this.id)
	}

	remove (removePlayer) {
		const removeId = removePlayer.id
		const players = this.players
		let removeIndex = null
		for (let idx = 0; idx < players.length; idx += 1) {
			if (players[idx].id === removeId) {
				removeIndex = idx
				break
			}
		}
		if (removeIndex !== null) {
			if (this.started) {
				removePlayer.isActive = false
			} else {
				this.players.splice(removeIndex, 1)
			}

			if (this.activePlayerCount() <= 0) {
				this.destroy()
				return true
			}
			this.broadcast('update player', { pid: removeId, joined: false })
		}
	}

	broadcast (name, message) {
		this.io.emit(name, message)
	}

}

Game.all = games

Game.getList = function () {
	const result = []
	for (let idx = games.length - 1; idx >= 0; idx -= 1) {
		const game = games[idx]
		result.push({
			id: game.id,
			players: game.formattedPlayers(),
			started: game.started,
			update: game.serverUpdate,
		})
	}
	return result
}

module.exports = Game
