const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const usersRouter = require('./testControllers/users')
const linksRouter = require('./testControllers/links')
const loginRouter = require('./controllers/login')
const playlistsRouter = require('./testControllers/playlists')
const path = require('path')


mongoose.connect(config.mongoUrl)
  .then( () => {
    console.log('connected to database', config.mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })

mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json())
app.use('/api/users', usersRouter)
app.use('/api/links', linksRouter)
app.use('/api/login', loginRouter)
app.use('/api/playlists', playlistsRouter)

app.use(express.static('build'))

/*Tämä jotta kaikki pyynnöt ohjataan ensin index.html ja sitten vasta eteenpäin.*/
app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
 })

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}
