import bcrypt from 'bcrypt'
import supertest from "supertest"
import app from '../app'
import Group from '../models/group'
import User from '../models/user'
import helper from './test_helper'

const api = supertest(app)

describe('User operations', () => {
  beforeAll(async () => {
    await Group.deleteMany()
    await Group.insertMany(helper.initialGroups)
  })

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('startup', async () => {
    expect(1).toEqual(1)
  })


  describe('Creation', () => {
    test('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.dbAllUsers()

      const newUser = {
        username: 'test',
        name: 'test',
        password: 'test'
      }

      const res = await api
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.dbAllUsers()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)

      const defaultGroup = await Group.findOne({ default: true })
      expect(res.body.group).toEqual(defaultGroup?.id)
    })

    test('fails with status code 400 when using an exisitng username', async () => {
      const usersAtStart = await helper.dbAllUsers()

      const newUser = {
        username: usersAtStart[0].username,
        name: 'test',
        password: 'test'
      }

      const res = await api
        .post('/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.error).toContain('Username must be unique.')

      const usersAtEnd = await helper.dbAllUsers()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })
})
