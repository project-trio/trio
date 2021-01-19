module.exports = (io, socket) => {
	socket.on('updated', (data) => {
		const player = socket.player
		if (player) {
			player.serverUpdate = data.update
		}
	})

	socket.on('player update', (data) => {
		const player = socket.player
		if (!player) {
			return //console.log('No player for socket', socket.user, 'player update')
		}
		if (player) {
			if (data.lives !== undefined) {
				player.setLives(data.lives)
				if (player.didLose()) {
					player.game.checkFinished()
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
		const player = socket.player
		if (!player) {
			return //console.log('leave game', 'Not in game', socket.user)
		}
		const game = player.game
		if (game.id !== gid) {
			return console.log('leave game', 'Wrong game', gid, game && game.id)
		}
		game.remove(socket)
	})

	socket.on('wave complete', (data) => {
		const player = socket.player
		if (!player) {
			return console.log('No player for socket', socket.user, 'wave complete')
		}
		const game = player.game
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
