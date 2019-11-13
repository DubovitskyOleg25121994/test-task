import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import loginStore from './modules/login.store'
import personalStore from './modules/personal.store'
import teamStore from './modules/team.store'
import { apiUrl } from '../configs/config'
import {
  getNewDataContactsInfo,
  addNewHasForPersonal,
  selectedStoragedData
} from './helper'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    contactStorages: [], // personal, team
    selectedStorage: null,
    selectedDataContacts: [],
    detailInfoContact: null,
    currentHashContacts: []
  },
  getters: {
    GET_CONTACT_STORAGE: state => state.contactStorages,
    GET_SELECTED_STORAGE: state => state.selectedStorage,
    GET_SELECTED_CONTACTS: state => state.selectedDataContacts.info,
    GET_DETAIL_INFO_CONTACT: state => state.detailInfoContact,
    GET_CURRENT_HASH_CONTACT: state => state.currentHashContacts
  },
  mutations: {
    ADD_CONTACT_IN_STORAGE: (state, contacts) =>
      (state.contactStorages = contacts),

    SELECT_STORAGE: (state, index) => {
      state.selectedStorage = state.contactStorages[index]
      state.detailInfoContact = null
    },

    ADD_SELECTED_CONTACTS: (state, storage) => {
      selectedStoragedData(storage, state)
    },
    ADD_CONTACT_INFO: (state, index) =>
      (state.detailInfoContact = state.selectedDataContacts.info[index]),

    UPDATE_ONE_CONTACT_HASH: (state, index, newValue) => {
      state.currentHashContacts[index].CTag = newValue
    },
    UPDATE_ONE_CONTACT: (state, index, newValue, type) => {
      if (type === 'personal') {
        state.personalStore.listDetailInfoContactsPersonal[index] = newValue
      } else {
        state.teamStore.listDetailInfoContactsTeam[index] = newValue
      }
    },
    ADD_NEW_HASH: (state, data) => {
      const { getNewDataPersonal, newCTag } = data
      console.log('ADD_NEW_HASH')
      console.log('newCTag', newCTag)
      console.log('getNewDataPersonal', getNewDataPersonal)
      getNewDataPersonal.forEach(element => {
        state.personalStore.listDetailInfoContactsPersonal.info.push(element)
      })
      state.personalStore.contactsInfoHashPersonal.CTag = newCTag
    },
    DELETE_CONTACT: (state, data) => {
      const { findedContactForDelete, newCTag } = data
      findedContactForDelete.forEach(element => {
        const findIndexContact = state.personalStore.listDetailInfoContactsPersonal.info.findIndex(
          item => {
            console.log('element.UUID', element.UUID)
            console.log('item.UUID', item.UUID)
            return element.UUID === item.UUID
          }
        )
        console.log('DELETE_CONTACT', findIndexContact)
        if (findIndexContact !== -1) {
          state.personalStore.listDetailInfoContactsPersonal.info.splice(
            findIndexContact,
            1
          )
          state.personalStore.contactsInfoHashPersonal.CTag = newCTag
        }
      })
    }
  },
  actions: {
    ADD_CONTACT_IN_STORAGE: async context => {
      try {
        const formData = new FormData()
        formData.append('Module', 'Contacts')
        formData.append('Method', 'GetContactStorages')
        const getContactsStorages = await axios({
          method: 'post',
          url: apiUrl,
          data: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        await context.commit(
          'ADD_CONTACT_IN_STORAGE',
          getContactsStorages.data.Result
        )
      } catch (err) {
        console.log('err', err)
      }
    },

    UPDATE_CONTACTS: async context => {
      try {
        await context.dispatch('UPDATE_CONTACTS_PERSONAL')
        await context.dispatch('UPDATE_CONTACTS_TEAM')
      } catch (err) {
        console.log('err', err)
      }
    },

    SELECT_STORAGE: async (context, index) => {
      try {
        context.commit('SELECT_STORAGE', index)
        const getSelectedStorage = context.getters.GET_SELECTED_STORAGE

        context.dispatch('GET_SELECTED_CONTACTS', getSelectedStorage)
      } catch (err) {
        console.log('err', err)
      }
    },

    GET_SELECTED_CONTACTS: async (context, storage) => {
      try {
        context.commit('ADD_SELECTED_CONTACTS', storage)
      } catch (err) {
        console.log('err', err)
      }
    },

    GET_DETAIL_INFO_SELECTED_CONTACT: async (context, index) => {
      try {
        context.commit('ADD_CONTACT_INFO', index)
      } catch (err) {
        console.log('err', err)
      }
    },

    UPDATE_ONE_CONTACT: async (context, data) => {
      try {
        const { type, UUID, CTag } = data
        const getCurrentHashPersonal =
          context.getters.personalStore.GET_CONTACTS_INFO_HASH_PERSONAL
        const findedIndexHash = getCurrentHashPersonal.Info.findIndex(
          item => item.UUID === UUID
        )
        context.commit('UPDATE_ONE_CONTACT_HASH', findedIndexHash, CTag)

        const getNewDataForContact = getNewDataContactsInfo(type, apiUrl, UUID) // axios request

        const getPersonalInfoContacts =
          context.getters.personalStore.GET_DETAIL_INFO_CONTACT_PERSONAL.Info
        const findedIndexPersonalInfoContact = getPersonalInfoContacts.findIndex(
          item => item.UUID === UUID
        )
        context.commit(
          'UPDATE_ONE_CONTACT',
          findedIndexPersonalInfoContact,
          getNewDataForContact.data.Result.Info,
          type
        )
      } catch (err) {
        console.log('err', err)
      }
    },

    ADD_NEW_HASH: async (context, array) => {
      try {
        const { newDataPersonal, newCTag } = array
        const getNewDataPersonal = await addNewHasForPersonal(newDataPersonal)
        await context.commit('ADD_NEW_HASH', {
          getNewDataPersonal: getNewDataPersonal.data.Result,
          newCTag
        })
      } catch (err) {
        console.log('err', err)
      }
    },
    DELETE_CONTACT: async (context, array) => {
      try {
        context.commit('DELETE_CONTACT', array)
      } catch (err) {
        console.log('err', err)
      }
    }
  },
  modules: {
    loginStore,
    personalStore,
    teamStore
  }
})
