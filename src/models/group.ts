import mongoose from 'mongoose'

interface IGroup {
  id?: string,
  name: string,
  permissions: { [name: string]: string | number | boolean }
}

const groupSchema = new mongoose.Schema<IGroup>({
  name: {
    type: String,
    required: true
  },
  permissions: {
    type: Map,
    required: true
  }
})

groupSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Group = mongoose.model<IGroup>('Group', groupSchema)

export default Group
