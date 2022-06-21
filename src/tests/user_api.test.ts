import bcrypt from 'bcrypt'
import supertest from "supertest"
import app from '../app'
import Group from '../models/group'
import User from '../models/user'
import helper from './test_helper'
import jwt from "jsonwebtoken"
import config from '../utils/config'

const api = supertest(app)

describe('User operations', () => {
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


  describe('Read all', () => {
    test('succeeds with status code 200', async () => {
      const res = await api
        .get('/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveLength(helper.initialUsers.length)
    })
  })

  describe('Read by id', () => {
    test('succeeds with a valid id', async () => {
      const userToView = (await helper.dbAllUsers())[0]
      const res = await api
        .get(`/users/${userToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const processedGroupToView = JSON.parse(JSON.stringify(userToView))
        expect(res.body).toEqual(processedGroupToView)
    })

    test('fails with status code 404 if group does not exist', async () => {
      const validNonexisitingID = await helper.nonExistingID()

      await api
        .get(`/groups/${validNonexisitingID}`)
        .expect(404)
    })
  })

  describe('Update group', () => {
    test('succeeds with status code 200 if id and data are valid', async () => {
      const targetUser = (await helper.dbAllUsers())[0]
      const targetGroup = (await helper.dbAllGroups()).find(g => targetUser.group.toString() !== g.id)

      const newGroup = {
        group: targetGroup?.id
      }

      await api
        .put(`/users/${targetUser.id}/group`)
        .send(newGroup)
        .expect(200)

      const usersAtEnd = await helper.dbAllUsers()
      const userAtEnd = usersAtEnd.find(u => u.id === targetUser.id)
      expect(userAtEnd?.group.toString()).toEqual(newGroup.group?.toString())
    })

    test('fails with status code 400 if new group is invalid', async () => {
      const targetUser = (await helper.dbAllUsers())[0]
      const newGroup = {
        group: await helper.nonExistingID()
      }

      const res = await api
        .put(`/users/${targetUser.id}/group`)
        .send(newGroup)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.dbAllUsers()
      const userAtEnd = usersAtEnd.find(u => u.id === targetUser.id)
      expect(userAtEnd?.group.toString()).not.toEqual(newGroup.group.toString())

      expect(res.body.error).toContain('Group not found.')
    })

    test('fails with status code 404 if user id is invalid', async () => {
      const targetUserId = await helper.nonExistingID()
      const targetGroup = (await helper.dbAllGroups())[0]
      const newGroup = {
        group: targetGroup.id
      }
      
      await api
        .put(`/users/${targetUserId}/group`)
        .send(newGroup)
        .expect(404)
    })
  })
})
