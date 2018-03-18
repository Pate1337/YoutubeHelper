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

/*Tää on nyt ihan katastrofi. Usealla käyttäjällä voi olla sama linkki,
eli sen id tietokannassa on sama. Siitä syystä tää poisto ei nyt suju.*/
linksRouter.delete('/:id', async (request, response) => {
  try {
    const token = getTokenFrom(request)
    /*const token = request.token*/
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    /*Voidaan kaivaa myös hakemalla käyttäjä ensin id:n perusteella
    ja jos linkin id ei ole käyttäjän linkeissä, niin sillon error*/
    const user = await User.findById(decodedToken.id)
    console.log('user: ' + user)
    const userHasLink = user.links
      .filter(l => l.toString() === request.params.id.toString())
    if (userHasLink.length === 0) {
      return response.status(401).json({ error: 'can not remove other users blogs' })
    }

    await Link.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    /*Tänne pomppaa jos ei ole headeria authorization*/
    console.log(exception)
    response.status(400).send({error: 'malformatted id'})
  }
})

module.exports = linksRouter
