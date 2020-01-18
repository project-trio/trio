const { getTimestamp } = require('@/common/utils')

let trio

let activities = []
const users = {}
const topics = {}
let scores = {}
const gameUsers = {}

const sendUpdate = (user, data) => {
	const currentTime = getTimestamp()
	if (currentTime > data.at + 5) {
		data.user = {
			id: user.id,
			at: currentTime,
		}
	}
	trio.in('home').emit('update action', data)
}

const namespaceToTopicID = {
	moba: 1,
	td: 2,
}

module.exports = {

	initData () {
		return { activities, users, topics }
	},

	async init (io) {
		trio = io.of('/trio')

		activities = await require('@/server/models/activity').latest()

		const topicArray = await require('@/server/models/topic').latest()
		for (const topic of topicArray) {
			topics[topic.id] = topic.name
		}

		const userIds = new Set()

		const gameModel = require('@/server/models/game')
		const tdNormal = await gameModel.scores(2, 'normal')
		const tdRandom = await gameModel.scores(2, 'random')
		scores = {
			2: {
				normal: tdNormal,
				random: tdRandom,
			},
		}
		for (const scoreRow of tdNormal) {
			userIds.add(scoreRow[0])
		}
		for (const scoreRow of tdRandom) {
			userIds.add(scoreRow[0])
		}

		for (const activity of activities) {
			userIds.add(activity.user_id)
			if (activity.target_type === 'user') {
				userIds.add(activity.target_id)
			}
		}
		if (userIds.size) {
			const activityUsers = await require('@/server/models/user').all(Array.from(userIds), true)
			for (const user of activityUsers) {
				user.online = 0
				user.gameData = {
					topicID: null,
					id: null,
				}
				users[user.id] = user
			}
		}

		for (const topicID in scores) {
			const topicScores = scores[topicID]
			const topicUsers = {}
			gameUsers[topicID] = topicUsers
			for (const mode in topicScores) {
				const modeScores = topicScores[mode]
				for (const score of modeScores) {
					const uid = score[0]
					topicUsers[uid] = users[uid]
				}
			}
		}
	},

	getGameStats (topicID) {
		return { users: gameUsers[topicID], scores: scores[topicID] }
	},

	addHighscore (user, topicID, mode, score) {
		const uid = user.id
		const modeScores = scores[topicID][mode]
		if (modeScores.length) {
			let updatedScore = false
			for (let idx = 0; idx < modeScores.length; idx += 1) {
				const modeScore = modeScores[idx]
				if (updatedScore) {
					if (modeScore[0] === uid) {
						modeScores.splice(idx, 1)
						break
					}
				} else if (modeScore[1] > score) {
					modeScores.splice(idx, 0, [ uid, score ])
					gameUsers[topicID][uid] = users[uid]
					updatedScore = true
				}
			}
		} else {
			modeScores.push([ uid, score ])
		}
	},

	// Activity

	addActivity (user, activity) {
		activities.unshift(activity)
		if (activities.length >= 100) {
			activities.pop()
		}
		sendUpdate(user, { activity })
	},

	addReaction (user, activityId, emoji) {
		let activity = null
		for (const checkActivity of activities) {
			if (checkActivity.id === activityId) {
				activity = checkActivity
				break
			}
		}

		if (!activity) {
			return console.log('No activity for reaction', user.id, activityId, emoji)
		}
		const userId = user.id
		const uids = activity.r_uids
		if (!uids) {
			activity.r_uids = [ userId ]
			activity.r_emoji = [ emoji ]
		} else {
			let updated = false
			for (let idx = uids.length - 1; idx >= 0; idx -= 1) {
				if (uids[idx] === userId) {
					activity.r_emoji[idx] = emoji
					updated = true
					break
				}
			}
			if (!updated) {
				activity.r_uids.push(userId)
				activity.r_emoji.push(emoji)
			}
		}
		const sendActivity = {
			id: activityId,
			r_uids: activity.r_uids,
			r_emoji: activity.r_emoji,
		}
		sendUpdate(user, { activity: sendActivity })
	},

	// User

	connectUser (socket, privateUser, gameName) {
		const userID = privateUser.id
		const existingUser = users[userID]
		let user, updateUser
		const topicID = gameName ? namespaceToTopicID[gameName] : null
		if (existingUser) {
			if (existingUser.gameData && existingUser.gameData.id) {
				return false
			}
			existingUser.at = privateUser.at
			if (existingUser.online < 1) {
				existingUser.online = 1
			} else {
				existingUser.online += 1
			}
			updateUser = {
				id: userID,
				online: existingUser.online,
				at: getTimestamp(),
				gameData: {
					topicID: topicID || existingUser.gameData.topicID,
					id: null,
				},
			}
			user = existingUser
		} else {
			user = {
				id: userID,
				name: privateUser.name,
				ccid: privateUser.ccid,
				md5: privateUser.md5,
				at: privateUser.at,
				admin: privateUser.admin,
				created_at: privateUser.created_at,
				online: 1,
				gameData: {
					topicID,
					id: null,
				},
			}
			users[userID] = user
			updateUser = user
		}
		socket.user = user
		socket.emit('local', { id: user.id, name: user.name, email: privateUser.email, ccid: user.ccid, md5: user.md5, admin: user.admin })
		trio.in('home').emit('update action', { user: updateUser })
		return true
	},

	disconnect (socket) {
		const user = socket.user
		if (!user) {
			return
		}
		user.online -= 1
		if (user.online === 0) {
			trio.in('home').emit('update action', { user })
		}
	},

}
