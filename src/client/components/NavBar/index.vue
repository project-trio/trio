<template>
<nav>
	<div class="container flex text-faint">
		<router-link class="brand" :to="{ name: 'Home' }">Trio</router-link>
		<router-link v-if="name" class="user-box flex" :to="{ name: 'User', params: { name } }">
			<span class="text-small">{{ name }}</span>
			<Avatar :size="24" :ccid="ccid" :md5="md5" class="inline" />
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

<style lang="stylus" scoped>
nav
	height 32px
	font-size 20px

.container
	padding 0 8px
	height inherit
	justify-content space-between

.user-box
	height inherit

.brand
	font-weight 900
	letter-spacing 0.7px

.avatar
	margin-left 4px
</style>
