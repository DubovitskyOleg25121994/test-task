import axios from 'axios'
import { apiUrl } from '../configs/config'

// here we update contacts
// add new
// and delete
export async function methodUpdate (
  context,
  currentCTag,
  newCTag,
  newContactsInfo,
  currentHash,
  type
) {
  try {
    if (currentCTag !== newCTag) {
      await Promise.all([
        // find contact that we delete on api
      // then delete it in the store
        // add new hash
        deleteContacts(context, currentHash, newContactsInfo, newCTag),
        addNewContacts(context, currentHash, newContactsInfo, newCTag),
        // find differences, update ETag then update contacts
        updateContacts(type, newContactsInfo, currentHash, context)
      ])
      // if (newContactsInfo.Info.length > currentHash.Info.length) {

      // }

      // if (newContactsInfo.Info.length === currentHash.Info.length) {

      // }
    }
    if (currentCTag === newCTag) {
      // do nothing
      console.log("[ --- Contacts don't need to update --- ]")
    }
  } catch (err) {
    console.log('err', err)
  }
}

function deleteContacts (context, currentHash, newContactsInfo, newCTag) {
  const findedContactForDelete = findDir(context, currentHash, newContactsInfo)

  console.log('findedContactForDelete.length', findedContactForDelete.length)
  if (findedContactForDelete.length > 0) {
    context.dispatch('DELETE_CONTACT', { findedContactForDelete, newCTag })
  }
}

function addNewContacts (context, currentHash, newContactsInfo, newCTag) {
  findNewHash(context, currentHash, newContactsInfo, newCTag)
}

function updateContacts (type, newContactsInfo, currentHash, context) {
  console.log('newContactsInfo.Info.length', newContactsInfo.Info.length)
  console.log('currentHash.Info.length', currentHash.Info.length)

  const updatedValueCurrentHash =
    context.getters.GET_CONTACTS_INFO_HASH_PERSONAL
  console.log('updatedValueCurrentHash', updatedValueCurrentHash.Info.length)

  if (newContactsInfo.Info.length === updatedValueCurrentHash.Info.length) {
    const findedDif = findDifferenceInHases(currentHash, newContactsInfo, type)
    console.log('findedDif', findedDif)
    context.dispatch('UPDATE_HASH', findedDif)
  }
}

export function selectedStoragedData (storage, state) {
  if (storage.Id === 'personal') {
    state.selectedDataContacts =
      state.personalStore.listDetailInfoContactsPersonal
    state.personalStore.contactsInfoHashPersonal.CTag =
      state.personalStore.listDetailInfoContactsPersonal.CTag
  }
  if (storage.Id === 'team') {
    state.selectedDataContacts = state.teamStore.listDetailInfoContactsTeam
    state.currentHashContacts = state.teamStore.contactsInfoHashTeam
    state.teamStore.contactsInfoHashTeam.CTag =
      state.teamStore.listDetailInfoContactsTeam.CTag
  }
}

export function getNewDataContacts (nameStorage, apiUrl) {
  const formData = new FormData()
  formData.append('Module', 'Contacts')
  formData.append('Method', 'GetContactsInfo')
  formData.append('Parameters', `{"Storage":"${nameStorage}"}`)

  return axios({
    method: 'post',
    url: apiUrl,
    data: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function getNewDataContactsInfo (nameStorage, apiUrl, Uids) {
  const formData = new FormData()
  formData.append('Module', 'Contacts')
  formData.append('Method', 'GetContactsByUids')
  formData.append(
    'Parameters',
    `{"Storage":"${nameStorage}", "Uids":[${Uids}]}`
  )

  return axios({
    method: 'post',
    url: apiUrl,
    data: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}

function findDifferenceInHases (currentHash, newContactsInfo, type) {
  console.log('currentHash', currentHash.Info.length)
  console.log('newContactsInfo', newContactsInfo.Info.length)
  const difference = []
  currentHash.Info.forEach((a, i) => {
    Object.keys(a).forEach(k => {
      if (a[k] !== newContactsInfo.Info[i][k]) {
        difference.push({
          index: i,
          UUID: newContactsInfo.Info[i]['UUID'],
          ETag: newContactsInfo.Info[i][k],
          type
        })
      }
    })
  })
  console.log('difference', difference)
  return difference
}

export async function updatePersonalData (
  context,
  arrayUids,
  data,
  apiUrl,
  updateSelectedStorage,
  type
) {
  try {
    if (type === 'personal') {
      const getNewDatafromApi = await getNewDataContactsInfo(
        type,
        apiUrl,
        arrayUids
      )

      console.log(
        'getNewDatafromApi [updatePersonalData]',
        getNewDatafromApi.data
      )

      data.forEach((item, i) => {
        const { index, ETag, UUID } = item
        context.commit('UPDATE_HASH_PERSONAL', { index, ETag })
        context.commit('UPDATE_CONTACT_INFO', {
          UUID,
          newData: getNewDatafromApi.data.Result,
          index: i
        })

        const data = {
          info: context.state.listDetailInfoContactsPersonal.info,
          CTag: context.state.listDetailInfoContactsPersonal.CTag
        }

        context.commit('ADD_DETAIL_INFO_CONTACT_PESONAL', data)
        if (updateSelectedStorage && updateSelectedStorage.Id === 'personal') {
          context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
        }
      })
    }
  } catch (err) {
    console.log('err', err)
  }
}

export async function updateTeamData (
  context,
  arrayUids,
  data,
  apiUrl,
  updateSelectedStorage,
  type
) {
  try {
    if (type === 'team') {
      const getNewDatafromApi = await getNewDataContactsInfo(
        type,
        apiUrl,
        arrayUids
      )

      data.forEach(async (item, i) => {
        const { ETag, UUID } = item
        context.commit('UPDATE_HASH_TEAM', { index: i, ETag })
        context.commit('UPDATE_CONTACT_INFO', {
          UUID,
          newData: getNewDatafromApi.data.Result,
          index: i
        })

        const data = {
          info: context.getters.GET_DETAIL_INFO_CONTACT_TEAM.info,
          CTag: context.getters.GET_DETAIL_INFO_CONTACT_TEAM.CTag
        }

        context.commit('ADD_DETAIL_INFO_CONTACT_TEAM', data)
        if (updateSelectedStorage && updateSelectedStorage.Id === 'team') {
          context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
}

function findNewHash (context, currentHash, newContactsInfo, newCTag) {
  const arrOut = newContactsInfo.Info.filter(e =>
    currentHash.Info.every(k => k.UUID !== e.UUID)
  )

  console.log('findNewHash', arrOut.length)
  if (arrOut.length > 0) {
    const newDataPersonal = []
    arrOut.forEach(item => newDataPersonal.push(`"${item.UUID}"`))
    context.dispatch('ADD_NEW_HASH', { newDataPersonal, newCTag })
  }
}

export async function addNewHasForPersonal (newDataPersonal) {
  try {
    return getNewDataContactsInfo('personal', apiUrl, newDataPersonal)
  } catch (err) {
    console.log('err', err)
  }
}

// function find contact that we don't have in new array from api
export function findDir (context, currentHash, newContactsInfo) {
  const arrOut = currentHash.Info.filter(e =>
    newContactsInfo.Info.every(k => k.UUID !== e.UUID)
  )
  return arrOut
}

// export async function deleTeHasForPersonal (newDataPersonal) {
//   try {
//     return getNewDataContactsInfo('personal', apiUrl, newDataPersonal)
//   } catch (err) {
//     console.log('err', err)
//   }
// }
