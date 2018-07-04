const db = require.main.require('./helpers/db')
const global = require.main.require('./helpers/global')

module.exports = {

	async create (user, data) {
		data.user_id = user.id
		const activity = await db.one(`INSERT INTO user_activities($[this:name]) VALUES($[this:list]) RETURNING id, EXTRACT(EPOCH FROM created_at) AS created_at`, data)
		data.id = activity.id
		data.created_at = activity.created_at
		global.addActivity(user, data)
	},

	update (id, body) {
		return db.oneOrNone(`UPDATE user_activities SET body = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING 1`, [ id, body ])
	},

	latest () {
		return db.manyOrNone(`
			SELECT a.id, a.user_id, a.body, EXTRACT(EPOCH FROM a.created_at) AS created_at, EXTRACT(EPOCH FROM a.updated_at) AS updated_at, a.target_id, a.target_type, a.reply_id, a.action, array_remove(array_agg(r.user_id), NULL) AS r_uids, array_remove(array_agg(r.reaction), NULL) AS r_emoji
			FROM user_activities a
			LEFT JOIN user_activity_reactions r
				ON r.activity_id = id
			GROUP BY a.id
			ORDER BY COALESCE(a.updated_at, a.created_at) DESC
			LIMIT 100
		`)
	},

	delete (id) {
		return db.oneOrNone(`DELETE FROM user_activities WHERE id = $1`, id)
	},

	react (user, id, emoji) {
		db.oneOrNone(`INSERT INTO
			user_activity_reactions(activity_id, user_id, reaction)
			VALUES($1, $2, $3)
			ON CONFLICT ON CONSTRAINT user_activity_reactions_pkey DO UPDATE
				SET reaction = EXCLUDED.reaction, updated_at = EXCLUDED.updated_at
			RETURNING 1
		`, [ id, user.id, emoji ])
		global.addReaction(user, id, emoji)
	},

}
