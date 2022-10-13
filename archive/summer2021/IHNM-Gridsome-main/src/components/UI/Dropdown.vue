<template>
  <div class="dropdown">

    <button class="dropdown__button" @click="handleButtonClick">
      <slot name="label"><StatesIcon :images="['down-arrow.svg']" /></slot>
    </button>

    <div v-if="toggled" class="dropdown__menu">
      <slot />
    </div>

  </div>
</template>

<script>
  export default {
    data: () => ({
      toggled: false,
    }),
    methods: {
      handleButtonClick() {
        if (!this.toggled) {
          this.toggled = true;
          setTimeout(() => {
            window.addEventListener(
              "click",
              function(e) { this.toggled = false; }.bind(this),
              { once: true }
            );
          }, 0);
        }
      },
    },
  };
</script>


<style lang="scss" scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    text-align: left;
    &__button {
      text-align: center;
      display: block;
      text-decoration: none;
    }
    &__menu {
      position: absolute;
      min-width: 200px;
      background-color: white;
      border-radius: 3px;
      padding: 0px;
      z-index: 1;
      box-shadow: 2px 2px 8px $text-color;
    }
  }
</style>
