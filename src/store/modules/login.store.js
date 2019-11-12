import axios from 'axios'

const state = {
  dataInputs: [
    {
      id: 1,
      label: 'Host',
      type: 'text',
      name: 'host'
    },
    {
      id: 2,
      label: 'Email',
      type: 'email',
      name: 'email'
    },
    {
      id: 3,
      label: 'Password',
      type: 'password',
      name: 'password'
    }
  ],

  data: {
    host: '',
    email: '',
    password: ''
  },
  isAuthenticated: localStorage.getItem('token') || '',
  status: ''
}

const getters = {
  GET_DATA_INPUTS: state => state.dataInputs,
  GET_DATA_FORM: state => state.data,
  IS_AUTHENTICATED: state => !!state.isAuthenticated,
  GET_AUTH_STATUS: state => state.status
}

const mutations = {
  CREATE_FORM: (state, data) => (state.data[data.name] = data.value),
  AUTH_REQUEST: state => (state.status = 'loading'),
  ADD_TOKEN: (state, token) => {
    state.isAuthenticated = token
    state.status = 'success'
  },
  AUTH_ERROR: state => (state.status = 'error'),
  LOGOUT: state => {
    state.status = ''
    state.isAuthenticated = ''
  }
}

const actions = {
  LOGIN: async (context, payload) => {
    try {
      const { host, email, password } = payload
      const formData = new FormData()
      formData.append('Module', 'Core')
      formData.append('Method', 'Login')
      formData.append(
        'Parameters',
        `{"Login":"${email}","Password":"${password}"}`
      )

      const responce = await axios({
        method: 'post',
        url: `${host}/?/Api/`,
        data: formData,
        config: { headers: { 'Content-Type': 'application/json' } }
      })

      const token = responce.data.Result.AuthToken
      localStorage.setItem('token', token)
      context.commit('ADD_TOKEN', token)
    } catch (err) {
      context.commit('AUTH_ERROR')
      localStorage.removeItem('token')
      console.log('err', err)
    }
  },
  LOGOUT: async context => {
    try {
      context.commit('LOGOUT')
      localStorage.removeItem('token')
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
