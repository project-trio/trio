<template>
<nav>
	<div class="container text-faint">
		<router-link class="brand" :to="{ name: 'Home' }">Trio</router-link>
		<router-link class="user-box" :to="{ query: { q: `@${name}` } }">
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
	display flex
	justify-content space-between
	align-items center

.brand
	font-weight 900

.user-box
	height inherit
	display flex
	align-items center

.avatar
	margin-left 4px
</style>
