const global = require.main.require('./helpers/global')
const middleware = require.main.require('./helpers/middleware')

const Activity = require.main.require('./models/activity')

module.exports = (socket) => {
	middleware.page(socket, 'home', (data, callback) => {
		callback(global.initData())
	})

	socket.on('activity react', async (data, callback) => {
		if (!socket.user) {
			return callback({ error: 'Authentication required '})
		}
		Activity.react(socket.user, data.id, data.emoji)
	})

	socket.on('submit post', async (data, callback) => {
		if (!socket.user) {
			return callback({ error: 'Authentication required '})
		}
		const activity = {
			body: data.message,
			target_id: data.targetId,
			target_type: data.targetType,
			reply_id: data.replyId,
		}
		await Activity.create(socket.user, activity)
		callback()
	})

}
