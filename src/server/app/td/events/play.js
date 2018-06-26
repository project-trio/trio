module.exports = (io, socket) => {
	socket.on('updated', (data) => {
		if (socket.player) {
			socket.player.serverUpdate = data.update
		}
	})
}
