const mongoose = require('mongoose')

const userSchema =  new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    relatedLinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RelatedLink' }],
    rComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    sentComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
})

userSchema.statics.format = (user) => {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    links: user.links,
    playlists: user.playlists,
    relatedLinks: user.relatedLinks,
    rComments: user.rComments,
    sentComments: user.sentComments
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
