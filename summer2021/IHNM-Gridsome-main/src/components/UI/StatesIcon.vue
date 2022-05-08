<template>
  <div class="states-icon" @click="onClick">
    <template v-for="(path, index) of images">
      <g-image v-if="state === index"
               quality="25"
               :src="require(`!!assets-loader!@/assets/icons/${path}`)" />
    </template>
  </div>
</template>

<script>
  export default {
    props: {
      images: { default: ()=>([]), type: Array },
      state: { default: 0, type: Number },
    },
    data() {
      return {
        dataState: this.state,
      };
    },
    methods: {
      onClick(e) {
        this.$emit("click", e);
      }
    },
    watch: {
      images: function(newVal, oldVal) {

      },
      state: function(newVal, oldVal) {
        this.state = this.dataState = newVal;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .states-icon {
    display: inline-block;
    vertical-align: middle;
    margin: 0px;
    width: 10px;
    height: 10px;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
</style>
