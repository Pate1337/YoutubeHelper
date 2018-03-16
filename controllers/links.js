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
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const body = request.body
    /*Etsitään user jonka token/userId kenttä*/
    /*const user = await User.findById(body.userId)*/
    const user = await User.findById(decodedToken.id)

    /*Pitää vielä varmistaa, ettei linkkiä ole jo tietokannassa.
    Turha lisätä uudestaan samalla id:llä olevaa linkkiä.*/
    const linkExists = await Link.find({ linkId: body.linkId })
    let savedLink = linkExists
    if (!linkExists) {
      const link = new Link({
        title: body.title,
        url: body.url,
        linkId: body.linkId
      })
      savedLink = await link.save()
    }

    /*Oletetaan että annetaan kaikki kentät pyynnössä, eli title ja url.
    Lisäksi koska tokeni ei vielä käytössä, pyynnössä kenttä userId*/

    /*Lisätään userin links kenttään savedLink._id. Siis pelkkä id, populate
    myöhemmin.*/
    user.links = user.links.concat(savedLink._id)
    await user.save()
    /*Tuo ylempi ilmeisesti siis päivittää jo tietokannasa olevan userin.*/

    /*Palautetaan linkki vaikka sitä ei todellisuudessa lisätäkkään uudestaan*/
    response.status(201).json(Link.format(savedLink))
  } catch (exception) {
    console.log('error')
  }
})

linksRouter.get('/', async (request, response) => {
  const links = await Link.find({})
  response.json(links.map(Link.format))
})

module.exports = linksRouter
