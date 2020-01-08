const { randomItem } = require.main.require('../common/utils')

const Config = require('../config')

const Util = require.main.require('./helpers/util')

const Queue = require('../lobby/queue')

module.exports = class Player {

	constructor (socket, user) {
		this.bot = !socket
		this.socket = socket
		if (user) {
			this.user = user
		} else {
			const botId = `bot-${Util.code()}`
			this.user = {
				id: botId,
				name: botId,
			}
		}

		this.game = null
		this.team = null
		this.isActive = false

		this.shipName = null
		this.switchUnit = null
		this.actionUpdate = null
		this.serverUpdate = null
		this.updatesUntilAuto = 0
		this.actions = null
		this.levelNext = null
		this.chatAt = null

		this.queueing = false
		this.queueReady = false
		this.queueMin = 1
		this.queueMap = null
	}

	data () {
		return {
			id: this.user.id,
			name: this.user.name,
			shipName: this.shipName,
			team: this.team,
			bot: this.bot,
		}
	}

	emit (name, message) {
		if (this.socket) {
			this.socket.emit(name, message)
		}
	}

	reset (team) {
		this.team = team
		this.isActive = true
		this.switchUnit = null
		this.actionUpdate = 0
		this.serverUpdate = 0
		this.actions = []
		this.levelNext = null
		this.chatAt = null
	}

	setRetro (retro, tutorial) {
		const shipNames = retro ? Config.RETRO_SHIP_NAMES : Config.SHIP_NAMES
		this.shipName = this.socket ? shipNames[tutorial ? 3 : 0] : randomItem(shipNames)
	}

	// Rooms

	join (room) {
		if (this.socket) {
			this.socket.join(room)
		}
	}

	leave (room) {
		if (this.socket) {
			this.socket.leave(room)
		}
	}

	// Game

	joinGame (game) {
		this.game = game

		this.join(game.id)
	}

	leaveGameRoom () {
		if (this.game) {
			this.leave(this.game.id)
		}
	}

	leaveGame () {
		if (this.game) {
			this.leaveGameRoom()
			const result = this.game.remove(this)
			this.game = null
			return result
		}
	}

	// Queue

	updateQueue (data) {
		this.queueReady = data.ready
		this.queueMin = data.size
		this.queueMap = data.map
	}

	queueEnter () {
		this.join('queue')
	}

	queueLeave () {
		this.leave('queue')
	}

	disconnect () {
		Queue.remove(this)
		return this.leaveGame()
	}
}
