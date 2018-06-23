<template>
<div class="activity-item">
	{{ user }}
	{{ activity }}
</div>
</template>

<script>
export default {
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

<style lang="stylus">
</style>
