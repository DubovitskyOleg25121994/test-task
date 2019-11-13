<template>
  <div class="container">
    <header-component />
    <div class="table">
      <storage-components />
      <div class="table-column table-column-left ">
        <div class='scroll'>
          <div
            class="table-td"
            v-for="(contactInfo, index) in this.getListContacts"
            v-bind:key="index+100"
            v-on:click="onSelectContact(index)"
            :class="{ active : active_el == index }"
          >
            <div v-if="contactInfo && contactInfo.FullName">{{contactInfo.FullName}}</div>
            <div v-if="contactInfo && contactInfo.FullName">{{contactInfo.ViewEmail}}</div>
          </div>
        </div>
      </div>
      <contact-info-component />
    </div>
  </div>
</template>

<script>
import HeaderComponent from './HeaderComponent/index.vue'
import StorageComponents from './StorageComponent/index.vue'
import ContactInfoComponent from './ContactInfoComponent/index.vue'

export default {
  name: 'contacts-maneger',
  components: {
    'header-component': HeaderComponent,
    'storage-components': StorageComponents,
    'contact-info-component': ContactInfoComponent
  },
  data () {
    return {
      active_el: undefined
    }
  },
  created () {
    this.$store.dispatch('ADD_CONTACT_IN_STORAGE')
    this.$store.dispatch('GET_CONTACT_INFO_PERSONAL')
    this.$store.dispatch('GET_CONTACT_INFO_TEAM')
  },
  computed: {
    getContacts () {
      return this.$store.getters.GET_CONTACT_STORAGE
    },
    getListContacts () {
      return this.$store.getters.GET_SELECTED_CONTACTS
    }
  },
  methods: {
    onSelectContact (index) {
      this.$store.dispatch('GET_DETAIL_INFO_SELECTED_CONTACT', index)
      this.active_el = index
    },

    onSelectStorage (index) {
      this.active_storage = index
    }
  }
}
</script>

<style lang="scss">
.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgb(176, 176, 176);
  border-bottom: 0;
  max-width: 100%;
  height: 50px;
  padding: 0 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);

  &-title {
    margin: 0;
    font-size: 22px;
  }

  &-option {
    display: flex;
    flex-direction: row;
    font-size: 18px;

    &-element:nth-last-child(1) {
      margin-left: 25px;
    }
    &-element {
      img {
        cursor: pointer;
        color: rgb(115, 115, 115);
        width: 15px;
      }
    }
  }
}

.table {
  display: flex;
  flex-direction: row;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgb(176, 176, 176);
  min-height: 500px;

  &-column {
    width: 100%;
    overflow: hidden;
    &-left {
      border: 1px solid #b0b0b0;
      border-bottom: 0;
      border-right: 0;
      border-top: 0;
    }
  }

  &-td {
    border-bottom: 1px solid rgb(176, 176, 176);
    padding: 10px;
    min-height: 23px;
    &-width {
      width: 60%;
    }
  }

  &-selected-contact {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .active {
    background-color: rgb(244, 244, 244);
  }

  .scroll {
    overflow: scroll;
    overflow-x: hidden;
    width: 100%;
    height: 500px;
    padding: 5px;
    border: solid 1px rgb(244, 244, 244);
  }
}
</style>
