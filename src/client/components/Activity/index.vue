<template>
<div class="py-4 whitespace-pre  flex items-start group">
	<Avatar :size="20" :ccid="user.ccid" :md5="user.md5" class="mt-1 mr-1" />
	<div class="flex-grow">
		<div class="flex items-start">
			<router-link :to="{ name: 'User', params: { name: fromName } }" class="flex">{{ fromName }}</router-link>
			<span v-if="action" class="flex-grow">
				<span v-if="action === 'create'">
					joined {{ new Date(activity.created_at * 1000).toLocaleDateString() }}!
				</span>
				<span v-else-if="action === 'highscore'">
					highscored
					<router-link :to="{ name: 'Topic', params: { name: targetTopic } }">{{ targetTopic }}</router-link>
					{{ highscoreDescription }}!
				</span>
			</span>
			<span v-else>
				<span v-if="headingName" class="text-secondary">
					{{ targetAsUser ? 'to' : 'in' }}
					<span v-if="targetAsUser && headingName === fromName">self</span>
					<router-link v-else :to="{ name: targetRoute, params: { name: headingName } }">{{ headingName }}</router-link>:
					</span>
					<span v-else>: </span>
				<MarkdownPoi :raw="activity.body" :tag="headingName ? 'div' : 'span'" :inline="!headingName" class="whitespace-pre-wrap" />
			</span>
		</div>
		<div class="mt-px  flex justify-between">
			<div class="mr-1  flex">
				<div v-for="reaction in activity.r_emoji" :key="reaction">{{ reaction }}</div>
				<span class="invisible group-hover:visible">
					<button class="activity-button  text-lg leading-none" @click="onShow('react')">{{ show === 'react' ? '⚉' : '⚇' }}</button>
					<button class="activity-button  text-sm" @click="onShow('reply')">{{ show === 'reply' ? 'Cancel' : 'Reply' }}</button>
				</span>
			</div>
			<RelativeTime :at="activity.created_at" class="text-sm text-secondary" />
		</div>
		<div v-if="show === 'reply'" class="mt-1">
			<textarea v-model="replyMessage" placeholder="4–280 characters" class="textarea-big" /> <!-- TODO v-focus -->
			<button class="button-big" @click="onReply">Send</button>
		</div>
		<div v-else-if="show === 'react'" class="invisible group-hover:visible absolute bg-white pt-1 rounded shadow">
			<div v-for="(emojiRow, idx) in $options.reactionEmoji" :key="idx">
				<button v-for="emoji in emojiRow" :key="emoji" class="px-1 pb-1" @click="onEmoji(emoji)">{{ emoji }}</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import MarkdownPoi from '@ky-is/vue-markdown-poi'

import { REACTION_EMOJI } from '@/common/constants'

import Avatar from '@/client/components/Avatar'
import RelativeTime from '@/client/components/RelativeTime'

import bridge from '@/client/xjs/bridge'

export default {
	components: {
		Avatar,
		MarkdownPoi,
		RelativeTime,
	},

	reactionEmoji: REACTION_EMOJI,

	props: {
		activity: Object,
		asUser: Number,
		asTopic: Number,
	},

	data () {
		return {
			show: null,
			replyMessage: null,
		}
	},

	computed: {
		user () {
			return this.$store.state.users[this.activity.user_id]
		},

		targetRoute () {
			const target = this.activity.target_type
			return target && `${target.charAt(0).toUpperCase()}${target.slice(1)}`
		},
		targetAsUser () {
			return this.targetRoute === 'User'
		},

		headingName () {
			if (this.targetRoute) {
				if (this.targetAsUser) {
					if (this.asUser !== this.activity.target_id) {
						return this.targetUser && this.targetUser.name
					}
				} else {
					if (this.asTopic !== this.activity.target_id) {
						return this.targetTopic
					}
				}
			}
			return null
		},

		targetUser () {
			return this.$store.state.users[this.activity.target_id]
		},
		targetTopic () {
			return this.$store.state.topics[this.activity.target_id]
		},

		highscoreDescription () {
			const split = this.activity.body.split(' ')
			return split.join(' mode in ')
		},

		fromName () {
			return this.user.name
		},

		action () {
			return this.activity.action
		},
	},

	methods: {
		onShow (name) {
			this.show = this.show !== name ? name : null
		},

		onEmoji (emoji) {
			bridge.emit('activity react', { id: this.activity.id, emoji })
			this.show = null
		},

		onReply () {
			const message = this.replyMessage
			if (message.length <= 4) {
				return console.log('Message too short')
			}
			bridge.emit('activity reply', { id: this.activity.id, message })
		},
	},
}
</script>

<style lang="postcss" scoped>
.activity-button {
	@apply h-6 min-w-6 mr-1 px-1 border rounded bg-transparent align-top;
	&:hover {
		@apply bg-brand-100 border-transparent text-brand-700;
	}
}
</style>
