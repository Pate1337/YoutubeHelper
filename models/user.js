const mongoose = require('mongoose')

const userSchema =  new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
})

userSchema.statics.format = (user) => {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    links: user.links
  }
}

const User = mongoose.model('User', userSchema)

/*
const User = [
  {
    id: '123123',
    username: 'testi1',
    name: 'Testi1',
    links: [{
      id: '19304',
      url: 'https://www.youtube.com/watch?v=TPXWtozVNzM'
    },
    {
      id: '1337',
      url: 'https://github.com/Pate1337/YoutubeHelper'
    }]
  },
  {
    id: '9876986',
    username: 'testi2',
    name: 'Testi2',
    links: [{
      id: '85740',
      url: 'https://www.youtube.com/watch?v=tsTZ2iFRSmw'
    },
    {
      id: '836743123',
      url: 'https://fullstack-hy.github.io/'
    }]
  }
]
*/
module.exports = User
