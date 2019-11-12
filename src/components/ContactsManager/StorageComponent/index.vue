<template>
  <div class="table-column table-column-left table-td-width">
    <div
      class="table-td"
      v-for="(contact, index) in this.getContacts"
      v-bind:key="index"
      @click="onSelectStorage(index)"
      :class="{ active : active_storage == index }"
    >{{contact.Name}}</div>
  </div>
</template>

<script>
export default {
  name: 'storage-component',
  data () {
    return {
      active_storage: undefined
    }
  },
  computed: {
    getContacts () {
      return this.$store.getters.GET_CONTACT_STORAGE
    },
    getSelectedStorage () {
      return this.$store.getters.GET_SELECTED_STORAGE
    }
  },
  methods: {
    onSelectStorage (index) {
      this.$store.dispatch('SELECT_STORAGE', index)
      this.active_storage = index
    }
  }
}
</script>
