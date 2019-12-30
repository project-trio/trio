<template>
<nav>
	<div class="container  h-10 text-secondary  flex justify-between items-center">
		<router-link :to="{ name: 'Home' }" class="text-xl font-black tracking-wide">Trio</router-link>
		<router-link v-if="name" :to="{ name: 'User', params: { name } }" class="flex items-center">
			<span class="text-sm">{{ name }}</span>
			<Avatar :size="24" :ccid="ccid" :md5="md5" class="ml-1" />
		</router-link>
	</div>
</nav>
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
