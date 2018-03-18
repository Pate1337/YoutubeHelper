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

/*Tiettyyn playlistiin uuden linkin lisääminen*/
playlistsRouter.post('/:id', async (request, response) => {
  try {
    const body = request.body
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    /*Etsitään id:tä vastaava playlisti.*/
    const playlist = await Playlist.findById(request.params.id)
    /*Tarkistetaan, onko lisättävä linkki jo linkkitietokannassa. Jos on,
    niin se otetaan käsittelyyn.*/
    let link
    const links = await Link.find({ linkId: body.linkId })
    if (links.length === 0) {
      link = new Link({
        title: body.title,
        url: body.url,
        linkId: body.linkId
      })
      const savedLink = await link.save()
      /*Jos linkki oli uusi, niin se ei voi olla käyttäjän playlistillä.*/
      playlist.links = playlist.links.concat(savedLink._id)
      await playlist.save()
      /*En ole varma, pitääkö vielä concatata userin playlistiin!!!
      Luulis et ei, koska userilla on playlist jolla on id. Ja siihen
      playlistiin juuri lisättiin tuo uusi linkki.*/
      return response.status(201).json(Link.format(savedLink))
    } else {
      link = links[0]
      /*Jos linkki oli jo olemassa, se voi olla käyttäjän playlistillä*/
      /*Tarkistetaan että ei ole käyttäjän playlistillä*/
      const exists = playlist.links.find(l => l.toString() === link._id.toString())
      if (exists.length === 0) {
        console.log('linkki ei ole käyttäjän playlistissä')
        /*Linkki ei ole käyttäjän playlistissä*/
        playlist.links = playlist.links.concat(link._id)
        await playlist.save()
        return response.status(201).json(Link.format(link))
      } else {
        console.log('linkki on käyttäjän playlistissä')
        /*Linkki on käyttäjän playlistissä*/
        return response.status(500).json({ error: 'link already in playlist' })
      }
    }
    console.log('Vituiks meni')
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
