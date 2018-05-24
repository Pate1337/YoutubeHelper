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
  const comments = await Comment.find({ receiver: request.params.id })
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
      sender: {
        id: body.sender,
        name: sender.username
      },
      date: new Date()
    })
    console.log('commentsRouter KOMMENTTI luotu')
    const savedComment = await comment.save()
    console.log('cRouter kommentti tallennettu kantaan')
    receiver.rComments = receiver.rComments.concat(savedComment._id)
    console.log('kommentti tallenettu receiverille')
    sender.sentComments = sender.sentComments.concat(savedComment._id)
    console.log('kommentti tallennettu lähettäjälle')

    if (sender.id != receiver.id) {
      await sender.save()
      console.log('lähettäjä user tallennettu')
    } else {
      receiver.sentComments = receiver.sentComments.concat(savedComment._id)
    }
    await receiver.save()
    console.log('saaja user tallennettu')
    


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

commentsRouter.delete('/:id', async (request, response) => {
  console.log('commentsRouter DELETE')
  try {
    const token = getTokenFrom(request)
    console.log('TOKEN', token)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      console.log('no token or decoded token')
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const commentToDelete = await Comment.findById(request.params.id)
    let userToDeleteFrom = await User.findById(decodedToken.id)
    //console.log('USER LÖYDETTY commentsController', userToDeleteFrom)
    userToDeleteFrom.rComments = userToDeleteFrom.rComments.filter(rcomment => rcomment != request.params.id)
    await userToDeleteFrom.save()
    console.log('DecodedTokenID', decodedToken.id)
    console.log('RECEIVER', commentToDelete.receiver)
    if (decodedToken.id == commentToDelete.receiver) {
      console.log('token was same as parameter id')
      await Comment.findByIdAndRemove(request.params.id)
      return response.status(204).end()
    } else {
      console.log('token was not the same as parameter id')
      return response.status(401).json({ error: 'No authorization' })
    }

  } catch (e) {
    return 'error'
  }
})

module.exports = commentsRouter