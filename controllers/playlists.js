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
    console.log('tokeni: ' + decodedToken.id)

    const user = await User.findById(decodedToken.id)
    /*Tarkistus ettei samannimistä playlistiä voida lisätä
    samalle käyttäjälle.*/

    let playlist
    let savedPlaylist
    const playlists = await Playlist.find({ user: decodedToken.id.toString() })
    console.log('playlists.length: ' + playlists.length)
    if (playlists === undefined || playlists.length === 0) {
      console.log('käyttäjällä ei soittolistoja')
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
      console.log('Käyttäjällä on soittolistoja')
      const exists = playlists.find(p => p.title === body.title)
      console.log('exists typeof: ' + typeof(exists))
      if (!exists || exists.length === 0) {
        /*Ei saman nimisiä*/
        console.log('ei saman nimisiä soittolistoja')
        playlist = new Playlist({
          title: body.title,
          user: decodedToken.id
        })
        savedPlaylist = await playlist.save()
        user.playlists = user.playlists.concat(savedPlaylist._id)
        await user.save()
        return response.status(201).json(savedPlaylist)
      }
      console.log('samanniminen soittolista on jo käyttäjällä')
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

    const user = await User.findById(decodedToken.id)

    /*Etsitään id:tä vastaava playlisti.*/
    const playlist = await Playlist.findById(request.params.id)
    /*Tarkistetaan, onko lisättävä linkki jo linkkitietokannassa. Jos on,
    niin se otetaan käsittelyyn.*/
    let link
    const links = await Link.find({ linkId: body.linkId })
    if (links === undefined || links.length === 0) {
      link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId
      })
      const savedLink = await link.save()
      /*Jos linkki oli uusi, niin se ei voi olla käyttäjän playlistillä.*/
      playlist.links = playlist.links.concat(savedLink._id)
      await playlist.save()

      return response.status(201).json(savedLink)
    } else {
      link = links[0]
      console.log('link: ' + link)
      /*Jos linkki oli jo olemassa, se voi olla käyttäjän playlistillä*/
      /*Tarkistetaan että ei ole käyttäjän playlistillä*/
      const exists = playlist.links.find(l => l.toString() === link._id.toString())
      if (!exists) {
        /*Linkki ei ole käyttäjän playlistissä*/
        playlist.links = playlist.links.concat(link._id)
        await playlist.save()
        return response.status(201).json(link)
      } else {
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
