const { TESTING } = require('@/common/constants')

const { uid } = require('@/server/helpers/util')

const MAX_IDLE_UPDATES = TESTING ? 1000 : 1000

class Game {

	constructor (io, mode) {
		const id = uid()
		this.id = id
		this.io = io.to(id)
		this.mode = mode
		this.state = Game.STATE_OPEN
		this.players = []

		this.serverUpdate = 0
		this.idleCount = 0
		this.destroyed = false
	}

	isStarted () {
		return this.state !== Game.STATE_OPEN
	}

	isFinished () {
		return this.state === Game.STATE_FINISHED
	}

	isPlaying () {
		return this.isStarted() && !this.isFinished()
	}

	idleTimeout () {
		if (this.idleCount > MAX_IDLE_UPDATES) {
			console.log(this.id, 'Game timed out due to inactivity')
			this.broadcast('closed')
			this.destroy()
			return true
		}
		this.idleCount += 1
		return false
	}

	destroy () {
		this.destroyed = true
		for (const player of this.players) {
			player.removeFromGame(this)
		}
		this.players = []
	}

	broadcast (name, message) {
		this.io.emit(name, message)
	}

	// Players

	playerCount () {
		return this.players.length
	}

	playerIndexOf (id) {
		const players = this.players
		for (let idx = 0; idx < players.length; idx += 1) {
			const player = players[idx]
			if (player.user.id === id) {
				return idx
			}
		}
		return null
	}

	playerById (id) {
		for (const player of this.players) {
			if (player.user.id === id) {
				return player
			}
		}
		return null
	}

	hasEnoughPlayersToContinue () {
		const minActiveCount = this.requiredNumberOfActivePlayers()
		let count = 0
		for (const player of this.players) {
			if (player.joinCompleted) {
				count += 1
				if (count >= minActiveCount) {
					return true
				}
			}
		}
		return false
	}
	
	requiredNumberOfActivePlayers () {
		return 1
	}

	remove (socket) {
		const pid = socket.user.id
		const leaveIndex = this.playerIndexOf(pid)
		if (leaveIndex !== null) {
			const player = socket.player
			if (this.isPlaying()) {
				player.joinCompleted = false
			} else {
				player.removeFromGame(this)
				this.players.splice(leaveIndex, 1)
				console.log('Player left', pid, this.id)
			}
			if (!this.hasEnoughPlayersToContinue()) {
				this.destroy()
				return true
			}
			this.broadcast('update player', { pid, joined: false })
		}
	}

}

Game.STATE_OPEN = 'OPEN'
Game.STATE_STARTED = 'STARTED'
Game.STATE_FINISHED = 'FINISHED'

module.exports = Game
