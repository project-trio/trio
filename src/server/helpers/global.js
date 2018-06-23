let three

module.exports = {
	activities: [],

	async init (io) {
		three = io.of('/three')
		const Activity = require.main.require('./models/activity')
		this.activities = await Activity.latest()
	},

	addActivity (activity) {
		this.activities.unshift(activity)
		if (this.activities.length >= 100) {
			this.activities.pop()
		}
		three.in('home').emit('activity', activity)
	},

}
