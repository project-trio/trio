<template>
<form @submit.prevent="onSubmit" class="text-center">
	<input v-model="email" type="email" placeholder="example@email.com" class="big">
	<button type="submit" class="big">Submit</button>
</form>
</template>

<script>
export default {
	data () {
		return {
			email: null,
		}
	},

	methods: {
		onSubmit() {
			if (!this.email || this.email.length < 6) {
				return window.alert('Please enter a valid email')
			}
		},
	},
}
</script>
