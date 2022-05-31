import mongoose from 'mongoose'

interface IUser {
  id?: string,
  username: string,
  name?: string,
  passwordHash: string,
  group?: mongoose.Types.ObjectId
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  passwordHash: {
    type: String,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
})

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v

    delete returnedObject.passwordHash
  }
})

const User = mongoose.model<IUser>('User', userSchema)

export default User
