<template>
<div id="app">
	<template v-if="hasSignin">
		<NavBar />
		<GameBar v-if="$route.name === 'Home'" />
	</template>
	<div v-if="reconnectAttempts !== null" class="fixed inset-0 bg-white opacity-75  pointer-events-none  flex justify-center items-center ">
		<h1 class="text-center text-3xl font-black text-danger-500">{{ reconnectAttempts }} attempts to reconnect</h1>
	</div>
	<div class="container">
		<router-view class="content" />
	</div>
</div>
</template>

<script>
import NavBar from '@/client/components/NavBar'
import GameBar from '@/client/components/NavBar/Game'

export default {
	components: {
		GameBar,
		NavBar,
	},

	countdownInterval: null,

	computed: {
		hasSignin () {
			return this.$store.state.sessionToken
		},

		reconnectAttempts () {
			return this.$store.state.reconnectAttempts
		},
	},

	created () {
		if (document.hasFocus()) {
			this.setCountdown(false)
		}
		window.addEventListener('blur', this.cancelCountdown, true)
		window.addEventListener('focus', this.setCountdown, true)
	},

	beforeUnmount () {
		window.removeEventListener('blur', this.cancelCountdown, true)
		window.removeEventListener('focus', this.setCountdown, true)
	},

	methods: {
		cancelCountdown () {
			if (this.$options.countdownInterval) {
				window.clearInterval(this.$options.countdownInterval)
				this.$options.countdownInterval = null
			}
		},

		setCountdown (event) {
			if (this.$options.countdownInterval) {
				return
			}
			this.$options.countdownInterval = window.setInterval(this.passiveUpdate, 60 * 1000)
			if (event) {
				this.passiveUpdate()
			}
		},

		passiveUpdate () {
			this.$store.commit('NOW')
		},
	},
}
</script>

<style lang="postcss">
@import '../assets/styles/tailwind.postcss';

#app {
	@apply text-gray-900;
}

a, button {
	transition-duration: 300ms;
}
button {
	transition-property: color background;
}
a {
	transition-property: color;
	@apply no-underline;
	&:not(.router-link-exact-active) {
		@apply text-brand-500;
		&:hover {
			@apply text-brand-600;
			&:active {
				@apply text-brand-400;
			}
		}
	}
}
.router-link-exact-active {
	@apply cursor-default;
}

.container {
	@apply max-w-xl m-auto px-2;
}

.text-secondary {
	@apply text-gray-600;
}

/* INPUT */

.button-big {
	@apply block mx-auto my-2 px-4 min-w-48 h-12 rounded-lg text-white text-2xl font-medium bg-brand-400;
}

.input-big {
	@apply block mx-auto my-2 w-96 max-w-full h-12 border rounded-lg text-xl font-light text-center;
}

.textarea-big {
	@apply block w-full min-h-8 max-h-48 px-2 py-px border rounded-lg;
}
</style>
