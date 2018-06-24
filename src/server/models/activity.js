const db = require.main.require('./helpers/db')
const global = require.main.require('./helpers/global')

const PUBLIC_FIELDS = 'id, user_id, body, EXTRACT(EPOCH FROM created_at) AS created_at, EXTRACT(EPOCH FROM updated_at) AS updated_at, target_id, target_type, reply_id, action'

module.exports = {

	async create (user, data) {
		data.user_id = user.id
		const activity = await db.one(`INSERT INTO user_activities($[this:name]) VALUES($[this:csv]) RETURNING ${PUBLIC_FIELDS}`, data)
		global.addActivity(user, activity)
		return activity
	},

	update (id, body) {
		return db.oneOrNone(`UPDATE user_activities SET body = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING 1`, [ id, body ])
	},

	latest () {
		return db.manyOrNone(`SELECT ${PUBLIC_FIELDS} FROM user_activities ORDER BY updated_at DESC LIMIT 100`)
	},

	delete (id) {
		return db.oneOrNone(`DELETE FROM user_activities WHERE id = $1`, id)
	},

}
