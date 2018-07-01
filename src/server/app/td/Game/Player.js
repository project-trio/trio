module.exports = class Player {

	constructor (socket, user) {
		this.socket = socket
		this.user = user

		this.joined = true
		this.ready = false
		this.finished = false
		this.serverUpdate = null

		this.wave = 0
		this.waveComplete = 0
		this.lives = 20

		this.send = {}
		this.towers = []
	}

	setLives (lives) {
		this.send.lives = lives
		this.lives = lives
		if (lives <= 0) {
			this.finished = true
		}
	}

}
