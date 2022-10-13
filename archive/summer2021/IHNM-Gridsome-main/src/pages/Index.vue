<template>
  <Layout :title="$t('home.title')">
    <main>
      <ul>
        <li><g-link :to="'/'+getLocale()+'number-systems'">{{$t("home.nsLink")}}</g-link></li>
        <li><g-link :to="'/'+getLocale()+'wheel-of-fortune'">{{$t("home.wofLink")}}</g-link></li>
      </ul>
    </main>
  </Layout>
</template>

<script>
  export default {
    metaInfo() {
      return {
        title: this.$t("home.title"),
      };
    },
    methods: {
      getLocale() {
        if ((typeof window !== "undefined") && window.localStorage.getItem("locale")) {
          return window.localStorage.getItem("locale") + "/";
        }
        else {
          return "";
        }
      },
    },
  };
</script>

<style lang="scss" scoped>

</style>
