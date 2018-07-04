<template>
<div v-html="markdown" class="ui-markdown" />
</template>

<script>
const REGEX_ITALIC = /(^|\s|\*|~)(?:\/)(.+?)(?:\/)/g
const REGEX_STRONG = /(^|\s|<em>|~)(?:\*)(.+?)(?:\*)/g
const REGEX_STRIKETHROUGH = /(^|\s|<strong>|<em>)(?:~)(.+?)(?:~)/g

const REGEX_LINK = /(^|\s)((?:(?:http(?:s|):\/\/|www\.))\S+\.\S{2,})($|\s)/g
const REGEX_MULTI_WHITESPACE = /\n\s*\n/g

const ESCAPE_ENTITIES = {
	'&': '&amp;',
	'<': '&lt;',
	'"': '&quot;',
	"'": '&#39;',
	'`': '&#x60;',
}
const REGEX_ESCAPE = new RegExp(`[${Object.keys(ESCAPE_ENTITIES).join('')}]`, 'g')

function closeInside (lines, idx, inside) {
	let closeTag
	if (inside === '>') {
		closeTag = 'blockquote'
	} else if (inside === '-') {
		closeTag = 'ul'
	}
	const previousLine = lines[idx - 1]
	lines[idx - 1] = `${previousLine}</${closeTag}>`
}

// Export

export default {
	props: {
		raw: String,
		inline: Boolean,
	},

	computed: {
		markdown () {
			let string = this.raw
			if (!string) {
				return null
			}

			// Escape HTML
			string = string.replace(REGEX_ESCAPE, s => ESCAPE_ENTITIES[s])

			// Italics
			string = string.replace(REGEX_ITALIC, '$1<em>$2</em>')

			// Bold
			string = string.replace(REGEX_STRONG, '$1<strong>$2</strong>')

			// Strikethrough
			string = string.replace(REGEX_STRIKETHROUGH, '$1<s>$2</s>')

			if (this.inline) {
				return string
			}

			// Linkify
			string = string.replace(REGEX_LINK, (all, before, url, after) => {
				const href = url.substring(0, 4) !== 'http' ? `http://${url}` : url
				return `${before}<a href="${href}" target="_blank" rel="noopener">${url}</a>${after}`
			})

			// Paragraphs, blockquotes, lists
			const blocks = string.split(REGEX_MULTI_WHITESPACE)
			for (const blockIndex in blocks) {
				const block = blocks[blockIndex]
				const lines = block.split('\n')
				let inside = null
				let idx = 0
				const lastIndex = lines.length - 1
				for (const line of lines) {
					const firstCharacter = line[0]
					const secondCharacter = line[1]
					const withSpace = !secondCharacter || secondCharacter === ' '
					if (inside) {
						if (!withSpace || firstCharacter !== inside) {
							closeInside(lines, idx, inside)
							inside = null
						}
					}
					if (withSpace) {
						if (firstCharacter === '>') {
							let prepending = ''
							if (inside !== firstCharacter) {
								inside = firstCharacter
								prepending = '<blockquote>'
							}
							lines[idx] = `${prepending}${line.substring(2)}`
						} else if (firstCharacter === '-') {
							let prepending = ''
							if (inside !== firstCharacter) {
								inside = firstCharacter
								prepending = '<ul>'
							}
							lines[idx] = `${prepending}<li>${line.substring(2)}</li>`
						}
					}
					if (inside !== '-' && idx < lastIndex) {
						lines[idx] = `${lines[idx]}<br>`
					}
					idx += 1
				}
				if (inside) {
					closeInside(lines, idx, inside)
				}
				blocks[blockIndex] = lines.join('')
			}
			return blocks.map(b => `<p>${b}</p>`).join('')
		},
	},
}
</script>
