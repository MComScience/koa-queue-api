"use strict"

document.addEventListener("DOMContentLoaded", function() {
  var app = new Vue({
    el: "#app",
    data: {
      loading: false,
      user: null,
      client: null
    },
    mounted() {
      this.fetchUser()
    },
    methods: {
      fetchUser: async function() {
        var urlParams = new URLSearchParams(window.location.search)
        try {
          this.loading = true
          const { data } = await axios.get(`/v1/oauth2/user?client_id=${urlParams.get("client_id")}`)
          this.user = data.user
          this.client = data.client
          this.loading = false
        } catch (error) {
          this.loading = false
          this.$notify.error({
            title: "Error",
            message: error.response.data.message
          })
        }
      }
    }
  })
})
