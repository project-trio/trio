const db = require.main.require('./helpers/db')

module.exports = {

	create (id, topic_id, mode, players, started_at, duration, completed, data, version) {
		return db.none(`INSERT INTO games(id, topic_id, mode, players, started_at, duration, completed, data, version) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [ id, topic_id, mode, players, started_at, duration, completed, JSON.stringify(data), version ])
	},

	scores (topicId, mode) {
		return db.query({
			text: `
				SELECT user_id, score
				FROM user_game_scores
				WHERE topic_id = $1 AND mode = $2
				ORDER BY score ASC
				LIMIT 100`,
			values: [ topicId, mode ],
			rowMode: 'array',
		})
	},

	userScores (user) {
		return db.manyOrNone(`
			SELECT topic_id, mode, score,
				(SELECT rank
				FROM (
						SELECT user_id, topic_id, mode, RANK() OVER (ORDER BY score desc) AS rank
						FROM user_game_scores
						WHERE topic_id = ugs.topic_id AND mode = ugs.mode
					) igs
				WHERE user_id = 1)
			FROM user_game_scores ugs
			WHERE user_id = 1
			ORDER BY updated_at DESC
		`, user.id)
	},

}
