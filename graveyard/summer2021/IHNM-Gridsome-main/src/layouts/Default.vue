<template>
  <div id="layout">
    <header class="header">
      <h2>{{title}}</h2>
      <button @click="changeLocale('en')" :disabled="currentLocale==='en'">en</button>
      <button @click="changeLocale('ru')" :disabled="currentLocale==='ru'">рус</button>
    </header>
    <slot />
    <footer class="footer">
      <div class="footer__credits">
        <p>Icons made by <a href="https://www.flaticon.com/authors/google" title="Google">Google</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
        <p>{{$t("defaultLayout.contribute")}}</p>
      </div>
    </footer>
  </div>
</template>

<script>
  export default {
    props: {
      title: { default: "", type: String },
    },
    data() {
      return {
        currentLocale: this.$i18n.locale.toString(),
      };
    },
    mounted() {
      let locale = window.localStorage.getItem("locale");
      if (locale) {
        this.changeLocale(locale);
      }
      else {
        window.localStorage.setItem("locale", this.currentLocale);
      }
    },
    methods: {
      changeLocale(locale) {
        if (locale !== this.currentLocale) {
          window.localStorage.setItem("locale", locale);
          this.currentLocale = locale;
          this.$router.push({ path: this.$tp(this.$route.path, locale, true) });
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .header {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-items: flex-start;
    h2 {
      flex: 1 1 auto;
      display: inline-block;
      align-self: flex-start;
      margin: 0px;
      padding: 0px;
      border: 0px;
    }
    button {
      flex: 0 0 auto;
      margin: 4px;
    }
  }
  .footer {
    &__credits {
      flex: 1 0 auto;
      text-align: center;
      font-size: 14px;
    }
  }
</style>
