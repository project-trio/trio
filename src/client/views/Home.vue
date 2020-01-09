<template>
<div>
	<ActivityList :user="user" :topicName="topicName" />
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
		topicName: String,
	},

	beforeCreate () {
		this.$store.dispatch('JOIN_HOME')
	},
}
</script>
