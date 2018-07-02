<template>
<form @submit.prevent="onSubmit">
	<fieldset :disabled="loading">
		<textarea v-model="message" class="big" :placeholder="messagePlaceholder" />
		<button v-if="message" type="submit" class="big">Submit</button>
	</fieldset>
</form>
</template>

<script>

export default {
	data () {
		return {
			message: null,
		}
	},

	computed: {
		loading () {
			return this.$store.state.loading > 0
		},

		messagePlaceholder () {
			const prefix = this.$route.name === 'User' ? 'to' : 'in'
			const target = this.$route.params.name
			return target ? `Message ${prefix} ${target}` : 'Update your status'
		},
	},

	methods: {
		onSubmit() {
		},
	},
}
</script>

<style lang="stylus" scoped>
.multiselect
	width 50%
	max-width 160px
	display inline-block
</style>
