<template>
<form class="text-center" @submit.prevent="onSubmit">
	<p v-if="!signinEmail">Enter your email to begin:</p>
	<p v-else-if="registering">Create an account:</p>
	<p v-else>Enter the passcode sent to your email:</p>
	<fieldset :disabled="loading">
		<input v-if="!signinEmail" v-model="email" type="email" class="input-big" placeholder="example@email.com" autocomplete="on">
		<div v-else-if="registering" class="max-w-full  flex justify-center">
			<Avatar :size="64" :ccid="enableCC ? ccid : null" :md5="md5" class="mr-2" />
			<div>
				<input v-model="name" :class="nameError" type="text" class="input-big" placeholder="Name (3-16 alphanumeric)" autocomplete="off">
				<div v-if="nameError" class="text-sm text-secondary">
					{{ nameError === 'taken' ? 'Sorry, this name has already been registered' : 'Invalid name' }}
				</div>
				<label v-else-if="ccid"><input v-model="enableCC" type="checkbox"> CC user?</label>
			</div>
		</div>
		<input v-else v-model="passcode" type="number" class="input-big" placeholder="123456" autocomplete="off">
		<button type="submit" class="button-big">Submit</button>
	</fieldset>
	<p v-if="!email" class="text-sm text-secondary">Your email is used to authenticate your account, and is never shown publicly, spammed, or made available to third parties.</p>
</form>
</template>

<script>
import { hash } from 'spark-md5'

import Validator from '@/common/validator'

import bridge from '@/client/xjs/bridge'

import Avatar from '@/client/components/Avatar'

export default {
	components: {
		Avatar,
	},

	data () {
		return {
			email: null,
			name: null,
			nameError: null,
			ccid: null,
			enableCC: false,
			passcode: null,
		}
	},

	computed: {
		loading () {
			return this.$store.state.loading > 0
		},

		signinEmail () {
			return this.$store.state.changeEmail
		},
		md5 () {
			return this.signinEmail ? hash(this.signinEmail) : null
		},

		registering () {
			return this.$store.state.registering
		},
	},

	watch: {
		name (name) {
			this.enableCC = false
			if (!name || Validator.name(name.split(' '))) {
				return this.nameError = 'invalid'
			}
			this.nameError = 'loading'
			bridge.emit('check name', name, (response) => {
				if (response.name !== this.name) {
					return
				}
				this.nameError = response.error ? 'taken' : null
				this.ccid = response.ccid
			})
		},
	},

	methods: {
		onSubmit () {
			const key = !this.passcode ? 'email' : 'passcode'
			const value = this[key]
			const error = Validator[key](value)
			if (error) {
				return window.alert(error)
			}
			const ccid = this.enableCC ? this.ccid : null
			const md5 = !this.enableCC ? this.md5 : null
			this.$store.dispatch('SIGNIN', { email: this.email, name: this.name, ccid, md5, passcode: this.passcode })
		},
	},
}
</script>

<style lang="postcss" scoped>
.loading {
	@apply bg-brand-100;
}
.invalid {
	@apply bg-danger-100;
}
.taken {
	@apply bg-danger-300;
}
</style>
