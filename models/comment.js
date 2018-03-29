const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: String,
  sender: String,
  receiver: String
})

commentSchema.statics.format = (comment) => {
  return {
    id: comment._id,
    content: comment.content,
    sender: comment.sender,
    receiver: comment.receiver
  }
}

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment