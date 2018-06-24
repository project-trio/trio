<template>
<div class="activity-item">
	<Avatar :size="24" :ccid="user.ccid" :md5="user.md5" />
	{{ user }}
	{{ activity }}
</div>
</template>

<script>
import Avatar from '@/client/components/Avatar'

export default {
	components: {
		Avatar,
	},

	props: {
		activity: Object,
	},

	computed: {
		user () {
			return this.$store.state.users[this.activity.user_id]
		},
	},
}
</script>

<style lang="stylus" scoped>
</style>
