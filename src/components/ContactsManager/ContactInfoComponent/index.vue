<template>
  <div class="table-column selected-contact table-column-left">
    <div v-if="!this.getSelectedContact"></div>
    <div class="selected-contact-info" v-else>
      <div class="table-td-info">
        <div class="table-td-info-name">Name</div>
        <div>{{this.getSelectedContact.FullName}}</div>
      </div>
      <div class="table-td-info">
        <div class="table-td-info-name">Email</div>
        <div>{{this.getSelectedContact.PersonalEmail || this.getSelectedContact.BusinessEmail}}</div>
      </div>
      <div class="table-td-info">
        <div class="table-td-info-name">Phone</div>
        <div>{{this.getSelectedContact.PersonalPhone}}</div>
      </div>
      <div class="table-td-info">
        <div class="table-td-info-name">Address</div>
        <div>{{this.getSelectedContact.PersonalAddress}}</div>
      </div>
      <div class="table-td-info">
        <div class="table-td-info-name">Skype</div>
        <div>{{this.getSelectedContact.Skype}}</div>
      </div>
      <div class="table-td-info">
        <div class="table-td-info-name">Facebook</div>
        <div>{{this.getSelectedContact.Facebook}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'contact-info-component',
  computed: {
    getSelectedContact () {
      return this.$store.getters.GET_DETAIL_INFO_CONTACT
    }
  }
}
</script>

<style lang="scss">
.table-td-info {
  display: flex;
  flex-direction: row;
  padding: 10px;
  border-bottom: 1px solid rgb(176, 176, 176);
  &-name {
    margin-left: 10px;
    min-width: 75px;
  }
}
</style>
