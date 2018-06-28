module.exports = (io, socket) => {
	socket.on('updated', (data) => {
		const player = socket.player
		if (player) {
			player.serverUpdate = data.update
		}
	})

	socket.on('player update', (data) => {
		const player = socket.player
		if (player) {
			if (data.lives !== undefined) {
				player.send.lives = data.lives
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
		if (!socket.game) {
			return console.log('No game for socket', socket.user)
		}
		if (socket.game.wave !== data.wave) {
			return console.log('Wave mismatch', socket.game.wave, data)
		}
		socket.player.wave = data.wave
		socket.player.waveComplete = data.time
	})

}
