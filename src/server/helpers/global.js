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
		const activityUsers = await User.all(Array.from(userIds), true)
		for (const user of activityUsers) {
			users[user.id] = user
			delete user.id
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

	updateUser (user) {
		const existingUser = users[user.id]
		if (existingUser) {
			existingUser.at = user.at
			if (!existingUser.online) {
				existingUser.online = 1
			} else {
				existingUser.online += 1
			}
			user = existingUser
		} else {
			user.online = 1
			users[user.id] = {
				email: user.email,
				at: user.at,
			}
		}
		trio.in('home').emit('user', user)
		return user
	},

	disconnect (user) {
		user.online -= 1
		if (user.online === 0) {
			trio.in('home').emit('user', user)
		}
	},

}
