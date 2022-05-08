<template>
  <TranslatorShell :error="dataError"
                           :warning="dataWarning"
                           :step="0">

    <template v-slot:radix-content>
      <span>{{$t("ns.NumericTranslator.positional")}}</span>
      <NumberInputStrict v-model="dataRadix"
                         @input="handleRadixInput"
                         :minValue="-256"
                         :maxValue="256"
                         :step="0"/>
      <span>{{$t("ns.NumericTranslator.based")}}</span>
    </template>

    <template v-slot:dropdown-options>
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
          radix: { default: 10,    type: Number    },
    },
    data() {
      return {
        dataError: "",
        dataWarning: "",
        dataRadix: this.radix,
        dataValue: this.value,
        dataPresentation: "",
        dataPlaceholder: "",
      };
    },
    created() {
      this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
      this.$emit("input", this.dataValue);
    },
    methods: {
      handleRadixInput(value) {
        this.clearMessages();
        if (this.leading) {
          this.dataValue = this.toDecimal(this.dataRadix, this.dataPresentation);
        }
        else {
          this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
        }
        this.$emit("input", this.dataValue);
      },
      handleNumberDecrease() {
        this.creaseValue(this.step.times(-1));
      },
      handleNumberIncrease() {
        this.creaseValue(this.step.times(+1));
      },
      creaseValue(addition) {
        if (this.succeeded) {
          this.clearMessages();
          this.dataValue = this.leading ? this.dataValue.plus(addition) : this.value.plus(addition);
          this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
          this.$emit("input", this.dataValue);
          this.$emit("applyLeading");
        }
      },
      handleNumberInput(text) {
        this.clearMessages();
        this.dataValue = this.toDecimal(this.dataRadix, this.dataPresentation);
        this.$emit("input", this.dataValue);
        this.$emit("applyLeading");
      },
      toDecimal(radix, presentation) {
        try {
          let strval = presentation
            .replace(/\s+/g, "")
            .replace(/,/, ".")
            .toUpperCase();
          if (strval === "") {
            throw new TranslatorError(this.$t("ns.NumericTranslator.emptyNumberInput"));
          }
          let checkedRadix = this.parseRadix(radix);
          return new BigNumber(strval, checkedRadix);
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          return new BigNumber(0);
        }
      },
      fromDecimal(radix, value) {
        try {
          let checkedRadix = this.parseRadix(radix);
          let presentation = "";
          if (value.isNegative()) {
            presentation = "-";
            value = value.abs();
          }
          presentation += value.toString(checkedRadix);

          // Почему-то если основание равно 10-ти, алфавит игнорируется
          if (radix === 10) {
            let tmp = "";
            for (let i = 0; i < presentation.length; i++) {
              if (presentation[i] >= "0" && presentation[i] <= "9") {
                tmp += BigNumber.config().ALPHABET[presentation.charCodeAt(i) - "0".charCodeAt(0)];
              }
              else {
                tmp += presentation[i];
              }
            }
            presentation = tmp;
          }
          return presentation;
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          this.dataPlaceholder = "-";
          return "";
        }
      },
      showError(e) {
        if (e instanceof TranslatorError) {
          this.dataError = e.message;
          return true;
        }
        if (e.message.indexOf("[BigNumber Error]") === 0) {
          this.dataError = this.$t("ns.NumericTranslator.parsingError");
          return true;
        }
        this.dataError = "Internal error";
        return false;
      },
      parseRadix(radix) {
        if (radix === 0) {
          throw new TranslatorError(this.$t("ns.NumericTranslator.zeroRadix"));
        }
        if (radix === 1) {
          throw new TranslatorError(this.$t("ns.NumericTranslator.oneRadix"));
        }
        if (radix === -1) {
          throw new TranslatorError(this.$t("ns.NumericTranslator.negativeOneRadix"));
        }
        if (radix < 0) {
          throw new TranslatorError(this.$t("ns.NumericTranslator.negativeRadix"));
        }
        if (radix > BigNumber.config().ALPHABET.length) {
          throw new TranslatorError(this.$t("ns.NumericTranslator.tooBigRadix"));
        }
        return radix;
      },
      clearMessages() {
        this.dataError = this.dataWarning = "";
        this.dataPlaceholder = "";
      },
    },
    computed: {
      succeeded: function() {
        return this.dataError === "";
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        if (!this.leading) {
          this.clearMessages();
          this.dataValue = newVal;
          this.dataError = this.dataWarning = "";
          this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
        }
      },
      alphabet: function(newVal, oldVal) {
        this.clearMessages();
        this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
      },
      precision: function(newVal, oldVal) {
        this.clearMessages();
        if (this.leading) {
          this.dataValue = this.toDecimal(this.dataRadix, this.dataPresentation);
          this.$emit("input", this.dataValue);
        }
        else {
          this.dataPresentation = this.fromDecimal(this.dataRadix, this.dataValue);
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
