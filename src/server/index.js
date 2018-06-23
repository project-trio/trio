const CommonConsts = require.main.require('../common/constants')

require('dotenv').config({ path: '.env.server' })

//EXPRESS

const express = require('express')
const path = require('path')

const app = express()
const http = require('http').createServer(app)

//SOCKET.IO

const io = require('socket.io')(http)

require('./app/trio')(io)

//HYDRATE

require.main.require('./helpers/global').init(io)

//APP

app.use(express.static('dist'))

app.get('*', (request, response, _next) => {
	response.sendFile(path.resolve(__dirname, '../../dist/index.html'))
})

//LISTEN

const port = process.env.PORT || CommonConsts.PORT

http.listen(port)

console.log(`Trio running on port ${port}`, '\n')
