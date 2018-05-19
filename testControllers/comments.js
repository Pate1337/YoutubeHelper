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

commentsRouter.get('/:id', async (request, response) => {
  console.log('commentsRouter GET_BY_USER_ID')
  const comments = await Comment.find({receiver:request.params.id})
  //console.log(comments)
  response.json(comments.map(Comment.format))
})

commentsRouter.post('/', async (request, response) => {
  console.log('commentsRouter POST')
  try {
    const token = getTokenFrom(request)
    console.log('TOKEN', token)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log('commentsRouter TOKEN verifioitu')
    const body = request.body
    const receiver = await User.findById(body.receiver)
    const sender = await User.findById(decodedToken.id)
    console.log('cRouter decTOKEN _ID', decodedToken.id)

    const comment = new Comment({
      content: body.content,
      receiver: body.receiver,
      sender: body.sender
    })
    console.log('commentsRouter KOMMENTTI luotu')
    const savedComment = await comment.save()
    console.log('cRouter kommentti tallennettu kantaan')
    receiver.rComments = receiver.rComments.concat(savedComment._id)
    console.log('kommentti tallenettu receiverille')
    sender.sentComments = sender.sentComments.concat(savedComment._id)
    console.log('kommentti tallennettu lähettäjälle')

    await receiver.save()
    console.log('saaja user tallennettu')
    await sender.save()
    console.log('lähettäjä user tallennettu')

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