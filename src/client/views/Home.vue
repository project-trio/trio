<template>
<div class="home">
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

export default {
	components: {
		Activity,
		CreateActivity,
	},

	computed: {
		activities () {
			return this.$store.state.activities
		},
	},

	beforeCreate () {
		this.$store.dispatch('JOIN_HOME')
	},
}
</script>
