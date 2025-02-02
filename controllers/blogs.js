const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs  = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})




blogsRouter.post('/', middleware.userExtractor, async(request, response) => {
  const body = request.body
  const user = await User.findById(request.decodedTokenId)
  
  const blog = new Blog ({
    title: body.title,
    autor: body.author || 'default author',
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id) 
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor,  async(request, response) => {
  
  const user = await User.findById(request.decodedTokenId)
  const blog = await Blog.findById(request.params.id)
  console.log(`blog id is ${blog.id}`)
  console.log(`blog user id is ${blog.user}`)
  console.log(`user id is ${user.id}`)
  if ( blog.user.toString() === user.id.toString() ){
    const delBlog = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else return response.status(401).json({ error: 'invalid user' })

  
})



blogsRouter.put('/:id', async(request, response) => {
  const body = request.body
  const upblog = {
    title: body.title,
    author: body.author || 'default author',
    url: body.url,
    likes: body.likes || 0,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, upblog, { new: true })
  response.status(200).json(updatedBlog)

})

  


module.exports = blogsRouter