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
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body
    const user = await User.findById(decodedToken.id)

    /*VAIHTOEHTO 1: POPULOINTI*/
    if (user.links.length === 0) {
      const link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId
      })
      const savedLink = await link.save()
      user.links = user.links.concat(savedLink._id)
      await user.save()

      return response.status(201).json(savedLink)
    } else {
      const populateUser = await User
        .findById(decodedToken.id)
        .populate('links', { linkId: 1 })
      const foundLink = populateUser.links.find(l =>
        l.linkId === body.linkId)

      if (foundLink === undefined || foundLink === null || foundLink.length === 0) {
        /*Kaikki ok, linkki lisätään tietokantaan ja suosikeihin.*/
        const link = new Link({
          title: body.title,
          thumbnail: body.thumbnail,
          linkId: body.linkId
        })
        const savedLink = await link.save()
        user.links = user.links.concat(savedLink._id)
        await user.save()

        return response.status(201).json(savedLink)
      }
    }
    /*Käyttäjällä oli jo suosikeissa kyseinen linkki*/
    return response.status(500).json({ error: 'link already in favourites' })

    /*VAIHTOEHTO 2: HAETAAN ERI TIETOKANNOISTA*/
    /*Ensimmäisenä tarkistetaan, onko tietokannassa jo linkkiä, jonka
    linkId == body.linkId JA favoritedBy = user._id.*/
    /*Ensin linkId:n perusteella.*/
    /*Etsitään user jonka token kenttä*/
    const links = await Link.find({ linkId: body.linkId })
    if (links === undefined || links === null || links.length === 0) {
      /*Ei ole linkkiä tietokannassa, joten voidaan lisätä uusi linkki
      tietokantaan ja käyttäjän suosikeihin. Ja palauttaa response.*/
      const link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId,
        favoritedBy: decodedToken.id
      })
      const savedLink = await link.save()
      user.links = user.links.concat(savedLink._id)
      await user.save()

      return response.status(201).json(savedLink)
    }
    /*Jos tietokannassa oli linkki, jonka linkId == body.linkId, niin
    sitten haetaan favoritedBy:n perusteella.*/
    const linksFound = links
      .find(l => l.favoritedBy.toString() === decodedToken.id.toString())
    if (linksFound === undefined || linksFound === null || linksFound.length === 0) {
      /*Ei löytynyt linkkiä kyseisellä linkId:llä joka olisi käyttäjän
      suosikeissa. Voidaan lisätä linkki tietokantaan ja käyttäjän
      suosikeihin ja palauttaa response.*/
      const link = new Link({
        title: body.title,
        thumbnail: body.thumbnail,
        linkId: body.linkId,
        favoritedBy: decodedToken.id
      })
      const savedLink = await link.save()
      user.links = user.links.concat(savedLink._id)
      await user.save()

      return response.status(201).json(savedLink)
    }
    /*Jos päästään tänne asti, niin linkki on jo käyttäjän suosikeissa.*/
    /*Tällöin sitä ei lisätä mihinkään ja palautetaan error.*/
    return response.status(500).json({ error: 'link already in favourites' })

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

linksRouter.delete('/all', async (request, response) => {
  await Link.remove({})
  response.status(204).end()
})

linksRouter.delete('/favourites', async (request, response) => {
  try {
    //const token = getTokenFrom(request)
    const authorization = request.body.usertoken
    let decodedToken = null
    console.log('deleten usertoken', request.body.usertoken)
    if ((authorization != undefined) && authorization.toLowerCase().startsWith('bearer ')) {
      //return authorization.substring(7)
      console.log('ennen jwt homoilua')
      decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
      console.log('decoded token: ', decodedToken)
    } else {
      console.log('if statement ei toimi')
    }

    if (!authorization || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    console.log('reqparams linkid bäkin deletestä', request.body)
    await Link.findByIdAndRemove(request.body.id)
    const user = await User.findById(decodedToken.id)
    console.log('USER LÖYDETTY')
    //console.log('USERIN LINKIT:', user.links)
    //console.log('LINKIN ID: ', user.links[0])
    //console.log('POISTETTAVAN LINKIN ID: ', request.body.id)
    //console.log('FILTTERÖITY LISTA: ', user.links.filter(link => link != request.body.id))
    user.links = user.links.filter(link => link != request.body.id)
    await user.save()

    response.status(204).end()
  } catch (e) {
    return 'error'
  }

})

module.exports = linksRouter
