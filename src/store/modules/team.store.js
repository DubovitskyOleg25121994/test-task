import axios from 'axios'
import { getNewDataContacts, methodUpdate } from '../helper'
import { apiUrl } from '../../configs/config'

const state = {
  contactsInfoHashTeam: null, // info about UUID, ETag
  listDetailInfoContactsTeam: [], // array all data contacts --- name, email etc
  selectedContactTeam: null // detail info contact
}

const getters = {
  GET_DETAIL_INFO_CONTACT_TEAM: state => state.listDetailInfoContactsTeam,
  GET_SELECTED_CONTACT_TEAM: state => state.selectedContactTeam,
  GET_CONTACTS_INFO_HASH_TEAM: state => state.contactsInfoHashTeam // info about UUID, ETag
}

const mutations = {
  ADD_CONTACT_INFO_HASH_TEAM: (state, data) => {
    state.contactsInfoHashTeam = data
  },
  ADD_DETAIL_INFO_CONTACT_TEAM: (state, detailInfoContactTeam) =>
    (state.listDetailInfoContactsTeam = detailInfoContactTeam),
  UPDATE_HASH_TEAM: (state, data) => {
    const { index, ETag: newETag } = data
    state.contactsInfoHashTeam.Info[index].ETag = newETag
  }
}

const actions = {
  GET_CONTACT_INFO_TEAM: async context => {
    try {
      const formData = new FormData()
      formData.append('Module', 'Contacts')
      formData.append('Method', 'GetContactsInfo')
      formData.append('Parameters', '{"Storage":"team"}')
      const getContactsInfoTeam = await axios({
        method: 'post',
        url: apiUrl,
        data: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      await context.commit(
        'ADD_CONTACT_INFO_HASH_TEAM',
        getContactsInfoTeam.data.Result
      )
      await context.dispatch(
        'GET_CONTACTS_INFO_TEAM_BY_UIDS',
        getContactsInfoTeam.data.Result
      )
    } catch (err) {
      console.log('err', err)
    }
  },

  GET_CONTACTS_INFO_TEAM_BY_UIDS: async (context, contacts) => {
    try {
      if (contacts && contacts.Info) {
        const { Info, CTag } = contacts
        const formData = new FormData()
        formData.append('Module', 'Contacts')
        formData.append('Method', 'GetContactsByUids')
        const arrayUids = []
        Info.forEach(async ({ UUID }) => {
          arrayUids.push(UUID)
        })
        formData.append(
          'Parameters',
          `{"Storage":"team", "Uids":${JSON.stringify(arrayUids)}}`
        )
        const getContactInfo = await axios({
          method: 'post',
          url: apiUrl,
          data: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = {
          info: getContactInfo.data.Result,
          CTag
        }
        await context.commit('ADD_DETAIL_INFO_CONTACT_TEAM', data)
        const updateSelectedStorage = context.getters.GET_SELECTED_STORAGE

        if (updateSelectedStorage && updateSelectedStorage.Id === 'team') {
          await context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
        }
      }
    } catch (err) {
      console.log('err', err)
    }
  },
  UPDATE_CONTACTS_TEAM: async context => {
    try {
      const currentHash = await context.getters.GET_CONTACTS_INFO_HASH_TEAM
      const { CTag: currentCTag } = currentHash
      const newContactsInfo = await getNewDataContacts('team', apiUrl)
      const { CTag: newCTag } = newContactsInfo.data.Result
      await methodUpdate(
        context,
        currentCTag,
        newCTag,
        newContactsInfo.data.Result,
        currentHash,
        'team'
      )
    } catch (err) {
      console.log('err', err)
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
