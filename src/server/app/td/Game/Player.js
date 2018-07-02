module.exports = class Player {

	constructor (socket, user) {
		this.socket = socket
		this.user = user

		this.joined = true
		this.ready = false
		this.lost = false
		this.finished = false
		this.serverUpdate = null

		this.waveNumber = 0
		this.waveAt = 0
		this.lives = 20
		this.wavesWon = 0

		this.send = {}
		this.towers = []
	}

	setLives (lives) {
		this.send.lives = lives
		this.lives = lives
		if (lives <= 0) {
			this.lost = true
			return false
		}
		return true
	}

	score () {
		return -20 + this.lives + this.wavesWon * 10
	}

}
