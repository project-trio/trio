const { now } = require.main.require('../common/utils')
const User = require.main.require('./models/user')

let trio

let activities = []
let users = {}

module.exports = {

	activities () {
		return activities
	},

	users () {
		return users
	},

	async init (io) {
		trio = io.of('/trio')
		const Activity = require.main.require('./models/activity')
		activities = await Activity.latest()

		const userIds = new Set()
		for (const activity of activities) {
			userIds.add(activity.user_id)
			if (activity.target_type === 'user') {
				userIds.add(activity.target_id)
			}
		}
		if (userIds.size) {
			const activityUsers = await User.all(Array.from(userIds), true)
			for (const user of activityUsers) {
				users[user.id] = user
				delete user.id
			}
		}
	},

	async addActivity (user, activity) {
		activities.unshift(activity)
		if (activities.length >= 100) {
			activities.pop()
		}
		const currentTime = now()
		if (currentTime - user.at > 30 * 1000) {
			user.at = currentTime
			trio.in('home').emit('user', user)
		}
		trio.in('home').emit('activity', activity)
	},

	connectUser (socket, privateUser, game) {
		const userId = privateUser.id
		const existingUser = users[userId]
		let user
		if (existingUser) {
			if (game && existingUser.game) {
				return false
			}
			existingUser.at = privateUser.at
			if (existingUser.online < 1) {
				existingUser.online = 1
			} else {
				existingUser.online += 1
			}
			user = existingUser
		} else {
			user = {
				name: privateUser.name,
				ccid: privateUser.ccid,
				md5: privateUser.md5,
				at: privateUser.at,
				admin: privateUser.admin,
				online: 1,
			}
			users[userId] = user
		}
		socket.user = user
		if (game) {
			user.game = game
		}
		socket.emit('local', { name: user.name, email: privateUser.email, ccid: user.ccid, md5: user.md5, admin: user.admin })
		trio.in('home').emit('user', user)
		return true
	},

	disconnect (socket) {
		const user = socket.user
		user.online -= 1
		if (user.online === 0) {
			trio.in('home').emit('user', user)
		}
	},

}
