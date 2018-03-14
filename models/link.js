const mongoose = require('mongoose')

/*Tänne tuskin tarvii laittaa kenttää user/users.
Nää tulee olemaan niin monella. Riittää kun User pitää kirjaa linkeistä.*/
const linkSchema = new mongoose.Schema({
  title: String,
  url: String
})

linkSchema.statics.format = (link) => {
  return {
    id: link._id,
    title: link.title,
    url: link.url
  }
}

const Link = mongoose.model('Link', linkSchema)

module.exports = Link
