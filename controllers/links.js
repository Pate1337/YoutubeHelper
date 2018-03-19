const linksRouter = require('express').Router()
const Link = require('../models/link')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

/*Tämä on myös nyt ok. */
linksRouter.post('/favourites', async (request, response) => {
  console.log('Ollaan /favouritesissa')
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log('tokeni: ' + decodedToken.id)
    const body = request.body
    /*Etsitään user jonka token kenttä*/
    const user = await User.findById(decodedToken.id)
    console.log('user: ' + user)
    /*Pitää vielä varmistaa, ettei linkkiä ole jo tietokannassa.
    Turha lisätä uudestaan samalla id:llä olevaa linkkiä.*/
    const links = await Link.find({ linkId: body.linkId })
    let link
    if (links === undefined || links.length === 0) {
      link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId
      })
      const savedLink = await link.save()
      /*Jos linkki oli uusi, niin se ei voi olla käyttäjän suosikeissa.*/
      user.links = user.links.concat(savedLink._id)
      await user.save()

      return response.status(201).json(Link.format(savedLink))
    } else {
      link = links[0]
      /*Jos linkki oli jo olemassa, se voi olla käyttäjän suosikeissa*/
      /*Tarkistetaan että ei ole käyttäjän suosikeissa*/
      const exists = user.links.find(l => l.toString() === link._id.toString())
      if (!exists) {
        /*Linkki ei ole käyttäjän suosikeissa*/
        user.links = user.links.concat(link._id)
        await user.save()
        return response.status(201).json(Link.format(link))
      } else {
        /*Linkki on käyttäjän suosikeissa*/
        return response.status(500).json({ error: 'link already in favourites' })
      }
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

linksRouter.get('/', async (request, response) => {
  const links = await Link.find({})
  response.json(links.map(Link.format))
})

/*Poistaessa linkin, se linkki jää kuleksimaan käyttäjien listaukseen
get api/users soittolistoihin ja suosikeihin.
Joten myös sieltä ne pitää poistaa.*/
linksRouter.delete('/:id', async (request, response) => {
  try {
    await Link.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    response.status(400).send({error: 'malformatted id'})
  }
  /*try {
    const token = getTokenFrom(request)*()
    /*const token = request.token*/
    /*const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }*/
    /*Voidaan kaivaa myös hakemalla käyttäjä ensin id:n perusteella
    ja jos linkin id ei ole käyttäjän linkeissä, niin sillon error*/
    /*const user = await User.findById(decodedToken.id)
    console.log('user: ' + user)
    const userHasLink = user.links
      .filter(l => l.toString() === request.params.id.toString())
    if (userHasLink.length === 0) {
      return response.status(401).json({ error: 'can not remove other users blogs' })
    }

    await Link.findByIdAndRemove(request.params.id)
    response.status(204).end()*/
  /*} catch (exception) {*/
    /*Tänne pomppaa jos ei ole headeria authorization*/
    /*console.log(exception)
    response.status(400).send({error: 'malformatted id'})
  }*/
})

module.exports = linksRouter
