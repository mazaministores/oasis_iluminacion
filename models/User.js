const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: String,
    passwordHash: String
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject._v
        delete returnedObject.passwordHash
    }
})

const User = model('User', userSchema)

module.exports = User