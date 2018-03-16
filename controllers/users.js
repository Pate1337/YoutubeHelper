const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const firstUsers = await User.find({})
  const usersWithLinks = await User
    .find({ links: { $exists: true, $ne: [] } })
    .populate('links')
  const usersWithoutLinks = firstUsers.filter(u => u.links.length === 0)
  console.log('firstUsers: ' + firstUsers)
  console.log('usersWithLinks: ' + usersWithLinks)
  console.log('usersWithoutLinks: ' + usersWithoutLinks)

  const users = usersWithLinks.concat(usersWithoutLinks)
  console.log('users: ' + users)
  /*Toi populate oli ihan helvettiä*/
  response.json(users.map(User.format))
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
