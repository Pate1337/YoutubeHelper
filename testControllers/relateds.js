const relatedsRouter = require('express').Router()
const Link = require('../models/link')
const User = require('../models/user')
const RelatedLink = require('../models/relatedLink')
const jwt = require('jsonwebtoken')


const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

/*Tää sit lisäämään yks kerrallaan niitä linkkejä!*/
relatedsRouter.post('/', async (request, response) => {
  try {
    console.log('lisätään linkit relatediin')
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body

    const user = await User.findById(decodedToken.id)
    let links = []
    for (let i = 0; i < body.length; i++) {
      let link = body[i]
      let linkToAdd = new Link({
        title: link.title,
        thumbnail: link.thumbnail,
        linkId: link.linkId
      })
      let savedLink = await linkToAdd.save()
      let relatedToAdd = new RelatedLink({
        count: 1,
        link: savedLink._id
      })
      let savedRelated = await relatedToAdd.save()
      links.push({
        _id: savedRelated._id,
        count: 1,
        link: {
          _id: savedLink._id,
          title: savedLink.title,
          thumbnail: savedLink.thumbnail,
          linkId: savedLink.linkId
        }
      })
      user.relatedLinks = user.relatedLinks.concat(savedRelated._id)
      await user.save()
    }
    console.log('Ehdotuksiin Lisätyt linkit: ' + links)
    return response.status(201).json(links)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

/*relatedsRouter.get('/:id', async (request, response) => {
  console.log('userin related')
  try {
    const id = request.params.id
    const user = await User.findById(id.toString())
    console.log('user kun haetaan käyttäjän related: ' + user)
    let links = []
    if (user.relatedLinks.length !== 0) {
      for (let i = 0; i < user.relatedLinks.length; i++) {
        let linkId = user.relatedLinks[i]
        let link = await Link.findById(linkId)
        links.push(link)
      }
      return response.status(201).json(links)
    }
    return response.status(201).json([])
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'No relateds found!' })
  }
})*/

relatedsRouter.delete('/:id', async (request, response) => {
  try {
    console.log('Poistetaan related link käyttäjältä')
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const linkId = request.params.id
    const user = await User.findById(decodedToken.id)
    const removed = await RelatedLink.findOneAndRemove({ link: linkId.toString() })
    console.log('Poistettava relatedLink: ' + removed)
    await Link.findByIdAndRemove(linkId)

    let newRelateds = []
    user.relatedLinks.forEach(l => {
      if (l.toString() !== removed._id.toString()) {
        newRelateds.push(l)
      } else {
        console.log('POISTETTAVA RELATED: ' + l)
      }
    })
    user.relatedLinks = newRelateds
    console.log('relatedLinks nyt: ')
    newRelateds.forEach(l => {
      console.log(l)
    })
    await user.save()
    response.status(204).end()
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = relatedsRouter
