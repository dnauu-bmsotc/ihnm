(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"27+9":function(t,a,e){},"3luI":function(t,a,e){"use strict";e("6o5r")},"4yNf":function(t,a,e){"use strict";var n=e("I+eb"),r=e("4zBA"),i=e("HYAF"),s=e("WSbT"),o=e("V37c"),l=r("".slice),u=Math.max,c=Math.min;n({target:"String",proto:!0,forced:!"".substr||"b"!=="ab".substr(-1)},{substr:function(t,a){var e,n,r=o(i(this)),d=r.length,h=s(t);return h===1/0&&(h=0),h<0&&(h=u(d+h,0)),(e=void 0===a?d:s(a))<=0||e===1/0||h>=(n=c(h+e,d))?"":l(r,h,n)}})},"6o5r":function(t,a,e){},"8MtF":function(t,a,e){"use strict";e("u3qM")},EUja:function(t,a,e){"use strict";var n=e("2oRo"),r=e("WSbT"),i=e("V37c"),s=e("HYAF"),o=n.RangeError;t.exports=function(t){var a=i(s(this)),e="",n=r(t);if(n<0||n==1/0)throw o("Wrong number of repetitions");for(;n>0;(n>>>=1)&&(a+=a))1&n&&(e+=a);return e}},JTJg:function(t,a,e){"use strict";var n=e("I+eb"),r=e("4zBA"),i=e("WjRb"),s=e("HYAF"),o=e("V37c"),l=e("qxPZ"),u=r("".indexOf);n({target:"String",proto:!0,forced:!l("includes")},{includes:function(t){return!!~u(o(s(this)),o(i(t)),arguments.length>1?arguments[1]:void 0)}})},NJ61:function(t,a,e){"use strict";e("i2YN")},OM9Z:function(t,a,e){e("I+eb")({target:"String",proto:!0},{repeat:e("EUja")})},Rm1S:function(t,a,e){"use strict";var n=e("xluM"),r=e("14Sl"),i=e("glrk"),s=e("UMSQ"),o=e("V37c"),l=e("HYAF"),u=e("3Eq5"),c=e("iqWW"),d=e("FMNM");r("match",(function(t,a,e){return[function(a){var e=l(this),r=null==a?void 0:u(a,t);return r?n(r,a,e):new RegExp(a)[t](o(e))},function(t){var n=i(this),r=o(t),l=e(a,n,r);if(l.done)return l.value;if(!n.global)return d(n,r);var u=n.unicode;n.lastIndex=0;for(var h,p=[],f=0;null!==(h=d(n,r));){var m=o(h[0]);p[f]=m,""===m&&(n.lastIndex=c(r,s(n.lastIndex),u)),f++}return 0===f?null:p}]}))},Sdli:function(t,a,e){"use strict";e("nn3/")},i2YN:function(t,a,e){},lemE:function(t,a,e){"use strict";e.r(a);function n(t,a){for(var e=0;e<a.length;e++){var n=a[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function r(t,a,e){return a&&n(t.prototype,a),e&&n(t,e),Object.defineProperty(t,"prototype",{writable:!1}),t}function i(t,a){if(!(t instanceof a))throw new TypeError("Cannot call a class as a function")}function s(t,a){return(s=Object.setPrototypeOf||function(t,a){return t.__proto__=a,t})(t,a)}function o(t,a){if("function"!=typeof a&&null!==a)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(a&&a.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),a&&s(t,a)}function l(t){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function u(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}var c=e("U8pU");function d(t,a){if(a&&("object"===Object(c.a)(a)||"function"==typeof a))return a;if(void 0!==a)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}function h(t){var a=u();return function(){var e,n=l(t);if(a){var r=l(this).constructor;e=Reflect.construct(n,arguments,r)}else e=n.apply(this,arguments);return d(this,e)}}function p(t,a,e){return(p=u()?Reflect.construct:function(t,a,e){var n=[null];n.push.apply(n,a);var r=new(Function.bind.apply(t,n));return e&&s(r,e.prototype),r}).apply(null,arguments)}function f(t){var a="function"==typeof Map?new Map:void 0;return(f=function(t){if(null===t||(e=t,-1===Function.toString.call(e).indexOf("[native code]")))return t;var e;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==a){if(a.has(t))return a.get(t);a.set(t,n)}function n(){return p(t,arguments,l(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),s(n,t)})(t)}e("sMBO"),e("2eJa"),e("1AHG"),e("pDQq"),e("rB9j"),e("UxlC"),e("yXV3"),e("qePV"),e("DQNa"),e("07d7"),e("JfAA");var m={props:{error:{default:"",type:String},warning:{default:"",type:String}}},g=function(t){o(e,t);var a=h(e);function e(t){var n;return i(this,e),(n=a.call(this,t)).name="TranslatorError",n}return r(e)}(f(Error)),b=m,v=(e("NJ61"),e("KHd+")),_=Object(v.a)(b,(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"ns__translator"},[e("div",{staticClass:"ns__translator__radix"},[t._t("radix-content")],2),e("Dropdown",{staticClass:"ns__translator__types-dropdown"},[[t._t("dropdown-options")]],2),e("div",{staticClass:"ns__translator__separator"}),t.error?e("div",{staticClass:"ns__translator__message--error",attrs:{"data-hint":t.error}},[t._v("!")]):t.warning?e("div",{staticClass:"ns__translator__message--warning",attrs:{"data-hint":t.warning}},[t._v("!")]):e("div",{staticClass:"ns__translator__message--nothing"}),e("div",{staticClass:"ns__translator__number"},[t._t("number-content")],2)],1)}),[],!1,null,"4824b5ca",null).exports,w=e("kB5k"),T=e.n(w),y={props:{alphabet:{required:!0,type:String},precision:{required:!0,type:Number},step:{required:!0,type:T.a},value:{required:!0,type:T.a},leading:{required:!0,type:Boolean},radix:{default:10,type:Number}},data:function(){return{dataError:"",dataWarning:"",dataRadix:this.radix,dataValue:this.value,dataPresentation:"",dataPlaceholder:""}},created:function(){this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue),this.$emit("input",this.dataValue)},methods:{handleRadixInput:function(t){this.clearMessages(),this.leading?this.dataValue=this.toDecimal(this.dataRadix,this.dataPresentation):this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue),this.$emit("input",this.dataValue)},handleNumberDecrease:function(){this.creaseValue(this.step.times(-1))},handleNumberIncrease:function(){this.creaseValue(this.step.times(1))},creaseValue:function(t){this.succeeded&&(this.clearMessages(),this.dataValue=this.leading?this.dataValue.plus(t):this.value.plus(t),this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue),this.$emit("input",this.dataValue),this.$emit("applyLeading"))},handleNumberInput:function(t){this.clearMessages(),this.dataValue=this.toDecimal(this.dataRadix,this.dataPresentation),this.$emit("input",this.dataValue),this.$emit("applyLeading")},toDecimal:function(t,a){try{var e=a.replace(/\s+/g,"").replace(/,/,".").toUpperCase();if(""===e)throw new g(this.$t("ns.NumericTranslator.emptyNumberInput"));var n=this.parseRadix(t);return new T.a(e,n)}catch(t){if(!this.showError(t))throw t;return new T.a(0)}},fromDecimal:function(t,a){try{var e=this.parseRadix(t),n="";if(a.isNegative()&&(n="-",a=a.abs()),n+=a.toString(e),10===t){for(var r="",i=0;i<n.length;i++)n[i]>="0"&&n[i]<="9"?r+=T.a.config().ALPHABET[n.charCodeAt(i)-"0".charCodeAt(0)]:r+=n[i];n=r}return n}catch(t){if(!this.showError(t))throw t;return this.dataPlaceholder="-",""}},showError:function(t){return t instanceof g?(this.dataError=t.message,!0):0===t.message.indexOf("[BigNumber Error]")?(this.dataError=this.$t("ns.NumericTranslator.parsingError"),!0):(this.dataError="Internal error",!1)},parseRadix:function(t){if(0===t)throw new g(this.$t("ns.NumericTranslator.zeroRadix"));if(1===t)throw new g(this.$t("ns.NumericTranslator.oneRadix"));if(-1===t)throw new g(this.$t("ns.NumericTranslator.negativeOneRadix"));if(t<0)throw new g(this.$t("ns.NumericTranslator.negativeRadix"));if(t>T.a.config().ALPHABET.length)throw new g(this.$t("ns.NumericTranslator.tooBigRadix"));return t},clearMessages:function(){this.dataError=this.dataWarning="",this.dataPlaceholder=""}},computed:{succeeded:function(){return""===this.dataError}},watch:{value:function(t,a){this.leading||(this.clearMessages(),this.dataValue=t,this.dataError=this.dataWarning="",this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue))},alphabet:function(t,a){this.clearMessages(),this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue)},precision:function(t,a){this.clearMessages(),this.leading?(this.dataValue=this.toDecimal(this.dataRadix,this.dataPresentation),this.$emit("input",this.dataValue)):this.dataPresentation=this.fromDecimal(this.dataRadix,this.dataValue)}},components:{TranslatorShell:_}},V=(e("3luI"),Object(v.a)(y,(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("TranslatorShell",{attrs:{error:t.dataError,warning:t.dataWarning,step:0},scopedSlots:t._u([{key:"radix-content",fn:function(){return[e("span",[t._v(t._s(t.$t("ns.NumericTranslator.positional")))]),e("NumberInputStrict",{attrs:{minValue:-256,maxValue:256,step:0},on:{input:t.handleRadixInput},model:{value:t.dataRadix,callback:function(a){t.dataRadix=a},expression:"dataRadix"}}),e("span",[t._v(t._s(t.$t("ns.NumericTranslator.based")))])]},proxy:!0},{key:"dropdown-options",fn:function(){return[t._t("dropdown-options")]},proxy:!0},{key:"number-content",fn:function(){return[e("NumberInput",{attrs:{stretchAxis:"y",crease:!t.step.isZero(),placeholder:t.dataPlaceholder},on:{decrease:t.handleNumberDecrease,input:t.handleNumberInput,increase:t.handleNumberIncrease},model:{value:t.dataPresentation,callback:function(a){t.dataPresentation=a},expression:"dataPresentation"}})]},proxy:!0}],null,!0)})}),[],!1,null,"9a3c649c",null).exports),x=(e("4yNf"),e("ma9I"),{props:{alphabet:{required:!0,type:String},precision:{required:!0,type:Number},step:{required:!0,type:T.a},value:{required:!0,type:T.a},leading:{required:!0,type:Boolean}},data:function(){return{dataValue:this.value,dataError:"",dataWarning:"",dataPresentation:"",dataUnicode:!1,dataPlaceholder:""}},created:function(){this.dataPresentation=this.fromDecimal(this.dataValue),this.$emit("input",this.dataValue)},methods:{creaseDataValue:function(t){this.succeeded&&(this.clearMessages(),this.dataValue=this.leading?this.dataValue.plus(t):this.value.plus(t),this.dataPresentation=this.fromDecimal(this.dataValue),this.$emit("input",this.dataValue),this.$emit("applyLeading"))},handleNumberDecrease:function(){this.creaseDataValue(this.step.times(-1))},handleNumberIncrease:function(){this.creaseDataValue(this.step.times(1))},handleNumberInput:function(){this.clearMessages(),this.dataValue=this.toDecimal(this.dataPresentation),this.$emit("input",this.dataValue),this.$emit("applyLeading")},toDecimal:function(t){try{t=t.replace(/\s+/g,"").toUpperCase();for(var a=new T.a(0),e=this.arab.length-1,n=0;e>=0&&n<t.length;)t.substr(n,this.roman[e].length)===this.roman[e]?(a=a.plus(this.arab[e]),n+=this.roman[e].length):e--;return e<0&&(this.dataError=this.$t("ns.RomanTranslator.parsingError"),a=new T.a(0)),a}catch(t){if(!this.showError(t))throw t;return new T.a(0)}},fromDecimal:function(t){var a=T()(t);try{if(a.isInteger()||(this.dataWarning=this.$t("ns.RomanTranslator.fractionsDiscarded"),a=a.integerValue(T.a.ROUND_FLOOR)),a.gt(this.maxValue))throw new g(this.$t("ns.RomanTranslator.tooBigNumber"));if(a.isNegative())throw new g(this.$t("ns.RomanTranslator.negativeNumber"));var e="";a.isNegative()&&(e="-",a=a.abs());for(var n=this.arab.length-1;a.gt(0);)a.gte(this.arab[n])?(e+=this.roman[n],a=a.minus(this.arab[n])):n--;return""===e&&(this.dataPlaceholder="nulla",e="",""===this.dataError&&(t.isInteger()?this.dataWarning=this.$t("ns.RomanTranslator.noZero"):this.dataWarning=this.$t("ns.RomanTranslator.notPresentable"))),e}catch(t){if(!this.showError(t))throw t;return"-"}},showError:function(t){return t instanceof g?(this.dataError=t.message,!0):(this.dataError="Internal error",!1)},onUnicodeOptionClick:function(){this.dataUnicode=!this.dataUnicode,this.clearMessages(),this.leading?this.dataValue=this.toDecimal(this.dataPresentation):this.dataPresentation=this.fromDecimal(this.dataValue),this.$emit("input",this.dataValue)},clearMessages:function(){this.dataError=this.dataWarning="",this.dataPlaceholder=""}},computed:{arab:function(){var t=[1,4,5,9,10,40,50,90,100,400,500,900,1e3];return this.dataUnicode&&(t=t.concat([4e3,5e3,9e3,1e4,4e4,5e4,9e4,1e5,4e5,5e5,9e5,1e6])),t},roman:function(){var t=["I","IV","V","IX","X","XL","L","XC","C","CD","D","CM","M"];return this.dataUnicode&&(t=t.concat(["MV̅","V̅","MX̅","X̅","X̅L̅","L̅","X̅C̅","C̅","C̅D̅","D̅","C̅M̅","M̅"])),t},maxValue:function(){return this.dataUnicode?3999999:3999},succeeded:function(){return""===this.dataError}},watch:{value:function(t,a){this.leading||(this.clearMessages(),this.value=t,this.dataValue=T()(t),this.dataPresentation=this.fromDecimal(t))}},components:{TranslatorShell:_}}),P=(e("Sdli"),Object(v.a)(x,(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("TranslatorShell",{attrs:{error:t.dataError,warning:t.dataWarning},scopedSlots:t._u([{key:"radix-content",fn:function(){return[t._v("\n    "+t._s(t.$t("ns.RomanTranslator.roman"))+"\n  ")]},proxy:!0},{key:"dropdown-options",fn:function(){return[e("DropdownItem",{attrs:{title:t.$t("ns.RomanTranslator.useUnicodeHint")},on:{click:t.onUnicodeOptionClick}},[e("StatesIcon",{attrs:{images:["blank.svg","checked.svg"],state:t.dataUnicode?1:0}}),t._v("\n      "+t._s(t.$t("ns.RomanTranslator.useUnicode"))+"\n    ")],1),e("DropdownSeparator"),t._t("dropdown-options")]},proxy:!0},{key:"number-content",fn:function(){return[e("NumberInput",{attrs:{stretchAxis:"y",crease:!t.step.isZero(),placeholder:t.dataPlaceholder},on:{decrease:t.handleNumberDecrease,input:t.handleNumberInput,increase:t.handleNumberIncrease},model:{value:t.dataPresentation,callback:function(a){t.dataPresentation=a},expression:"dataPresentation"}})]},proxy:!0}],null,!0)})}),[],!1,null,"7407fb70",null).exports),$=(e("yq1k"),e("JTJg"),e("OM9Z"),e("+2oP"),e("oVuX"),e("Rm1S"),{props:{alphabet:{required:!0,type:String},precision:{required:!0,type:Number},step:{required:!0,type:T.a},value:{required:!0,type:T.a},leading:{required:!0,type:Boolean},ranks:{default:16,type:Number},usingMode:{default:"one's",type:String}},data:function(){return{dataValue:this.value,dataRanks:this.ranks,dataError:"",dataWarning:"",dataPresentation:"",dataMode:this.usingMode,dataPlaceholder:""}},created:function(){this.dataPresentation=this.fromDecimal(this.dataRanks,this.dataValue),this.$emit("input",this.dataValue)},methods:{onRanksInput:function(){this.clearMessages(),this.leading?this.dataValue=this.toDecimal(this.dataRanks,this.dataPresentation):this.dataPresentation=this.fromDecimal(this.dataRanks,this.dataValue),this.$emit("input",this.dataValue)},creaseValue:function(t){this.succeeded&&(this.clearMessages(),this.dataValue=this.leading?this.dataValue.plus(t):this.value.plus(t),this.dataValue.lt(this.minValue)||this.dataValue.gt(this.maxValue)?this.dataWarning=this.$t("ns.ComplementTranslator.tooLittleRanks"):(this.dataPresentation=this.fromDecimal(this.dataRanks,this.dataValue),this.$emit("input",this.dataValue),this.$emit("applyLeading")))},handleNumberDecrease:function(){this.creaseValue(this.step.times(-1))},handleNumberIncrease:function(){this.creaseValue(this.step.times(1))},handleNumberInput:function(){this.clearMessages(),this.dataValue=this.toDecimal(this.dataRanks,this.dataPresentation),this.$emit("input",this.dataValue),this.$emit("applyLeading")},toDecimal:function(t,a){try{var e=a.replace(/\s+/g,"");if(""===e)throw new g(this.$t("ns.ComplementTranslator.emptyNumberInput"));if(e.includes(".")||e.includes(","))throw new g(this.$t("ns.ComplementTranslator.fractionsNotSupported"));var n=t-e.length;if(n>0)e=this.zero.repeat(n)+e,this.dataWarning=this.$t("ns.ComplementTranslator.fillZeros",{amount:n});else if(n<0)throw new g(this.$t("ns.ComplementTranslator.tooLargeValue"));var r=new T.a(e.slice(1),2);return e[0]===this.one&&(r=new T.a(2).pow(t-1).minus(r).times(-1)),r}catch(t){if(!this.showError(t))throw t;return new T.a(0)}},fromDecimal:function(t,a){try{if(a.isInteger()||(this.dataWarning=this.$t("ns.ComplementTranslator.fractionsDiscarded"),a=a.integerValue(T.a.ROUND_FLOOR)),a.gt(this.maxValue)||a.lt(this.minValue))throw new g(this.$t("ns.ComplementTranslator.ranksNotEnough"));var e=this.zero,n="";a.isNegative()?(this.isOnesComplement&&(e=this.one,n=this.maxValue.plus(a).toString(2)),this.isTwosComplement&&(a.isZero()?(e=this.zero,n=""):(e=this.one,n=this.maxValue.plus(a).plus(1).toString(2)))):n=a.toString(2);var r=t-1-n.length;return(e+this.zero.repeat(r>0?r:0)+n).match(/.{1,4}(?=(.{4})*$)/g).join(" ")}catch(t){if(!this.showError(t))throw t;return this.dataPlaceholder="-",""}},showError:function(t){return t instanceof g?(this.dataError=t.message,!0):0===t.message.indexOf("[BigNumber Error]")?(this.dataError=this.$t("ns.ComplementTranslator.parsingError"),!0):(this.dataError="Internal error",!1)},clearMessages:function(){this.dataError=this.dataWarning="",this.dataPlaceholder=""}},computed:{isOnesComplement:function(){return"one's"===this.dataMode},isTwosComplement:function(){return"two's"===this.dataMode},twoToPowerRanks:function(){return T()(2).pow(this.dataRanks-1)},maxValue:function(){return this.isOnesComplement||this.isTwosComplement?this.twoToPowerRanks.minus(1):void 0},minValue:function(){return this.isOnesComplement?this.twoToPowerRanks.minus(1).times(-1):this.isTwosComplement?this.twoToPowerRanks.times(-1):void 0},zero:function(){return T.a.config().ALPHABET[0]},one:function(){return T.a.config().ALPHABET[1]},succeeded:function(){return""===this.dataError}},watch:{value:function(t,a){this.leading||(this.clearMessages(),this.dataValue=t,this.dataError=this.dataWarning="",this.dataPresentation=this.fromDecimal(this.dataRanks,this.dataValue))},alphabet:function(t,a){this.clearMessages(),this.dataPresentation=this.fromDecimal(this.dataRanks,this.dataValue)}},components:{TranslatorShell:_}}),C=(e("8MtF"),Object(v.a)($,(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("TranslatorShell",{attrs:{error:t.dataError,warning:t.dataWarning},scopedSlots:t._u([{key:"radix-content",fn:function(){return[t.isOnesComplement?[t._v(t._s(t.$t("ns.ComplementTranslator.Ones")))]:t._e(),t.isTwosComplement?[t._v(t._s(t.$t("ns.ComplementTranslator.Twos"))+" ")]:t._e(),e("NumberInputStrict",{attrs:{minValue:2,maxValue:1024,step:0},on:{input:t.onRanksInput},model:{value:t.dataRanks,callback:function(a){t.dataRanks=a},expression:"dataRanks"}}),t._v(t._s(t.$t("ns.ComplementTranslator.rankedBinary"))+"\n  ")]},proxy:!0},{key:"dropdown-options",fn:function(){return[t._t("dropdown-options")]},proxy:!0},{key:"number-content",fn:function(){return[e("NumberInput",{attrs:{crease:!t.step.isZero(),placeholder:t.dataPlaceholder},on:{decrease:t.handleNumberDecrease,input:t.handleNumberInput,increase:t.handleNumberIncrease},model:{value:t.dataPresentation,callback:function(a){t.dataPresentation=a},expression:"dataPresentation"}})]},proxy:!0}],null,!0)})}),[],!1,null,"eaede172",null).exports),E={mixins:[C],data:function(){return{dataMode:"one's"}}},N=Object(v.a)(E,void 0,void 0,!1,null,null,null).exports,D={mixins:[C],data:function(){return{dataMode:"two's"}}},I=Object(v.a)(D,void 0,void 0,!1,null,null,null).exports,R=function(t){o(e,t);var a=h(e);function e(t){var n;return i(this,e),(n=a.call(this,t)).name="AlphabetError",n}return r(e)}(f(Error)),k={metaInfo:function(){return{title:this.$t("ns.title")}},props:{starterValue:{default:2021},propPrecision:{default:10},propStep:{default:1}},data:function(){return{dataTranslators:[],dataTranslatorsCreated:0,dataLeadingTranslatorID:null,dataValue:null,dataPrecision:this.propPrecision,dataCreaseStep:null,dataAlphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",dataAlphabetError:""}},created:function(){this.translatorTypes=[{id:"NumericTranslator",label:this.$t("ns.Translator.positional"),hint:this.$t("ns.Translator.positionalHint")},{id:"RomanTranslator",label:this.$t("ns.Translator.roman"),hint:this.$t("ns.Translator.romanHint")},{id:"OnesComplementTranslator",label:this.$t("ns.Translator.onesComplement"),hint:this.$t("ns.Translator.onesComplementHint")},{id:"TwosComplementTranslator",label:this.$t("ns.Translator.twosComplement"),hint:this.$t("ns.Translator.twosComplementHint")}],this.configBigNumber(this.mathConfig),T.a.DEBUG=!0,this.dataCreaseStep=T()(this.propStep),this.dataValue=new T.a(this.starterValue),this.addTranslator("NumericTranslator",{radix:10}),this.addTranslator("NumericTranslator",{radix:2}),this.addTranslator("NumericTranslator",{radix:8}),this.addTranslator("NumericTranslator",{radix:16})},methods:{addTranslator:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"NumericTranslator",a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{radix:10},e=this.dataTranslatorsCreated++;null===this.dataLeadingTranslatorID&&(this.dataLeadingTranslatorID=e),this.dataTranslators.push({id:e,type:t,initialProps:a,translatorData:{}})},onTranslatorDeletion:function(t,a){this.dataTranslators.splice(a,1),t.id===this.dataLeadingTranslatorID&&(this.dataTranslators.length>0?this.dataLeadingTranslatorID=this.dataTranslators[0].id:this.dataLeadingTranslatorID=null)},onApplyLeading:function(t){this.dataLeadingTranslatorID!==t.id&&(this.dataLeadingTranslatorID=t.id)},onTypeChange:function(t,a){t.type=a},onPrecisionChange:function(t){this.dataPrecision=t,this.configBigNumber()},onAlphabetChange:function(t){this.dataAlphabetError="",this.dataAlphabet=t.replace(/\s+/g,"");try{if(this.dataAlphabet.length<2)throw new R(this.$t("ns.alphabetErrors.atLeastTwoSymbols"));this.configBigNumber()}catch(t){if(0===t.message.indexOf("[BigNumber Error]"))this.dataAlphabetError=this.$t("ns.alphabetErrors.parsingError");else{if(!(t instanceof R))throw t;this.dataAlphabetError=t.message}}},configBigNumber:function(){T.a.config({DECIMAL_PLACES:this.dataPrecision,ROUNDING_MODE:T.a.ROUND_HALF_UP,ALPHABET:this.dataAlphabet})}},components:{NumericTranslator:V,OnesComplementTranslator:N,TwosComplementTranslator:I,RomanTranslator:P}},S=(e("rZ0h"),Object(v.a)(k,(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("Layout",{attrs:{title:t.$t("ns.title")}},[e("main",[e("div",{ref:"container",staticClass:"ns__translators-container"},[0===t.dataTranslators.length?e("div",{staticClass:"ns__empty-message"},[t._v(t._s(t.$t("ns.empty")))]):t._e(),t._l(t.dataTranslators,(function(a,n){return e(a.type,t._b({key:a.id,ref:"translator",refInFor:!0,tag:"Translator",class:{"ns__translator--leading":a.id===t.dataLeadingTranslatorID},attrs:{alphabet:t.dataAlphabet,precision:t.dataPrecision,step:t.dataCreaseStep,leading:a.id===t.dataLeadingTranslatorID},on:{applyLeading:function(e){return t.onApplyLeading(a)}},model:{value:t.dataValue,callback:function(a){t.dataValue=a},expression:"dataValue"}},"Translator",a.initialProps,!1),[e("template",{slot:"dropdown-options"},[t._l(t.translatorTypes,(function(n){return e("DropdownItem",{key:a.id+"-dd-"+n.id,attrs:{title:n.hint},on:{click:function(e){return t.onTypeChange(a,n.id)}}},[e("StatesIcon",{attrs:{images:["circle-outline.svg","radio-on-button.svg"],state:a.type===n.id?1:0}}),t._v("\n            "+t._s(n.label)+"\n          ")],1)})),e("DropdownSeparator"),e("DropdownItem",{on:{click:function(e){return t.onTranslatorDeletion(a,n)}}},[e("StatesIcon",{attrs:{images:["close.svg"],state:0}}),t._v("\n            "+t._s(t.$t("ns.Translator.delete"))+"\n          ")],1)],2)],2)}))],2),e("section",{staticClass:"ns__instruction"},[e("h3",[t._v(t._s(t.$t("ns.instruction.header")))]),e("p",[t._v(t._s(t.$t("ns.instruction.introduction")))]),e("p",[t._v(t._s(t.$t("ns.instruction.addingTranslator.beforeButton"))),e("button",{staticClass:"button ns__option-add",on:{click:function(a){return t.addTranslator()}}},[t._v("\n            "+t._s(t.$t("ns.instruction.addingTranslator.button"))+"\n          ")]),t._v(t._s(t.$t("ns.instruction.addingTranslator.afterButton"))),t._v(t._s(t.$t("ns.instruction.settingPrecision.beforeInput"))),e("NumberInputStrict",{staticClass:"ns__option-precision",attrs:{value:t.dataPrecision,minValue:0,maxValue:100,step:0},on:{input:t.onPrecisionChange}}),t._v(t._s(t.$t("ns.instruction.settingPrecision.afterInput"))),e("span",{attrs:{hidden:""}},[t._v(t._s(t.$t("ns.instruction.settingStep.beforeInput"))),e("NumberInputStrict",{staticClass:"ns__option-step",attrs:{mode:"bignumber",minValue:0,maxValue:100,maxPrecision:t.dataPrecision},model:{value:t.dataCreaseStep,callback:function(a){t.dataCreaseStep=a},expression:"dataCreaseStep"}}),t._v(t._s(t.$t("ns.instruction.settingPrecision.afterInput"))+"\n        ")],1),t._v(t._s(t.$t("ns.instruction.changingType.beforeButton"))),e("button",{staticClass:"ns__option-types-reference"},[e("StatesIcon",{attrs:{images:["down-arrow.svg"]}})],1),t._v(t._s(t.$t("ns.instruction.changingType.afterButton"))+"\n      ")],1),e("p",[t._v(t._s(t.$t("ns.instruction.settingAlphabet.beforeInput"))),e("TextInput",{staticClass:"ns__option-alphabet",on:{input:t.onAlphabetChange},model:{value:t.dataAlphabet,callback:function(a){t.dataAlphabet=a},expression:"dataAlphabet"}}),t._v(t._s(t.$t("ns.instruction.settingAlphabet.afterInput"))+"\n      ")],1),e("p",{staticClass:"ns__option-alphabet__error"},[t._v(t._s(t.dataAlphabetError))])])])])}),[],!1,null,"6daeccc4",null));a.default=S.exports},"nn3/":function(t,a,e){},pDQq:function(t,a,e){"use strict";var n=e("I+eb"),r=e("2oRo"),i=e("I8vh"),s=e("WSbT"),o=e("B/qT"),l=e("ewvW"),u=e("ZfDv"),c=e("hBjN"),d=e("Hd5f")("splice"),h=r.TypeError,p=Math.max,f=Math.min;n({target:"Array",proto:!0,forced:!d},{splice:function(t,a){var e,n,r,d,m,g,b=l(this),v=o(b),_=i(t,v),w=arguments.length;if(0===w?e=n=0:1===w?(e=0,n=v-_):(e=w-2,n=f(p(s(a),0),v-_)),v+e-n>9007199254740991)throw h("Maximum allowed length exceeded");for(r=u(b,n),d=0;d<n;d++)(m=_+d)in b&&c(r,d,b[m]);if(r.length=n,e<n){for(d=_;d<v-n;d++)g=d+e,(m=d+n)in b?b[g]=b[m]:delete b[g];for(d=v;d>v-n+e;d--)delete b[d-1]}else if(e>n)for(d=v-n;d>_;d--)g=d+e-1,(m=d+n-1)in b?b[g]=b[m]:delete b[g];for(d=0;d<e;d++)b[d+_]=arguments[d+2];return b.length=v-n+e,r}})},rZ0h:function(t,a,e){"use strict";e("27+9")},u3qM:function(t,a,e){},yq1k:function(t,a,e){"use strict";var n=e("I+eb"),r=e("TWQb").includes,i=e("0Dky"),s=e("RNIs");n({target:"Array",proto:!0,forced:i((function(){return!Array(1).includes()}))},{includes:function(t){return r(this,t,arguments.length>1?arguments[1]:void 0)}}),s("includes")}}]);