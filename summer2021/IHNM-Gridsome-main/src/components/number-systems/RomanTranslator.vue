<template>
  <TranslatorShell :error="dataError" :warning="dataWarning">

    <template v-slot:radix-content>
      {{$t("ns.RomanTranslator.roman")}}
    </template>

    <template v-slot:dropdown-options>
      <DropdownItem :title="$t('ns.RomanTranslator.useUnicodeHint')"
                    @click="onUnicodeOptionClick">
        <StatesIcon :images='["blank.svg", "checked.svg"]' :state="dataUnicode ? 1 : 0" />
        {{$t('ns.RomanTranslator.useUnicode')}}
      </DropdownItem>
      <DropdownSeparator></DropdownSeparator>
      <slot name="dropdown-options" />
    </template>

    <template v-slot:number-content>
      <NumberInput stretchAxis="y"
                   v-model="dataPresentation"
                   :crease="!step.isZero()"
                   :placeholder="dataPlaceholder"
                   @decrease="handleNumberDecrease"
                   @input="handleNumberInput"
                   @increase="handleNumberIncrease"/>
    </template>

  </TranslatorShell>
</template>

<script>
  import TranslatorShell, { TranslatorError } from "~/components/number-systems/TranslatorShell";
  import BigNumber from "bignumber.js";

  export default {
    props: {
       alphabet: { required: true, type: String    },
      precision: { required: true, type: Number    },
           step: { required: true, type: BigNumber },
          value: { required: true, type: BigNumber },
        leading: { required: true, type: Boolean   },
    },
    data() {
      return {
        dataValue: this.value,
        dataError: "",
        dataWarning: "",
        dataPresentation: "",
        dataUnicode: false,
        dataPlaceholder: "",
      };
    },
    created() {
      this.dataPresentation = this.fromDecimal(this.dataValue);
      this.$emit("input", this.dataValue);
    },
    methods: {
      creaseDataValue(addition) {
        if (this.succeeded) {
          this.clearMessages();
          this.dataValue = this.leading ? this.dataValue.plus(addition) : this.value.plus(addition);
          this.dataPresentation = this.fromDecimal(this.dataValue);
          this.$emit("input", this.dataValue);
          this.$emit("applyLeading");
        }
      },
      handleNumberDecrease() {
        this.creaseDataValue(this.step.times(-1));
      },
      handleNumberIncrease() {
        this.creaseDataValue(this.step.times(+1));
      },
      handleNumberInput() {
        this.clearMessages();
        this.dataValue = this.toDecimal(this.dataPresentation);
        this.$emit("input", this.dataValue);
        this.$emit("applyLeading");
      },
      toDecimal(presentation) {
        try {
          presentation = presentation.replace(/\s+/g, "").toUpperCase();
          let value = new BigNumber(0);
          let i = this.arab.length - 1;
          let pos = 0;
          while (i >= 0 && pos < presentation.length) {
            if (presentation.substr(pos, this.roman[i].length) === this.roman[i]) {
              value = value.plus(this.arab[i]);
              pos += this.roman[i].length;
            }
            else {
              i--;
            }
          }
          if (i < 0) {
            this.dataError = this.$t("ns.RomanTranslator.parsingError");
            value = new BigNumber(0);
          }
          return value;
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          return new BigNumber(0);
        }
      },
      fromDecimal(value) {
        let val = BigNumber(value);
        try {
          if (!val.isInteger()) {
            this.dataWarning = this.$t("ns.RomanTranslator.fractionsDiscarded");
            val = val.integerValue(BigNumber.ROUND_FLOOR);
          }
          if (val.gt(this.maxValue)) {
            throw new TranslatorError(this.$t("ns.RomanTranslator.tooBigNumber"));
          }
          if (val.isNegative()) {
            throw new TranslatorError(this.$t("ns.RomanTranslator.negativeNumber"));
          }
          let presentation = "";
          if (val.isNegative()) {
            presentation = "-";
            val = val.abs();
          }
          let i = this.arab.length - 1;
          while (val.gt(0)) {
            if (val.gte(this.arab[i])) {
              presentation += this.roman[i];
              val = val.minus(this.arab[i]);
            }
            else {
              i--;
            }
          }
          if (presentation === "") {
            this.dataPlaceholder = "nulla";
            presentation = "";
            if (this.dataError === "") {
              if (value.isInteger()) {
                this.dataWarning = this.$t("ns.RomanTranslator.noZero");
              }
              else {
                this.dataWarning = this.$t("ns.RomanTranslator.notPresentable");
              }
            }
          }
          return presentation;
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          return "-";
        }
      },
      showError(e) {
        if (e instanceof TranslatorError) {
          this.dataError = e.message;
          return true;
        }
        this.dataError = "Internal error";
        return false;
      },
      onUnicodeOptionClick() {
        this.dataUnicode = !this.dataUnicode;
        this.clearMessages();
        if (this.leading) {
          this.dataValue = this.toDecimal(this.dataPresentation);
        }
        else {
          this.dataPresentation = this.fromDecimal(this.dataValue);
        }
        this.$emit("input", this.dataValue);
      },
      clearMessages() {
        this.dataError = this.dataWarning = "";
        this.dataPlaceholder = "";
      },
    },
    computed: {
      arab: function() {
        let result = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000];
        if (this.dataUnicode) {
          result = result.concat([4000, 5000, 9000, 10000, 40000, 50000, 90000, 100000, 400000, 500000, 900000, 1000000]);
        }
        return result;
      },
      roman: function() {
        let result = ["I","IV","V","IX","X","XL","L","XC","C","CD","D","CM","M"];
        if (this.dataUnicode) {
          result = result.concat(["MV\u0305", "V\u0305", "MX\u0305", "X\u0305", "X\u0305L\u0305", "L\u0305", "X\u0305C\u0305", "C\u0305", "C\u0305D\u0305", "D\u0305", "C\u0305M\u0305", "M\u0305"]);
        }
        return result;
      },
      maxValue: function() {
        return this.dataUnicode ? 3999999 : 3999;
      },
      succeeded: function() {
        return this.dataError === "";
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        if (!this.leading) {
          this.clearMessages();
          this.value = newVal;
          this.dataValue = BigNumber(newVal);
          this.dataPresentation = this.fromDecimal(newVal);
        }
      },
    },
    components: {
      "TranslatorShell": TranslatorShell,
    },
  };
</script>

<style lang="scss" scoped>
  .ns__translator__number {
    width: 100%;
    min-width: 128px;
    .number-input {
      width: 100%;
    }
  }
</style>
