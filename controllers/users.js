
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()


const User = require('../models/User')

usersRouter.post('/', async (request, response) => {
    const { body } = request
    const { username, password } = body

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = new User({
        username,
        passwordHash
    })

    const savedUser = await newUser.save()

    response.json(savedUser)
})

module.exports = usersRouter