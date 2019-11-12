<template>
  <div class="header">
    <h1 class="header-title">Contacts manager</h1>
    <div class="header-option">
      <div class="header-option-element" @click="updateContacts">
        <img src="../../../assets/icons/refresh-button.png" alt="icon_refresh" />
      </div>
      <div class="header-option-element" @click="logout">
         <img src="../../../assets/icons/exit-to-app-button.png" alt="icon_logout" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'header-component',
  methods: {
    updateContacts () {
      this.$store.dispatch('UPDATE_CONTACTS')
    },
    logout () {
      this.$store.dispatch('LOGOUT').then(() => this.$router.push('/'))
    }
  }
}
</script>
