<template>
<form @submit.prevent="onSubmit">
	<fieldset :disabled="loading">
		<Multiselect v-model="topicSelected" :options="topicsAvailable" @tag="onTagTopic" placeholder="Topic" taggable selectLabel="⏎" deselectLabel="⏎" />
		<Multiselect v-model="userSelected" :options="usersAvailable" placeholder="User" selectLabel="⏎" deselectLabel="⏎" />
		<textarea v-model="message" class="big" :placeholder="messagePlaceholder" />
		<button v-if="message" type="submit" class="big">Submit</button>
	</fieldset>
</form>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
	components: {
		Multiselect,
	},

	data () {
		return {
			message: null,

			topicsAvailable: [ 'Following' ],
			topicSelected: null,
			usersAvailable: [ 'Friends' ],
			userSelected: null,
		}
	},

	computed: {
		loading () {
			return this.$store.state.loading > 0
		},

		messagePlaceholder () {
			const target = this.userSelected || this.topicSelected
			return target ? `Message ${target}` : 'Update your status'
		},
	},

	methods: {
		onTagTopic (tag) {
			this.topicsAvailable.push(tag)
			this.topicSelected = tag
		},

		onSubmit() {
		},
	},
}
</script>

<style lang="stylus">
.multiselect
	width 50%
	max-width 160px
	display inline-block !important
</style>
