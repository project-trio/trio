const { randomItem } = require('@/common/utils')

const Player = require('@/server/app/Game/Player')

const Config = require('../config')

module.exports = class MobaPlayer extends Player {

	constructor (socket, game, team) {
		super(socket, game)
		this.team = team

		this.shipName = null
		this.switchUnit = null
		this.actionUpdate = 0
		this.updatesUntilAuto = 0
		this.actions = null
		this.levelNext = null
		this.chatAt = 0
		this.actions = []
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

	setRetro (retro, tutorial) {
		const shipNames = retro ? Config.RETRO_SHIP_NAMES : Config.SHIP_NAMES
		this.shipName = this.socket ? shipNames[tutorial ? 3 : 0] : randomItem(shipNames)
	}

}
