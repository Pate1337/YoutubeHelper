const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  console.log(User)
  const users = User
  console.log(users)


  response.json(users)
})

module.exports = usersRouter
