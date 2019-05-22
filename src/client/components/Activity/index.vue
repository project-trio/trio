<template>
<div class="activity-item flex flex-top show-hover">
	<Avatar :size="16" :ccid="user.ccid" :md5="user.md5" />
	<div class="flex-fill">
		<div class="flex flex-top">
			<router-link :to="{ name: 'User', params: { name: fromName } }" class="activity-user flex">
				{{ fromName }}
			</router-link>
			&nbsp;
			<div v-if="action" class="flex-fill">
				<div v-if="action === 'create'">
					joined {{ new Date(activity.created_at * 1000).toLocaleDateString() }}!
				</div>
				<div v-else-if="action === 'highscore'">
					highscored
					<router-link :to="{ name: 'Topic', params: { name: targetTopic } }">{{ targetTopic }}</router-link>
					{{ highscoreDescription }}!
				</div>
			</div>
			<div v-else class="flex-fill">
				<span v-if="headingName" class="text-faint">
					{{ targetAsUser ? 'to' : 'in' }}
					<span v-if="targetAsUser && headingName === fromName">self</span>
					<router-link v-else :to="{ name: targetRoute, params: { name: headingName } }">{{ headingName }}</router-link>:
				</span>
				<MarkdownPoi :raw="activity.body" />
			</div>
		</div>
		<div class="activity-actions flex">
			<div class="flex">
				<div v-for="reaction in activity.r_emoji" :key="reaction">{{ reaction }}</div>
				<button class="show-hovered" @click="onShow('react')">{{ show === 'react' ? '⚉' : '⚇' }}</button>
				<button class="show-hovered borderless" @click="onShow('reply')">{{ show === 'reply' ? 'Cancel' : 'Reply' }}</button>
			</div>
			<RelativeTime :at="activity.created_at" class="show-hovered text-small text-faint" />
		</div>
		<div v-if="show === 'reply'">
			<textarea v-model="replyMessage" class="big" placeholder="4–280 characters" />
			<button class="big" @click="onReply">Send</button>
		</div>
		<div v-else-if="show === 'react'" class="popover show-hovered">
			<div v-for="(emojiRow, idx) in $options.reactionEmoji" :key="idx">
				<button v-for="emoji in emojiRow" :key="emoji" @click="onEmoji(emoji)">{{ emoji }}</button>
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

<style lang="stylus" scoped>
.activity-item
	padding 16px 0

.flex-top
	align-items flex-start

.avatar
	margin-right 2px
	flex-shrink 0

.activity-actions
	margin-top 2px
	justify-content space-between
	& > *
		margin-right 4px
	& button
		height 24px
		background none
		border 1px solid #d
		border-radius 4px

.flex-fill
	flex-grow 1

.popover
	position absolute
	background #f
	box-shadow 0 1.5px 2px #a
	border-radius 2px
	padding-top 4px
	& button
		border none
		background none
		font-size 24px

.markdown-poi
	margin -12px 0
</style>
