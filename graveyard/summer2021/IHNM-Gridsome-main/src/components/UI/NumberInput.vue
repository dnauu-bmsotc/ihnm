<template>
  <div class="number-input">
    <button class="number-input__decrease-button"
            @click="onDecrease"
            v-if="crease">−</button>

   <TextInput :stretchAxis="stretchAxis"
              :placeholder="placeholder"
              v-model="dataValue"
              @input="onInput"
              @blur="onBlur"
              @focus="onFocus"/>

    <button class="number-input__increase-button"
            @click="onIncrease"
            v-if="crease">+</button>
  </div>
</template>

<script>
  export default {
    props: {
      stretchAxis: { default: "y",  type: String  },
            value: { default: "0",  type: String  },
           crease: { default: true, type: Boolean },
      placeholder: { default: "",   type: String  },
    },
    data() {
      return {
        dataValue: this.value,
      };
    },
    methods: {
      onDecrease(e) {
        this.$emit("decrease");
      },
      onIncrease(e) {
        this.$emit("increase");
      },
      onInput(e) {
        this.$emit("input", this.dataValue);
      },
      onBlur(e) {
        this.$emit("blur");
      },
      onFocus(e) {
        this.$emit("focus");
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        this.dataValue = newVal;
      },
      dataValue: function(newVal, oldVal) {
        this.dataValue = this.value;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .number-input {
    vertical-align: middle;
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: stretch;

    &__decrease-button,
    &__increase-button {
      flex: 0 0 auto;
      padding: 0;
      width: 16px;
      margin: -4px 0px 0px 0px;
      color: $secondary-text-color;
      border-bottom-width: 1px;
      border-radius: 5px 5px 0px 0px;
      background-color: #f9f5f3;
      text-decoration: none;
    }

    .text-input {
      flex: 1 1 64px;
    }
  }
</style>
