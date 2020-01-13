<template>
<div class="activity-list">
	<div class="mb-2">
		<div v-if="user" class="flex">
			<Avatar :size="48" :ccid="currentUser && currentUser.ccid" :md5="currentUser && currentUser.md5" />
			<h1 class="ml-1 text-xl">{{ !currentUser ? '[ unknown ]' : currentUser.name }}</h1>
		</div>
		<template v-else-if="topicName">
			<TopicHero v-if="topic" :topic="topic" />
			<div v-else>
				<h1>{{ topicName }}</h1>
			</div>
		</template>
	</div>
	<CreateActivity />
	<ul v-if="activities">
		<li v-for="activity in activities" :key="activity.id">
			<Activity :activity="activity" :asUser="userId" :asTopic="topicId" />
		</li>
	</ul>
</div>
</template>

<script>
import { TOPIC_DATA } from '@/common/constants'

import Activity from '@/client/components/Activity'
import CreateActivity from '@/client/components/CreateActivity'
import Avatar from '@/client/components/Avatar'
import TopicHero from '@/client/components/Topic/Hero'

export default {
	components: {
		Activity,
		Avatar,
		CreateActivity,
		TopicHero,
	},

	props: {
		user: String,
		topicName: String,
	},

	computed: {
		currentUser () {
			const users = this.$store.state.users
			for (const id in users) {
				const user = users[id]
				if (user.name === this.user) {
					return user
				}
			}
			return null
		},
		userId () {
			return this.user && this.currentUser && this.currentUser.id
		},

		topic () {
			return TOPIC_DATA[this.topicName]
		},

		topicId () {
			const topicName = this.topicName
			if (!topicName) {
				return null
			}
			const topics = this.$store.state.topics
			for (const id in topics) {
				if (topics[id] === topicName) {
					return parseInt(id, 10)
				}
			}
			return null
		},
		topicLink () {
			if (this.topicName === 'TD') {
				return 'https://ttd.netlify.com'
			}
			if (this.topicName === 'Moba') {
				return 'https://moba.netlify.com'
			}
			return console.log('UNKNOWN TOPIC', this.topicName)
		},

		activities () {
			const filterUserId = this.user && this.userId
			const filterTopicId = this.topicName && this.topicId
			const filterId = filterUserId || filterTopicId
			const activities = this.$store.state.activities
			if (!filterId) {
				return activities
			}
			const filterType = filterUserId ? 'user' : 'topic'
			return activities.filter(activity => {
				if (filterUserId && activity.user_id === filterUserId) {
					return true
				}
				return activity.target_id === filterId && activity.target_type === filterType
			})
		},
	},
}
</script>
