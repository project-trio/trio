module.exports = class Player {

	constructor (socket, user) {
		this.socket = socket
		this.user = user

		this.isJoined = true
		this.isReadyToStart = false
		this.finished = false
		this.serverUpdate = null

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
