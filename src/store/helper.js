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
        await deleteContacts(context, currentHash, newContactsInfo, newCTag),
        // add new hash
        // find differences, update ETag then update contacts
        await addNewContacts(context, currentHash, newContactsInfo, newCTag),
        await updateContacts(type, newContactsInfo, currentHash, context)
      ])
    }
    if (currentCTag === newCTag) {
      // do nothing
      console.log("[ --- Contacts don't need to update --- ]")
    }
  } catch (err) {
    console.log('err', err)
  }
}

async function deleteContacts (context, currentHash, newContactsInfo, newCTag) {
  try {
    const findedContactForDelete = await findDir(
      context,
      currentHash,
      newContactsInfo
    )
    if (findedContactForDelete.length > 0) {
      await context.dispatch('DELETE_CONTACT', {
        findedContactForDelete,
        newCTag
      })
    }
    return true
  } catch (err) {
    console.log('err', err)
  }
}

async function addNewContacts (context, currentHash, newContactsInfo, newCTag) {
  try {
    return findNewHash(context, currentHash, newContactsInfo, newCTag)
  } catch (err) {
    console.log('err', err)
  }
}

function updateContacts (type, newContactsInfo, currentHash, context) {
  // const updatedValueCurrentHash =
  //   context.getters.GET_CONTACTS_INFO_HASH_PERSONAL

  // if (newContactsInfo.Info.length === updatedValueCurrentHash.Info.length) {
  const findedDif = findDifferenceInHases(currentHash, newContactsInfo, type)
  context.dispatch('UPDATE_HASH', findedDif)
  return true
  // }
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

export function getNewDataContacts (nameStoasrage, apiUrl) {
  try {
    const formData = new FormData()
    formData.append('Module', 'Contacts')
    formData.append('Method', 'GetContactsInfo')
    formData.append('Parameters', `{"Storage":"${nameStoasrage}"}`)

    return axios({
      method: 'post',
      url: apiUrl,
      data: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
  } catch (err) {
    console.log('err', err)
  }
}

export async function getNewDataContactsInfo (nameStorage, apiUrl, Uids) {
  try {
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
  } catch (err) {
    console.log('err', err)
  }
}

function findDifferenceInHases (currentHash, newContactsInfo, type) {
  try {
    const difference = []
    currentHash.Info.forEach(async (a, i) => {
      if (a) {
        Object.keys(a).forEach(async k => {
          if (a[k] !== newContactsInfo.Info[i][k]) {
            if (k) {
              if (newContactsInfo.Info[i] && newContactsInfo.Info[i]['UUID']) {
                difference.push({
                  index: i,
                  UUID: newContactsInfo.Info[i]['UUID'],
                  ETag: newContactsInfo.Info[i][k],
                  type
                })
              }
            }
          }
        })
      }
    })
    return difference
  } catch (err) {
    console.log('err', err)
  }
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

      data.forEach(async (item, i) => {
        const { index, ETag, UUID } = item
        await context.commit('UPDATE_HASH_PERSONAL', { index, ETag })
        await context.commit('UPDATE_CONTACT_INFO', {
          UUID,
          newData: getNewDatafromApi.data.Result,
          index: i
        })

        const data = {
          info: context.state.listDetailInfoContactsPersonal.info,
          CTag: context.state.listDetailInfoContactsPersonal.CTag
        }

        await context.commit('ADD_DETAIL_INFO_CONTACT_PESONAL', data)
        if (updateSelectedStorage && updateSelectedStorage.Id === 'personal') {
          await context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
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

        await context.commit('ADD_DETAIL_INFO_CONTACT_TEAM', data)
        if (updateSelectedStorage && updateSelectedStorage.Id === 'team') {
          await context.commit('ADD_SELECTED_CONTACTS', updateSelectedStorage)
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
}

async function findNewHash (context, currentHash, newContactsInfo, newCTag) {
  try {
    const arrOut = newContactsInfo.Info.filter(async e =>
      currentHash.Info.every(async k => k.UUID !== e.UUID)
    )

    if (arrOut.length > 0) {
      const newDataPersonal = []
      arrOut.forEach(async item => newDataPersonal.push(`"${item.UUID}"`))
      await context.dispatch('ADD_NEW_HASH', { newDataPersonal, newCTag })
    }
    return true
  } catch (err) {
    console.log('err', err)
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
export async function findDir (context, currentHash, newContactsInfo) {
  try {
    const arrOut = currentHash.Info.filter(async e =>
      newContactsInfo.Info.every(async k => k.UUID !== e.UUID)
    )
    return arrOut
  } catch (err) {
    console.log('err', err)
  }
}
