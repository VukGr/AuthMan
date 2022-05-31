import mongoose from 'mongoose'

interface IGroup {
  id?: string,
  name: string,
  permissions: { [name: string]: string | number | boolean }
  default: boolean
  users: mongoose.Types.ObjectId[]
}

const groupSchema = new mongoose.Schema<IGroup>({
  name: {
    type: String,
    required: true
  },
  permissions: {
    type: Map,
    required: true
  },
  default: {
    type: Boolean,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

groupSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.default = returnedObject.default || false
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Group = mongoose.model<IGroup>('Group', groupSchema)

export default Group
