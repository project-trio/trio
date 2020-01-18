const Player = require('@/server/app/Game/Player')

module.exports = class TDPlayer extends Player {

	constructor (socket, game) {
		super(socket, game)

		this.isReadyToStart = false
		this.finished = false
		this.waveNumber = 0
		this.waveDuration = 0
		this.lives = 20
		this.wavesWon = 0

		this.send = {}
		this.towers = []
	}

	setLives (lives) {
		this.send.lives = lives
		this.lives = lives
		return this.didLose()
	}

	didLose () {
		return this.lives <= 0
	}

	score () {
		return -20 + this.lives + this.wavesWon * 10
	}

}
