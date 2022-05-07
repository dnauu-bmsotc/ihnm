<template>
  <Layout :title="$t('ns.title')">
    <main>
      <div class="ns__translators-container" ref="container">
        <div v-if="dataTranslators.length===0" class="ns__empty-message">{{$t("ns.empty")}}</div>
        <Translator v-for="(t, i) in dataTranslators"
                    v-model="dataValue"
                    v-bind="t.initialProps"
                    ref="translator"
                    :key="t.id"
                    :is="t.type"
                    :class="{'ns__translator--leading': t.id===dataLeadingTranslatorID}"
                    :alphabet="dataAlphabet"
                    :precision="dataPrecision"
                    :step="dataCreaseStep"
                    :leading="t.id===dataLeadingTranslatorID"
                    @applyLeading="onApplyLeading(t)">
          <template slot="dropdown-options">
            <DropdownItem v-for="type of translatorTypes"
                          :key="t.id + '-dd-' + type.id"
                          :title="type.hint"
                          @click="onTypeChange(t, type.id)">
              <StatesIcon :images="['circle-outline.svg', 'radio-on-button.svg']" :state="t.type === type.id ? 1 : 0"/>
              {{type.label}}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem @click="onTranslatorDeletion(t, i)">
              <StatesIcon :images="['close.svg']" :state="0" />
              {{$t("ns.Translator.delete")}}
            </DropdownItem>
          </template>
        </Translator>
      </div>
      <section class="ns__instruction">
        <h3>{{$t("ns.instruction.header")}}</h3>
        <p>{{$t("ns.instruction.introduction")}}</p>
        <p><!--
          -->{{$t("ns.instruction.addingTranslator.beforeButton")}}<!--
          --><button class="button ns__option-add" @click="addTranslator()">
              {{$t("ns.instruction.addingTranslator.button")}}
            </button><!--
          -->{{$t("ns.instruction.addingTranslator.afterButton")}}<!--
          -->{{$t("ns.instruction.settingPrecision.beforeInput")}}<!--
          --><NumberInputStrict @input="onPrecisionChange"
                                :value="dataPrecision"
                                :minValue="0"
                                :maxValue="100"
                                class="ns__option-precision"
                                :step="0" /><!--
          -->{{$t("ns.instruction.settingPrecision.afterInput")}}<!--
          --><span hidden><!--
            -->{{$t("ns.instruction.settingStep.beforeInput")}}<!--
            --><NumberInputStrict mode="bignumber"
                                  v-model="dataCreaseStep"
                                  :minValue="0"
                                  :maxValue="100"
                                  :maxPrecision="dataPrecision"
                                  class="ns__option-step" /><!--
            -->{{$t("ns.instruction.settingPrecision.afterInput")}}
          </span><!--
          -->{{$t("ns.instruction.changingType.beforeButton")}}<!--
          --><button class="ns__option-types-reference"><StatesIcon :images="['down-arrow.svg']" /></button><!--
          -->{{$t("ns.instruction.changingType.afterButton")}}
        </p>
        <p><!--
          -->{{$t("ns.instruction.settingAlphabet.beforeInput")}}<!--
          --><TextInput @input="onAlphabetChange"
                        v-model="dataAlphabet"
                        class="ns__option-alphabet"/><!--
          -->{{$t("ns.instruction.settingAlphabet.afterInput")}}
        </p>
        <p class="ns__option-alphabet__error">{{dataAlphabetError}}</p>
      </section>
    </main>
  </Layout>
</template>

<script>
  import NumericTranslator from "~/components/number-systems/NumericTranslator";
  import RomanTranslator from "~/components/number-systems/RomanTranslator";
  import OnesComplementTranslator from "~/components/number-systems/OnesComplementTranslator.vue";
  import TwosComplementTranslator from "~/components/number-systems/TwosComplementTranslator.vue";
  import BigNumber from "bignumber.js";

  class AlphabetError extends Error {
    constructor(message) {
      super(message);
      this.name = "AlphabetError";
    }
  }

  export default {
    metaInfo() {
      return {
        title: this.$t("ns.title"),
      };
    },
    props: {
       starterValue: { default: 2021 },
      propPrecision: { default: 10   },
           propStep: { default: 1    },
    },
    data() {
      return {
        dataTranslators: [],
        dataTranslatorsCreated: 0,
        dataLeadingTranslatorID: null,
        dataValue: null,
        dataPrecision: this.propPrecision,
        dataCreaseStep: null,
        dataAlphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        dataAlphabetError: "",
      }
    },
    created() {
      this.translatorTypes = [
        { id: "NumericTranslator",        label: this.$t("ns.Translator.positional"),     hint: this.$t("ns.Translator.positionalHint")     },
        { id: "RomanTranslator",          label: this.$t("ns.Translator.roman"),          hint: this.$t("ns.Translator.romanHint")          },
        { id: "OnesComplementTranslator", label: this.$t("ns.Translator.onesComplement"), hint: this.$t("ns.Translator.onesComplementHint") },
        { id: "TwosComplementTranslator", label: this.$t("ns.Translator.twosComplement"), hint: this.$t("ns.Translator.twosComplementHint") },
      ];
      this.configBigNumber(this.mathConfig);
      BigNumber.DEBUG = true;
      this.dataCreaseStep = BigNumber(this.propStep);
      this.dataValue = new BigNumber(this.starterValue);
      this.addTranslator("NumericTranslator", { radix: 10 });
      this.addTranslator("NumericTranslator", { radix: 2 });
      this.addTranslator("NumericTranslator", { radix: 8 });
      this.addTranslator("NumericTranslator", { radix: 16 });
      // this.addTranslator("RomanTranslator");
      // this.addTranslator("OnesComplementTranslator", { ranks: 16 });
      // this.addTranslator("TwosComplementTranslator", { ranks: 16 });
    },
    methods: {
      addTranslator(initialType="NumericTranslator", initialProps={radix: 10}) {
        let id = this.dataTranslatorsCreated++;
        if (this.dataLeadingTranslatorID === null) {
          this.dataLeadingTranslatorID = id;
        }
        this.dataTranslators.push({
          id: id,
          type: initialType,
          initialProps: initialProps,
          translatorData: {},
        });
      },
      onTranslatorDeletion(translator, index) {
        this.dataTranslators.splice(index, 1);
        if (translator.id === this.dataLeadingTranslatorID) {
          if (this.dataTranslators.length > 0) {
            this.dataLeadingTranslatorID = this.dataTranslators[0].id;
          }
          else {
            this.dataLeadingTranslatorID = null;
          }
        }
      },
      onApplyLeading(translator) {
        if (this.dataLeadingTranslatorID !== translator.id) {
          this.dataLeadingTranslatorID = translator.id;
        }
      },
      onTypeChange(translator, newType) {
        translator.type = newType;
      },
      onPrecisionChange(value) {
        this.dataPrecision = value;
        this.configBigNumber();
      },
      onAlphabetChange(value) {
        this.dataAlphabetError = "";
        this.dataAlphabet = value.replace(/\s+/g, "");
        try {
          if (this.dataAlphabet.length < 2) {
            throw new AlphabetError(this.$t("ns.alphabetErrors.atLeastTwoSymbols"));
          }
          this.configBigNumber();
        }
        catch (e) {
          if (e.message.indexOf("[BigNumber Error]") === 0) {
            this.dataAlphabetError = this.$t("ns.alphabetErrors.parsingError");
          }
          else if (e instanceof AlphabetError) {
            this.dataAlphabetError = e.message;
          }
          else {
            throw e;
          }
        }
      },
      configBigNumber() {
        BigNumber.config({
          DECIMAL_PLACES: this.dataPrecision,
          ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
          ALPHABET: this.dataAlphabet,
        });
      },
    },
    components: {
      "NumericTranslator": NumericTranslator,
      "OnesComplementTranslator": OnesComplementTranslator,
      "TwosComplementTranslator": TwosComplementTranslator,
      "RomanTranslator": RomanTranslator,
    },
  };
</script>

<style lang="scss" scoped>
  .ns__ {
    &empty-message {
      font-size: 20px;
      text-align: center;
      color: $secondary-text-color;
    }
    &translators-container {
      max-width: 800px;
      padding: 0px;
      font-family: monospace;
    }
    &options {
      ul {
        margin-top: 0px;
        margin-left: 16px;
      }
      li {
        margin: 32px 0px;
      }
    }
    &option {
      &-add {
        padding: 4px 8px;
        .states-icon {
          width: 12px;
          height: 12px;
          margin-right: 4px;
        }
      }
      &-precision {
        max-width: 128px;
      }
      &-step {

      }
      &-types-reference {
        color: $secondary-text-color;
        text-decoration: none;
      }
      &-alphabet {
        display: inline-block;
        width: 80%;
        textarea {
          letter-spacing: 1px;
          font-size: 16px;
        }
        &__error {
          color: $error-color;
        }
      }
    }
  }
</style>
