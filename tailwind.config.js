module.exports = {
	theme: {
		colors: require('@ky-is/tailwind-color-palette')('#f83', {ui: true, grayscale: true}),
		extend: {
			inset: {
				full: '100%',
			},
			width: {
				96: '24rem',
			},
			minWidth: theme => theme('width'),
			minHeight: theme => theme('height'),
		},
	},
	variants: {
		appearance: ['responsive'],
		backgroundAttachment: ['responsive'],
		backgroundColor: ['responsive', 'hover', 'focus'],
		backgroundPosition: ['responsive'],
		backgroundRepeat: ['responsive'],
		backgroundSize: ['responsive'],
		borderCollapse: [],
		borderColor: ['responsive', 'hover', 'focus'],
		borderRadius: ['responsive'],
		borderStyle: ['responsive'],
		borderWidth: ['responsive'],
		cursor: ['responsive'],
		display: ['responsive', 'group-hover'],
		flexDirection: ['responsive'],
		flexWrap: ['responsive'],
		alignItems: ['responsive'],
		alignSelf: ['responsive'],
		justifyContent: ['responsive'],
		alignContent: ['responsive'],
		flex: ['responsive'],
		flexGrow: ['responsive'],
		flexShrink: ['responsive'],
		float: ['responsive'],
		fontFamily: ['responsive'],
		fontWeight: ['responsive', 'hover', 'focus'],
		height: ['responsive'],
		lineHeight: ['responsive'],
		listStylePosition: ['responsive'],
		listStyleType: ['responsive'],
		margin: ['responsive'],
		maxHeight: ['responsive'],
		maxWidth: ['responsive'],
		minHeight: ['responsive'],
		minWidth: ['responsive'],
		negativeMargin: ['responsive'],
		objectFit: ['responsive'],
		objectPosition: ['responsive'],
		opacity: ['responsive'],
		outline: ['focus'],
		overflow: ['responsive'],
		padding: ['responsive'],
		pointerEvents: ['responsive'],
		position: ['responsive'],
		inset: ['responsive'],
		resize: ['responsive'],
		boxShadow: ['responsive', 'hover', 'focus'],
		fill: [],
		stroke: [],
		tableLayout: ['responsive'],
		textAlign: ['responsive'],
		textColor: ['responsive', 'hover', 'focus'],
		fontSize: ['responsive'],
		fontStyle: ['responsive'],
		textTransform: ['responsive'],
		textDecoration: ['responsive', 'hover', 'focus'],
		fontSmoothing: ['responsive'],
		letterSpacing: ['responsive'],
		userSelect: ['responsive'],
		verticalAlign: ['responsive'],
		visibility: ['responsive', 'hover', 'group-hover'],
		whitespace: ['responsive'],
		wordBreak: ['responsive'],
		width: ['responsive'],
		zIndex: ['responsive'],
	},
	corePlugins: {
		container: false,
	},
	plugins: [
		require('@ky-is/tailwindcss-plugin-width-height')({ variants: ['responsive'] }),
	],
}
