const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const firstUsers = await User.find({})
  const usersWithLinks = await User
    .find({ links: { $exists: true, $ne: [] } })
    .populate('links')
  const usersWithoutLinks = firstUsers.filter(u => u.links.length === 0)

  const users = usersWithLinks.concat(usersWithoutLinks)
  /*Toi populate oli ihan helvettiä*/
  response.json(users.map(User.format))
})

usersRouter.get('/:id', async (request, response) => {
  try {
    /*Ei vittu tää kusee taas jos käyttäjäl ei oo linkkejä*/
    const searchedUserHasLinks = await User
      .findOne({ _id: request.params.id, links: { $exists: true, $ne: [] } })
      .populate('links')
    console.log('searchedUserHasLinks: ' + searchedUserHasLinks)
    /*Jos linkkejä ei ole, haetaan uudestaan ilman populatea.*/
    let searchedUser = searchedUserHasLinks
    /*En oo yhtään varma onko null vai undefined jos ei löydy.*/
    if (searchedUserHasLinks === null) {
      searchedUser = await User.findById(request.params.id)
    }
    response.status(201).json(User.format(searchedUser))
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'No users found!' })
  }
})

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    /*Salasana vähintään 3 merkkiä*/
    if (body.password.length < 3) {
      return response.status(400).json({error: 'password has to be atleast 3 characters long'})
    }
    /*Käyttäjätunnus oltava uniikki*/
    const existingUser = await User.find({username: body.username})
    if (existingUser.length > 0) {
      return response.status(400).json({error: 'username already taken'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    /*Uusi käyttäjä lisätään ilman kenttää links.*/
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()
    /*Palauttaa formated userin*/
    response.status(200).json(User.format(savedUser))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = usersRouter
