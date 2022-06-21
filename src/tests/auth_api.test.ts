import bcrypt from 'bcrypt'
import supertest from "supertest"
import app from '../app'
import Group from '../models/group'
import User from '../models/user'
import helper from './test_helper'
import jwt from "jsonwebtoken"
import config from '../utils/config'

const api = supertest(app)

describe('Auth operations', () => {
  beforeAll(async () => {
    await Group.deleteMany()
    await Group.insertMany(helper.initialGroups)
  })

  beforeEach(async () => {
    await User.deleteMany({})
    const defaultGroup = await Group.findOne({ default: true })

    const users = await Promise.all(helper.initialUsers.map(async u => {
      const passwordHash = await bcrypt.hash('secret', 10)
      return {
        username: u.username,
        group: defaultGroup?.id,
        passwordHash
      }
    }))

    await User.insertMany(users)
  })

  test('startup', async () => {
    expect(1).toEqual(1)
  })


  describe('Registration', () => {
    test('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.dbAllUsers()

      const newUser = {
        username: 'test',
        password: 'test'
      }

      const res = await api
        .post('/auth/register')
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
        password: 'test'
      }

      const res = await api
        .post('/auth/register')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.error).toContain('Username must be unique.')

      const usersAtEnd = await helper.dbAllUsers()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })

  describe('Login', () => {
    test('succeeds with correct data', async () => {
      const user = helper.initialUsers[0]
      const login = {
        username: user.username,
        password: user.password
      }

      const res = await api
        .post('/auth/login')
        .send(login)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body.username).toEqual(login.username)
      expect(() => jwt.verify(res.body.token, config.SECRET)).not.toThrow()
    })

    test('fails with incorrect data', async () => {
      const user = helper.initialUsers[0]
      const login = {
        username: user.username,
        password: user.password + 'aa'
      }

      const res = await api
        .post('/auth/login')
        .send(login)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(res.body.error).toContain('Invalid username or password.')
    })
  })
})
