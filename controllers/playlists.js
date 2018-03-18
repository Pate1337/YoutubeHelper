const playlistsRouter = require('express').Router()
const Link = require('../models/link')
const Playlist = require('../models/playlist')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

playlistsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log('tokeni: ' + decodedToken.id)

    const user = await User.findById(decodedToken.id)
    /*Tarkistus ettei samannimistä playlistiä voida lisätä
    samalle käyttäjälle.*/
    const exists = user.playlists.filter(p => p.title === body.title)
    console.log('exists.length playlist: ' + exists.length)
    if (exists.length !== 0) {
      return response.status(401).json({ error: 'playlist by that name already exists!' })
    }

    const playlist = new Playlist({
      title: body.title
    })
    const savedPlaylist = await playlist.save()

    user.playlists = user.playlists.concat(savedPlaylist._id)
    await user.save()

    response.status(201).json(Playlist.format(savedPlaylist))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

playlistsRouter.get('/', async (request, response) => {
  const playlists = await Playlist.find({})
  response.json(playlists.map(Playlist.format))
})

module.exports = playlistsRouter
