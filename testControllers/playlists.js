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

/*Tämä ok, kunhan tietokanta tyhjennetään.*/
playlistsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    let playlist
    let savedPlaylist
    const playlists = await Playlist.find({ user: decodedToken.id.toString() })
    if (playlists === undefined || playlists.length === 0) {
      /*Käyttäjällä ei ole soittolistoja*/
      playlist = new Playlist({
        title: body.title,
        user: decodedToken.id
      })
      savedPlaylist = await playlist.save()
      user.playlists = user.playlists.concat(savedPlaylist._id)
      await user.save()
      return response.status(201).json(savedPlaylist)
    } else {
      /*Käyttäjällä on soittolistoja, tarkistetaan ettei samannimisiä*/
      const exists = playlists.find(p => p.title === body.title)
      if (!exists || exists.length === 0) {
        /*Ei saman nimisiä*/
        playlist = new Playlist({
          title: body.title,
          user: decodedToken.id
        })
        savedPlaylist = await playlist.save()
        user.playlists = user.playlists.concat(savedPlaylist._id)
        await user.save()
        return response.status(201).json(savedPlaylist)
      }
      return response.status(401).json({ error: 'playlist by that name already exists!' })
    }
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
/*Tämä on kunnossa*/
playlistsRouter.post('/:id', async (request, response) => {
  try {
    const body = request.body
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    /*Etsitään id:tä vastaava playlisti.*/
    const playlist = await Playlist.findById(request.params.id)

    /*VAIHTOEHTO 1: POPULOINTI*/
    if (playlist.links.length === 0) {
      /*Voidaan lisätä suoraan soittolistaan*/
      const link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId
      })
      const savedLink = await link.save()
      playlist.links = playlist.links.concat(savedLink._id)
      await playlist.save()

      return response.status(201).json(savedLink)
    } else {
      const populatePlaylist = await Playlist
        .findById(request.params.id)
        .populate('links', { linkId: 1 })
      const foundLink = populatePlaylist.links
        .find(l => l.linkId === body.linkId)
      if (foundLink === undefined || foundLink === null || foundLink.length === 0) {
        /*Linkki ei ole soittolistalla*/
        const link = new Link({
          title: body.title,
          thumbnail: body.thumbnail,
          linkId: body.linkId
        })
        const savedLink = await link.save()
        playlist.links = playlist.links.concat(savedLink._id)
        await playlist.save()

        return response.status(201).json(savedLink)
      }
    }
    /*Linkki on soittolistalla.*/
    return response.status(500).json({ error: 'link already in playlist' })
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

/*playlistsRouter.delete('/:id', (request, response) => {
  try {
    Playlist.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    response.status(400).send({error: 'malformatted id'})
  }
})*/

playlistsRouter.delete('/all', async (request, response) => {
  await Playlist.remove({})
  response.status(204).end()
})

module.exports = playlistsRouter
