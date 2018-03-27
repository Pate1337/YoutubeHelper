const mongoose = require('mongoose')

const relatedLinkSchema =  new mongoose.Schema({
    count: Number,
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' }
})

relatedLinkSchema.statics.format = (relatedLink) => {
  return {
    id: relatedLink._id,
    count: relatedLink.count,
    link: relatedLink.link
  }
}

const RelatedLink = mongoose.model('RelatedLink', relatedLinkSchema)

module.exports = RelatedLink
