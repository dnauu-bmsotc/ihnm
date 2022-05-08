<template>
  <div class="dropdown__item"
       tabindex="0"
       @click="handleClick"
  ><slot/></div>
</template>

<script>
  export default {
    methods: {
      handleClick(e) {
        this.$emit("click", e);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dropdown__item {
    @include tabbable;
    padding: 4px 16px 4px 8px;
    display: block;
    box-sizing: border-box;
    white-space: nowrap;
    width: 100%;
    background-color: white;
    &:hover {
      background-color: $highlight-color;
    }
    &:active {
      background-color: $lowshadow-color;
    }
  }
</style>
