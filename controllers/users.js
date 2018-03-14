const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    /*.populate('links', { title: 1, url: 1 })*/
  /*Aattelin et palautettais aina frontille helposti käsiteltävässä muodossa,
  siksi populate. Paitsi että nyt se ei toimi, koska lisätessä uus käyttäjä
  toi links kenttä on tyhjä.*/

  /*Kovakoodatulla userlistillä(sijaitsee models/user)
  const users = User
  */
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

    /*Pitäis voida lisätä uusi käyttäjä ilman kenttää links.
    Pitää viel miettii et miten hoitaa uuden käyttäjän lisäämisen tyhjällä
    links kentällä, jotta se saadaan kuitenki mielellää tos populate muodos
    fronttiin.*/
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
