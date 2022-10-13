<template>
  <Layout>
    <main>

      <h2>404</h2>
      <h3>Page Not Found</h3>
      <p class="pnf__toHome">
        <g-link to="/">{{$t("pnf.homeLink")}}</g-link>
      </p>

    </main>
  </Layout>
</template>

<script>
  export default {
    metaInfo: {
      title: "404",
    },
  };
</script>

<style lang="scss" scoped>
  h2 {
    font-size: 128px;
    margin: 32px auto;
    text-align: center;
  }
  h3 {
    font-size: 32px;
    margin: 32px 0px;
    text-align: center;
  }
  .pnf {
    &__toHome {
      text-align: center;
    }
  }
</style>
