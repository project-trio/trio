<template>
<form @submit.prevent="onSubmit" class="text-center">
	<p v-if="!signinEmail">Enter your email to begin</p>
	<p v-else>Enter the passcode sent to your email</p>
	<fieldset :disabled="loading">
		<input v-if="!signinEmail" v-model="email" type="email" class="big" placeholder="example@email.com" autocomplete="on">
		<input v-else v-model="passcode" type="number" class="big" placeholder="123456" autocomplete="off">
		<button type="submit" class="big">Submit</button>
	</fieldset>
	<p v-if="!email" class="text-small text-faint">Your email is used to authenticate your account, and is never shown publicly, spammed, or made available to a third party.</p>
</form>
</template>

<script>
import Validator from '@/common/validator'

export default {
	data () {
		return {
			email: null,
			passcode: null,
		}
	},

	computed: {
		loading () {
			return this.$store.state.loading > 0
		},

		signinEmail () {
			return this.$store.state.email
		},
	},

	methods: {
		onSubmit() {
			const asEmail = !this.signinEmail
			const key = asEmail ? 'email' : 'passcode'
			const value = this[key]
			const error = Validator[key](value)
			if (error) {
				return window.alert(error)
			}
			this.$store.dispatch('SIGNIN', { email: this.email, passcode: this.passcode })
		},
	},
}
</script>
