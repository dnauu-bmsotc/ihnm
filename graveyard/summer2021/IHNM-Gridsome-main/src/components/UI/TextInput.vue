<!-- TextInput won't accept any input if v-model is not provided -->

<template>
  <div :class="{'text-input': true, 'text-input--focused': dataFocused}"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave">
    <textarea :class='{
                "text-input__textarea": true,
                "text-input__textarea--horizontal": stretchAxis === "x",
                "text-input__textarea--vertical": stretchAxis === "y"
              }'
              :value="dataValue"
              :placeholder="placeholder"
              :data-stretch-axis="stretchAxis"
              @input="handleInput"
              @focus="handleFocus"
              @blur="handleBlur"
              @keypress="handleKeypress"
              @keydown="handleKeydown"
              ref="textarea"
              spellcheck="false"/>
  </div>
</template>

<script>
  let resizeObserver = null;

  export default {
    props: {
            value: { default: "",  type: String },
      placeholder: { default: "",  type: String },
      stretchAxis: { default: "y", type: String }, // "x" or "y" or ""
    },
    data() {
      return {
        dataValue: this.value,
        dataFocused: false,
      };
    },
    mounted() {
      if (!resizeObserver) {
        // ResizeObserver is client-only so initialization is here
        resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            this.recalculateSize(entry.target);
          }
        });
      }
      resizeObserver.observe(this.$refs.textarea);
    },
    beforeDestroy() {
      resizeObserver.unobserve(this.$refs.textarea);
    },
    methods: {
      handleInput(e) {
        this.dataValue = e.target.value;
        this.$emit("input", this.dataValue);
      },
      handleFocus(e) {
        this.dataFocused = true;
        this.$emit("focus", e);
      },
      handleBlur(e) {
        this.dataFocused = false;
        this.$emit("blur", e);
      },
      handleKeypress(e) {
        this.$emit("keypress", e);
        if (e.keyCode === 13 && this.stretchAxis === "x") {
          e.preventDefault();
        }
      },
      handleKeydown(e) {
        this.$emit("keydown", e);
        if (e.keyCode === 13 && this.stretchAxis === "x") {
          e.preventDefault();
        }
      },
      handleMouseEnter(e) {
        this.$emit("mouseenter", e);
      },
      handleMouseLeave(e) {
        this.$emit("mouseleave", e);
      },
      recalculateSize(element) {
        if (element.dataset.stretchAxis === "x") {
          // recalculate width
          element.style.width = "0px";
          let paddingLeft = +window.getComputedStyle(element, null).getPropertyValue("padding-left").slice(0, -2);
          let paddingRight = +window.getComputedStyle(element, null).getPropertyValue("padding-right").slice(0, -2);
          element.style.width = element.scrollWidth + paddingLeft + paddingRight + "px";
        }
        // recalculate height
        element.style.height = "0px";
        let paddingTop = +window.getComputedStyle(element, null).getPropertyValue("padding-top").slice(0, -2);
        let paddingBottom = +window.getComputedStyle(element, null).getPropertyValue("padding-bottom").slice(0, -2);
        if (element.scrollWidth > element.clientWidth) {
          element.style.height = element.scrollHeight + window.scrollbarWidth - paddingTop - paddingBottom + "px";
        }
        else {
          element.style.height = element.scrollHeight - paddingTop - paddingBottom + "px";
        }
      },
      focus(obj) {
        this.$refs.textarea.focus(obj)
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        this.dataValue = newVal;
      },
      dataValue: function(newVal, oldVal) {
        this.dataValue = this.value;
        // next tick is used because textarea size should be computed based on actual value.
        // If text is changed programmatically, its value is not updated untill next tick.
        this.$nextTick(function(){
          this.recalculateSize(this.$refs.textarea)
        }.bind(this));
      },
    }
  };
</script>

<style lang="scss" scoped>
  .text-input {
    display: inline-block;
    vertical-align: middle;
    border-width: 0px;
    border-bottom: 1px solid $lowshadow-color;
    &--focused {
      border-bottom: 1px solid $text-color;
    }
    &__textarea {
      display: inline-block;
      vertical-align: bottom;
      width: calc(100% - 16px);
      padding: 8px 8px 1px 8px;
      margin: 0px;
      border-width: 0px;
      overflow: auto;
      resize: none;
      box-sizing: content-box;
      background-color: transparent;
      &--vertical {
        overflow-wrap: break-word;
      }
      &--horizontal {
        overflow-wrap: normal;
        white-space: nowrap;
      }
    }
  }
</style>
