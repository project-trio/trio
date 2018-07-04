<template>
<form @submit.prevent="onSubmit">
	<fieldset :disabled="submitting">
		<textarea v-model="message" class="big" :placeholder="messagePlaceholder" />
		<button v-if="message" type="submit" class="big">Submit</button>
	</fieldset>
</form>
</template>

<script>
import bridge from '@/client/xjs/bridge'

export default {
	data () {
		return {
			message: null,
			submitting: false,
		}
	},

	computed: {
		targetName () {
			return this.$route.params.name
		},

		messagePlaceholder () {
			const prefix = this.$route.name === 'User' ? 'to' : 'in'
			const name = this.targetName
			return name ? `Message ${prefix} ${name}` : 'Update your status'
		},
	},

	methods: {
		onSubmit() {
			const name = this.targetName
			let targetId, targetType
			if (name) {
				targetType = this.$route.name.toLowerCase()
				if (targetType === 'user') {
					const users = this.$store.state.users
					for (const uid in users) {
						if (users[uid].name === name) {
							targetId = uid
							break
						}
					}
				} else if (targetType === 'topic') {
					const topics = this.$store.state.topics
					for (const tid in topics) {
						if (topics[tid] === name) {
							targetId = tid
							break
						}
					}
				}
			}
			this.submitting = true
			bridge.emit('submit post', { targetId, targetType, message: this.message }, () => {
				this.message = null
				this.submitting = false
			})
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
