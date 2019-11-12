<template>
  <div class="container">
    <div class="app-form">
      <h1 class="app-form-title">Contacts manager</h1>
      <form @submit="onSubmit">
        <div class="app-form-content" v-for="data in dataInputs" v-bind:key="data.id">
          <label class="app-form-label">{{data.label}}</label>
          <app-input class="app-form-input" v-bind:type="data.type" v-bind:name="data.name" />
        </div>
        <button type="submit" class="app-form-button">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import Input from '../Input/index.vue'
export default {
  name: 'app-logo',
  components: {
    'app-input': Input
  },
  computed: {
    dataInputs () {
      return this.$store.getters.GET_DATA_INPUTS
    },
    getDataForm () {
      return this.$store.getters.GET_DATA_FORM
    },
    isAuthenticated () {
      return this.$store.getters.IS_AUTHENTICATED
    }
  },
  methods: {
    async onSubmit (event) {
      event.preventDefault()
      const { host, email, password } = this.getDataForm
      if (host && email && password) {
        await this.$store.dispatch('LOGIN', {
          host,
          email,
          password
        })

        const isAuthenticated = this.isAuthenticated
        if (isAuthenticated) {
          this.$router.push('/contacts-manager')
        } else if (!isAuthenticated) {
          alert('Wrong password or email')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  max-width: 800px;
  margin: 80px auto;
}

.app {
  &-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-items: center;

    &-title {
      font-size: 28px;
      color: #000;
    }

    &-content {
      border-bottom: 1px solid #000;
      margin-bottom: 10px;
    }

    &-label {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: column;
      min-width: 50px;
      font-size: 16px;
      color: rgb(117, 117, 117);
    }

    &-input {
      font-size: 18px;
      border: 0;
      border-bottom: 1px;
      color: rgb(117, 117, 117);

      &:focus,
      &:active {
        outline: 0;
        border-bottom: 1px solid rgb(102, 102, 102)
      }
    }

    &-button {
      width: 100%;
      height: 35px;
      background-color: rgb(196, 196, 196);
      color: #fff;
      border-radius: 10px;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
