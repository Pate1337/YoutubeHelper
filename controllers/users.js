const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  /*Aivan liian hidasta etsiä ja populoida kaikki, joten palautetaan
  ilman populointia. Jos käyttäjän tietoja tarvitaan, niin ne voidaan
  hakea alempaa gettiä käyttämällä.*/
  const users = await User.find({})
  /*const usersWithLinks = await User
    .find({ links: { $exists: true, $ne: [] } })
    .populate('links')
  const usersWithoutLinks = firstUsers.filter(u => u.links.length === 0)

  const users = usersWithLinks.concat(usersWithoutLinks)*/
  /*Toi populate oli ihan helvettiä*/
  response.json(users.map(User.format))
})

usersRouter.get('/:id', async (request, response) => {
  try {
    /*Tää on nyt aika optimaalinen. Olen ylpeä.*/
    const id = request.params.id
    const user = await User.findById(id)
    let searchedUser
    if (user.links.length !== 0 && user.playlists.length !== 0) {
      searchedUser = await User
        .findById(id)
        .populate([{
          path: 'links',
          model: 'Link'
        },
        {
          path: 'playlists',
          model: 'Playlist',
          populate: {
            path: 'links',
            model: 'Link'
          }
        }])
      console.log('searchedUser: ' + searchedUser)
    } else if (user.links.length !== 0) {
      searchedUser = await User
        .findById(id)
        .populate('links')
      console.log('searchedUser: ' + searchedUser)
    } else if (user.playlists.length !== 0) {
      searchedUser = await User
        .findById(id)
        .populate({
          path: 'playlists',
          model: 'Playlist',
          populate: {
            path: 'links',
            model: 'Link'
          }
        })
      console.log('searchedUser: ' + searchedUser)
    } else {
      searchedUser = user
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
    if (body.password.length < 8) {
      return response.status(400).json({error: 'password has to be atleast 8 characters long!'})
    }
    if(body.name.length < 2) {
      return response.status(400).json({error: 'Name must be at least 2 characters long!'})
    }
    if(body.username.length < 5) {
      return response.status(400).json({error: 'Username must be at least 5 characters long!'})
    }
    /*Käyttäjätunnus oltava uniikki*/
    const existingUser = await User.find({username: body.username})
    if (existingUser.length > 0) {
      return response.status(400).json({error: 'username already taken'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    /*Uusi käyttäjä lisätään ilman kenttää links.*/
    /*Kokeile, pitääkö olla määriteltynä kentät links ja playlists*/
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

/*usersRouter.delete('/:id', async (request, response) => {
  try {
    await User.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    response.status(400).send({error: 'malformatted id'})
  }
})*/

usersRouter.delete('/all', async (request, response) => {
  await User.remove({})
  response.status(204).end()
})

module.exports = usersRouter
