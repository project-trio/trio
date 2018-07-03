module.exports = (io, socket) => {
	socket.on('updated', (data) => {
		const player = socket.player
		if (player) {
			player.serverUpdate = data.update
		}
	})

	socket.on('player update', (data) => {
		const game = socket.game
		const player = socket.player
		if (!game || !player) {
			return console.log('No game for socket', socket.user, game, player)
		}
		if (player) {
			if (data.lives !== undefined) {
				if (!player.setLives(data.lives)) {
					game.checkFinished()
				}
			}
			player.send.creeps = data.creeps
			if (data.towers) {
				for (const tower of data.towers) {
					player.towers.push(tower)
				}
			}
		}
	})

	socket.on('leave game', (gid) => {
		const game = socket.game
		if (!game || game.id !== gid) {
			return console.log('leave game', 'Not in game', gid, game && game.id)
		}
		game.remove(socket)
	})

	socket.on('wave complete', (data) => {
		const game = socket.game
		const player = socket.player
		if (!game || !player) {
			return console.log('No game for socket', socket.user)
		}
		if (game.waveCheck !== data.wave) {
			return console.log('Wave mismatch', game.waveNumber, data)
		}
		player.waveNumber = data.wave
		player.waveDuration = data.time
		if (player.waveNumber >= game.waves) {
			player.finished = true
			game.checkFinished()
		}
	})

}
