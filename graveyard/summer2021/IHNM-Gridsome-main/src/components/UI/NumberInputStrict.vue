<template>
  <NumberInput :value="dataPresentation"
               :crease="step !== 0"
               :placeholder="placeholder"
               class="number-input--strict"
               stretchAxis="x"
               @input="handleInput"
               @increase="handleIncrease"
               @decrease="handleDecrease"
               @focus="handleFocus"
               @blur="handleBlur"/>
</template>

<script>
  import BigNumber from "bignumber.js";

  export default {
    props: {
       placeholder: { default: "",       type: String },
              mode: { default: "number", type: String }, // number or bignumber
             value: { default: 0                      },
          minValue: { default: 0                      },
          maxValue: { default: 100                    },
      defaultValue: {                                 },
              step: { default: 1                      },
      maxPrecision: { default: 0                      },
    },
    data: function() {
      return {
        dataPresentation: this.value.toString(),
        dataValue:        new BigNumber(this.value),
        dataMinValue:     new BigNumber(this.minValue),
        dataMaxValue:     new BigNumber(this.maxValue),
        dataDefaultValue: new BigNumber(this.defaultValue ? this.defaultValue : this.value),
        dataMaxPrecision: new BigNumber(this.maxPrecision),
        dataStep:         new BigNumber(this.step),
        dataDotAtTheEnd:  false,
      };
    },
    created() {
      this.dataDotAtTheEnd = !this.dataValue.isInteger();
    },
    methods: {
      handleDecrease(event) {
        this.dataValue = this.limitValue(this.dataValue.minus(this.step));
        this.dataPresentation = this.dataValue.toString();
        this.$emit("input", this.publicDataValue);
      },
      handleIncrease(event) {
        this.dataValue = this.limitValue(this.dataValue.plus(this.step));
        this.dataPresentation = this.dataValue.toString();
        this.$emit("input", this.publicDataValue);
      },
      handleInput(text) {
        this.dataDotAtTheEnd = false;
        if (text === "" || text === "-" || text === "−") {
          this.dataPresentation = text;
        }
        else {
          text = text.replace(/\s+/g, "");
          let presentation = "";
          let negative = false;
          let i = 0;
          let exactness = 0;
          let separatorFound = false;

          // Ведущие нули
          while((text[i] === "0") && i < text.length - 1 && (text[i + 1] !== ".") && (text[i + 1] !== ",")) { i++; }
          // Остальные символы
          for (; (i < text.length) && (this.dataMaxPrecision.gte(exactness)); i++) {
            // Обрабатываются только цифры, и символы знака
            if (text[i] >= "0" && text[i] <= "9") {
              presentation += text[i];
              if (separatorFound) {
                exactness += 1;
              }
            }
            // Вставка знака в любом месте меняет знак числа
            else if (text[i] === "-" || text[i] === "−") {
              negative = !negative;
            }
            else if (text[i] === "+") {
              negative = false;
            }
            else if (!separatorFound && (!this.dataMaxPrecision.isZero()) && (text[i] === "." || text[i] === ",")) {
              presentation += ".",
              separatorFound = true;
            }
          }
          if (exactness === 0 && separatorFound) {
            this.dataDotAtTheEnd = true;
          }
          if (presentation !== "" && presentation !== ".") {
            presentation = (negative ? "-" : "") + presentation;
            let value = new BigNumber(presentation);
            let limitedValue = this.limitValue(value);
            this.dataValue = limitedValue;
            if (!limitedValue.eq(value)) {
              presentation = limitedValue.toString();
            }
          }
          this.dataPresentation = presentation;
          this.$emit("input", this.publicDataValue);
        }
      },
      handleBlur() {
        if (this.dataPresentation === "" || this.dataPresentation === "-" || this.dataPresentation === "−") {
          this.dataValue = this.dataDefaultValue;
          this.$emit("input", this.publicDataValue);
        }
      },
      handleFocus() {

      },
      limitValue(value) {
        value = value.gt(this.dataMinValue) ? value : this.dataMinValue;
        value = value.lt(this.dataMaxValue) ? value : this.dataMaxValue;
        return value;
      },
    },
    computed: {
      publicDataValue() {
        return (this.mode === "number") ? this.dataValue.toNumber() : this.dataValue;
      },
      hasCrease() {
        return (this.mode === "number") ? (this.step !== 0) : !this.step.isZero();
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        this.dataValue = newVal;
      },
      dataValue: function(newVal, oldVal) {
        this.dataValue = newVal;
        if (this.dataValue !== null) {
          if (typeof(this.dataValue) === "number") {
            this.dataValue = new BigNumber(this.dataValue);
          }
          this.dataPresentation = newVal.toString();
          if (this.dataDotAtTheEnd) {
            this.dataPresentation += ".";
          }
        }
      },
      maxPrecision: function(newVal, oldVal) {
        this.dataMaxPrecision = new BigNumber(newVal);
      }
    },
  };
</script>

<style lang="scss" scoped>
  .number-input--strict {
    ::v-deep .text-input textarea {
      text-align: center;
      width: calc(100% - 8px);
      padding: 0px 4px 0px 4px;
    }
  }
</style>
