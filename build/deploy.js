const fs = require('fs-extra')

const DEPLOY_PATH = '../trio-deploy/'

function copy (name) {
	fs.copySync(name, DEPLOY_PATH + name)
}

function move (name) {
	fs.moveSync(name, DEPLOY_PATH + name, { overwrite: true })
}

move('dist')
copy('package.json')
copy('src/common')
copy('src/server')
