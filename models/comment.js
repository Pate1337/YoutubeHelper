const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: String,
  sender: { id: String, name: String},
  receiver: String
})

commentSchema.statics.format = (comment) => {
  return {
    id: comment._id,
    content: comment.content,
    sender: {id: comment.sender, name: comment.sender.username},
    receiver: comment.receiver
  }
}

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment