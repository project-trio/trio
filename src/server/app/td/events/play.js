module.exports = (io, socket) => {
	socket.on('updated', (data) => {
		if (socket.player) {
			socket.player.serverUpdate = data.update
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
