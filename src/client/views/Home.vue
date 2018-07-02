<template>
<div class="home">
	<div v-if="user" class="flex">
		<Avatar :size="48" :ccid="userFilter.ccid" :md5="userFilter.md5" />
		<h1>{{ userFilter.name }}</h1>
	</div>
	<div v-else-if="topic">
		<h1>{{ topic }}</h1>
		<p v-if="topicLink">Play now: <a :href="topicLink" target="_blank">{{ topicLink }}</a></p>
	</div>
	<CreateActivity />
	<ul v-if="activities">
		<li v-for="activity in activities" :key="activity.id">
			<Activity :activity="activity" />
		</li>
	</ul>
</div>
</template>

<script>
import Activity from '@/client/components/Activity'
import CreateActivity from '@/client/components/CreateActivity'
import Avatar from '@/client/components/Avatar'

export default {
	components: {
		Activity,
		Avatar,
		CreateActivity,
	},

	props: {
		user: String,
		topic: String,
	},

	computed: {
		userFilter () {
			const users = this.$store.state.users
			for (const id in users) {
				const user = users[id]
				if (user.name === this.user) {
					return user
				}
			}
		},
		userId () {
			return this.userFilter.id
		},
		topicId () {
			const topics = this.$store.state.topics
			for (const id in topics) {
				if (topics[id] === this.topic) {
					return parseInt(id, 10)
				}
			}
		},
		topicLink () {
			if (this.topic === 'TD') {
				return 'https://td.suzu.online'
			}
			if (this.topic === 'Moba') {
				return 'https://moba.suzu.online'
			}
		},

		activities () {
			const filterUserId = this.user && this.userId
			const filterTopicId = this.topic && this.topicId
			const filterId = filterUserId || filterTopicId
			const filterType = filterUserId ? 'user' : 'topic'
			const activities = this.$store.state.activities
			return !filterId ? activities : activities.filter(activity => {
				if (filterUserId && activity.user_id === filterUserId) {
					return true
				}
				return activity.target_id === filterId && activity.target_type === filterType
			})
		},
	},

	beforeCreate () {
		this.$store.dispatch('JOIN_HOME')
	},
}
</script>

<style lang="stylus" scoped>
li
	margin 48px 0
</style>
