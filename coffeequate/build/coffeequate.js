
/*
 RequireJS 2.1.9 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(Z){function H(b){return"[object Function]"===L.call(b)}function I(b){return"[object Array]"===L.call(b)}function y(b,c){if(b){var e;for(e=0;e<b.length&&(!b[e]||!c(b[e],e,b));e+=1);}}function M(b,c){if(b){var e;for(e=b.length-1;-1<e&&(!b[e]||!c(b[e],e,b));e-=1);}}function t(b,c){return ga.call(b,c)}function l(b,c){return t(b,c)&&b[c]}function F(b,c){for(var e in b)if(t(b,e)&&c(b[e],e))break}function Q(b,c,e,h){c&&F(c,function(c,j){if(e||!t(b,j))h&&"string"!==typeof c?(b[j]||(b[j]={}),Q(b[j],
c,e,h)):b[j]=c});return b}function u(b,c){return function(){return c.apply(b,arguments)}}function aa(b){throw b;}function ba(b){if(!b)return b;var c=Z;y(b.split("."),function(b){c=c[b]});return c}function A(b,c,e,h){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=h;e&&(c.originalError=e);return c}function ha(b){function c(a,f,b){var d,m,c,g,e,h,j,i=f&&f.split("/");d=i;var n=k.map,p=n&&n["*"];if(a&&"."===a.charAt(0))if(f){d=l(k.pkgs,f)?i=[f]:i.slice(0,i.length-
1);f=a=d.concat(a.split("/"));for(d=0;f[d];d+=1)if(m=f[d],"."===m)f.splice(d,1),d-=1;else if(".."===m)if(1===d&&(".."===f[2]||".."===f[0]))break;else 0<d&&(f.splice(d-1,2),d-=2);d=l(k.pkgs,f=a[0]);a=a.join("/");d&&a===f+"/"+d.main&&(a=f)}else 0===a.indexOf("./")&&(a=a.substring(2));if(b&&n&&(i||p)){f=a.split("/");for(d=f.length;0<d;d-=1){c=f.slice(0,d).join("/");if(i)for(m=i.length;0<m;m-=1)if(b=l(n,i.slice(0,m).join("/")))if(b=l(b,c)){g=b;e=d;break}if(g)break;!h&&(p&&l(p,c))&&(h=l(p,c),j=d)}!g&&
h&&(g=h,e=j);g&&(f.splice(0,e,g),a=f.join("/"))}return a}function e(a){z&&y(document.getElementsByTagName("script"),function(f){if(f.getAttribute("data-requiremodule")===a&&f.getAttribute("data-requirecontext")===i.contextName)return f.parentNode.removeChild(f),!0})}function h(a){var f=l(k.paths,a);if(f&&I(f)&&1<f.length)return f.shift(),i.require.undef(a),i.require([a]),!0}function $(a){var f,b=a?a.indexOf("!"):-1;-1<b&&(f=a.substring(0,b),a=a.substring(b+1,a.length));return[f,a]}function n(a,f,
b,d){var m,B,g=null,e=f?f.name:null,h=a,j=!0,k="";a||(j=!1,a="_@r"+(L+=1));a=$(a);g=a[0];a=a[1];g&&(g=c(g,e,d),B=l(r,g));a&&(g?k=B&&B.normalize?B.normalize(a,function(a){return c(a,e,d)}):c(a,e,d):(k=c(a,e,d),a=$(k),g=a[0],k=a[1],b=!0,m=i.nameToUrl(k)));b=g&&!B&&!b?"_unnormalized"+(M+=1):"";return{prefix:g,name:k,parentMap:f,unnormalized:!!b,url:m,originalName:h,isDefine:j,id:(g?g+"!"+k:k)+b}}function q(a){var f=a.id,b=l(p,f);b||(b=p[f]=new i.Module(a));return b}function s(a,f,b){var d=a.id,m=l(p,
d);if(t(r,d)&&(!m||m.defineEmitComplete))"defined"===f&&b(r[d]);else if(m=q(a),m.error&&"error"===f)b(m.error);else m.on(f,b)}function v(a,f){var b=a.requireModules,d=!1;if(f)f(a);else if(y(b,function(f){if(f=l(p,f))f.error=a,f.events.error&&(d=!0,f.emit("error",a))}),!d)j.onError(a)}function w(){R.length&&(ia.apply(G,[G.length-1,0].concat(R)),R=[])}function x(a){delete p[a];delete T[a]}function E(a,f,b){var d=a.map.id;a.error?a.emit("error",a.error):(f[d]=!0,y(a.depMaps,function(d,c){var g=d.id,
e=l(p,g);e&&(!a.depMatched[c]&&!b[g])&&(l(f,g)?(a.defineDep(c,r[g]),a.check()):E(e,f,b))}),b[d]=!0)}function C(){var a,f,b,d,m=(b=1E3*k.waitSeconds)&&i.startTime+b<(new Date).getTime(),c=[],g=[],j=!1,l=!0;if(!U){U=!0;F(T,function(b){a=b.map;f=a.id;if(b.enabled&&(a.isDefine||g.push(b),!b.error))if(!b.inited&&m)h(f)?j=d=!0:(c.push(f),e(f));else if(!b.inited&&(b.fetched&&a.isDefine)&&(j=!0,!a.prefix))return l=!1});if(m&&c.length)return b=A("timeout","Load timeout for modules: "+c,null,c),b.contextName=
i.contextName,v(b);l&&y(g,function(a){E(a,{},{})});if((!m||d)&&j)if((z||da)&&!V)V=setTimeout(function(){V=0;C()},50);U=!1}}function D(a){t(r,a[0])||q(n(a[0],null,!0)).init(a[1],a[2])}function J(a){var a=a.currentTarget||a.srcElement,b=i.onScriptLoad;a.detachEvent&&!W?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=i.onScriptError;(!a.detachEvent||W)&&a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}function K(){var a;for(w();G.length;){a=
G.shift();if(null===a[0])return v(A("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));D(a)}}var U,X,i,N,V,k={waitSeconds:7,baseUrl:"./",paths:{},pkgs:{},shim:{},config:{}},p={},T={},Y={},G=[],r={},S={},L=1,M=1;N={require:function(a){return a.require?a.require:a.require=i.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?a.exports:a.exports=r[a.map.id]={}},module:function(a){return a.module?a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){var b=
l(k.pkgs,a.map.id);return(b?l(k.config,a.map.id+"/"+b.main):l(k.config,a.map.id))||{}},exports:r[a.map.id]}}};X=function(a){this.events=l(Y,a.id)||{};this.map=a;this.shim=l(k.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};X.prototype={init:function(a,b,c,d){d=d||{};if(!this.inited){this.factory=b;if(c)this.on("error",c);else this.events.error&&(c=u(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.errback=c;this.inited=!0;
this.ignore=d.ignore;d.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=b)},fetch:function(){if(!this.fetched){this.fetched=!0;i.startTime=(new Date).getTime();var a=this.map;if(this.shim)i.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],u(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=
this.map.url;S[a]||(S[a]=!0,i.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var d=this.exports,m=this.factory;if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(H(m)){if(this.events.error&&this.map.isDefine||j.onError!==aa)try{d=i.execCb(c,m,b,d)}catch(e){a=e}else d=i.execCb(c,m,b,d);this.map.isDefine&&((b=this.module)&&void 0!==b.exports&&b.exports!==
this.exports?d=b.exports:void 0===d&&this.usingExports&&(d=this.exports));if(a)return a.requireMap=this.map,a.requireModules=this.map.isDefine?[this.map.id]:null,a.requireType=this.map.isDefine?"define":"require",v(this.error=a)}else d=m;this.exports=d;if(this.map.isDefine&&!this.ignore&&(r[c]=d,j.onResourceLoad))j.onResourceLoad(i,this.map,this.depMaps);x(c);this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=
!0)}}else this.fetch()}},callPlugin:function(){var a=this.map,b=a.id,e=n(a.prefix);this.depMaps.push(e);s(e,"defined",u(this,function(d){var m,e;e=this.map.name;var g=this.map.parentMap?this.map.parentMap.name:null,h=i.makeRequire(a.parentMap,{enableBuildCallback:!0});if(this.map.unnormalized){if(d.normalize&&(e=d.normalize(e,function(a){return c(a,g,!0)})||""),d=n(a.prefix+"!"+e,this.map.parentMap),s(d,"defined",u(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),
e=l(p,d.id)){this.depMaps.push(d);if(this.events.error)e.on("error",u(this,function(a){this.emit("error",a)}));e.enable()}}else m=u(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),m.error=u(this,function(a){this.inited=!0;this.error=a;a.requireModules=[b];F(p,function(a){0===a.map.id.indexOf(b+"_unnormalized")&&x(a.map.id)});v(a)}),m.fromText=u(this,function(d,c){var e=a.name,g=n(e),B=O;c&&(d=c);B&&(O=!1);q(g);t(k.config,b)&&(k.config[e]=k.config[b]);try{j.exec(d)}catch(ca){return v(A("fromtexteval",
"fromText eval for "+b+" failed: "+ca,ca,[b]))}B&&(O=!0);this.depMaps.push(g);i.completeLoad(e);h([e],m)}),d.load(a.name,h,m,k)}));i.enable(e,this);this.pluginMaps[e.id]=e},enable:function(){T[this.map.id]=this;this.enabling=this.enabled=!0;y(this.depMaps,u(this,function(a,b){var c,d;if("string"===typeof a){a=n(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[b]=a;if(c=l(N,a.id)){this.depExports[b]=c(this);return}this.depCount+=1;s(a,"defined",u(this,function(a){this.defineDep(b,
a);this.check()}));this.errback&&s(a,"error",u(this,this.errback))}c=a.id;d=p[c];!t(N,c)&&(d&&!d.enabled)&&i.enable(a,this)}));F(this.pluginMaps,u(this,function(a){var b=l(p,a.id);b&&!b.enabled&&i.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){y(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};i={config:k,contextName:b,registry:p,defined:r,urlFetched:S,defQueue:G,Module:X,makeModuleMap:n,
nextTick:j.nextTick,onError:v,configure:function(a){a.baseUrl&&"/"!==a.baseUrl.charAt(a.baseUrl.length-1)&&(a.baseUrl+="/");var b=k.pkgs,c=k.shim,d={paths:!0,config:!0,map:!0};F(a,function(a,b){d[b]?"map"===b?(k.map||(k.map={}),Q(k[b],a,!0,!0)):Q(k[b],a,!0):k[b]=a});a.shim&&(F(a.shim,function(a,b){I(a)&&(a={deps:a});if((a.exports||a.init)&&!a.exportsFn)a.exportsFn=i.makeShimExports(a);c[b]=a}),k.shim=c);a.packages&&(y(a.packages,function(a){a="string"===typeof a?{name:a}:a;b[a.name]={name:a.name,
location:a.location||a.name,main:(a.main||"main").replace(ja,"").replace(ea,"")}}),k.pkgs=b);F(p,function(a,b){!a.inited&&!a.map.unnormalized&&(a.map=n(b))});if(a.deps||a.callback)i.require(a.deps||[],a.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(Z,arguments));return b||a.exports&&ba(a.exports)}},makeRequire:function(a,f){function h(d,c,e){var g,k;f.enableBuildCallback&&(c&&H(c))&&(c.__requireJsBuild=!0);if("string"===typeof d){if(H(c))return v(A("requireargs",
"Invalid require call"),e);if(a&&t(N,d))return N[d](p[a.id]);if(j.get)return j.get(i,d,a,h);g=n(d,a,!1,!0);g=g.id;return!t(r,g)?v(A("notloaded",'Module name "'+g+'" has not been loaded yet for context: '+b+(a?"":". Use require([])"))):r[g]}K();i.nextTick(function(){K();k=q(n(null,a));k.skipMap=f.skipMap;k.init(d,c,e,{enabled:!0});C()});return h}f=f||{};Q(h,{isBrowser:z,toUrl:function(b){var f,e=b.lastIndexOf("."),g=b.split("/")[0];if(-1!==e&&(!("."===g||".."===g)||1<e))f=b.substring(e,b.length),b=
b.substring(0,e);return i.nameToUrl(c(b,a&&a.id,!0),f,!0)},defined:function(b){return t(r,n(b,a,!1,!0).id)},specified:function(b){b=n(b,a,!1,!0).id;return t(r,b)||t(p,b)}});a||(h.undef=function(b){w();var c=n(b,a,!0),f=l(p,b);e(b);delete r[b];delete S[c.url];delete Y[b];f&&(f.events.defined&&(Y[b]=f.events),x(b))});return h},enable:function(a){l(p,a.id)&&q(a).enable()},completeLoad:function(a){var b,c,d=l(k.shim,a)||{},e=d.exports;for(w();G.length;){c=G.shift();if(null===c[0]){c[0]=a;if(b)break;b=
!0}else c[0]===a&&(b=!0);D(c)}c=l(p,a);if(!b&&!t(r,a)&&c&&!c.inited){if(k.enforceDefine&&(!e||!ba(e)))return h(a)?void 0:v(A("nodefine","No define call for "+a,null,[a]));D([a,d.deps||[],d.exportsFn])}C()},nameToUrl:function(a,b,c){var d,e,h,g,i,n;if(j.jsExtRegExp.test(a))g=a+(b||"");else{d=k.paths;e=k.pkgs;g=a.split("/");for(i=g.length;0<i;i-=1)if(n=g.slice(0,i).join("/"),h=l(e,n),n=l(d,n)){I(n)&&(n=n[0]);g.splice(0,i,n);break}else if(h){a=a===h.name?h.location+"/"+h.main:h.location;g.splice(0,i,
a);break}g=g.join("/");g+=b||(/^data\:|\?/.test(g)||c?"":".js");g=("/"===g.charAt(0)||g.match(/^[\w\+\.\-]+:/)?"":k.baseUrl)+g}return k.urlArgs?g+((-1===g.indexOf("?")?"?":"&")+k.urlArgs):g},load:function(a,b){j.load(i,a,b)},execCb:function(a,b,c,d){return b.apply(d,c)},onScriptLoad:function(a){if("load"===a.type||ka.test((a.currentTarget||a.srcElement).readyState))P=null,a=J(a),i.completeLoad(a.id)},onScriptError:function(a){var b=J(a);if(!h(b.id))return v(A("scripterror","Script error for: "+b.id,
a,[b.id]))}};i.require=i.makeRequire();return i}var j,w,x,C,J,D,P,K,q,fa,la=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,ma=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,ea=/\.js$/,ja=/^\.\//;w=Object.prototype;var L=w.toString,ga=w.hasOwnProperty,ia=Array.prototype.splice,z=!!("undefined"!==typeof window&&"undefined"!==typeof navigator&&window.document),da=!z&&"undefined"!==typeof importScripts,ka=z&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,W="undefined"!==typeof opera&&
"[object Opera]"===opera.toString(),E={},s={},R=[],O=!1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(H(requirejs))return;s=requirejs;requirejs=void 0}"undefined"!==typeof require&&!H(require)&&(s=require,require=void 0);j=requirejs=function(b,c,e,h){var q,n="_";!I(b)&&"string"!==typeof b&&(q=b,I(c)?(b=c,c=e,e=h):b=[]);q&&q.context&&(n=q.context);(h=l(E,n))||(h=E[n]=j.s.newContext(n));q&&h.configure(q);return h.require(b,c,e)};j.config=function(b){return j(b)};j.nextTick="undefined"!==
typeof setTimeout?function(b){setTimeout(b,4)}:function(b){b()};require||(require=j);j.version="2.1.9";j.jsExtRegExp=/^\/|:|\?|\.js$/;j.isBrowser=z;w=j.s={contexts:E,newContext:ha};j({});y(["toUrl","undef","defined","specified"],function(b){j[b]=function(){var c=E._;return c.require[b].apply(c,arguments)}});if(z&&(x=w.head=document.getElementsByTagName("head")[0],C=document.getElementsByTagName("base")[0]))x=w.head=C.parentNode;j.onError=aa;j.createNode=function(b){var c=b.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml",
"html:script"):document.createElement("script");c.type=b.scriptType||"text/javascript";c.charset="utf-8";c.async=!0;return c};j.load=function(b,c,e){var h=b&&b.config||{};if(z)return h=j.createNode(h,c,e),h.setAttribute("data-requirecontext",b.contextName),h.setAttribute("data-requiremodule",c),h.attachEvent&&!(h.attachEvent.toString&&0>h.attachEvent.toString().indexOf("[native code"))&&!W?(O=!0,h.attachEvent("onreadystatechange",b.onScriptLoad)):(h.addEventListener("load",b.onScriptLoad,!1),h.addEventListener("error",
b.onScriptError,!1)),h.src=e,K=h,C?x.insertBefore(h,C):x.appendChild(h),K=null,h;if(da)try{importScripts(e),b.completeLoad(c)}catch(l){b.onError(A("importscripts","importScripts failed for "+c+" at "+e,l,[c]))}};z&&!s.skipDataMain&&M(document.getElementsByTagName("script"),function(b){x||(x=b.parentNode);if(J=b.getAttribute("data-main"))return q=J,s.baseUrl||(D=q.split("/"),q=D.pop(),fa=D.length?D.join("/")+"/":"./",s.baseUrl=fa),q=q.replace(ea,""),j.jsExtRegExp.test(q)&&(q=J),s.deps=s.deps?s.deps.concat(q):
[q],!0});define=function(b,c,e){var h,j;"string"!==typeof b&&(e=c,c=b,b=null);I(c)||(e=c,c=null);!c&&H(e)&&(c=[],e.length&&(e.toString().replace(la,"").replace(ma,function(b,e){c.push(e)}),c=(1===e.length?["require"]:["require","exports","module"]).concat(c)));if(O){if(!(h=K))P&&"interactive"===P.readyState||M(document.getElementsByTagName("script"),function(b){if("interactive"===b.readyState)return P=b}),h=P;h&&(b||(b=h.getAttribute("data-requiremodule")),j=E[h.getAttribute("data-requirecontext")])}(j?
j.defQueue:R).push([b,c,e])};define.amd={jQuery:!0};j.exec=function(b){return eval(b)};j(s)}})(this);

define("requireLib", function(){});

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('nodes',[],function() {
    var BasicNode;
    BasicNode = (function() {
      function BasicNode(label) {
        this.label = label;
      }

      BasicNode.prototype.getChildren = function() {
        return [];
      };

      return BasicNode;

    })();
    return {
      BasicNode: BasicNode,
      RoseNode: (function(_super) {
        __extends(_Class, _super);

        function _Class(label, children) {
          this.children = children != null ? children : null;
          if (this.children == null) {
            this.children = [];
          }
          _Class.__super__.constructor.call(this, label);
        }

        _Class.prototype.getChildren = function() {
          return this.children;
        };

        _Class.prototype.toLisp = function() {
          return "(" + this.label + (this.children ? " " : "") + (this.children.join(" ")) + ")";
        };

        _Class.prototype.toString = function() {
          return "(" + (this.children.join(" " + this.label + " ")) + ")";
        };

        return _Class;

      })(BasicNode),
      BinaryNode: (function(_super) {
        __extends(_Class, _super);

        function _Class(label, left, right) {
          this.label = label;
          this.children = {
            left: left,
            right: right
          };
        }

        _Class.prototype.getChildren = function() {
          return [this.children.left, this.children.right];
        };

        _Class.prototype.toLisp = function() {
          return "(" + this.label + " " + this.children.left + " " + this.children.right + ")";
        };

        _Class.prototype.toString = function() {
          return "(" + this.children.left + " " + this.label + " " + this.children.right + ")";
        };

        return _Class;

      })(BasicNode)
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('parse',["require"], function(require) {
    var ParseError, StringToExpression, stringToTerminal;
    ParseError = (function(_super) {
      __extends(ParseError, _super);

      function ParseError(input, type) {
        this.input = input;
        this.type = type;
      }

      ParseError.prototype.toString = function() {
        return "Could not parse '" + this.input + "' as " + this.type;
      };

      return ParseError;

    })(Error);
    stringToTerminal = function(string) {
      var terminals;
      terminals = require("terminals");
      if (/\d+(\.\d+)?/.test(string) || /\d+(\.\d+)?\/\d+(\.\d+)?/.test(string)) {
        return new terminals.Constant(string);
      } else if (/[a-zA-Z][a-zA-Z_\-\d]*/.test(string)) {
        return new terminals.Variable(string);
      } else {
        throw new ParseError(string, "terminal");
      }
    };
    StringToExpression = (function() {
      /*
      			ADDN := MULT | ADDN "+" MULT
      			MULT := POWR | MULT "*" POWR
      			POWR := BRAC | POWR "**" BRAC
      			BRAC := "-" BRAC | "(" ADDN ")" | TERM
      			TERM := <Existing Code>
      */

      function StringToExpression(string) {
        this.tokens = StringToExpression.tokenise(string).reverse();
        this.upto = 0;
        this.operators = require("operators");
        return this.parseAddition();
      }

      StringToExpression.tokenise = function(string) {
        return string.split(/(\*\*|[+*()\-]|\s)/).filter(function(z) {
          return !/^\s*$/.test(z);
        });
      };

      StringToExpression.prototype.getToken = function() {
        return this.tokens[this.upto];
      };

      StringToExpression.prototype.parseAddition = function() {
        var addn, mult;
        mult = this.parseMultiplication();
        if (this.getToken() !== "+") {
          return mult;
        }
        this.upto += 1;
        addn = this.parseAddition();
        return new this.operators.Add(addn, mult);
      };

      StringToExpression.prototype.parseMultiplication = function() {
        var mult, powr;
        powr = this.parsePower();
        if (this.getToken() !== "*") {
          return powr;
        }
        this.upto += 1;
        mult = this.parseMultiplication();
        return new this.operators.Mul(mult, powr);
      };

      StringToExpression.prototype.parsePower = function() {
        var brac, powr;
        brac = this.parseBracket();
        if (this.getToken() !== "**") {
          return brac;
        }
        this.upto += 1;
        powr = this.parsePower();
        return new this.operators.Pow(powr, brac);
      };

      StringToExpression.prototype.parseBracket = function() {
        var addn, term;
        if (this.getToken() === ")") {
          this.upto += 1;
          addn = this.parseAddition();
          if (this.getToken() !== "(") {
            throw new Error(("ParseError: Expected '(' but found '" + (this.getToken()) + "' at position ") + ("" + (this.tokens.length - this.upto) + "/" + this.tokens.length + " in token stream '" + (this.tokens.reverse().join(" ")) + "'"));
          }
          this.upto += 1;
          if (this.getToken() === "-") {
            this.upto += 1;
            return new this.operators.Mul(-1, addn);
          } else {
            return addn;
          }
        } else {
          term = this.parseTerm();
          if (this.getToken() === "-") {
            this.upto += 1;
            return new this.operators.Mul(-1, term);
          } else {
            return term;
          }
        }
      };

      StringToExpression.prototype.parseTerm = function() {
        var term;
        term = stringToTerminal(this.getToken());
        this.upto += 1;
        return term;
      };

      return StringToExpression;

    })();
    return {
      ParseError: ParseError,
      stringToExpression: function(string) {
        return new StringToExpression(string);
      },
      constant: function(value) {
        if (typeof value === "string" || value instanceof String) {
          if (value === "") {
            throw new ParseError("", "constant");
          }
          value = value.split("/");
          if (value.length === 1) {
            return [parseFloat(value[0]), 1];
          } else if (value.length === 2) {
            return [parseFloat(value[0]), parseFloat(value[1])];
          } else {
            throw new ParseError(value.join("/"), "constant");
          }
        } else if (typeof value === "number" || value instanceof Number) {
          return [value, 1];
        } else {
          throw new ParseError(value, "constant");
        }
      },
      stringToTerminal: stringToTerminal
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define('generateInfo',[],function() {
    return {
      getMathMLInfo: function(equationID, expression, equality) {
        var html, mathClass, mathID;
        if (equality == null) {
          equality = "0";
        }
        mathClass = expression ? "expression" : "equation";
        mathID = "" + mathClass + "-" + (equationID != null ? equationID : Math.floor(Math.random() * 10000000).toString(16));
        html = '<div id="' + mathID + '" class="' + mathClass + '"><math xmlns="http://www.w3.org/1998/Math/MathML">' + (equality != null ? (isFinite(equality) ? "<mn>" + equality + "</mn>" : "<mi>" + equality + "</mi>") + "<mo>=</mo>" : "");
        return [mathClass, mathID, html];
      },
      getHTMLInfo: function(equationID, expression, equality) {
        var html, mathClass, mathID;
        if (equality == null) {
          equality = "0";
        }
        mathClass = expression ? "expression" : "equation";
        mathID = "" + mathClass + "-" + (equationID != null ? equationID : Math.floor(Math.random() * 10000000).toString(16));
        html = '<div id="' + mathID + '" class="' + mathClass + '">' + (equality != null ? (isFinite(equality) ? "" + equality : "" + equality) + "=" : "");
        return [mathClass, mathID, html];
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('terminals',["parse", "generateInfo"], function(parse, generateInfo) {
    var Constant, SymbolicConstant, Terminal, Variable;
    Terminal = (function() {
      function Terminal(label) {
        this.label = label;
      }

      Terminal.prototype.evaluate = function() {};

      Terminal.prototype.copy = function() {
        return new Terminal(this.label);
      };

      Terminal.prototype.toString = function() {
        return this.label;
      };

      return Terminal;

    })();
    Constant = (function(_super) {
      __extends(Constant, _super);

      function Constant(value, denominator) {
        var _ref, _ref1;
        this.denominator = denominator != null ? denominator : null;
        this.cmp = -6;
        if (this.denominator != null) {
          _ref = parse.constant(value), this.numerator = _ref[0], denominator = _ref[1];
          this.denominator *= denominator;
        } else {
          _ref1 = parse.constant(value), this.numerator = _ref1[0], this.denominator = _ref1[1];
        }
      }

      Constant.prototype.evaluate = function() {
        return this.numerator / this.denominator;
      };

      Constant.prototype.copy = function() {
        return new Constant(this.numerator, this.denominator);
      };

      Constant.prototype.compareSameType = function(b) {
        if (this.evaluate() < b.evaluate()) {
          return -1;
        } else if (this.evaluate() === b.evaluate()) {
          return 0;
        } else {
          return 1;
        }
      };

      Constant.prototype.multiply = function(b) {
        return new Constant(this.numerator * b.numerator, this.denominator * b.denominator);
      };

      Constant.prototype.add = function(b) {
        return new Constant(b.denominator * this.numerator + this.denominator * b.numerator, this.denominator * b.denominator);
      };

      Constant.prototype.equals = function(b) {
        if (!(b instanceof Constant)) {
          return false;
        }
        return this.evaluate() === b.evaluate();
      };

      Constant.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        if (this.denominator === 1) {
          return "<mn>" + this.numerator + "</mn>";
        }
        return "<mfrac><mrow><mn>" + this.numerator + "</mn></mrow><mrow><mn>" + this.denominator + "</mn></mrow</mfrac>";
      };

      Constant.prototype.toHTML = function() {
        if (this.denominator === 1) {
          return "" + this.numerator;
        }
        return "(" + this.numerator + "/" + this.denominator + ")";
      };

      Constant.prototype.toLaTeX = function() {
        if (this.denominator === 1) {
          return "" + this.numerator;
        }
        return "\\frac{" + this.numerator + "}{" + this.denominator + "}";
      };

      Constant.prototype.toString = function() {
        if (this.denominator !== 1) {
          return "" + this.numerator + "/" + this.denominator;
        }
        return "" + this.numerator;
      };

      return Constant;

    })(Terminal);
    SymbolicConstant = (function(_super) {
      __extends(SymbolicConstant, _super);

      function SymbolicConstant(label, value) {
        this.label = label;
        this.value = value != null ? value : null;
        this.cmp = -5;
      }

      SymbolicConstant.prototype.copy = function() {
        return new SymbolicConstant(this.label, this.value);
      };

      SymbolicConstant.prototype.compareSameType = function(b) {
        if (this.label < b.label) {
          return -1;
        } else if (this.label === b.label) {
          return 0;
        } else {
          return 1;
        }
      };

      SymbolicConstant.prototype.evaluate = function() {
        return this.value;
      };

      SymbolicConstant.prototype.equals = function(b) {
        if (!(b instanceof SymbolicConstant)) {
          return false;
        }
        return this.label === b.label && this.value === b.value;
      };

      SymbolicConstant.prototype.toHTML = function() {
        return this.toString();
      };

      SymbolicConstant.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        return "" + html + "<mn>" + this.label + "</mn>" + closingHTML;
      };

      SymbolicConstant.prototype.toLaTeX = function() {
        return this.toString();
      };

      return SymbolicConstant;

    })(Terminal);
    Variable = (function(_super) {
      __extends(Variable, _super);

      function Variable(label) {
        this.label = label;
        this.cmp = -4;
      }

      Variable.prototype.copy = function() {
        return new Variable(this.label);
      };

      Variable.prototype.compareSameType = function(b) {
        if (this.label < b.label) {
          return -1;
        } else if (this.label === b.label) {
          return 0;
        } else {
          return 1;
        }
      };

      Variable.prototype.equals = function(b) {
        if (!(b instanceof Variable)) {
          return false;
        }
        return b.label === this.label;
      };

      Variable.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, label, labelArray, labelID, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        if (topLevel) {
          _ref = generateInfo.getMathMLInfo(equationID, expression), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
          closingHTML = "</math></div>";
        } else {
          html = "";
          closingHTML = "";
        }
        labelArray = this.label.split("-");
        label = labelArray[0];
        labelID = labelArray[1] != null ? 'id="variable-' + this.label + '"' : "";
        if (label.length > 1) {
          return html + '<msub class="variable"' + labelID + '><mi>' + label[0] + '</mi><mi>' + label.slice(1) + "</mi></msub>" + closingHTML;
        } else {
          return html + '<mi class="variable"' + labelID + '>' + label + '</mi>' + closingHTML;
        }
      };

      Variable.prototype.toHTML = function() {
        var label, labelArray, labelID;
        labelArray = this.label.split("-");
        label = labelArray[0];
        labelID = labelArray[1] != null ? 'id="variable-' + this.label + '"' : "";
        return '<span class="variable"' + labelID + '>' + label + '</span>';
      };

      Variable.prototype.toLaTeX = function() {
        return this.toString();
      };

      return Variable;

    })(Terminal);
    return {
      Terminal: Terminal,
      Variable: Variable,
      Constant: Constant,
      SymbolicConstant: SymbolicConstant
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define('operators',["nodes", "parse", "terminals", "generateInfo"], function(nodes, parse, terminals, generateInfo) {
    var Add, AlgebraError, Mul, Pow, compare, parseArgs, prettyPrint;
    AlgebraError = (function(_super) {
      __extends(AlgebraError, _super);

      function AlgebraError(expr, variable, postscript) {
        if (postscript == null) {
          postscript = null;
        }
        AlgebraError.__super__.constructor.call(this, "Unsolvable: " + expr + " for " + variable + (postscript ? ";" + postscript : ""));
      }

      return AlgebraError;

    })(Error);
    prettyPrint = function(array) {
      var i, out, _i, _len;
      out = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        i = array[_i];
        if (i instanceof Array) {
          out.push(prettyPrint(i));
        } else {
          out.push(typeof i.toString === "function" ? i.toString() : void 0);
        }
      }
      return "[" + out.join(", ") + "]";
    };
    parseArgs = function() {
      var arg, args, outArgs, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      outArgs = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        if (typeof arg === "string" || arg instanceof String) {
          outArgs.push(parse.stringToTerminal(arg));
        } else if (typeof arg === "number" || arg instanceof Number) {
          outArgs.push(new terminals.Constant(arg));
        } else if (arg instanceof terminals.Terminal || arg instanceof nodes.BasicNode || (arg.isTerminal != null)) {
          outArgs.push(arg);
        } else {
          throw new Error("Invalid argument " + arg + ", (" + (typeof arg) + "), (" + (arg.toString()) + ")");
        }
      }
      return outArgs;
    };
    Add = (function(_super) {
      __extends(Add, _super);

      function Add() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length < 1) {
          throw new Error("Add nodes must have at least one child.");
        }
        this.cmp = -1;
        args = parseArgs.apply(null, args);
        Add.__super__.constructor.call(this, "+", args);
      }

      Add.prototype.copy = function() {
        var args, i;
        args = (function() {
          var _i, _len, _ref, _results;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.copy != null ? i.copy() : i);
          }
          return _results;
        }).call(this);
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, args, function(){});
      };

      Add.prototype.compareSameType = function(b) {
        var c, child, index, lengthComparison, _i, _len, _ref;
        if (this.children.length === b.children.length) {
          lengthComparison = 0;
        } else if (this.children.length < b.children.length) {
          lengthComparison = -1;
        } else {
          lengthComparison = 1;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (b.children[index] == null) {
            return 1;
          }
          c = compare(this.children[index], b.children[index]);
          if (c !== 0) {
            return c;
          }
        }
        return lengthComparison;
      };

      Add.prototype.expand = function() {
        var add, c, child, children, _i, _j, _len, _len1, _ref, _ref1;
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.expand != null) {
            child = child.expand();
          } else if (child.copy != null) {
            child = child.copy();
          }
          if (child instanceof Add) {
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              children.push(c);
            }
          } else {
            children.push(child);
          }
        }
        add = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
        add.sort();
        return add;
      };

      Add.prototype.sort = function() {
        var child, _i, _len, _ref;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (typeof child.sort === "function") {
            child.sort();
          }
        }
        return this.children.sort(compare);
      };

      Add.prototype.equals = function(b) {
        var child, index, _i, _len, _ref;
        if (!(b instanceof Add)) {
          return false;
        }
        if (b.children.length !== this.children.length) {
          return false;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child.equals != null) {
            if (!child.equals(b.children[index])) {
              return false;
            }
          } else {
            if (child !== b.children[index]) {
              return false;
            }
          }
        }
        return true;
      };

      Add.prototype.simplify = function() {
        var c, child, constantterm, constanttermmul, found, i, index, liketerm, liketerms, newAdd, newMul, term, terms, variabletermmul, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2;
        terms = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.simplify != null) {
            child = child.simplify();
          } else if (child.copy != null) {
            child = child.copy();
          }
          terms.push(child);
        }
        liketerms = [];
        constantterm = null;
        i = 0;
        while (i < terms.length) {
          term = terms[i];
          if (term instanceof Add) {
            terms.splice(i, 1)[0];
            _ref1 = term.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              terms.push(c);
            }
            i -= 1;
          } else if (term instanceof terminals.Constant) {
            if (constantterm != null) {
              constantterm = constantterm.add(term);
            } else {
              constantterm = term.copy();
            }
          } else if (term instanceof Mul) {
            constanttermmul = null;
            variabletermmul = null;
            _ref2 = term.children;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              child = _ref2[_k];
              if (child instanceof terminals.Constant) {
                if (constanttermmul != null) {
                  constanttermmul = constanttermmul.multiply(child);
                } else {
                  constanttermmul = child.copy();
                }
              } else {
                if (variabletermmul != null) {
                  variabletermmul.children.push(child);
                } else {
                  variabletermmul = new Mul(child);
                }
              }
            }
            if (variabletermmul.children.length === 1) {
              variabletermmul = variabletermmul.children[0];
            }
            if ((constanttermmul != null) && (variabletermmul == null)) {
              if (constantterm != null) {
                constantterm = constantterm.add(constanttermmul);
              } else {
                constantterm = constanttermmul.copy();
              }
            } else {
              if (constanttermmul == null) {
                constanttermmul = new terminals.Constant("1");
              }
              found = false;
              for (index = _l = 0, _len3 = liketerms.length; _l < _len3; index = ++_l) {
                liketerm = liketerms[index];
                if (liketerm[0].equals != null) {
                  if (liketerm[0].equals(variabletermmul)) {
                    liketerms[index][1] = new Add(liketerm[1], constanttermmul);
                    liketerms[index][1] = liketerms[index][1].simplify();
                    found = true;
                  }
                } else if (liketerm[0] === variabletermmul) {
                  liketerms[index][1] = new Add(liketerm[1], constanttermmul);
                  liketerms[index][1] = liketerms[index][1].simplify();
                  found = true;
                }
              }
              if (!found) {
                liketerms.push([variabletermmul, constanttermmul]);
              }
            }
          } else {
            found = false;
            for (index = _m = 0, _len4 = liketerms.length; _m < _len4; index = ++_m) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(term)) {
                  liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                  liketerms[index][1] = liketerms[index][1].simplify();
                  found = true;
                }
              } else if (liketerm[0] === term) {
                liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                liketerms[index][1] = liketerms[index][1].simplify();
                found = true;
              }
            }
            if (!found) {
              liketerms.push([term, new terminals.Constant("1")]);
            }
          }
          i += 1;
        }
        newAdd = null;
        for (_n = 0, _len5 = liketerms.length; _n < _len5; _n++) {
          liketerm = liketerms[_n];
          if ((liketerm[0].children != null) && liketerm[0].children.length === 1) {
            liketerm[0] = liketerm[0].children[0];
          }
          if ((typeof (_base = liketerm[1]).evaluate === "function" ? _base.evaluate() : void 0) !== 1) {
            newMul = new Mul(liketerm[0], liketerm[1]);
            newMul = newMul.simplify();
          } else {
            newMul = liketerm[0];
          }
          if (newAdd != null) {
            newAdd.children.push(newMul);
          } else {
            newAdd = new Add(newMul);
          }
        }
        if (newAdd == null) {
          return constantterm;
        }
        if ((constantterm != null) && constantterm.evaluate() !== 0) {
          newAdd.children.push(constantterm);
        }
        newAdd.sort();
        if (newAdd.children.length !== 1) {
          return newAdd;
        }
        return newAdd.children[0];
      };

      Add.prototype.expandAndSimplify = function() {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify();
        }
        return expr;
      };

      Add.prototype.solve = function(variable) {
        var a, added, b, c, d, expr, factorised, factorisedEquatable, factorisedSquares, factorisedSquaresEquatable, factorisedTerm, negatedNewerPow, negatedTerms, negatedTermsEquatable, newMul, newPow, newerPow, nonNegatedTermsEquatable, power, quadratic, rd, subterm, subterms, term, termsContainingVariable, termsNotContainingVariable, v1, v2, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
        expr = this.expandAndSimplify();
        termsContainingVariable = [];
        termsNotContainingVariable = [];
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && expr.label === variable) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (!(expr instanceof Add)) {
          return expr.solve(variable);
        }
        _ref = expr.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          term = _ref[_i];
          if (term.copy != null) {
            term = term.copy();
          }
          if (term instanceof Pow) {
            if (term.children.left instanceof terminals.Variable && term.children.left.label === variable) {
              termsContainingVariable.push(term);
            } else {
              termsNotContainingVariable.push(term);
            }
          } else if (term instanceof Mul) {
            added = false;
            _ref1 = term.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              subterm = _ref1[_j];
              if (subterm instanceof terminals.Variable && subterm.label === variable) {
                termsContainingVariable.push(term);
                added = true;
                break;
              } else if (subterm instanceof Pow && subterm.children.left instanceof terminals.Variable && subterm.children.left.label === variable) {
                termsContainingVariable.push(term);
                added = true;
                break;
              }
            }
            if (!added) {
              termsNotContainingVariable.push(term);
            }
          } else if (term instanceof terminals.Variable && term.label === variable) {
            termsContainingVariable.push(term);
          } else {
            termsNotContainingVariable.push(term);
          }
        }
        if (termsContainingVariable.length === 0) {
          throw new AlgebraError(expr.toString(), variable);
        }
        factorised = [];
        factorisedSquares = [];
        for (_k = 0, _len2 = termsContainingVariable.length; _k < _len2; _k++) {
          term = termsContainingVariable[_k];
          if (term instanceof terminals.Variable) {
            factorised.push(new terminals.Constant("1"));
          } else if (term instanceof Pow) {
            if (!(term.children.right instanceof terminals.Constant)) {
              throw new AlgebraError(expr.toString(), variable);
            }
            power = term.children.right.evaluate();
            if (power === 1) {
              factorised.push(new terminals.Constant("1"));
            } else if (power === 2) {
              factorisedSquares.push(new terminals.Constant("1"));
            } else {
              throw new AlgebraError(expr.toString(), variable, "polynomials of degree > 2 not supported");
            }
          } else if (term instanceof Mul) {
            subterms = [];
            quadratic = false;
            _ref2 = term.children;
            for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
              subterm = _ref2[_l];
              if (subterm instanceof terminals.Variable && subterm.label === variable) {

              } else if (subterm instanceof Pow) {
                if (!(subterm.children.right instanceof terminals.Constant)) {
                  throw new AlgebraError(expr.toString(), variable);
                }
                power = subterm.children.right.evaluate();
                if (power === 1) {

                } else if (power === 2) {
                  quadratic = true;
                } else {
                  throw new AlgebraError(expr.toString(), variable, "polynomials of degree > 2 not supported");
                }
              } else {
                subterms.push(subterm);
              }
            }
            factorisedTerm = (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Mul, subterms, function(){});
            if (!quadratic) {
              factorised.push(factorisedTerm);
            } else {
              factorisedSquares.push(factorisedTerm);
            }
          }
        }
        negatedTerms = [];
        for (_m = 0, _len4 = termsNotContainingVariable.length; _m < _len4; _m++) {
          term = termsNotContainingVariable[_m];
          newMul = new Mul("-1", (term.copy != null ? term.copy() : term));
          newMul = newMul.simplify();
          negatedTerms.push(newMul);
        }
        if (negatedTerms.length !== 0) {
          negatedTermsEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, negatedTerms, function(){});
        }
        if (factorised.length !== 0) {
          factorisedEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, factorised, function(){});
        }
        if (factorisedSquares.length !== 0) {
          factorisedSquaresEquatable = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Add, factorisedSquares, function(){});
        }
        if (factorisedSquares.length === 0) {
          if (factorised.length > 0) {
            newPow = new Pow(factorisedEquatable, "-1");
            newPow = newPow.simplify();
            if (negatedTermsEquatable != null) {
              newMul = new Mul(negatedTermsEquatable, newPow);
              newMul = newMul.simplify();
              return [newMul];
            } else {
              return [newPow];
            }
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        } else if (factorised.length === 0) {
          if (factorisedSquares.length > 0) {
            newPow = new Pow(factorisedSquaresEquatable, "-1");
            newPow = newPow.simplify();
            if (negatedTermsEquatable != null) {
              newMul = new Mul(negatedTermsEquatable, newPow);
              newerPow = new Pow(newMul, "1/2");
              negatedNewerPow = new Mul("-1", newerPow);
              negatedNewerPow = negatedNewerPow.simplify();
              newerPow = newerPow.simplify();
              return [newerPow, negatedNewerPow];
            } else {
              newerPow = new Pow(newPow, "1/2");
              negatedNewerPow = new Mul("-1", newerPow);
              negatedNewerPow = negatedNewerPow.simplify();
              newerPow = newerPow.simplify();
              return [newerPow, negatedNewerPow];
            }
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        } else {
          if (termsNotContainingVariable.length !== 0) {
            nonNegatedTermsEquatable = (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(Add, termsNotContainingVariable, function(){});
          }
          if (nonNegatedTermsEquatable != null) {
            a = factorisedSquaresEquatable;
            b = factorisedEquatable;
            c = nonNegatedTermsEquatable;
            d = new Add(new Pow(b, "2"), new Mul("-4", a, c));
            rd = new Pow(d, "1/2");
            v1 = new Mul(new Add(new Mul("-1", b), rd), new Pow(new Mul("2", a), "-1"));
            v2 = new Mul("-1", new Add(b, rd), new Pow(new Mul("2", a), "-1"));
            v1 = v1.expandAndSimplify();
            v2 = v2.expandAndSimplify();
            if ((v1.equals != null) && v1.equals(v2)) {
              return [v1];
            }
            return [v1, v2];
          } else {
            newPow = new Pow(factorisedSquaresEquatable, "-1");
            newMul = new Mul("-1", factorisedEquatable, newPow);
            newMul = newMul.simplify();
            return [0, newMul];
          }
        }
      };

      Add.prototype.getAllVariables = function() {
        var child, childVariables, outVariables, variable, variables, _i, _j, _len, _len1, _ref;
        variables = {};
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variables[child.label] = true;
          } else if (child.getAllVariables != null) {
            childVariables = child.getAllVariables();
            for (_j = 0, _len1 = childVariables.length; _j < _len1; _j++) {
              variable = childVariables[_j];
              variables[variable] = true;
            }
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Add.prototype.replaceVariables = function(replacements) {
        var child, index, _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child instanceof terminals.Variable && child.label in replacements) {
            _results.push(this.children[index] = replacements[child.label]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Add.prototype.sub = function(substitutions) {
        var child, children, newAdd, variable, _i, _len, _ref;
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.label in substitutions) {
            children.push(substitutions[child.label].copy());
          } else if (child.sub != null) {
            children.push(child.sub(substitutions));
          } else {
            children.push(child.copy());
          }
        }
        newAdd = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, children, function(){});
        newAdd = newAdd.expandAndSimplify();
        return newAdd;
      };

      Add.prototype.substituteExpression = function(sourceExpression, variable, equivalencies) {
        var child, children, _i, _len, _ref, _results;
        if (equivalencies == null) {
          equivalencies = null;
        }
        children = [];
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.label === variable) {
            _results.push(children.push(sourceExpression.copy()));
          } else if (child.substituteExpression != null) {
            _results.push(children.push(substituteExpression(sourcex, variable, equivalencies)));
          } else {
            _results.push(children.push(child.copy()));
          }
        }
        return _results;
      };

      Add.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        return html + "<mrow>" + this.children.map(function(child) {
          return "<mfenced>" + child.toMathML() + "</mfenced>";
        }).join("<mo>+</mo>") + "</mrow>" + closingHTML;
      };

      Add.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        return html + this.children.map(function(child) {
          return "(" + child.toHTML() + ")";
        }).join("+") + closingHTML;
      };

      Add.prototype.toLaTeX = function() {
        return this.children.map(function(child) {
          return "\\left(" + child.toLaTeX() + "\\right)";
        }).join("+");
      };

      return Add;

    })(nodes.RoseNode);
    Mul = (function(_super) {
      __extends(Mul, _super);

      function Mul() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length < 1) {
          throw new Error("Mul nodes must have at least one child.");
        }
        this.cmp = -2;
        args = parseArgs.apply(null, args);
        Mul.__super__.constructor.call(this, "*", args);
      }

      Mul.prototype.copy = function() {
        var args, i;
        args = (function() {
          var _i, _len, _ref, _results;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.copy != null ? i.copy() : i);
          }
          return _results;
        }).call(this);
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, args, function(){});
      };

      Mul.prototype.simplifyConstants = function() {
        var child, constantterm, variableterm, _i, _len, _ref;
        constantterm = new terminals.Constant("1");
        variableterm = null;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Constant) {
            constantterm = constantterm.multiply(child);
          } else {
            if (variableterm != null) {
              variableterm.children.push(child);
            } else {
              variableterm = new Mul(child);
            }
          }
        }
        if (variableterm == null) {
          return constantterm;
        }
        if (constantterm.evaluate() === 1) {
          return variableterm;
        }
        return new Mul(constantterm, variableterm);
      };

      Mul.prototype.compareSameType = function(b) {
        var c, child, index, lengthComparison, _i, _len, _ref;
        if (this.children.length === b.children.length) {
          lengthComparison = 0;
        } else if (this.children.length < b.children.length) {
          lengthComparison = -1;
        } else {
          lengthComparison = 1;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (b.children[index] == null) {
            return 1;
          }
          c = compare(this.children[index], b.children[index]);
          if (c !== 0) {
            return c;
          }
        }
        return lengthComparison;
      };

      Mul.expandMulAdd = function(mul, add) {
        var c, child, newAdd, newMul, results, _i, _j, _len, _len1, _ref, _ref1;
        results = [];
        _ref = add.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.copy != null) {
            child = child.copy();
          }
          if (child instanceof Mul) {
            newMul = mul.copy();
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              newMul.children.push(c);
            }
          } else if (child instanceof Add) {
            newMul = Mul.expandMulAdd(mul, child);
          } else {
            if (mul.children.length === 1) {
              newMul = mul.copy();
              newMul.children.push(child.copy());
            } else {
              newMul = new Mul(mul.copy(), child.copy());
            }
          }
          results.push(newMul);
        }
        newAdd = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Add, results, function(){});
        newAdd = newAdd.expand();
        return newAdd;
      };

      Mul.prototype.equals = function(b) {
        var child, index, _i, _len, _ref;
        if (!(b instanceof Mul)) {
          return false;
        }
        if (b.children.length !== this.children.length) {
          return false;
        }
        _ref = this.children;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child.equals != null) {
            if (!child.equals(b.children[index])) {
              return false;
            }
          } else {
            if (child !== b.children[index]) {
              return false;
            }
          }
        }
        return true;
      };

      Mul.prototype.expand = function() {
        var child, newMul, results, term, _base, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        term = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.expand != null) {
            child = child.expand();
          } else if (child.copy != null) {
            child = child.copy();
          }
          term.push(child);
        }
        while (term.length > 1) {
          if (term[0] instanceof Mul) {
            if (term[1] instanceof Add) {
              term[0] = Mul.expandMulAdd(term[0], term.splice(1, 1)[0]);
            } else if (term[1] instanceof Mul) {
              _ref1 = term.splice(1, 1)[0].children;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                child = _ref1[_j];
                term[0].children.push(child);
              }
            } else {
              term[0].children.push(term.splice(1, 1)[0]);
            }
          } else if (term[0] instanceof Add) {
            if (term[1] instanceof Add) {
              results = [];
              _ref2 = term[0].children;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                child = _ref2[_k];
                newMul = new Mul(child, term[1]);
                newMul = newMul.expand();
                results.push(newMul);
              }
              term.splice(1, 1);
              term[0] = (function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(Add, results, function(){});
              term[0] = term[0].expand();
            } else if (term[1] instanceof Mul) {
              term[0] = Mul.expandMulAdd(term.splice(1, 1)[0], term[0]);
            } else {
              term[0] = new Mul(term[0], term.splice(1, 1)[0]);
            }
          } else {
            term[0] = new Mul(term[0]);
          }
        }
        if (typeof (_base = term[0]).sort === "function") {
          _base.sort();
        }
        return term[0];
      };

      Mul.prototype.simplify = function() {
        var base, c, child, constantterm, found, i, index, liketerm, liketerms, newMul, newPow, numerical, power, term, terms, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        terms = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.simplify != null) {
            child = child.simplify();
          } else if (child.copy != null) {
            child = child.copy();
          }
          terms.push(child);
        }
        liketerms = [];
        constantterm = null;
        i = 0;
        while (i < terms.length) {
          term = terms[i];
          if (term instanceof Mul) {
            child = terms.splice(i, 1)[0];
            _ref1 = child.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              terms.push(c);
            }
            i -= 1;
          } else if (term instanceof terminals.Constant) {
            if (constantterm != null) {
              constantterm = constantterm.multiply(term);
            } else {
              constantterm = term.copy();
            }
          } else if (term instanceof Pow) {
            base = term.children.left;
            power = term.children.right;
            found = false;
            for (index = _k = 0, _len2 = liketerms.length; _k < _len2; index = ++_k) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(base)) {
                  liketerms[index][1] = new Add(liketerm[1], power);
                  liketerms[index][1] = liketerms[index][1].simplify();
                  if (((_ref2 = liketerms[index][1].children) != null ? _ref2.length : void 0) === 1) {
                    liketerms[index][1] = liketerms[index][1].children[0];
                  }
                  found = true;
                }
              } else if (liketerm[0] === base) {
                liketerms[index][1] = new Add(liketerm[1], power);
                liketerms[index][1] = liketerms[index][1].simplify();
                if (((_ref3 = liketerms[index][1].children) != null ? _ref3.length : void 0) === 1) {
                  liketerms[index][1] = liketerms[index][1].children[0];
                }
                found = true;
              }
            }
            if (!found) {
              liketerms.push([base, power]);
            }
          } else {
            found = false;
            for (index = _l = 0, _len3 = liketerms.length; _l < _len3; index = ++_l) {
              liketerm = liketerms[index];
              if (liketerm[0].equals != null) {
                if (liketerm[0].equals(term)) {
                  liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                  liketerms[index][1] = liketerms[index][1].simplify();
                  if (((_ref4 = liketerms[index][1].children) != null ? _ref4.length : void 0) === 1) {
                    liketerms[index][1] = liketerms[index][1].children[0];
                  }
                  found = true;
                }
              } else if (liketerm[0] === term) {
                liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"));
                liketerms[index][1] = liketerms[index][1].simplify();
                if (((_ref5 = liketerms[index][1].children) != null ? _ref5.length : void 0) === 1) {
                  liketerms[index][1] = liketerms[index][1].children[0];
                }
                found = true;
              }
            }
            if (!found) {
              liketerms.push([term, new terminals.Constant("1")]);
            }
          }
          i += 1;
        }
        if ((constantterm != null ? typeof constantterm.evaluate === "function" ? constantterm.evaluate() : void 0 : void 0) === 0) {
          return new terminals.Constant("0");
        }
        newMul = null;
        for (_m = 0, _len4 = liketerms.length; _m < _len4; _m++) {
          liketerm = liketerms[_m];
          if ((typeof (_base = liketerm[1]).evaluate === "function" ? _base.evaluate() : void 0) !== 1) {
            newPow = new Pow(liketerm[0], liketerm[1]);
            newPow = newPow.simplify();
          } else {
            newPow = liketerm[0];
          }
          if (newMul != null) {
            newMul.children.push(newPow);
          } else {
            newMul = new Mul(newPow);
          }
        }
        if (newMul == null) {
          return constantterm;
        }
        if ((constantterm != null) && constantterm.evaluate() !== 1) {
          newMul.children.push(constantterm);
        }
        newMul.sort();
        numerical = true;
        _ref6 = newMul.children;
        for (_n = 0, _len5 = _ref6.length; _n < _len5; _n++) {
          child = _ref6[_n];
          if (!(child instanceof terminals.Constant)) {
            numerical = false;
            break;
          }
        }
        if (numerical) {
          return newMul.simplifyConstants();
        }
        if (newMul.children.length !== 1) {
          return newMul;
        }
        return newMul.children[0];
      };

      Mul.prototype.sort = function() {
        var child, _i, _len, _ref;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (typeof child.sort === "function") {
            child.sort();
          }
        }
        return this.children.sort(compare);
      };

      Mul.prototype.expandAndSimplify = function() {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify();
        }
        return expr;
      };

      Mul.prototype.solve = function(variable) {
        var child, error, expr, _i, _len, _ref;
        expr = this.expandAndSimplify();
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && expr.label === variable) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (!(expr instanceof Mul)) {
          return expr.solve(variable);
        }
        _ref = expr.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.label === variable) {
            return [new terminals.Constant("0")];
          } else if (child instanceof Pow) {
            try {
              return child.solve(variable);
            } catch (_error) {
              error = _error;
              if (error instanceof AlgebraError) {
                continue;
              } else {
                throw error;
              }
            }
          }
        }
        throw new AlgebraError(expr.toString(), variable);
      };

      Mul.prototype.getAllVariables = function() {
        var child, childVariables, outVariables, variable, variables, _i, _j, _len, _len1, _ref;
        variables = {};
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable) {
            variables[child.label] = true;
          } else if (child.getAllVariables != null) {
            childVariables = child.getAllVariables();
            for (_j = 0, _len1 = childVariables.length; _j < _len1; _j++) {
              variable = childVariables[_j];
              variables[variable] = true;
            }
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Mul.prototype.replaceVariables = function(replacements) {
        var child, index, _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          child = _ref[index];
          if (child instanceof terminals.Variable && child.label in replacements) {
            _results.push(this.children[index] = replacements[child.label]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Mul.prototype.sub = function(substitutions) {
        var child, children, newMul, variable, _i, _len, _ref;
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        children = [];
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.label in substitutions) {
            children.push(substitutions[child.label].copy());
          } else if (child.sub != null) {
            children.push(child.sub(substitutions));
          } else {
            children.push(child.copy());
          }
        }
        newMul = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Mul, children, function(){});
        newMul = newMul.expandAndSimplify();
        return newMul;
      };

      Mul.prototype.substituteExpression = function(sourceExpression, variable, equivalencies) {
        var child, children, _i, _len, _ref, _results;
        if (equivalencies == null) {
          equivalencies = null;
        }
        children = [];
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof terminals.Variable && child.label === variable) {
            _results.push(children.push(sourceExpression.copy()));
          } else if (child.substituteExpression != null) {
            _results.push(children.push(substituteExpression(sourcex, variable, equivalencies)));
          } else {
            _results.push(children.push(child.copy()));
          }
        }
        return _results;
      };

      Mul.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        return html + "<mrow>" + this.children.map(function(child) {
          return "<mfenced>" + child.toMathML() + "</mfenced>";
        }).join("<mo>&middot;</mo>") + "</mrow>" + closingHTML;
      };

      Mul.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, mathClass, mathID, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        return html + this.children.map(function(child) {
          return "(" + child.toHTML() + ")";
        }).join("&middot;") + closingHTML;
      };

      Mul.prototype.toLaTeX = function() {
        return this.children.map(function(child) {
          return "\\left(" + child.toLaTeX() + "\\right)";
        }).join("\\cdot");
      };

      return Mul;

    })(nodes.RoseNode);
    Pow = (function(_super) {
      __extends(Pow, _super);

      function Pow() {
        var args, base, power, _ref;
        base = arguments[0], power = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!((base != null) && (power != null))) {
          throw new Error("Pow nodes must have two children.");
        }
        if (args.length > 0) {
          throw new Error("Pow nodes must have two children.");
        }
        this.cmp = -3;
        _ref = parseArgs(base, power), base = _ref[0], power = _ref[1];
        Pow.__super__.constructor.call(this, "**", base, power);
      }

      Pow.prototype.copy = function() {
        return new Pow((this.children.left.copy != null ? this.children.left.copy() : this.children.left), (this.children.right.copy != null ? this.children.right.copy() : this.children.right));
      };

      Pow.prototype.sort = function() {
        var _base, _base1;
        if (typeof (_base = this.children.left).sort === "function") {
          _base.sort();
        }
        return typeof (_base1 = this.children.right).sort === "function" ? _base1.sort() : void 0;
      };

      Pow.prototype.equals = function(b) {
        if (!(b instanceof Pow)) {
          return false;
        }
        if (this.children.left.equals != null) {
          if (!this.children.left.equals(b.children.left)) {
            return false;
          }
        } else {
          if (this.children.left !== b.children.left) {
            return false;
          }
        }
        if (this.children.right.equals != null) {
          if (!this.children.right.equals(b.children.right)) {
            return false;
          }
        } else {
          if (this.children.right !== b.children.right) {
            return false;
          }
        }
        return true;
      };

      Pow.prototype.compareSameType = function(b) {
        var c;
        c = compare(this.children.left, b.children.left);
        if (c !== 0) {
          return c;
        } else {
          return compare(this.children.right, b.children.right);
        }
      };

      Pow.prototype.expand = function() {
        var child, children, i, index, left, newMul, newPow, right, _i, _j, _len, _ref, _ref1;
        if (this.children.left.expand != null) {
          left = this.children.left.expand();
        } else if (this.children.left.copy != null) {
          left = this.children.left.copy();
        } else {
          left = this.children.left;
        }
        if (this.children.right.expand != null) {
          right = this.children.right.expand();
        } else if (this.children.right.copy != null) {
          right = this.children.right.copy();
        } else {
          right = this.children.right;
        }
        if (left.children != null) {
          if (left instanceof Pow) {
            left.children.right = new Mul(left.children.right, right);
            left.expand();
          } else if (left instanceof Mul) {
            _ref = left.children;
            for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
              child = _ref[index];
              newPow = new Pow(child, right);
              newPow = newPow.expand();
              left.children[index] = newPow;
            }
          } else if (left instanceof Add) {
            if (right instanceof terminals.Constant && right.evaluate() % 1 === 0 && right.evaluate() > 0) {
              children = [];
              for (i = _j = 1, _ref1 = right.evaluate(); 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
                children.push(left);
              }
              newMul = (function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(Mul, children, function(){});
              newMul = newMul.expand();
              left = newMul;
            } else {
              left = new Pow(left, right);
            }
          }
          return left;
        } else {
          return new Pow(left, right);
        }
      };

      Pow.prototype.simplify = function() {
        var left, newPow, power, right;
        if (this.children.left.simplify != null) {
          left = this.children.left.simplify();
        } else if (this.children.left.copy != null) {
          left = this.children.left.copy();
        } else {
          left = this.children.left;
        }
        if (this.children.right.simplify != null) {
          right = this.children.right.simplify();
        } else if (this.children.right.copy != null) {
          right = this.children.right.copy();
        } else {
          right = this.children.right;
        }
        if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) === 1) {
          return left;
        } else if ((typeof left.evaluate === "function" ? left.evaluate() : void 0) === 1) {
          return left;
        } else if ((typeof right.evaluate === "function" ? right.evaluate() : void 0) === 0) {
          return new terminals.Constant("1");
        } else {
          if (right instanceof terminals.Constant && left instanceof terminals.Constant) {
            return new terminals.Constant(Math.pow(left.evaluate(), right.evaluate()));
          } else if (left instanceof Pow) {
            power = new Mul(left.children.right, right);
            newPow = new Pow(left.children.left, power);
            newPow = newPow.simplify();
            return newPow;
          } else {
            return new Pow(left, right);
          }
        }
      };

      Pow.prototype.expandAndSimplify = function() {
        var expr;
        expr = this.expand();
        if (expr.simplify != null) {
          return expr.simplify();
        }
        return expr;
      };

      Pow.prototype.solve = function(variable) {
        var error, expr, negative, returnables, solution, solutions, _i, _len;
        expr = this.expandAndSimplify();
        if (expr instanceof terminals.Terminal) {
          if (expr instanceof terminals.Variable && expr.label === variable) {
            return [new terminals.Constant("0")];
          } else {
            throw new AlgebraError(expr.toString(), variable);
          }
        }
        if (expr instanceof Pow) {
          if (expr.children.left instanceof terminals.Variable) {
            if (expr.children.left.label === variable) {
              return [new terminals.Constant("0")];
            }
            throw new AlgebraError(expr.toString(), variable);
          } else if (expr.children.left instanceof terminals.Terminal) {
            throw new AlgebraError(expr.toString(), variable);
          } else {
            try {
              solutions = expr.children.left.solve(variable);
            } catch (_error) {
              error = _error;
              throw error;
            }
            if ((expr.children.right.evaluate != null) && expr.children.right.evaluate() % 2 === 0) {
              returnables = [];
              for (_i = 0, _len = solutions.length; _i < _len; _i++) {
                solution = solutions[_i];
                negative = (new Mul(-1, solution)).simplify();
                if (negative.equals != null) {
                  if (!negative.equals(solution)) {
                    returnables.push(negative);
                  }
                  returnables.push(solution);
                } else {
                  if (negative !== solution) {
                    returnables.push(negative);
                  }
                  returnables.push(solution);
                }
              }
              return returnables;
            } else {
              return solutions;
            }
          }
        } else {
          return expr.solve(variable);
        }
      };

      Pow.prototype.sub = function(substitutions) {
        var left, newPow, right, variable;
        for (variable in substitutions) {
          if (!(substitutions[variable] instanceof terminals.Terminal || substitutions[variable] instanceof nodes.BasicNode)) {
            substitutions[variable] = new terminals.Constant(substitutions[variable]);
          }
        }
        left = null;
        right = null;
        if (this.children.left instanceof terminals.Variable && this.children.left.label in substitutions) {
          left = substitutions[this.children.left.label].copy();
        } else if (this.children.left.sub != null) {
          left = this.children.left.sub(substitutions);
        } else {
          left = this.children.left.copy();
        }
        if (this.children.right instanceof terminals.Variable && this.children.right.label in substitutions) {
          right = substitutions[this.children.right.label].copy();
        } else if (this.children.right.sub != null) {
          right = this.children.right.sub(substitutions);
        } else {
          right = this.children.right.copy();
        }
        newPow = new Pow(left, right);
        newPow = newPow.expandAndSimplify();
        return newPow;
      };

      Pow.prototype.getAllVariables = function() {
        var leftVariables, outVariables, rightVariables, variable, variables, _i, _j, _len, _len1;
        variables = {};
        if (this.children.left instanceof terminals.Variable) {
          variables[this.children.left.label] = true;
        } else if (this.children.left.getAllVariables != null) {
          leftVariables = this.children.left.getAllVariables();
          for (_i = 0, _len = leftVariables.length; _i < _len; _i++) {
            variable = leftVariables[_i];
            variables[variable] = true;
          }
        }
        if (this.children.right instanceof terminals.Variable) {
          variables[this.children.right.label] = true;
        } else if (this.children.right.getAllVariables != null) {
          rightVariables = this.children.right.getAllVariables();
          for (_j = 0, _len1 = rightVariables.length; _j < _len1; _j++) {
            variable = rightVariables[_j];
            variables[variable] = true;
          }
        }
        outVariables = [];
        for (variable in variables) {
          outVariables.push(variable);
        }
        return outVariables;
      };

      Pow.prototype.replaceVariables = function(replacements) {
        if (this.children.left instanceof terminals.Variable && this.children.left.label in replacements) {
          this.children.left.label = replacements[this.children.left.label];
        }
        if (this.children.right instanceof terminals.Variable && this.children.right.label in replacements) {
          return this.children.right.label = replacements[this.children.right.label];
        }
      };

      Pow.prototype.substituteExpression = function(sourceExpression, variable, equivalencies) {
        var left, newPow, right;
        if (equivalencies == null) {
          equivalencies = null;
        }
        left = this.children.left.copy();
        right = this.children.right.copy();
        if (this.children.left instanceof terminals.Variable && this.children.left.label === variable) {
          left = sourceExpression.copy();
        } else if (!(this.children.left instanceof terminals.Terminal)) {
          left = this.children.left.substituteExpression(sourceExpression, variable, equivalencies);
        }
        if (this.children.right instanceof terminals.Variable && this.children.right.label === variable) {
          right = sourceExpression.copy();
        } else if (!(this.children.right instanceof terminals.Terminal)) {
          right = this.children.right.substituteExpression(sourceExpression, variable, equivalencies);
        }
        newPow = new Pow(left, right);
        newPow = newPow.expandAndSimplify();
        return newPow;
      };

      Pow.prototype.toMathML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, innerHTML, mathClass, mathID, right, _base, _base1, _base2, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getMathMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</math></div>";
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 1) {
          return html + this.children.left.toMathML() + closingHTML;
        } else if ((typeof (_base1 = this.children.right).evaluate === "function" ? _base1.evaluate() : void 0) === 0) {
          return html + "<mn>1</mn>" + closingHTML;
        } else {
          innerHTML = "<mfenced>" + (this.children.left.toMathML()) + "</mfenced>" + (this.children.right.toMathML());
          innerHTML = "<msup>" + innerHTML + "</msup>";
          if ((typeof (_base2 = this.children.right).evaluate === "function" ? _base2.evaluate() : void 0) < 0) {
            right = this.children.right.copy();
            right = new Mul("-1", right);
            right = right.simplify();
            innerHTML = "<mfrac><mn>1</mn>" + innerHTML + "</mfrac>";
          }
          return html + innerHTML + closingHTML;
        }
      };

      Pow.prototype.toHTML = function(equationID, expression, equality, topLevel) {
        var closingHTML, html, innerHTML, mathClass, mathID, _base, _base1, _ref;
        if (expression == null) {
          expression = false;
        }
        if (equality == null) {
          equality = "0";
        }
        if (topLevel == null) {
          topLevel = false;
        }
        _ref = generateInfo.getHTMLInfo(equationID, expression, equality), mathClass = _ref[0], mathID = _ref[1], html = _ref[2];
        if (!topLevel) {
          html = "";
          closingHTML = "";
        } else {
          closingHTML = "</div>";
        }
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 1) {
          return html + this.children.left.toHTML() + closingHTML;
        } else if ((typeof (_base1 = this.children.right).evaluate === "function" ? _base1.evaluate() : void 0) === 0) {
          return html + "1" + closingHTML;
        } else {
          innerHTML = "(" + (this.children.left.toHTML()) + ") ** (" + (this.children.right.toHTML()) + ")";
          return html + innerHTML + closingHTML;
        }
      };

      Pow.prototype.toLaTeX = function() {
        var innerLaTeX, right, _base, _base1, _base2;
        if ((typeof (_base = this.children.right).evaluate === "function" ? _base.evaluate() : void 0) === 1) {
          return this.children.left.toLaTeX();
        } else if ((typeof (_base1 = this.children.right).evaluate === "function" ? _base1.evaluate() : void 0) === 0) {
          return "1";
        } else {
          innerLaTeX = "\\left(" + (this.children.left.toLaTeX()) + "\\right)^{" + (this.children.right.toLaTeX()) + "}";
          if ((typeof (_base2 = this.children.right).evaluate === "function" ? _base2.evaluate() : void 0) < 0) {
            right = this.children.right.copy();
            right = new Mul("-1", right);
            right = right.simplify();
            innerLaTeX = "\\frac{1}{" + innerLaTeX + "}";
          }
          return innerLaTeX;
        }
      };

      return Pow;

    })(nodes.BinaryNode);
    compare = function(a, b) {
      /*
      		Order:
      		-6: Constants, by value
      		-5: Symbolic constants, by label
      		-4: Variables, by label
      		-3: Power nodes, by base
      		-2: Multiplication nodes, by first child
      		-1: Addition nodes, by first child
      */

      if ((a.cmp != null) && (b.cmp != null)) {
        if (a.cmp === b.cmp) {
          return a.compareSameType(b);
        } else {
          return (a.cmp - b.cmp) / Math.abs(a.cmp - b.cmp);
        }
      } else {
        return 0;
      }
    };
    return {
      Add: Add,
      Mul: Mul,
      Pow: Pow,
      compare: compare,
      AlgebraError: AlgebraError
    };
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  require.config({
    baseUrl: "./"
  });

  define('coffeequate',["operators", "parse", "terminals"], function(operators, parse, terminals) {
    return {
      operators: operators,
      parse: parse,
      terminals: terminals
    };
  });

}).call(this);

require(["coffeequate"]);
