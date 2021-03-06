const live = require('@/server/helpers/live')
const middleware = require('@/server/helpers/middleware')

const Activity = require('@/server/models/activity')

module.exports = (socket) => {
	middleware.page(socket, 'home', (data, callback) => {
		callback(live.initData())
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
			target_type: data.targetType,
		}
		if (data.targetId !== undefined) {
			activity.target_id = parseInt(data.targetId, 10)
		}
		if (data.replyId !== undefined) {
			activity.reply_id = parseInt(data.replyId, 10)
		}
		await Activity.create(socket.user, activity)
		callback()
	})

}
