(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{"47m9":function(t,e,a){"use strict";a("Irgt")},Irgt:function(t,e,a){},M38g:function(t,e,a){"use strict";a.r(e);var i=a("uFwe"),n=a("KQm4"),s=a("U8pU"),o=(a("brp2"),a("DQNa"),a("QFcT"),a("4l63"),a("pDQq"),a("TZCg"),a("1AHG"),a("07d7"),a("JfAA"),a("2B1R"),a("yXV3"),a("PKPk"),a("3bBZ"),a("Kz25"),a("mGGf"),a("wLYn"),a("sMBO"),a("qePV"),a("oVuX"),a("TeQF"),a("cTNl")),r=a.n(o),c={props:{imageDisplayMode:{default:"Resize",type:String},sectors:{default:function(){return[]},type:Array},angle:{default:0,type:Number},highlightSegment:{default:-1,type:Number}},data:function(){return{dataContext:null,dataResizeObserver:null,dataPatternMode:null}},created:function(){this.svgWidth=100,this.svgHeight=100,this.svgStroke=.25,this.svgFatStroke=1,this.svgRadius=Math.min(this.svgWidth,this.svgHeight)/2,this.svgContentRadius=this.svgRadius-Math.max(this.svgStroke,this.svgFatStroke),this.svgCenterRadius=4,this.svgCenterX=this.svgWidth/2,this.svgCenterY=this.svgHeight/2,this.colors=r.a},methods:{createSvgArc:function(t,e,a,i,n){if(i>n){var s=i;i=n,n=s}n-i>2*Math.PI-1e-5&&(i=0,n=1.99999*Math.PI);var o=n-i<=Math.PI?0:1;return["M",t,e,"L",t+Math.cos(i)*a,e-Math.sin(i)*a,"A",a,a,0,o,0,t+Math.cos(n)*a,e-Math.sin(n)*a,"L",t,e].join(" ")},pointIsOnWheel:function(t,e){var a=Math.abs(t-this.getCenterX()),i=Math.abs(e-this.getCenterY()),n=Math.pow(a,2)+Math.pow(i,2)<Math.pow(this.getRadius(),2),s=Math.pow(a,2)+Math.pow(i,2)<Math.pow(this.svgCenterRadius,2);return n&&!s},handleMouseDown:function(t){this.pointIsOnWheel(t.clientX,t.clientY)&&this.$emit("wofMouseDown",t)},handleTouchStart:function(t){for(var e=0;e<t.touches.length;e++)if(this.pointIsOnWheel(t.touches[e].clientX,t.touches[e].clientY)){this.$emit("wofTouchStart",t,e);break}},handleTouchEnd:function(t){this.$emit("wofTouchEnd",t)},getCenterX:function(){var t=this.$refs.wheel.getBoundingClientRect();return(t.left+t.right)/2},getCenterY:function(){var t=this.$refs.wheel.getBoundingClientRect();return(t.top+t.bottom)/2},getRadius:function(){var t=this.$refs.wheel.getBoundingClientRect();return(t.right-t.left)/2},onWindowResize:function(){this.dataClientRect=this.$refs.wheel.getBoundingClientRect()},getDisplayMods:function(){return["Resize","Fit"]}},computed:{activeSectors:function(){return this.sectors.filter((function(t){return t.active}))},arcRadians:function(){return 2*Math.PI/this.activeSectors.length},arcDegrees:function(){return 360/this.activeSectors.length},sectorChord:function(){return 2*this.svgContentRadius*Math.sin(this.arcRadians/2)},sectorChordHeight:function(){var t=this.svgContentRadius,e=this.sectorChord;return.5*t*t*Math.sin(this.arcRadians)/e*2},sectorCenterChord:function(){return this.sectorChord/this.svgContentRadius*this.svgCenterRadius},sectorCenterChordHeight:function(){return this.sectorChordHeight/this.svgContentRadius*this.svgCenterRadius},processedSectors:function(){for(var t=this.activeSectors.filter((function(){return!0})),e=0;e<t.length;e++)if(t[e].imageIsLoaded){var a=t[e].image.width/t[e].image.height,i=1===this.activeSectors.length?1:this.svgContentRadius/this.sectorChord,n=void 0,s=void 0,o=void 0;switch(this.imageDisplayMode){case"Fit":if(1===t.length)s=2*this.svgContentRadius*Math.sin(Math.atan(1/a)),o=-a/2;else{var r=1/(2*a),c=Math.tan(this.arcRadians/2),h=Math.atan(r*c/(r+c)),l=2*this.svgContentRadius*Math.sin(h);s=l,o=l/2/Math.tan(h)/s-a}break;default:case"Resize":1===t.length?(s=2*this.svgContentRadius,o=-a/2):(s=a<i?this.svgContentRadius/a:this.svgContentRadius/i,o=this.sectorCenterChordHeight/s)}n="scale("+s+")";var d="translate("+o+" "+this.svgCenterY/100+")";t[e].imageRatio=a,t[e].transform=[n,"",d].join(" ")}else t[e].imageRatio=1,t[e].transform="";return t},selectedSectorOrder:function(){return Math.floor((2*Math.PI-this.angle+Math.PI/2)%(2*Math.PI)/this.arcRadians)},selectedSector:function(){return this.activeSectors[this.selectedSectorOrder]}}},h=(a("47m9"),a("KHd+")),l={metaInfo:function(){return{title:this.$t("wof.title")}},data:function(){return{dataVariants:[],dataVariantsCreated:0,dataImageDidplayMode:"Resize",displayMods:[],dataAngle:0,dataVelocity:0,dataLastDragXPosition:null,dataLastDragYPosition:null,dataDragXPosition:null,dataDragYPosition:null,dataAccelerationButtonPressed:!1,dataBrakeButtonPressed:!1,dataIsDragged:!1,dataDragTouch:0,dataLastFrameTime:0}},created:function(){this.frictionMultilplier=.99975,this.frictionSubtraction=18e-7*Math.PI,this.acceleration=3e-4,this.brake=.99,this.maxVelocity=.3*Math.PI,this.minSpinForce=.08*Math.PI,this.maxSpinForce=.17*Math.PI,this.dragSmoother=12e-7,this.addVariant({label:"Label1"}),this.addVariant({label:"Label2"}),this.addVariant({label:"Label3"}),this.addVariant({label:"Label4"}),this.addVariant({label:"Label5"})},mounted:function(){this.displayMods=this.$refs.wheel.getDisplayMods(),window.addEventListener("mouseup",this.mouseUpHandler),this.dataLastFrameTime=Date.now(),requestAnimationFrame(this.wheelAnimation)},beforeDestroy:function(){window.removeEventListener("mouseup",this.mouseUpHandler)},methods:{resetDragData:function(){this.dataIsDragged=!1,this.dataLastDragMoment=0,this.dataLastDragXPosition=null,this.dataLastDragYPosition=null,this.dataDragXPosition=null,this.dataDragYPosition=null,this.dataDragTouch=0},mouseUpHandler:function(t){this.endBrake(),this.endAcceleration(),window.removeEventListener("mousemove",this.mouseMoveHandler),this.resetDragData()},startDragging:function(t,e){this.dataLastDragXPosition=this.dataDragXPosition=t,this.dataLastDragYPosition=this.dataDragYPosition=e,this.dataIsDragged=!0},wheelMouseDownHandler:function(t){window.addEventListener("mousemove",this.mouseMoveHandler),this.startDragging(t.clientX,t.clientY)},registerMouseMove:function(t,e){var a=this.$refs.wheel.getCenterX(),i=this.$refs.wheel.getCenterY(),n=this.$refs.wheel.getRadius(),s=Math.hypot(a-t,i-e);s>n?(this.dataDragXPosition=a+(t-a)/s*n,this.dataDragYPosition=i+(e-i)/s*n):(this.dataDragXPosition=t,this.dataDragYPosition=e)},mouseMoveHandler:function(t){this.registerMouseMove(t.clientX,t.clientY)},wheelTouchStartHandler:function(t,e){this.dataDragTouch=e,window.addEventListener("touchmove",this.touchMoveHandler),this.startDragging(t.touches[this.dataDragTouch].clientX,t.touches[this.dataDragTouch].clientY),t.preventDefault()},wheelTouchEndHandler:function(t){window.removeEventListener("touchmove",this.touchMoveHandler),this.resetDragData()},touchMoveHandler:function(t){this.registerMouseMove(t.touches[this.dataDragTouch].clientX,t.touches[this.dataDragTouch].clientY)},onVariantInputKeydown:function(t,e){switch(event.keyCode){case 13:e=parseInt(e),this.addVariant({},e+1),this.focusVariant(e+1),t.preventDefault();break;case 38:this.focusVariant(e-1>=0?e-1:this.dataVariants.length-1),t.preventDefault();break;case 40:this.focusVariant(e+1<this.dataVariants.length?e+1:0),t.preventDefault()}},focusVariant:function(t){var e=this;this.$nextTick((function(){var a="variantInput"+t;e.$refs[a][0].focus()}))},onVariantInputInput:function(t,e){},spinClockWise:function(){this.dataVelocity-=this.minSpinForce+Math.random()*this.spinForceRange,this.dataVelocity=Math.max(this.dataVelocity,-this.maxVelocity)},spinCounterClockWise:function(){this.dataVelocity+=this.minSpinForce+Math.random()*this.spinForceRange,this.dataVelocity=Math.min(this.dataVelocity,this.maxVelocity)},startBrake:function(t){0===t.button&&(this.dataBrakeButtonPressed=!0)},endBrake:function(t){this.dataBrakeButtonPressed=!1},touchStartBrake:function(t){this.dataBrakeButtonPressed=!0},touchEndBrake:function(t){this.dataBrakeButtonPressed=!1},startAcceleration:function(t){0===t.button&&(this.dataAccelerationButtonPressed=!0)},endAcceleration:function(t){this.dataAccelerationButtonPressed=!1},touchStartAcceleration:function(t){this.dataAccelerationButtonPressed=!0},touchEndAcceleration:function(t){this.dataAccelerationButtonPressed=!1},stop:function(){this.dataVelocity=0,clearInterval(this.dataTimerId),this.dataTimerId=null},triangleSquareThreeDots:function(t,e,a,i,n,s){return.5*(a-t)*(s-e)-(n-t)*(i-e)},wheelAnimation:function(){var t=Date.now(),e=t-this.dataLastFrameTime;if(this.dataAngle=(this.dataAngle+this.dataVelocity)%(2*Math.PI),this.dataVelocity*=Math.pow(this.frictionMultilplier,e),this.dataVelocity>0?this.dataVelocity=Math.max(0,this.dataVelocity-this.frictionSubtraction*e):this.dataVelocity=Math.min(0,this.dataVelocity+this.frictionSubtraction*e),this.dataAccelerationButtonPressed&&(this.dataVelocity>0?this.dataVelocity+=this.acceleration*e:this.dataVelocity-=this.acceleration*e),this.dataBrakeButtonPressed&&(this.dataVelocity*=Math.pow(this.brake,e)),this.dataIsDragged){var a=this.triangleSquareThreeDots(this.dataDragXPosition,this.dataDragYPosition,this.dataLastDragXPosition,this.dataLastDragYPosition,this.$refs.wheel.getCenterX(),this.$refs.wheel.getCenterY());this.dataVelocity=a*this.dragSmoother*e,this.dataVelocity>0?this.dataVelocity=Math.min(this.dataVelocity,this.maxVelocity):this.dataVelocity=Math.max(this.dataVelocity,-this.maxVelocity),this.dataLastDragXPosition=this.dataDragXPosition,this.dataLastDragYPosition=this.dataDragYPosition}this.dataLastFrameTime=t,requestAnimationFrame(this.wheelAnimation)},addVariant:function(t,e){"object"!==Object(s.a)(t)&&(t={});var a=function(t,e,a){void 0===t[e]&&(t[e]=a)};a(t,"color",this.getRandomColor()),a(t,"image",null),a(t,"imageBlob",""),a(t,"imageName",""),a(t,"label",""),a(t,"active",!0),a(t,"focus",!1),a(t,"hover",!1),a(t,"imageIsLoaded",!1),a(t,"id",this.dataVariantsCreated),this.dataVariantsCreated+=1,void 0===e?this.dataVariants.push(t):this.dataVariants.splice(e,0,t)},getRandomColor:function(){var t=function(t,e){return Math.pow(t*Math.E,-t*e)},e=360*Math.random(),a=Math.random()>.5?100*(1-t(1,4*Math.random())):100*(0+t(1,2*Math.random())),i=100-20*t(1,5*Math.random());return"#"+function(t,e,a){return((t<<16)+(e<<8)+a).toString(16).padStart(6,"0")}.apply(void 0,Object(n.a)(function(t,e,a){e/=100,a/=100;var i=function(e){return(e+t/60)%6},n=function(t){return a*(1-e*Math.max(0,Math.min(i(t),4-i(t),1)))};return[255*n(5),255*n(3),255*n(1)]}(e,a,i).map((function(t){return Math.round(t)}))))},randomizeColors:function(){var t,e=Object(i.a)(this.dataVariants);try{for(e.s();!(t=e.n()).done;){t.value.color=this.getRandomColor()}}catch(t){e.e(t)}finally{e.f()}},shuffleVariants:function(){for(var t,e=this.dataVariants.length;0!==e;){t=Math.floor(Math.random()*e),e--;var a=this.dataVariants[e],i=this.dataVariants[t];this.dataVariants.splice(e,1,i),this.dataVariants.splice(t,1,a)}},onVariantDeleteButtonClick:function(t){this.dataVariants.splice(this.dataVariants.indexOf(t),1)},onVariantCheckboxClick:function(t){t.active=!t.active},exclude:function(t){this.$refs.wheel.activeSectors.length>0&&(this.$refs.wheel.selectedSector.active=!1)},onVariantImageChange:function(t,e){e.imageBlob=URL.createObjectURL(t.target.files[0]),e.image=new Image,e.image.src=e.imageBlob,e.image.onload=function(){this.imageIsLoaded=!0}.bind(e),e.imageName=t.target.files[0].name},onVariantImageClick:function(t,e){e.imageBlob&&(e.image=null,e.imageBlob="",e.imageIsLoaded=!1,t.preventDefault())},changeImageDisplayMode:function(t){this.dataImageDidplayMode=t}},computed:{spinForceRange:function(){return this.maxSpinForce-this.minSpinForce},sectorToHighlight:function(){for(var t=-1,e=0;e<this.dataVariants.length;e++){if(this.dataVariants[e].focus&&this.dataVariants[e].active)return e;this.dataVariants[e].hover&&this.dataVariants[e].active&&(t=e)}return t}},watch:{},components:{WheelOfFortune:Object(h.a)(c,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"wof__wheel-of-fortune"},[a("svg",{ref:"wheel",staticClass:"wof__svg-wheel",attrs:{height:"100%",width:"100%",preserveAspectRatio:"none",viewBox:"0 0 "+t.svgWidth+" "+t.svgHeight},on:{mousedown:t.handleMouseDown,touchstart:t.handleTouchStart,touchend:t.handleTouchEnd}},["Pattern"===t.imageDisplayMode||"Resize"===t.imageDisplayMode?a("defs",[a("clipPath",{attrs:{id:"sector-clip"}},[a("path",{attrs:{d:t.createSvgArc(0,0,t.svgContentRadius,-t.arcRadians/2,t.arcRadians/2)}})])]):t._e(),a("circle",{attrs:{fill:"#ccc",cx:t.svgCenterX,cy:t.svgCenterY,r:t.svgContentRadius}}),a("g",{attrs:{transform:"translate("+t.svgCenterX+" "+t.svgCenterY+") rotate("+-t.angle/Math.PI*180+")"}},[t._l(t.processedSectors,(function(e,i){return[a("path",{key:"arc"+e.id,attrs:{d:t.createSvgArc(0,0,t.svgContentRadius,t.arcRadians*i,t.arcRadians*(i+1)),fill:e.color,stroke:t.colors.textColor,"stroke-width":t.svgStroke}}),a("g",{attrs:{"clip-path":"url(#sector-clip)",transform:"rotate("+-t.arcDegrees*(i+.5)+")"}},["Fit"===t.imageDisplayMode||"Resize"===t.imageDisplayMode?a("image",{attrs:{transform:e.transform,x:"0",y:"-1",width:e.imageRatio,height:"1",href:e.imageBlob}}):t._e()]),a("g",{key:"labelGroup"+e.id,attrs:{transform:"rotate("+-t.arcDegrees*(i+.5)+")"}},[a("text",{key:"label"+e.id,attrs:{transform:"translate("+(t.svgContentRadius/2+t.svgCenterRadius)+" 1)","font-size":"6","font-family":"serif",fill:t.colors.textColor,"text-anchor":"middle","pointer-events":"none"}},[t._v("\n            "+t._s(e.label)+"\n          ")])])]})),a("path",{attrs:{d:t.createSvgArc(0,0,t.svgContentRadius,t.arcRadians*t.selectedSectorOrder,t.arcRadians*(t.selectedSectorOrder+1)),fill:"transparent",stroke:t.colors.textColor,"stroke-width":t.svgFatStroke}}),a("path",{directives:[{name:"show",rawName:"v-show",value:-1!==t.highlightSegment,expression:"highlightSegment !== -1"}],attrs:{d:t.createSvgArc(0,0,t.svgContentRadius,t.arcRadians*t.highlightSegment,t.arcRadians*(t.highlightSegment+1)),fill:"transparent",stroke:t.colors.lowshadowColor,"stroke-width":t.svgFatStroke}})],2),a("polyline",{attrs:{points:"48,0 52,0 50,4",fill:t.colors.textColor}}),a("circle",{attrs:{cx:t.svgCenterX,cy:t.svgCenterY,r:t.svgCenterRadius,fill:t.colors.textColor,stroke:t.colors.textColor}})])])}),[],!1,null,"3e9c4bbe",null).exports}},d=(a("QMcg"),Object(h.a)(l,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("Layout",{attrs:{title:t.$t("wof.title")}},[a("main",[a("WheelOfFortune",{ref:"wheel",staticClass:"wof__wheel",attrs:{sectors:t.dataVariants,angle:t.dataAngle,imageDisplayMode:t.dataImageDidplayMode,highlightSegment:t.sectorToHighlight},on:{wofMouseDown:t.wheelMouseDownHandler,wofTouchStart:t.wheelTouchStartHandler,wofTouchEnd:t.wheelTouchEndHandler}}),a("div",{staticClass:"wof__controls"},[a("button",{on:{click:t.spinClockWise}},[t._v(t._s(t.$t("wof.spinCWButton"))),a("StatesIcon",{attrs:{images:["rotate-to-right-button.svg"]}})],1),a("button",{on:{click:t.spinCounterClockWise}},[t._v(t._s(t.$t("wof.spinCCWButton"))),a("StatesIcon",{attrs:{images:["rotate-to-left-button.svg"]}})],1),a("button",{on:{mousedown:t.startBrake,touchstart:t.touchStartBrake,touchend:t.touchEndBrake}},[t._v(t._s(t.$t("wof.brakeButton"))),a("StatesIcon",{attrs:{images:["underline-button.svg"]}})],1),a("button",{on:{mousedown:t.startAcceleration,touchstart:t.touchStartAcceleration,touchend:t.touchEndAcceleration}},[t._v(t._s(t.$t("wof.accelerateButton"))),a("StatesIcon",{attrs:{images:["motorcycle.svg"]}})],1),a("button",{on:{click:t.stop}},[t._v(t._s(t.$t("wof.stopButton"))),a("StatesIcon",{attrs:{images:["pause-button.svg"]}})],1),a("button",{on:{click:t.exclude}},[t._v(t._s(t.$t("wof.excludeButton"))),a("StatesIcon",{attrs:{images:["swap.svg"]}})],1)]),a("div",{staticClass:"wof__variants"},t._l(t.dataVariants,(function(e,i){return a("div",{staticClass:"wof__variants__item"},[a("input",{directives:[{name:"model",rawName:"v-model",value:e.color,expression:"variant.color"}],key:"color-"+e.id,staticClass:"color-input wof__variants__item--color-input",attrs:{type:"color"},domProps:{value:e.color},on:{input:function(a){a.target.composing||t.$set(e,"color",a.target.value)}}}),a("div",{key:"image-"+e.id,staticClass:"wof__variants__item--image"},[a("FileInput",{attrs:{accept:"image/*"},on:{fiChange:function(a){return t.onVariantImageChange(a,e)},click:function(a){return t.onVariantImageClick(a,e)}}},[a("StatesIcon",{attrs:{images:["image1.svg","image2.svg"],state:e.imageBlob?1:0}})],1)],1),a("TextInput",{key:"input-"+e.id,ref:"variantInput"+i,refInFor:!0,staticClass:"wof__variants__item--text-input",attrs:{stretchAxis:"y",placeholder:e.imageName},on:{input:function(a){return t.onVariantInputInput(a,e)},keydown:function(e){return t.onVariantInputKeydown(e,i)},focus:function(t){e.focus=!0},blur:function(t){e.focus=!1},mouseenter:function(t){e.hover=!0},mouseleave:function(t){e.hover=!1}},model:{value:e.label,callback:function(a){t.$set(e,"label",a)},expression:"variant.label"}}),a("div",{key:"active-"+e.id,staticClass:"wof__variants__item--checkbox"},[a("button",{on:{click:function(a){return t.onVariantCheckboxClick(e)}}},[a("StatesIcon",{attrs:{images:["blank.svg","checked.svg"],state:e.active?1:0}})],1)]),a("div",{key:"delete-"+e.id,staticClass:"wof__variants__item--delete"},[a("button",{on:{click:function(a){return t.onVariantDeleteButtonClick(e)}}},[a("StatesIcon",{attrs:{images:["close.svg"],state:0}})],1)])],1)})),0),a("button",{staticClass:"wof__add-variant-button",on:{click:function(e){return t.addVariant({})}}},[t._v("\n      "+t._s(t.$t("wof.addSector"))+"\n    ")]),a("div",{staticClass:"wof__variants-options"},[a("button",{on:{click:t.shuffleVariants}},[a("StatesIcon",{attrs:{images:["shuffle.svg"]}}),t._v("\n        "+t._s(t.$t("wof.shuffle"))+"\n      ")],1),a("button",{on:{click:t.randomizeColors}},[a("StatesIcon",{attrs:{images:["round-rgb-button.svg"]}}),t._v("\n        "+t._s(t.$t("wof.randomizeColors"))+"\n      ")],1),a("div",[t._v("\n        "+t._s(t.$t("wof.imageDisplayMode"))+t._s(t.$t("wof.imageDisplayMode"+t.dataImageDidplayMode))+"\n        "),a("Dropdown",[t._l(t.displayMods,(function(e){return[a("DropdownItem",{on:{click:function(a){return t.changeImageDisplayMode(e)}}},[a("StatesIcon",{attrs:{images:["circle-outline.svg","radio-on-button.svg"],state:t.dataImageDidplayMode===e?1:0}}),t._v("\n              "+t._s(t.$t("wof.imageDisplayMode"+e))+"\n            ")],1)]}))],2)],1)])],1)])}),[],!1,null,"2dedd821",null));e.default=d.exports},QMcg:function(t,e,a){"use strict";a("XZOI")},XZOI:function(t,e,a){},cTNl:function(t,e,a){t.exports={backgroundColor:"#fff",textColor:"#56261f",secondaryTextColor:"#886d66",errorColor:"#db5043",warningColor:"#f9a90d",highlightColor:"#f3eeed",lowshadowColor:"#c2a79e",buttonColor:"#f1ddd9"}}}]);