module.exports = {
	outputDir: '~$dist',
	productionSourceMap: false,

	devServer: {
		open: true,
		port: 8030,
		proxy: {
			'/socket.io': {
				target: 'http://localhost:8031',
				changeOrigin: true,
			},
		},
	},

	pages: {
		index: { entry: 'src/client/app/main.js' },
		admin: { entry: 'src/client/admin/main.js' },
	},

	chainWebpack (config) {
		config.optimization.minimizer('terser').tap((args) => {
			args[0].terserOptions.compress.drop_console = true
			return args
		})
	},
}
