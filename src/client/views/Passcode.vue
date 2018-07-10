<template>
<div>{{ loading ? 'Loading...' : 'Sorry, unable to authenticate your account. Please try again.' }}</div>
</template>

<script>
export default {
	props: {
		email: String,
		passcode: String,
	},

	computed: {
		loading () {
			return this.$store.state.loading
		},
	},

	created () {
		this.$store.dispatch('SIGNIN', { email: this.email, passcode: this.passcode })
	},
}
</script>
