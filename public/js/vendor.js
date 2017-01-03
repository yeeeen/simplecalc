(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();
/* jshint ignore:start */
(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = (window.brunch || {});
  var ar = br['auto-reload'] = (br['auto-reload'] || {});
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel=stylesheet]'))
        .filter(function(link) {
          var val = link.getAttribute('data-autoreload');
          return link.href && val != 'false';
        })
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });

      // Hack to force page repaint after 25ms.
      if (forceRepaint) setTimeout(function() { document.body.offsetHeight; }, 25);
    },

    javascript: function(){
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function(script) { return script.text }).filter(function(text) { return text.length > 0 });
      var srcScripts = scripts.filter(function(script) { return script.src });

      var loaded = 0;
      var all = srcScripts.length;
      var onLoad = function() {
        loaded = loaded + 1;
        if (loaded === all) {
          textScripts.forEach(function(script) { eval(script); });
        }
      }

      srcScripts
        .forEach(function(script) {
          var src = script.src;
          script.remove();
          var newScript = document.createElement('script');
          newScript.src = cacheBuster(src);
          newScript.async = true;
          newScript.onload = onLoad;
          document.head.appendChild(newScript);
        });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function(){
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function(event){
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function(){
      if (connection.readyState) connection.close();
    };
    connection.onclose = function(){
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();
/* jshint ignore:end */

;;(typeof window!='undefined'?window:typeof global!='undefined'?global:this).pug={}
;(function(exports){
  'use strict';
  
  var pug_has_own_property = Object.prototype.hasOwnProperty;
  
  /**
   * Merge two attribute objects giving precedence
   * to values in object `b`. Classes are special-cased
   * allowing for arrays and merging/joining appropriately
   * resulting in a string.
   *
   * @param {Object} a
   * @param {Object} b
   * @return {Object} a
   * @api private
   */
  
  exports.merge = pug_merge;
  function pug_merge(a, b) {
    if (arguments.length === 1) {
      var attrs = a[0];
      for (var i = 1; i < a.length; i++) {
        attrs = pug_merge(attrs, a[i]);
      }
      return attrs;
    }
  
    for (var key in b) {
      if (key === 'class') {
        var valA = a[key] || [];
        a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
      } else if (key === 'style') {
        var valA = pug_style(a[key]);
        var valB = pug_style(b[key]);
        a[key] = valA + (valA && valB && ';') + valB;
      } else {
        a[key] = b[key];
      }
    }
  
    return a;
  };
  
  /**
   * Process array, object, or string as a string of classes delimited by a space.
   *
   * If `val` is an array, all members of it and its subarrays are counted as
   * classes. If `escaping` is an array, then whether or not the item in `val` is
   * escaped depends on the corresponding item in `escaping`. If `escaping` is
   * not an array, no escaping is done.
   *
   * If `val` is an object, all the keys whose value is truthy are counted as
   * classes. No escaping is done.
   *
   * If `val` is a string, it is counted as a class. No escaping is done.
   *
   * @param {(Array.<string>|Object.<string, boolean>|string)} val
   * @param {?Array.<string>} escaping
   * @return {String}
   */
  exports.classes = pug_classes;
  function pug_classes_array(val, escaping) {
    var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
    for (var i = 0; i < val.length; i++) {
      className = pug_classes(val[i]);
      if (!className) continue;
      escapeEnabled && escaping[i] && (className = pug_escape(className));
      classString = classString + padding + className;
      padding = ' ';
    }
    return classString;
  }
  function pug_classes_object(val) {
    var classString = '', padding = '';
    for (var key in val) {
      if (key && val[key] && pug_has_own_property.call(val, key)) {
        classString = classString + padding + key;
        padding = ' ';
      }
    }
    return classString;
  }
  function pug_classes(val, escaping) {
    if (Array.isArray(val)) {
      return pug_classes_array(val, escaping);
    } else if (val && typeof val === 'object') {
      return pug_classes_object(val);
    } else {
      return val || '';
    }
  }
  
  /**
   * Convert object or string to a string of CSS styles delimited by a semicolon.
   *
   * @param {(Object.<string, string>|string)} val
   * @return {String}
   */
  
  exports.style = pug_style;
  function pug_style(val) {
    if (!val) return '';
    if (typeof val === 'object') {
      var out = '', delim = '';
      for (var style in val) {
        /* istanbul ignore else */
        if (pug_has_own_property.call(val, style)) {
          out = out + delim + style + ':' + val[style];
          delim = ';';
        }
      }
      return out;
    } else {
      val = '' + val;
      if (val[val.length - 1] === ';') return val.slice(0, -1);
      return val;
    }
  };
  
  /**
   * Render the given attribute.
   *
   * @param {String} key
   * @param {String} val
   * @param {Boolean} escaped
   * @param {Boolean} terse
   * @return {String}
   */
  exports.attr = pug_attr;
  function pug_attr(key, val, escaped, terse) {
    if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
      return '';
    }
    if (val === true) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    }
    if (typeof val.toJSON === 'function') {
      val = val.toJSON();
    }
    if (typeof val !== 'string') {
      val = JSON.stringify(val);
      if (!escaped && val.indexOf('"') !== -1) {
        return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
      }
    }
    if (escaped) val = pug_escape(val);
    return ' ' + key + '="' + val + '"';
  };
  
  /**
   * Render the given attributes object.
   *
   * @param {Object} obj
   * @param {Object} terse whether to use HTML5 terse boolean attributes
   * @return {String}
   */
  exports.attrs = pug_attrs;
  function pug_attrs(obj, terse){
    var attrs = '';
  
    for (var key in obj) {
      if (pug_has_own_property.call(obj, key)) {
        var val = obj[key];
  
        if ('class' === key) {
          val = pug_classes(val);
          attrs = pug_attr(key, val, false, terse) + attrs;
          continue;
        }
        if ('style' === key) {
          val = pug_style(val);
        }
        attrs += pug_attr(key, val, false, terse);
      }
    }
  
    return attrs;
  };
  
  /**
   * Escape the given string of `html`.
   *
   * @param {String} html
   * @return {String}
   * @api private
   */
  
  var pug_match_html = /["&<>]/;
  exports.escape = pug_escape;
  function pug_escape(_html){
    var html = '' + _html;
    var regexResult = pug_match_html.exec(html);
    if (!regexResult) return _html;
  
    var result = '';
    var i, lastIndex, escape;
    for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
      switch (html.charCodeAt(i)) {
        case 34: escape = '&quot;'; break;
        case 38: escape = '&amp;'; break;
        case 60: escape = '&lt;'; break;
        case 62: escape = '&gt;'; break;
        default: continue;
      }
      if (lastIndex !== i) result += html.substring(lastIndex, i);
      lastIndex = i + 1;
      result += escape;
    }
    if (lastIndex !== i) return result + html.substring(lastIndex, i);
    else return result;
  };
  
  /**
   * Re-throw the given `err` in context to the
   * the pug in `filename` at the given `lineno`.
   *
   * @param {Error} err
   * @param {String} filename
   * @param {String} lineno
   * @param {String} str original source
   * @api private
   */
  
  exports.rethrow = pug_rethrow;
  function pug_rethrow(err, filename, lineno, str){
    if (!(err instanceof Error)) throw err;
    if ((typeof window != 'undefined' || !filename) && !str) {
      err.message += ' on line ' + lineno;
      throw err;
    }
    try {
      str = str || require('fs').readFileSync(filename, 'utf8')
    } catch (ex) {
      pug_rethrow(err, null, lineno)
    }
    var context = 3
      , lines = str.split('\n')
      , start = Math.max(lineno - context, 0)
      , end = Math.min(lines.length, lineno + context);
  
    // Error context
    var context = lines.slice(start, end).map(function(line, i){
      var curr = i + start + 1;
      return (curr == lineno ? '  > ' : '    ')
        + curr
        + '| '
        + line;
    }).join('\n');
  
    // Alter exception message
    err.path = filename;
    err.message = (filename || 'Pug') + ':' + lineno
      + '\n' + context + '\n\n' + err.message;
    throw err;
  };

})(pug);


//# sourceMappingURL=vendor.js.map