import SelectImprove from "./SelectImprove.js";

Vue.use(vuelidate.default);

function alpha(value) {
  return /^[А-Яа-яA-Za-z]*$/.test(value);
}

window.clientFormApp = new Vue({
  el: "#clientForm",
  data: {
    lastname: "",
    firstname: "",
    patronymic: "",
    birthDate: "",
    phone: "",
    gender: "0",
    clientGroup: [],
    doctor: "0",
    sms: false,

    postIndex: "",
    country: "",
    state: "",
    city: "",
    street: "",
    house: "",

    document: "0",
    series: "",
    number: "",
    issuedBy: "",
    issueDate: ""
  },
  validations: {
    lastname: { 
      required: validators.required,
      minLength: validators.minLength(2),
      alpha
    },
    firstname: { 
      required: validators.required,
      minLength: validators.minLength(2),
      alpha
    },
    patronymic: {
      minLength: validators.minLength(2),
      alpha
    },
    birthDate: {
      required: validators.required
    },
    phone: {
      numeric: validators.numeric,
      minLength: validators.minLength(11)
    },
    clientGroup: {
      required: function(value) { return this.clientGroup.length > 0 }
    },
    postIndex: {
      numeric: validators.numeric,
      minLength: validators.minLength(6)
    },
    city: {
      required: validators.required
    },
    document: {
      required: (value) => value != "0"
    },
    series: {
      minLength: validators.minLength(4),
      numeric: validators.numeric
    },
    number: {
      minLength: validators.minLength(6),
      numeric: validators.numeric
    },
    issueDate: {
      required: validators.required
    }
  },
  mounted: function() {
    new SelectImprove(document.getElementById("gender"));
    new SelectImprove(document.getElementById("clientGroup"), true);
    new SelectImprove(document.getElementById("doctor"));
    new SelectImprove(document.getElementById("document"));
  },
  methods: {
    toUpCaseFirst: function(text) {
      if(text.length > 0) {
        text = text[0].toUpperCase() + text.slice(1, text.length);
        return text;
      }else {
        return text;
      }
    },
    toggleCheckbox(event) {
      let el = event.target;

      if(el.checked) {
        el.className = "active"
      }else {
        el.removeAttribute("class");
      }
    },
    submit() {
      if(this.$v.$invalid) {
        this.$v.$touch();
        alert("Не все поля прошли проверку")
      }else {
        alert("Форма отправлена!")
      }
    }
  }
});