/*Tänne tulis sit ainaki se .put millä voidaan asettaa tokenin
perusteella käyttäjälle linkki.*/
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

linksRouter.post('/favourites', async (request, response) => {
  /*Ilman tokenia vielä toistaseks. Haluun vaan kokeilla toimiiko tuo
  populate.*/
  console.log('Ollaan /favouritesissa')
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log('tokeni: ' + decodedToken.id)
    const body = request.body
    /*Etsitään user jonka token/userId kenttä*/
    /*const user = await User.findById(body.userId)*/
    const user = await User.findById(decodedToken.id)
    console.log('user: ' + user)
    /*Pitää vielä varmistaa, ettei linkkiä ole jo tietokannassa.
    Turha lisätä uudestaan samalla id:llä olevaa linkkiä.*/
    /*Tässä kusee koska noille aiemmille linkeille ei ole määritelty linkId:tä*/
    const links = await Link.find({})
    console.log('links: ' + links)
    let linkExists = []
    if (links.length === 0) {
      console.log('links === 0')
      linkExists = []
    } else {
      linkExists = await Link.find({ linkId: body.linkId })
      console.log('body.linkId: ' + body.linkId)
    }
    let savedLink
    if (linkExists.length === 0) {
      const link = new Link({
        title: body.title,
        url: body.url,
        linkId: body.linkId
      })
      console.log('link: ' + link)
      savedLink = await link.save()
    } else {
      savedLink = linkExists[0]
    }
    console.log('savedLink: ' + savedLink)
    console.log('savedLink._id: ' + savedLink._id)
    console.log('savedLink.id: ' + savedLink.id)
    /*Lisätään userin links kenttään savedLink._id. Siis pelkkä id, populate
    myöhemmin.*/
    user.links = user.links.concat(savedLink._id)
    await user.save()
    /*Tuo ylempi ilmeisesti siis päivittää jo tietokannasa olevan userin.*/
    /*Palautetaan linkki vaikka uutta ei lisättykkään*/
    response.status(201).json(Link.format(savedLink))
    /*Oletetaan että annetaan kaikki kentät pyynnössä, eli title ja url.*/
  } catch (exception) {
    console.log('error')
  }
})

linksRouter.get('/', async (request, response) => {
  const links = await Link.find({})
  response.json(links.map(Link.format))
})

module.exports = linksRouter
