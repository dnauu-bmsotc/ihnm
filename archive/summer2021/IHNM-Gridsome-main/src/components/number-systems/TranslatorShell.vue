<template>
  <div class="ns__translator">

    <div class="ns__translator__radix">
      <slot name="radix-content" />
    </div>

    <Dropdown class="ns__translator__types-dropdown">
      <template>
        <slot name="dropdown-options" />
      </template>
    </Dropdown>

    <div class="ns__translator__separator" />

    <div class="ns__translator__message--error"   v-if="error"        :data-hint="error"  >!</div>
    <div class="ns__translator__message--warning" v-else-if="warning" :data-hint="warning">!</div>
    <div class="ns__translator__message--nothing" v-else></div>

    <div class="ns__translator__number">
      <slot name="number-content" />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
        error: { default: "", type: String },
      warning: { default: "", type: String },
    },
  }

  export class TranslatorError extends Error {
    constructor(message) {
      super(message);
      this.name = "TranslatorError";
    }
  };
</script>

<style lang="scss" scoped>
  .ns__translator {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    border-radius: 3px;

    &__radix {
      flex: 0 1 280px;
      padding: 8px 8px 8px 4px;
      text-align: right;
    }
    &__number {
      flex: 1 1 200px;
      padding: 8px;
      text-align: left;
    }
    &__separator {
      align-self: stretch;
      min-width: 1px;
      width: 1px;
      background-color: $lowshadow-color;
    }
    &__message {
      &--error, &--warning, &--nothing {
        @include hintable;
        flex: 0 0 auto;
        width: 20px;
        height: 20px;
        text-align: center;
        color: white;
        padding: 0px;
        border-radius: 0px 3px 3px 0px;
        font-weight: bolder;
      }
      &--error {
        background-color: $error-color;
      }
      &--warning {
        background-color: $warning-color;
      }
      &--nothing {
        background-color: $highlight-color;
        color: $secondary-text-color;
      }
    }
    &--leading {
      background-color: $highlight-color;
    }
  }

  ::v-deep .dropdown__button {
    width: 20px;
    height: 20px;
    padding: 0px;
    border-radius: 3px 0px 0px 3px;
    color: $secondary-text-color;
  }
</style>
