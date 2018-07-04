<template>
<div class="activity-item flex show-hover">
	<Avatar :size="16" :ccid="user.ccid" :md5="user.md5" />
	<div class="flex-fill">
		<div class="flex">
			<router-link class="activity-user flex" :to="{ name: 'User', params: { name: fromName } }">{{ fromName }}</router-link>
			&nbsp;
			<div v-if="action" class="flex-fill">
				<div v-if="action === 'create'">
					joined!
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
				<Markdown :raw="activity.body" />
			</div>
			<RelativeTime :at="activity.created_at" class="show-hovered text-small text-faint" />
		</div>
		<div class="activity-actions flex">
			<div v-for="reaction in activity.r_emoji" :key="reaction">{{ reaction }}</div>
			<button @click="onShow('react')" class="show-hovered">{{ show === 'react' ? '⚉' : '⚇' }}</button>
			<button @click="onShow('reply')" class="show-hovered borderless">{{ show === 'reply' ? 'Cancel' : 'Reply' }}</button>
		</div>
		<div v-if="show === 'reply'">
			<textarea v-model="replyMessage" class="big" placeholder="4 - 280 characters" />
			<button @click="onReply" class="big">Send</button>
		</div>
		<div v-else-if="show === 'react'" class="popover show-hovered">
			<div v-for="(emojiRow, idx) in $options.reactionEmoji" :key="idx">
				<button v-for="emoji in emojiRow" @click="onEmoji(emoji)" :key="emoji">{{ emoji }}</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import { REACTION_EMOJI } from '@/common/constants'

import Avatar from '@/client/components/Avatar'
import Markdown from '@/client/components/UI/Markdown'
import RelativeTime from '@/client/components/RelativeTime'

import bridge from '@/client/xjs/bridge'

export default {
	components: {
		Avatar,
		Markdown,
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
			console.log(target && `${target.charAt(0).toUpperCase()}${target.slice(1)}`)
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

.flex
	align-items flex-start

.avatar
	margin-right 2px
	flex-shrink 0

.activity-actions
	margin-top 2px
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
</style>
