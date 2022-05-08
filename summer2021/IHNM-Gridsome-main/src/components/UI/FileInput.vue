<template>
  <button class="file-input" @click="handleClick">
    <label class="file-input__label">
      <slot />
      <input class="file-input__input"
             type="file"
             ref="input"
             :access="access"
             :multiple="multiple"
             @change="handleChange"/>
    </label>
  </button>
</template>

<script>
  export default {
    props: {
        access: { default: "",    type: String  },
      multiple: { default: false, type: Boolean },
    },
    data() {
      return {
        dataFiles: null,
      };
    },
    mounted() {
      this.dataFiles = this.$refs.input.files;
    },
    methods: {
      handleChange(e) {
        this.$emit("fiChange", e);
      },
      handleClick(e) {
        this.$emit("click", e);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file-input {
    position: relative;
    &__label {
      display: inline-block;
      &::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }
    }
    &__input {
      display: none;
    }
  }
</style>
