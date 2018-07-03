<template>
<div class="home">
	<ActivityList :user="user" :topic="topic" />
</div>
</template>

<script>
import ActivityList from '@/client/components/Activity/List'

export default {
	components: {
		ActivityList,
	},

	props: {
		user: String,
		topic: String,
	},

	beforeCreate () {
		this.$store.dispatch('JOIN_HOME')
	},
}
</script>
