const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
  title: String,
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
})

playlistSchema.statics.format = (playlist) => {
  return {
    id: playlist._id,
    title: playlist.title,
    links: user.links
  }
}

const Playlist = mongoose.model('Playlist', playlistSchema)

module.exports = Playlist
