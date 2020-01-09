<template>
<header>
	<nav class="container  h-12 text-secondary  flex justify-between items-center">
		<router-link :to="{ name: 'Home' }" class="logo-link"><img src="/icon.png" class="logo">Trio</router-link>
		<router-link v-if="name" :to="{ name: 'User', params: { name } }" class="flex items-center">
			<span>{{ name }}</span>
			<Avatar :size="26" :ccid="ccid" :md5="md5" class="ml-1" />
		</router-link>
	</nav>
</header>
</template>

<script>
import Avatar from '@/client/components/Avatar'

export default {
	components: {
		Avatar,
	},

	computed: {
		name () {
			return this.$store.state.local.name
		},

		ccid () {
			return this.$store.state.local.ccid
		},

		md5 () {
			return this.$store.state.local.md5
		},
	},
}
</script>

<style lang="postcss" scoped>
.logo {
	@apply inline wh-8 pr-1;
	transition-property: transform;
	transition-duration: 300ms;
}

.logo-link {
	@apply text-xl font-black tracking-wide;
	&:hover {
		& .logo {
			transform: rotate(30deg);
		}
		&:not(.router-link-exact-active):active .logo {
			transform: rotate(90deg);
		}
	}
}
</style>
