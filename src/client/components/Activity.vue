<template>
<div class="activity-item">
	<div class="flex">
		<router-link class="flex" :to="{ name: 'User', params: { name } }">
			<Avatar :size="16" :ccid="user.ccid" :md5="user.md5" />
			<div class="">{{ name }}</div>
		</router-link>
		&nbsp;
		<div v-if="action">
			<div v-if="action === 'create'">
				joined!
			</div>
		</div>
		<div v-else>
			{{ action.body }}
		</div>
		&nbsp;
		<RelativeTime :at="activity.created_at" class="text-small text-faint" />
	</div>
</div>
</template>

<script>
import Avatar from '@/client/components/Avatar'
import RelativeTime from '@/client/components/RelativeTime'

export default {
	components: {
		Avatar,
		RelativeTime,
	},

	props: {
		activity: Object,
	},

	computed: {
		user () {
			return this.$store.state.users[this.activity.user_id]
		},

		topic () {
			return this.$store.state.topics[this.activity.target_id]
		},

		name () {
			return this.user.name
		},

		action () {
			return this.activity.action
		},
	},
}
</script>

<style lang="stylus" scoped>
.avatar
	margin-right 2px
</style>
