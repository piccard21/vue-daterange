import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import SvgIcon from "vue-svgicon";
import dictionaries from "./translations/index.js";

Vue.config.productionTip = false;

Vue.prototype.$legends = dictionaries;

Vue.use(SvgIcon, {
  tagName: "svgicon"
});

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
