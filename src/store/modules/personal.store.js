import axios from 'axios'
import { apiUrl } from '../../configs/config'
import {
  getNewDataContacts,
  methodUpdate,
  updateTeamData,
  updatePersonalData
} from '../helper'

const state = {
  contactsInfoHashPersonal: null, // info about UUID, ETag
  listDetailInfoContactsPersonal: [], // array all data contacts --- name, email etc
  selectedContactPerson: null // detail info contact
}

const getters = {
  GET_DETAIL_INFO_CONTACT_PERSONAL: state =>
    state.listDetailInfoContactsPersonal.info,
  GET_SELECTED_CONTACT_PERSON: state => state.selectedContactPerson,
  GET_CONTACTS_INFO_HASH_PERSONAL: state => state.contactsInfoHashPersonal // info about UUID, ETag
}

const mutations = {
  ADD_CONTACT_INFO_HASH_PERSONAL: (state, data) => {
    state.contactsInfoHashPersonal = data
  },
  ADD_DETAIL_INFO_CONTACT_PESONAL: (state, detailInfoContact) => {
    state.listDetailInfoContactsPersonal = detailInfoContact
  },

  UPDATE_HASH_PERSONAL: (state, data) => {
    const { index, ETag: newETag } = data
    state.contactsInfoHashPersonal.Info[index].ETag = newETag
  },

  UPDATE_CONTACT_INFO: (state, data) => {
    const { UUID, newData, index } = data

    const findIndexContact = state.listDetailInfoContactsPersonal.info.findIndex(
      item => {
        if (item && item.UUID) {
          return item.UUID === UUID
        }
      }
    )

    if (findIndexContact !== -1) {
      if (newData[index]) {
        state.listDetailInfoContactsPersonal.info[findIndexContact] =
        newData[index]
        console.log('newData[index]', newData[index])
      }
    }
  },

  SELECT_CONTACT: (state, index) =>
    (state.selectedContactPerson =
      state.listDetailInfoContactsPersonal.info[index])
}

const actions = {
  GET_CONTACT_INFO_PERSONAL: async context => {
    try {
      const formData = new FormData()
      formData.append('Module', 'Contacts')
      formData.append('Method', 'GetContactsInfo')
      formData.append('Parameters', '{"Storage":"personal"}')
      const getContactsInfo = await axios({
        method: 'post',
        url: apiUrl,
        data: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      await context.commit(
        'ADD_CONTACT_INFO_HASH_PERSONAL',
        getContactsInfo.data.Result
      )
      await context.dispatch(
        'GET_CONTACTS_INFO_PERSONAL_BY_UIDS',
        getContactsInfo.data.Result
      )
    } catch (err) {
      console.log('err', err)
    }
  },

  GET_CONTACTS_INFO_PERSONAL_BY_UIDS: async (context, contacts) => {
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
          `{"Storage":"personal", "Uids":${JSON.stringify(arrayUids)}}`
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
        await context.commit('ADD_DETAIL_INFO_CONTACT_PESONAL', data)
        const updateSelectedStorage = context.getters.GET_SELECTED_STORAGE
        if (updateSelectedStorage && updateSelectedStorage.Id === 'personal') {
          await context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
        }
      }
    } catch (err) {
      console.log('err', err)
    }
  },
  UPDATE_CONTACTS_PERSONAL: async context => {
    try {
      const currentHash = await context.getters.GET_CONTACTS_INFO_HASH_PERSONAL
      const { CTag: currentCTag } = currentHash
      const newContactsInfo = await getNewDataContacts('personal', apiUrl)
      const { CTag: newCTag } = newContactsInfo.data.Result
      await methodUpdate(
        context,
        currentCTag,
        newCTag,
        newContactsInfo.data.Result,
        currentHash,
        'personal'
      )
    } catch (err) {
      console.log('err', err)
    }
  },

  UPDATE_HASH: async (context, data) => {
    try {
      const arrayUids = []

      data.forEach(async item => {
        arrayUids.push(`"${item.UUID}"`)
      })

      const updateSelectedStorage = context.getters.GET_SELECTED_STORAGE
      if (updateSelectedStorage.Id === 'personal') {
        updatePersonalData(
          context,
          arrayUids,
          data,
          apiUrl,
          updateSelectedStorage,
          'personal'
        )
      } else {
        updateTeamData(
          context,
          arrayUids,
          data,
          apiUrl,
          updateSelectedStorage,
          'team'
        )
      }
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
