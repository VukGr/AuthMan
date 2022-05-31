import mongoose from "mongoose"
import supertest from "supertest"
import app from '../app'
import Group from "../models/group"
import helper from './test_helper'

const api = supertest(app)

//TODO Test default group operations.

describe('Group operations', () => {
  beforeEach(async () => {
    await Group.deleteMany({})
    await Group.insertMany(helper.initialGroups)
  })

  test('startup', async () => {
    expect(1).toEqual(1)
  })

  describe('Creation', () => {
    test('succeeds with valid data', async () => {
      const newGroup = {
        name: 'Manager',
        permissions: {
          AuthManMod: true
        }
      }

      await api
        .post('/groups')
        .send(newGroup)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // TODO Change to IGroup
      const groupsAtEnd = await helper.dbAllGroups()
      expect(groupsAtEnd).toHaveLength(helper.initialGroups.length + 1)

      const names = groupsAtEnd.map(g => g.name)
      expect(names).toContain(newGroup.name)
    })

    test('fails with code 400 if name is missing', async () => {
      const newGroup = {
        name: '',
        permissions: {
          AuthManMod: true
        }
      }

      await api
        .post('/groups')
        .send(newGroup)
        .expect(400)

      const groupsAtEnd = await helper.dbAllGroups()
      expect(groupsAtEnd).toHaveLength(helper.initialGroups.length)
    })
  })

  describe('Read all', () => {
    test('groups are returned as json', async () => {
      await api
        .get('/groups')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all groups are returned', async () => {
      const res = await api.get('/groups')
      expect(res.body).toHaveLength(helper.initialGroups.length)
    })
  })

  describe('Read by id', () => {
    test('succeeds witha  valid id', async () => {
      const groupToView = (await helper.dbAllGroups())[0]
      const res = await api
        .get(`/groups/${groupToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const processedGroupToView = JSON.parse(JSON.stringify(groupToView))
        expect(res.body).toEqual(processedGroupToView)
    })

    test('fails with status code 404 if group does not exist', async () => {
      const validNonexisitingID = await helper.nonExistingID()

      await api
        .get(`/groups/${validNonexisitingID}`)
        .expect(404)
    })

    test('fails with status code 400 if id is not valid', async () => {
      const invalidID = '1'

      await api
        .get(`/groups/${invalidID}`)
        .expect(400)
    })
  })

  describe('Update', () => {
    test('succeeds with status code 200 if id and data are valid', async () => {
      const targetGroup = (await helper.dbAllGroups())[0]
      targetGroup.name = 'TEST' 

      await api
        .put(`/groups/${targetGroup.id}`)
        .send(targetGroup)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const groupsAtEnd = await helper.dbAllGroups()

      const names = groupsAtEnd.map(g => g.name)
      expect(names).toContain(targetGroup.name)
    })

    test('fails with status code 400 if new name is empty', async () => {
      const targetGroup = (await helper.dbAllGroups())[0]
      targetGroup.name = ''

      await api
        .put(`/groups/${targetGroup.id}`)
        .send(targetGroup)
        .expect(400)

      const groupsAtEnd = await helper.dbAllGroups()

      const names = groupsAtEnd.map(g => g.name)
      expect(names).not.toContain(targetGroup.name)
    })

    test('fails with status code 404 if group does not exist', async () => {
      const targetGroup = (await helper.dbAllGroups())[0]
      const nonExistingID = (await helper.nonExistingID())
      targetGroup.name = 'TEST'

      await api
        .put(`/groups/${nonExistingID}`)
        .send(targetGroup)
        .expect(404)

      const groupsAtEnd = await helper.dbAllGroups()

      const names = groupsAtEnd.map(g => g.name)
      expect(names).not.toContain(targetGroup.name)
    })
  })

  describe('Deletion', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const groupToDelete = (await helper.dbAllGroups())[0]

      await api
        .delete(`/groups/${groupToDelete.id}`)
        .expect(204)

      const groupsAtEnd = await helper.dbAllGroups()
      expect(groupsAtEnd).toHaveLength(helper.initialGroups.length - 1)

      const names = groupsAtEnd.map(g => g.name)
      expect(names).not.toContain(groupToDelete.name)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
