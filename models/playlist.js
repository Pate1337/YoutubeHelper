const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
  title: String,
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

playlistSchema.statics.format = (playlist) => {
  return {
    id: playlist._id,
    title: playlist.title,
    links: playlist.links,
    user: playlist.user
  }
}

const Playlist = mongoose.model('Playlist', playlistSchema)

module.exports = Playlist
