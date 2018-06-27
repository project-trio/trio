const { TESTING } = require.main.require('../common/constants')

const { uid } = require.main.require('./helpers/util')

const { TICK_DURATION, UPDATE_DURATION } = require('./config')

const Player = require('./Player')

//CONSTRUCTOR

const games = []

class Game {

	constructor (io) {
		this.players = []
		this.id = uid()
		this.io = io.to(this.id)
		this.started = false
		this.finished = false
		this.serverUpdate = 0
		this.idleCount = 0
		this.updatesUntilStart = (TESTING ? 1 : 15) * 1000 / UPDATE_DURATION

		this.wave = 0
		this.waveUpdate = 0

		console.log('Created td', this.id)
		games.push(this)
	}

//PRIVATE

	playerById (id) {
		for (const player of this.players) {
			if (player.user.id === id) {
				return player
			}
		}
		return null
	}

	playerIndexOf (id) {
		let result = null
		const players = this.players
		for (let idx = 0; idx < players.length; idx += 1) {
			if (players[idx].id === id) {
				result = idx
				break
			}
		}
		return result
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
		for (const player of this.players) {
			broadcastPlayers.push({
				id: player.user.id,
				name: player.user.name,
			})
		}
		return broadcastPlayers
	}

	ready (socket) {
		if (this.started || !socket.player) {
			return
		}
		socket.player.ready = true
		for (const player of this.players) {
			if (!player.ready) {
				return
			}
		}
		this.started = true
		this.wave = 1
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
		const user = socket.user
		const pid = user.id
		let data
		let player = this.playerById(pid)
		if (player) {
			player.isActive = true
			socket.player = player
			this.broadcast('update player', { pid, joined: true })
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
			player = new Player(socket, user)
			this.players.push(player)
			data = { gid: this.id }
		}
		socket.game = this
		socket.player = player
		socket.join(this.id, () => {
			callback(data)
		})
	}

	destroy () {
		this.finished = true
		for (const player of this.players) {
			player.isActive = false
			const socket = player.socket
			if (socket) {
				socket.leave(this.id)
				if (socket.game === this) {
					socket.game = null
					socket.player = null
				}
			}
		}

		for (let idx = games.length - 1; idx >= 0; idx -= 1) {
			if (this === games[idx]) {
				games.splice(idx, 1)
				return
			}
		}
		console.log('ERR unable to remove deleted game', this.id)
	}

	remove (socket) {
		const pid = socket.user.id
		const leaveIndex = this.playerIndexOf(pid)
		if (leaveIndex !== null) {
			if (this.started) {
				const player = this.players[leaveIndex]
				player.isActive = false
			} else {
				this.players.splice(leaveIndex, 1)
			}

			if (this.activePlayerCount() <= 0) {
				this.destroy()
				return true
			}
			socket.game = null
			socket.player = null
			this.broadcast('update player', { pid, joined: false })
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
