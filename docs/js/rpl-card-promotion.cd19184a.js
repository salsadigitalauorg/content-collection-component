(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["rpl-card-promotion"],{"0099":function(t,e,n){},"033c":function(t,e,n){"use strict";n.r(e),n.d(e,"RplGrantsOverview",(function(){return C})),n.d(e,"RplGrantsListItem",(function(){return T}));var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"rpl-grants-overview"},[t.title||t.list?n("rpl-list",{staticClass:"rpl-grants-overview__list",attrs:{size:"large",title:t.title,link:t.listing&&t.link&&t.link.url?t.link.url:null,list:t.list,"data-chromatic":"ignore"}}):t._e(),t.description?n("rpl-markup",{staticClass:"rpl-grants-overview__description",attrs:{html:t.description}}):t._e(),!t.listing&&t.link?n("rpl-button",{staticClass:"rpl-grants-overview__cta",attrs:{href:t.link.url,theme:"primary"}},[t._v(t._s(t.link.text))]):t._e()],1)},s=[],l=(n("99af"),n("c1df")),r=n.n(l),a=n("4f99"),o=n("cc40"),c=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"rpl-list",class:{"rpl-list--normal":"normal"===t.size,"rpl-list--large":"large"===t.size}},[t.title?n("h2",{staticClass:"rpl-list__title"},[t.link?n("rpl-text-link",{staticClass:"rpl-list__title-inner",attrs:{url:t.link,text:t.title}}):n("span",{staticClass:"rpl-list__title-inner"},[t._v(t._s(t.title))])],1):t._e(),t._t("above-list"),t.list?n("div",{staticClass:"rpl-list__list"},t._l(t.list,(function(e,i){return n("div",{key:i+"-"+e.id,staticClass:"rpl-list__list-item",attrs:{"data-tid":t.testId(e)}},[n("span",{staticClass:"rpl-list__icon"},[e.symbol?n("rpl-icon",{attrs:{symbol:e.symbol,color:e.color||t.iconColor,size:t.iconSize(e)}}):t._e()],1),e.link?n("rpl-link",{staticClass:"rpl-list__text",attrs:{href:e.link}},[t._v(t._s(e.text))]):n("span",{staticClass:"rpl-list__text",attrs:{href:e.link}},[t._v(t._s(e.text))])],1)})),0):t._e(),t._t("below-list")],2)},u=[],p=(n("a9e3"),n("d3b7"),n("25f0"),n("39a6")),d=n("2470"),f={name:"RplList",props:{title:String,link:String,size:{type:String,default:"normal"},iconScale:{type:Number,default:1},iconColor:{type:String,default:"primary"},list:Array},components:{RplLink:p["a"],RplTextLink:p["d"],RplIcon:d["c"]},methods:{iconSize:function(t){var e=(t.size?t.size:1)*this.iconScale;return e.toString()},testId:function(t){return t.id?t.id:null}}},g=f,_=(n("6ff7"),n("2877")),m=Object(_["a"])(g,c,u,!1,null,null,null),v=m.exports,y=n("0b4b"),b=n("627e"),h={name:"RplGrantsOverview",components:{RplButton:a["a"],RplMarkup:o["a"],RplList:v},mixins:[b["a"]],props:{title:{type:String,default:""},funding:{type:Object},audience:{type:String,default:""},startdate:{type:String,default:""},enddate:{type:String,default:""},description:{type:String,default:""},link:{type:Object,default:null},listing:{type:Boolean,default:!1},statusTerms:{type:Object,default:function(){return{open:"Open",closed:"Closed",ongoing:"Ongoing",openingSoon:function(t){return"Opening on ".concat(t)},closingSoon:function(t,e){var n=parseInt(t.diff(e,"days"));return n>1?"Open, closing in ".concat(n," days"):1===n?"Open, closing in ".concat(n," day"):"Open, closing today"}}}}},methods:{calcFunding:function(t,e){return t>0&&e>0?t===e?Object(y["b"])(t):"".concat(Object(y["b"])(t)," - ").concat(Object(y["b"])(e)):0===t&&e>0?"$0 - ".concat(Object(y["b"])(e)):t>0&&0===e?Object(y["b"])(t):null},calcStatus:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.statusTerms;if(t||e){var i=r()(),s=t?r()(t):null,l=e?r()(e):null;return s?i.isAfter(s)?l?i.isBefore(l)?n.closingSoon(l,i):n.closed:n.ongoing:i.isBetween(r()(s).subtract(1,"months"),s)?n.openingSoon(this.formatDate(t)):n.closed:l?i.isBefore(l)?n.closingSoon(l,i):n.closed:n.ongoing}return n.ongoing}},computed:{list:function(){var t=[];if(this.funding){var e=this.calcFunding(this.funding.from,this.funding.to);e&&t.push({symbol:"dollar_negative",size:20/12,text:e,id:"grants-funding"})}this.audience&&t.push({symbol:"user",size:20/12,text:this.audience,id:"grants-audience"});var n=this.calcStatus(this.startdate,this.enddate,this.statusTerms);return t.push({symbol:"Closed"===n?"cross_circle":"success",color:"Closed"===n?"danger":"success",size:"Closed"===n?20/24:1,text:n,id:"grants-status"}),t.length>0?t:null}}},k=h,S=(n("1f0f"),Object(_["a"])(k,i,s,!1,null,null,null)),C=S.exports,O=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"rpl-grants-list-item"},[n("rpl-grants-overview",{attrs:{listing:!0,title:t.title,funding:t.funding,audience:t.audience,startdate:t.startdate,enddate:t.enddate,description:t.description,link:t.link}}),n("ul",{staticClass:"rpl-grants-list-item__tags"},t._l(t.tags,(function(t,e){return n("li",{key:e,staticClass:"rpl-grants-list-item__tag"},[n("rpl-meta-tag",{attrs:{linkText:t.linkText,linkUrl:t.linkUrl}})],1)})),0)],1)},x=[],w=n("8989"),j={components:{RplGrantsOverview:C,RplMetaTag:w["a"]},props:{title:{type:String,default:""},funding:{type:Object},audience:{type:String,default:""},startdate:{type:String,default:""},enddate:{type:String,default:""},description:{type:String,default:""},link:{type:Object,default:null},tags:{type:Array,default:function(){return[]}}}},z=j,R=(n("4d642"),Object(_["a"])(z,O,x,!1,null,null,null)),T=R.exports;e["default"]=C},"1f0f":function(t,e,n){"use strict";n("ca5f")},"315e":function(t,e,n){},"4d642":function(t,e,n){"use strict";n("0099")},"6ff7":function(t,e,n){"use strict";n("315e")},ca5f:function(t,e,n){}}]);
//# sourceMappingURL=rpl-card-promotion.cd19184a.js.map