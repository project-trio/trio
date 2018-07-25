const dotenv = require('dotenv')

dotenv.config({ path: 'src/server/config/.env' })
dotenv.config({ path: `src/server/config/.env.${process.env.NODE_ENV || 'development'}` })

//EXPRESS

const express = require('express')
const path = require('path')

const app = express()

const server = require('http').createServer(app)

//SOCKET.IO

const io = require('socket.io')(server)

require('./app/trio')(io)
require('./app/td')(io)

//HYDRATE

require.main.require('./helpers/live').init(io)

//APP

app.use(express.static('dist'))

app.get('*', (request, response, _next) => {
	response.sendFile(path.resolve(__dirname, '../../dist/index.html'))
})

//LISTEN

const port = process.env.PORT || 8031
server.listen(port, () => {
	console.log(`Trio running on port ${port}`, '\n')
})
