/*Tänne tulis sit ainaki se .put millä voidaan asettaa tokenin
perusteella käyttäjälle linkki.*/
const linksRouter = require('express').Router()
const Link = require('../models/link')
const User = require('../models/user')

linksRouter.post('/', async (request, response) => {
  /*Ilman tokenia vielä toistaseks. Haluun vaan kokeilla toimiiko tuo
  populate.*/
  try {
    const body = request.body
    /*Oletetaan että annetaan kaikki kentät pyynnössä, eli title ja url.
    Lisäksi koska tokeni ei vielä käytössä, pyynnössä kenttä userId*/
    const link = new Link({
      title: body.title,
      url: body.url
    })
    const savedLink = await link.save()

    /*Etsitään user jonka token/userId kenttä*/
    const user = await User.findById(body.userId)

    /*Ja lisätään userin links kenttään savedLink._id. Siis pelkkä id, populate
    myöhemmin.*/
    user.links = user.links.concat(savedLink._id)
    await user.save()
    /*Tuo ylempi ilmeisesti siis päivittää jo tietokannasa olevan userin.*/

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
