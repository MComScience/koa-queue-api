"use strict"

document.addEventListener("DOMContentLoaded", function() {
  var app = new Vue({
    el: "#app",
    data: {
      form: {
        username: "",
        password: ""
      },
      error: "",
      submitted: false
    },
    methods: {
      onSubmit: async function() {
        try {
          this.submitted = true
          this.error = ""
          const { data } = await axios.post(`/v1/oauth2/login`, this.form)
          this.submitted = false
          window.location.href = data.redirect_uri
        } catch (error) {
          this.submitted = false
          this.error = error.response.data.message
        }
      }
    }
  })
})
