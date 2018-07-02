const db = require.main.require('./helpers/db')

module.exports = {

	create (id, topic_id, mode, players, started_at, duration, completed, data, version) {
		return db.none(`INSERT INTO games(id, topic_id, mode, players, started_at, duration, completed, data, version) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [ id, topic_id, mode, players, started_at, duration, completed, JSON.stringify(data), version ])
	},

}
