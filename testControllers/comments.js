const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

commentsRouter.get('/', async (request, response) => {
  console.log('commentsRouter GET_ALL')
  const comments = await Comment.find({})
  response.json(comments.map(Comment.format))
})

commentsRouter.post('/', async (request, response) => {
  console.log('commentsRouter POST')
  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body
    const receiver = await User.findById(body.receiver)
    const sender = await User.findById(decodedToken._id)

    const comment = new Comment({
      content: body.content,
      receiver: body.receiver,
      sender: body.sender
    })
    const savedComment = await comment.save()
    receiver.rComments = receiver.rComments.concat(savedComment._id)
    sender.sentComments = sender.sentComments.concat(savedComment._id)

    await receiver.save()
    await sender.save()

    return response.status(201).json(savedComment)

  } catch (e) {
    if (e.name === 'JsonWebTokenError') {
      response.status(401).json({ error: e.message })
    } else {
      console.log(e)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = commentsRouter