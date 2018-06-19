module.exports = {
	lintOnSave: true,
	productionSourceMap: false,

	devServer: {
		open: true,
		port: 8060,
		proxy: {
			'/api': {
				target: 'http://192.168.0.11:8061',
				changeOrigin: true,
			},
		},
	},

	pages: {
		index: { entry: 'src/client/main.js' },
	},
}
