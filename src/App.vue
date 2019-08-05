<template>
  <div id="app" style="margin: 20px 0;">
    <daterange-picker
      locale="de"
      submit-title="Ok"
      begin="2016-02-19T00:00:00.000+01:00"
    />
  </div>
</template>

<script>
import DaterangePicker from "./components/DaterangePicker";

export default {
  name: "app",
  components: {
    DaterangePicker
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 5vw;
}
</style>
