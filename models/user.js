const mongoose = require('mongoose')

/*
const User = mongoose.model('User', {
    username: String,
    name: String,
    passwordHash: String
})
*/

const User = [
  {
    id: '123123',
    username: 'testi1',
    name: 'Testi1',
    links: {
      id: '19304',
      url: 'https://www.youtube.com/watch?v=TPXWtozVNzM'
    }
  },
  {
    id: '9876986',
    username: 'testi2',
    name: 'Testi2',
    links: {
      id: '85740',
      url: 'https://www.youtube.com/watch?v=tsTZ2iFRSmw'
    }
  }
]
module.exports = User
