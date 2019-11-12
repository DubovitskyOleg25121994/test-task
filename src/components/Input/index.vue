<template>
  <input v-bind="$attrs" @input="onChangeInput" />
</template>

<script>
export default {
  name: 'app-input',
  data () {
    return {
      newData: '',
      nameInput: ''
    }
  },
  methods: {
    onChangeInput (event) {
      this.newData = event.target.value
      this.nameInput = event.target.name
      this.$store.commit('CREATE_FORM', {
        name: this.nameInput,
        value: this.newData
      })
    }
  }
}
</script>
