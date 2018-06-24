const { uid } = require.main.require('./helpers/util')

const { TICK_DURATION, UPDATE_DURATION } = require('./config')

//CONSTRUCTOR

const games = []

class Game {

	constructor (io) {
		this.io = io.to(this.id)
		this.players = []
		this.id = uid()
		this.game = null
		this.started = false
		this.finished = false
		this.serverUpdate = 0
		this.idleCount = 0

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

	add (socket) {
		const pid = socket.user.id
		if (this.playerById(pid)) {
			socket.isActive = true
			this.broadcast('update player', { pid: pid, joined: true })
		} else {
			if (this.started) {
				return { error: `Already started ${this.id}` }
			}
			this.broadcast('players', { players: this.formattedPlayers() })
			socket.isActive = true
			socket.join(this.id)
			socket.game = this
		}
		return { gid: this.id, players: this.formattedPlayers() }
	}

	destroy () {
		this.finished = true
		for (const socket of this.players) {
			socket.isActive = false
			socket.leave(this.id)
			socket.game = null
		}
		this.players = {}

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

//METHODS

	start () {
		this.broadcast('start game', {
			gid: this.id,
			players: this.formattedPlayers(),
			tickDuration: TICK_DURATION,
			updateDuration: UPDATE_DURATION,
		})
		this.started = true
		console.log('Started game', this.id)
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
