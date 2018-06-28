module.exports = class Player {

	constructor (socket, user) {
		this.socket = socket
		this.user = user

		this.isActive = true
		this.ready = false
		this.serverUpdate = null

		this.wave = 0
		this.waveComplete = 0

		this.send = {}
		this.towers = []
	}

}
