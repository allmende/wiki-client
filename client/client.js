(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.wiki = require('./lib/wiki');

require('./lib/legacy');


},{"./lib/legacy":5,"./lib/wiki":18}],2:[function(require,module,exports){
(function() {
  var active, findScrollContainer, scrollTo;

  module.exports = active = {};

  active.scrollContainer = void 0;

  findScrollContainer = function() {
    var scrolled;
    scrolled = $("body, html").filter(function() {
      return $(this).scrollLeft() > 0;
    });
    if (scrolled.length > 0) {
      return scrolled;
    } else {
      return $("body, html").scrollLeft(12).filter(function() {
        return $(this).scrollLeft() > 0;
      }).scrollTop(0);
    }
  };

  scrollTo = function(el) {
    var bodyWidth, contentWidth, maxX, minX, target, width;
    if (active.scrollContainer == null) {
      active.scrollContainer = findScrollContainer();
    }
    bodyWidth = $("body").width();
    minX = active.scrollContainer.scrollLeft();
    maxX = minX + bodyWidth;
    target = el.position().left;
    width = el.outerWidth(true);
    contentWidth = $(".page").outerWidth(true) * $(".page").size();
    if (target < minX) {
      return active.scrollContainer.animate({
        scrollLeft: target
      });
    } else if (target + width > maxX) {
      return active.scrollContainer.animate({
        scrollLeft: target - (bodyWidth - width)
      });
    } else if (maxX > $(".pages").outerWidth()) {
      return active.scrollContainer.animate({
        scrollLeft: Math.min(target, contentWidth - bodyWidth)
      });
    }
  };

  active.set = function(el) {
    el = $(el);
    $(".active").removeClass("active");
    return scrollTo(el.addClass("active"));
  };

}).call(this);

/*
//@ sourceMappingURL=active.js.map
*/
},{}],3:[function(require,module,exports){
(function() {
  var util;

  util = require('./util');

  module.exports = function(journalElement, action) {
    var actionElement, actionTitle, controls, pageElement;
    pageElement = journalElement.parents('.page:first');
    actionTitle = action.type || 'separator';
    if (action.date != null) {
      actionTitle += " " + (util.formatElapsedTime(action.date));
    }
    actionElement = $("<a href=\"#\" /> ").addClass("action").addClass(action.type || 'separator').text(action.symbol || util.symbols[action.type]).attr('title', actionTitle).attr('data-id', action.id || "0").data('action', action);
    controls = journalElement.children('.control-buttons');
    if (controls.length > 0) {
      actionElement.insertBefore(controls);
    } else {
      actionElement.appendTo(journalElement);
    }
    if (action.type === 'fork' && (action.site != null)) {
      return actionElement.css("background-image", "url(//" + action.site + "/favicon.png)").attr("href", "//" + action.site + "/" + (pageElement.attr('id')) + ".html").data("site", action.site).data("slug", pageElement.attr('id'));
    }
  };

}).call(this);

/*
//@ sourceMappingURL=addToJournal.js.map
*/
},{"./util":17}],4:[function(require,module,exports){
(function() {
  var arrayToJson, bind, csvToArray, emit,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  emit = function(div, item) {
    var showMenu, showPrompt;
    div.append('<p>Double-Click to Edit<br>Drop Text or Image to Insert</p>');
    showMenu = function() {
      var info, left, menu, menuItem, name, _i, _len, _ref, _ref1;
      menu = div.find('p').append("<br>Or Choose a Plugin");
      menu.append((left = $("<div style=\"text-align:left; padding-left: 40%\"></div>")));
      menu = left;
      menuItem = function(title, name) {
        return menu.append("<li><a class=\"menu\" href=\"#\" title=\"" + title + "\">" + name + "</a></li>");
      };
      if (Array.isArray(window.catalog)) {
        _ref = window.catalog;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          info = _ref[_i];
          menuItem(info.title, info.name);
        }
      } else {
        _ref1 = window.catalog;
        for (name in _ref1) {
          info = _ref1[name];
          menuItem(info.menu, name);
        }
      }
      return menu.find('a.menu').click(function(evt) {
        div.removeClass('factory').addClass(item.type = evt.target.text.toLowerCase());
        div.unbind();
        return wiki.textEditor(div, item);
      });
    };
    showPrompt = function() {
      return div.append("<p>" + (wiki.resolveLinks(item.prompt)) + "</b>");
    };
    if (item.prompt) {
      return showPrompt();
    } else if (window.catalog != null) {
      return showMenu();
    } else {
      return $.getJSON('/system/factories.json', function(data) {
        window.catalog = data;
        return showMenu();
      });
    }
  };

  bind = function(div, item) {
    var syncEditAction;
    syncEditAction = function() {
      var err, pageElement;
      wiki.log('factory item', item);
      div.empty().unbind();
      div.removeClass("factory").addClass(item.type);
      pageElement = div.parents('.page:first');
      try {
        div.data('pageElement', pageElement);
        div.data('item', item);
        wiki.getPlugin(item.type, function(plugin) {
          plugin.emit(div, item);
          return plugin.bind(div, item);
        });
      } catch (_error) {
        err = _error;
        div.append("<p class='error'>" + err + "</p>");
      }
      return wiki.pageHandler.put(pageElement, {
        type: 'edit',
        id: item.id,
        item: item
      });
    };
    div.dblclick(function() {
      div.removeClass('factory').addClass(item.type = 'paragraph');
      div.unbind();
      return wiki.textEditor(div, item);
    });
    div.bind('dragenter', function(evt) {
      return evt.preventDefault();
    });
    div.bind('dragover', function(evt) {
      return evt.preventDefault();
    });
    return div.bind("drop", function(dropEvent) {
      var dt, found, ignore, origin, punt, readFile, url;
      punt = function(data) {
        item.prompt = "<b>Unexpected Item</b><br>We can't make sense of the drop.<br>" + (JSON.stringify(data)) + "<br>Try something else or see [[About Factory Plugin]].";
        data.userAgent = navigator.userAgent;
        item.punt = data;
        wiki.log('factory punt', dropEvent);
        return syncEditAction();
      };
      readFile = function(file) {
        var majorType, minorType, reader, _ref;
        if (file != null) {
          _ref = file.type.split("/"), majorType = _ref[0], minorType = _ref[1];
          reader = new FileReader();
          if (majorType === "image") {
            reader.onload = function(loadEvent) {
              item.type = 'image';
              item.url = loadEvent.target.result;
              item.caption || (item.caption = "Uploaded image");
              return syncEditAction();
            };
            return reader.readAsDataURL(file);
          } else if (majorType === "text") {
            reader.onload = function(loadEvent) {
              var array, result;
              result = loadEvent.target.result;
              if (minorType === 'csv') {
                item.type = 'data';
                item.columns = (array = csvToArray(result))[0];
                item.data = arrayToJson(array);
                item.text = file.fileName;
              } else {
                item.type = 'paragraph';
                item.text = result;
              }
              return syncEditAction();
            };
            return reader.readAsText(file);
          } else {
            return punt({
              number: 1,
              name: file.fileName,
              type: file.type
            });
          }
        } else {
          return punt({
            number: 2,
            types: dropEvent.originalEvent.dataTransfer.types
          });
        }
      };
      dropEvent.preventDefault();
      if ((dt = dropEvent.originalEvent.dataTransfer) != null) {
        if ((dt.types != null) && (__indexOf.call(dt.types, 'text/uri-list') >= 0 || __indexOf.call(dt.types, 'text/x-moz-url') >= 0) && !(__indexOf.call(dt.types, 'Files') >= 0)) {
          url = dt.getData('URL');
          if (found = url.match(/^http:\/\/([a-zA-Z0-9:.-]+)(\/([a-zA-Z0-9:.-]+)\/([a-z0-9-]+(_rev\d+)?))+$/)) {
            wiki.log('factory drop url', found);
            ignore = found[0], origin = found[1], ignore = found[2], item.site = found[3], item.slug = found[4], ignore = found[5];
            if ($.inArray(item.site, ['view', 'local', 'origin']) >= 0) {
              item.site = origin;
            }
            return $.getJSON("http://" + item.site + "/" + item.slug + ".json", function(remote) {
              wiki.log('factory remote', remote);
              item.type = 'reference';
              item.title = remote.title || item.slug;
              item.text = wiki.createSynopsis(remote);
              syncEditAction();
              if (item.site != null) {
                return wiki.registerNeighbor(item.site);
              }
            });
          } else {
            return punt({
              number: 4,
              url: url,
              types: dt.types
            });
          }
        } else if (__indexOf.call(dt.types, 'Files') >= 0) {
          return readFile(dt.files[0]);
        } else {
          return punt({
            number: 5,
            types: dt.types
          });
        }
      } else {
        return punt({
          number: 6,
          trouble: "no data transfer object"
        });
      }
    });
  };

  csvToArray = function(strData, strDelimiter) {
    var arrData, arrMatches, objPattern, strMatchedDelimiter, strMatchedValue;
    strDelimiter = strDelimiter || ",";
    objPattern = new RegExp("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");
    arrData = [[]];
    arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
      strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
        arrData.push([]);
      }
      if (arrMatches[2]) {
        strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
      } else {
        strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    return arrData;
  };

  arrayToJson = function(array) {
    var cols, row, rowToObject, _i, _len, _results;
    cols = array.shift();
    rowToObject = function(row) {
      var k, obj, v, _i, _len, _ref, _ref1;
      obj = {};
      _ref = _.zip(cols, row);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], k = _ref1[0], v = _ref1[1];
        if ((v != null) && (v.match(/\S/)) && v !== 'NULL') {
          obj[k] = v;
        }
      }
      return obj;
    };
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      row = array[_i];
      _results.push(rowToObject(row));
    }
    return _results;
  };

  module.exports = {
    emit: emit,
    bind: bind
  };

}).call(this);

/*
//@ sourceMappingURL=factory.js.map
*/
},{}],5:[function(require,module,exports){
(function() {
  var active, newPage, pageHandler, plugin, refresh, state, util, wiki;

  wiki = require('./wiki');

  util = require('./util');

  pageHandler = wiki.pageHandler = require('./pageHandler');

  plugin = require('./plugin');

  state = require('./state');

  active = require('./active');

  refresh = require('./refresh');

  newPage = require('./page').newPage;

  Array.prototype.last = function() {
    return this[this.length - 1];
  };

  $(function() {
    var LEFTARROW, RIGHTARROW, createTextElement, doInternalLink, finishClick, getTemplate, sleep, textEditor;
    window.dialog = $('<div></div>').html('This dialog will show every time!').dialog({
      autoOpen: false,
      title: 'Basic Dialog',
      height: 600,
      width: 800
    });
    wiki.dialog = function(title, html) {
      window.dialog.html(html);
      window.dialog.dialog("option", "title", wiki.resolveLinks(title));
      return window.dialog.dialog('open');
    };
    sleep = function(time, done) {
      return setTimeout(done, time);
    };
    wiki.removeItem = function($item, item) {
      pageHandler.put($item.parents('.page:first'), {
        type: 'remove',
        id: item.id
      });
      return $item.remove();
    };
    wiki.createItem = function($page, $before, item) {
      var $item, before;
      if ($page == null) {
        $page = $before.parents('.page');
      }
      item.id = util.randomBytes(8);
      $item = $("<div class=\"item " + item.type + "\" data-id=\"" + "\"</div>");
      $item.data('item', item).data('pageElement', $page);
      if ($before != null) {
        $before.after($item);
      } else {
        $page.find('.story').append($item);
      }
      plugin["do"]($item, item);
      before = wiki.getItem($before);
      sleep(500, function() {
        return pageHandler.put($page, {
          item: item,
          id: item.id,
          type: 'add',
          after: before != null ? before.id : void 0
        });
      });
      return $item;
    };
    createTextElement = function(pageElement, beforeElement, initialText) {
      var item, itemBefore, itemElement;
      item = {
        type: 'paragraph',
        id: util.randomBytes(8),
        text: initialText
      };
      itemElement = $("<div class=\"item paragraph\" data-id=" + item.id + "></div>");
      itemElement.data('item', item).data('pageElement', pageElement);
      beforeElement.after(itemElement);
      plugin["do"](itemElement, item);
      itemBefore = wiki.getItem(beforeElement);
      wiki.textEditor(itemElement, item);
      return sleep(500, function() {
        return pageHandler.put(pageElement, {
          item: item,
          id: item.id,
          type: 'add',
          after: itemBefore != null ? itemBefore.id : void 0
        });
      });
    };
    textEditor = wiki.textEditor = function(div, item, caretPos, doubleClicked) {
      var original, textarea, _ref;
      if (div.hasClass('textEditing')) {
        return;
      }
      div.addClass('textEditing');
      textarea = $("<textarea>" + (original = (_ref = item.text) != null ? _ref : '') + "</textarea>").focusout(function() {
        div.removeClass('textEditing');
        if (item.text = textarea.val()) {
          plugin["do"](div.empty(), item);
          if (item.text === original) {
            return;
          }
          pageHandler.put(div.parents('.page:first'), {
            type: 'edit',
            id: item.id,
            item: item
          });
        } else {
          pageHandler.put(div.parents('.page:first'), {
            type: 'remove',
            id: item.id
          });
          div.remove();
        }
        return null;
      }).bind('keydown', function(e) {
        var middle, page, pageElement, prefix, prevItem, prevTextLen, sel, suffix, text;
        if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 83) {
          textarea.focusout();
          return false;
        }
        if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 73) {
          e.preventDefault();
          if (!e.shiftKey) {
            page = $(e.target).parents('.page');
          }
          doInternalLink("about " + item.type + " plugin", page);
          return false;
        }
        if (item.type === 'paragraph') {
          sel = util.getSelectionPos(textarea);
          if (e.which === $.ui.keyCode.BACKSPACE && sel.start === 0 && sel.start === sel.end) {
            prevItem = wiki.getItem(div.prev());
            if (prevItem.type !== 'paragraph') {
              return false;
            }
            prevTextLen = prevItem.text.length;
            prevItem.text += textarea.val();
            textarea.val('');
            textEditor(div.prev(), prevItem, prevTextLen);
            return false;
          } else if (e.which === $.ui.keyCode.ENTER && item.type === 'paragraph') {
            if (!sel) {
              return false;
            }
            text = textarea.val();
            prefix = text.substring(0, sel.start);
            if (sel.start !== sel.end) {
              middle = text.substring(sel.start, sel.end);
            }
            suffix = text.substring(sel.end);
            if (prefix === '') {
              textarea.val(' ');
            } else {
              textarea.val(prefix);
            }
            textarea.focusout();
            pageElement = div.parent().parent();
            createTextElement(pageElement, div, suffix);
            if (middle != null) {
              createTextElement(pageElement, div, middle);
            }
            if (prefix === '') {
              createTextElement(pageElement, div, '');
            }
            return false;
          }
        }
      });
      div.html(textarea);
      if (caretPos != null) {
        return util.setCaretPosition(textarea, caretPos);
      } else if (doubleClicked) {
        util.setCaretPosition(textarea, textarea.val().length);
        return textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
      } else {
        return textarea.focus();
      }
    };
    doInternalLink = wiki.doInternalLink = function(name, page, site) {
      if (site == null) {
        site = null;
      }
      name = wiki.asSlug(name);
      if (page != null) {
        $(page).nextAll().remove();
      }
      wiki.createPage(name, site).appendTo($('.main')).each(refresh);
      return active.set($('.page').last());
    };
    LEFTARROW = 37;
    RIGHTARROW = 39;
    $(document).keydown(function(event) {
      var direction, newIndex, pages;
      direction = (function() {
        switch (event.which) {
          case LEFTARROW:
            return -1;
          case RIGHTARROW:
            return +1;
        }
      })();
      if (direction && !(event.target.tagName === "TEXTAREA")) {
        pages = $('.page');
        newIndex = pages.index($('.active')) + direction;
        if ((0 <= newIndex && newIndex < pages.length)) {
          return active.set(pages.eq(newIndex));
        }
      }
    });
    $(window).on('popstate', state.show);
    $(document).ajaxError(function(event, request, settings) {
      if (request.status === 0 || request.status === 404) {
        return;
      }
      return wiki.log('ajax error', event, request, settings);
    });
    getTemplate = function(slug, done) {
      if (!slug) {
        return done(null);
      }
      wiki.log('getTemplate', slug);
      return pageHandler.get({
        whenGotten: function(pageObject, siteFound) {
          return done(pageObject.getRawPage().story);
        },
        whenNotGotten: function() {
          return done(null);
        },
        pageInformation: {
          slug: slug
        }
      });
    };
    finishClick = function(e, name) {
      var page;
      e.preventDefault();
      if (!e.shiftKey) {
        page = $(e.target).parents('.page');
      }
      doInternalLink(name, page, $(e.target).data('site'));
      return false;
    };
    $('.main').delegate('.show-page-source', 'click', function(e) {
      var json, pageElement;
      e.preventDefault();
      pageElement = $(this).parent().parent();
      json = pageElement.data('data');
      return wiki.dialog("JSON for " + json.title, $('<pre/>').text(JSON.stringify(json, null, 2)));
    }).delegate('.page', 'click', function(e) {
      if (!$(e.target).is("a")) {
        return active.set(this);
      }
    }).delegate('.internal', 'click', function(e) {
      var name;
      name = $(e.target).data('pageName');
      pageHandler.context = $(e.target).attr('title').split(' => ');
      return finishClick(e, name);
    }).delegate('img.remote', 'click', function(e) {
      var name;
      name = $(e.target).data('slug');
      pageHandler.context = [$(e.target).data('site')];
      return finishClick(e, name);
    }).delegate('.revision', 'dblclick', function(e) {
      var $page, action, json, page, rev;
      e.preventDefault();
      $page = $(this).parents('.page');
      page = $page.data('data');
      rev = page.journal.length - 1;
      action = page.journal[rev];
      json = JSON.stringify(action, null, 2);
      return wiki.dialog("Revision " + rev + ", " + action.type + " action", $('<pre/>').text(json));
    }).delegate('.action', 'click', function(e) {
      var $action, $page, name, rev, slug;
      e.preventDefault();
      $action = $(e.target);
      if ($action.is('.fork') && ((name = $action.data('slug')) != null)) {
        pageHandler.context = [$action.data('site')];
        return finishClick(e, (name.split('_'))[0]);
      } else {
        $page = $(this).parents('.page');
        slug = wiki.asSlug($page.data('data').title);
        rev = $(this).parent().children().not('.separator').index($action);
        if (rev < 0) {
          return;
        }
        if (!e.shiftKey) {
          $page.nextAll().remove();
        }
        wiki.createPage("" + slug + "_rev" + rev, $page.data('site')).appendTo($('.main')).each(refresh);
        return active.set($('.page').last());
      }
    }).delegate('.fork-page', 'click', function(e) {
      var item, pageElement, remoteSite;
      pageElement = $(e.target).parents('.page');
      if (pageElement.hasClass('local')) {
        if (!wiki.useLocalStorage()) {
          item = pageElement.data('data');
          pageElement.removeClass('local');
          return pageHandler.put(pageElement, {
            type: 'fork',
            item: item
          });
        }
      } else {
        if ((remoteSite = pageElement.data('site')) != null) {
          return pageHandler.put(pageElement, {
            type: 'fork',
            site: remoteSite
          });
        }
      }
    }).delegate('.action', 'hover', function() {
      var id;
      id = $(this).attr('data-id');
      $("[data-id=" + id + "]").toggleClass('target');
      return $('.main').trigger('rev');
    }).delegate('.item', 'hover', function() {
      var id;
      id = $(this).attr('data-id');
      return $(".action[data-id=" + id + "]").toggleClass('target');
    }).delegate('button.create', 'click', function(e) {
      return getTemplate($(e.target).data('slug'), function(story) {
        var $page, page, pageObject;
        $page = $(e.target).parents('.page:first');
        $page.removeClass('ghost');
        page = $page.data('data');
        page.story = story || [];
        pageObject = newPage(page, null);
        page = pageObject.getRawPage();
        pageHandler.put($page, {
          type: 'create',
          id: page.id,
          item: {
            title: page.title,
            story: page.story
          }
        });
        return wiki.buildPage(pageObject, $page.empty());
      });
    }).delegate('.ghost', 'rev', function(e) {
      var $item, $page, position;
      wiki.log('rev', e);
      $page = $(e.target).parents('.page:first');
      $item = $page.find('.target');
      position = $item.offset().top + $page.scrollTop() - $page.height() / 2;
      wiki.log('scroll', $page, $item, position);
      return $page.stop().animate({
        scrollTop: postion
      }, 'slow');
    }).delegate('.score', 'hover', function(e) {
      return $('.main').trigger('thumb', $(e.target).data('thumb'));
    });
    $(".provider input").click(function() {
      $("footer input:first").val($(this).attr('data-provider'));
      return $("footer form").submit();
    });
    $('body').on('new-neighbor-done', function(e, neighbor) {
      return $('.page').each(function(index, element) {
        return wiki.emitTwins($(element));
      });
    });
    return $(function() {
      state.first();
      $('.page').each(refresh);
      return active.set($('.page').last());
    });
  });

}).call(this);

/*
//@ sourceMappingURL=legacy.js.map
*/
},{"./active":2,"./page":7,"./pageHandler":8,"./plugin":10,"./refresh":12,"./state":15,"./util":17,"./wiki":18}],6:[function(require,module,exports){
(function() {
  var active, createSearch, neighborhood, nextAvailableFetch, nextFetchInterval, populateSiteInfoFor, totalPages, util, wiki, _,
    __hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  wiki = require('./wiki');

  active = require('./active');

  util = require('./util');

  createSearch = require('./search');

  module.exports = neighborhood = {};

  if (wiki.neighborhood == null) {
    wiki.neighborhood = {};
  }

  nextAvailableFetch = 0;

  nextFetchInterval = 2000;

  totalPages = 0;

  populateSiteInfoFor = function(site, neighborInfo) {
    var fetchMap, now, transition;
    if (neighborInfo.sitemapRequestInflight) {
      return;
    }
    neighborInfo.sitemapRequestInflight = true;
    transition = function(site, from, to) {
      return $(".neighbor[data-site=\"" + site + "\"]").find('div').removeClass(from).addClass(to);
    };
    fetchMap = function() {
      var request, sitemapUrl;
      sitemapUrl = "http://" + site + "/system/sitemap.json";
      transition(site, 'wait', 'fetch');
      request = $.ajax({
        type: 'GET',
        dataType: 'json',
        url: sitemapUrl
      });
      return request.always(function() {
        return neighborInfo.sitemapRequestInflight = false;
      }).done(function(data) {
        neighborInfo.sitemap = data;
        transition(site, 'fetch', 'done');
        return $('body').trigger('new-neighbor-done', site);
      }).fail(function(data) {
        return transition(site, 'fetch', 'fail');
      });
    };
    now = Date.now();
    if (now > nextAvailableFetch) {
      nextAvailableFetch = now + nextFetchInterval;
      return setTimeout(fetchMap, 100);
    } else {
      setTimeout(fetchMap, nextAvailableFetch - now);
      return nextAvailableFetch += nextFetchInterval;
    }
  };

  wiki.registerNeighbor = neighborhood.registerNeighbor = function(site) {
    var neighborInfo;
    if (wiki.neighborhood[site] != null) {
      return;
    }
    neighborInfo = {};
    wiki.neighborhood[site] = neighborInfo;
    populateSiteInfoFor(site, neighborInfo);
    return $('body').trigger('new-neighbor', site);
  };

  neighborhood.listNeighbors = function() {
    return _.keys(wiki.neighborhood);
  };

  neighborhood.search = function(searchQuery) {
    var finds, match, matchingPages, neighborInfo, neighborSite, sitemap, start, tally, tick, _ref;
    finds = [];
    tally = {};
    tick = function(key) {
      if (tally[key] != null) {
        return tally[key]++;
      } else {
        return tally[key] = 1;
      }
    };
    match = function(key, text) {
      var hit;
      hit = (text != null) && text.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;
      if (hit) {
        tick(key);
      }
      return hit;
    };
    start = Date.now();
    _ref = wiki.neighborhood;
    for (neighborSite in _ref) {
      if (!__hasProp.call(_ref, neighborSite)) continue;
      neighborInfo = _ref[neighborSite];
      sitemap = neighborInfo.sitemap;
      if (sitemap != null) {
        tick('sites');
      }
      matchingPages = _.each(sitemap, function(page) {
        tick('pages');
        if (!(match('title', page.title) || match('text', page.synopsis) || match('slug', page.slug))) {
          return;
        }
        tick('finds');
        return finds.push({
          page: page,
          site: neighborSite,
          rank: 1
        });
      });
    }
    tally['msec'] = Date.now() - start;
    return {
      finds: finds,
      tally: tally
    };
  };

  $(function() {
    var $neighborhood, flag, search;
    $neighborhood = $('.neighborhood');
    flag = function(site) {
      return "<span class=\"neighbor\" data-site=\"" + site + "\">\n  <div class=\"wait\">\n    <img src=\"http://" + site + "/favicon.png\" title=\"" + site + "\">\n  </div>\n</span>";
    };
    $('body').on('new-neighbor', function(e, site) {
      return $neighborhood.append(flag(site));
    }).on('new-neighbor-done', function(e, site) {
      var img, pageCount;
      pageCount = wiki.neighborhood[site].sitemap.length;
      img = $(".neighborhood .neighbor[data-site=\"" + site + "\"]").find('img');
      img.attr('title', "" + site + "\n " + pageCount + " pages");
      totalPages += pageCount;
      return $('.searchbox .pages').text("" + totalPages + " pages");
    }).delegate('.neighbor img', 'click', function(e) {
      return wiki.doInternalLink('welcome-visitors', null, this.title.split("\n")[0]);
    });
    search = createSearch({
      neighborhood: neighborhood
    });
    return $('input.search').on('keypress', function(e) {
      var searchQuery;
      if (e.keyCode !== 13) {
        return;
      }
      searchQuery = $(this).val();
      search.performSearch(searchQuery);
      return $(this).val("");
    });
  });

}).call(this);

/*
//@ sourceMappingURL=neighborhood.js.map
*/
},{"./active":2,"./search":14,"./util":17,"./wiki":18,"underscore":19}],7:[function(require,module,exports){
(function() {
  var asSlug, emptyPage, newPage, nowSections, util, _;

  util = require('./util');

  _ = require('underscore');

  asSlug = function(name) {
    return name.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
  };

  emptyPage = function() {
    return newPage({}, null);
  };

  nowSections = function(now) {
    return [
      {
        symbol: '❄',
        date: now - 1000 * 60 * 60 * 24 * 366,
        period: 'a Year'
      }, {
        symbol: '⚘',
        date: now - 1000 * 60 * 60 * 24 * 31 * 3,
        period: 'a Season'
      }, {
        symbol: '⚪',
        date: now - 1000 * 60 * 60 * 24 * 31,
        period: 'a Month'
      }, {
        symbol: '☽',
        date: now - 1000 * 60 * 60 * 24 * 7,
        period: 'a Week'
      }, {
        symbol: '☀',
        date: now - 1000 * 60 * 60 * 24,
        period: 'a Day'
      }, {
        symbol: '⌚',
        date: now - 1000 * 60 * 60,
        period: 'an Hour'
      }
    ];
  };

  newPage = function(json, site) {
    var addItem, addParagraph, getContext, getNeighbors, getRawPage, getRemoteSite, getSlug, getTitle, isLocal, isPlugin, isRemote, page, seqActions, seqItems, setTitle;
    page = _.extend({}, util.emptyPage(), json);
    page.story || (page.story = []);
    page.journal || (page.journal = []);
    getRawPage = function() {
      return page;
    };
    getContext = function() {
      var action, addContext, context, _i, _len, _ref;
      context = ['view'];
      if (isRemote()) {
        context.push(site);
      }
      addContext = function(site) {
        if ((site != null) && !_.include(context, site)) {
          return context.push(site);
        }
      };
      _ref = page.journal.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        addContext(action.site);
      }
      return context;
    };
    isPlugin = function() {
      return page.plugin != null;
    };
    isRemote = function() {
      return !(site === (void 0) || site === null || site === 'view' || site === 'origin' || site === 'local');
    };
    isLocal = function() {
      return site === 'local';
    };
    getRemoteSite = function(host) {
      if (host == null) {
        host = null;
      }
      if (isRemote()) {
        return site;
      } else {
        return host;
      }
    };
    getSlug = function() {
      return asSlug(page.title);
    };
    getNeighbors = function(host) {
      var action, item, neighbors, _i, _j, _len, _len1, _ref, _ref1;
      neighbors = [];
      if (isRemote()) {
        neighbors.push(site);
      } else {
        if (host != null) {
          neighbors.push(host);
        }
      }
      _ref = page.story;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.site != null) {
          neighbors.push(item.site);
        }
      }
      _ref1 = page.journal;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        action = _ref1[_j];
        if (action.site != null) {
          neighbors.push(action.site);
        }
      }
      return _.uniq(neighbors);
    };
    getTitle = function() {
      return page.title;
    };
    setTitle = function(title) {
      return page.title = title;
    };
    addItem = function(item) {
      item = _.extend({}, {
        id: util.randomBytes(8)
      }, item);
      return page.story.push(item);
    };
    seqItems = function(each) {
      var emitItem;
      emitItem = function(i) {
        if (i >= page.story.length) {
          return;
        }
        return each(page.story[i], function() {
          return emitItem(i + 1);
        });
      };
      return emitItem(0);
    };
    addParagraph = function(text) {
      var type;
      type = "paragraph";
      return addItem({
        type: type,
        text: text
      });
    };
    seqActions = function(each) {
      var emitAction, sections, smaller;
      smaller = 0;
      sections = nowSections((new Date).getTime());
      emitAction = function(i) {
        var action, bigger, section, separator, _i, _len;
        if (i >= page.journal.length) {
          return;
        }
        action = page.journal[i];
        bigger = action.date || 0;
        separator = null;
        for (_i = 0, _len = sections.length; _i < _len; _i++) {
          section = sections[_i];
          if (section.date > smaller && section.date < bigger) {
            separator = section;
          }
        }
        smaller = bigger;
        return each({
          action: action,
          separator: separator
        }, function() {
          return emitAction(i + 1);
        });
      };
      return emitAction(0);
    };
    return {
      getRawPage: getRawPage,
      getContext: getContext,
      isPlugin: isPlugin,
      isRemote: isRemote,
      isLocal: isLocal,
      getRemoteSite: getRemoteSite,
      getSlug: getSlug,
      getNeighbors: getNeighbors,
      getTitle: getTitle,
      setTitle: setTitle,
      addItem: addItem,
      addParagraph: addParagraph,
      seqItems: seqItems,
      seqActions: seqActions
    };
  };

  module.exports = {
    newPage: newPage,
    emptyPage: emptyPage
  };

}).call(this);

/*
//@ sourceMappingURL=page.js.map
*/
},{"./util":17,"underscore":19}],8:[function(require,module,exports){
(function() {
  var addToJournal, newPage, pageFromLocalStorage, pageHandler, pushToLocal, pushToServer, recursiveGet, revision, state, util, wiki, _;

  _ = require('underscore');

  wiki = require('./wiki');

  util = require('./util');

  state = require('./state');

  revision = require('./revision');

  addToJournal = require('./addToJournal');

  newPage = require('./page').newPage;

  module.exports = pageHandler = {};

  pageFromLocalStorage = function(slug) {
    var json;
    if (json = localStorage[slug]) {
      return JSON.parse(json);
    } else {
      return void 0;
    }
  };

  recursiveGet = function(_arg) {
    var localContext, localPage, pageInformation, rev, site, slug, url, whenGotten, whenNotGotten;
    pageInformation = _arg.pageInformation, whenGotten = _arg.whenGotten, whenNotGotten = _arg.whenNotGotten, localContext = _arg.localContext;
    slug = pageInformation.slug, rev = pageInformation.rev, site = pageInformation.site;
    if (site) {
      localContext = [];
    } else {
      site = localContext.shift();
    }
    if (site === window.location.host) {
      site = 'origin';
    }
    if (site === 'view') {
      site = null;
    }
    if (site != null) {
      if (site === 'local') {
        if (localPage = pageFromLocalStorage(pageInformation.slug)) {
          return whenGotten(newPage(localPage, 'local'));
        } else {
          return whenNotGotten();
        }
      } else {
        if (site === 'origin') {
          url = "/" + slug + ".json";
        } else {
          url = "http://" + site + "/" + slug + ".json";
        }
      }
    } else {
      url = "/" + slug + ".json";
    }
    return $.ajax({
      type: 'GET',
      dataType: 'json',
      url: url + ("?random=" + (util.randomBytes(4))),
      success: function(page) {
        if (rev) {
          page = revision.create(rev, page);
        }
        return whenGotten(newPage(page, site));
      },
      error: function(xhr, type, msg) {
        var troublePageObject;
        if ((xhr.status !== 404) && (xhr.status !== 0)) {
          wiki.log('pageHandler.get error', xhr, xhr.status, type, msg);
          troublePageObject = newPage({
            title: "Trouble: Can't Get Page"
          }, null);
          troublePageObject.addParagraph("The page handler has run into problems with this   request.\n<pre class=error>" + (JSON.stringify(pageInformation)) + "</pre>\nThe requested url.\n<pre class=error>" + url + "</pre>\nThe server reported status.\n<pre class=error>" + xhr.status + "</pre>\nThe error type.\n<pre class=error>" + type + "</pre>\nThe error message.\n<pre class=error>" + msg + "</pre>\nThese problems are rarely solved by reporting issues.\nThere could be additional information reported in the browser's console.log.\nMore information might be accessible by fetching the page outside of wiki.\n<a href=\"" + url + "\" target=\"_blank\">try-now</a>");
          return whenGotten(troublePageObject);
        }
        if (localContext.length > 0) {
          return recursiveGet({
            pageInformation: pageInformation,
            whenGotten: whenGotten,
            whenNotGotten: whenNotGotten,
            localContext: localContext
          });
        } else {
          return whenNotGotten();
        }
      }
    });
  };

  pageHandler.get = function(_arg) {
    var localPage, pageInformation, whenGotten, whenNotGotten;
    whenGotten = _arg.whenGotten, whenNotGotten = _arg.whenNotGotten, pageInformation = _arg.pageInformation;
    if (!pageInformation.site) {
      if (localPage = pageFromLocalStorage(pageInformation.slug)) {
        if (pageInformation.rev) {
          localPage = revision.create(pageInformation.rev, localPage);
        }
        return whenGotten(newPage(localPage, 'local'));
      }
    }
    if (!pageHandler.context.length) {
      pageHandler.context = ['view'];
    }
    return recursiveGet({
      pageInformation: pageInformation,
      whenGotten: whenGotten,
      whenNotGotten: whenNotGotten,
      localContext: _.clone(pageHandler.context)
    });
  };

  pageHandler.context = [];

  pushToLocal = function(pageElement, pagePutInfo, action) {
    var page, site;
    if (action.type === 'create') {
      page = {
        title: action.item.title,
        story: [],
        journal: []
      };
    } else {
      page = pageFromLocalStorage(pagePutInfo.slug);
      page || (page = pageElement.data("data"));
      if (page.journal == null) {
        page.journal = [];
      }
      if ((site = action['fork']) != null) {
        page.journal = page.journal.concat({
          'type': 'fork',
          'site': site
        });
        delete action['fork'];
      }
      page.story = $(pageElement).find(".item").map(function() {
        return $(this).data("item");
      }).get();
    }
    page.journal = page.journal.concat(action);
    localStorage[pagePutInfo.slug] = JSON.stringify(page);
    return addToJournal(pageElement.find('.journal'), action);
  };

  pushToServer = function(pageElement, pagePutInfo, action) {
    return $.ajax({
      type: 'PUT',
      url: "/page/" + pagePutInfo.slug + "/action",
      data: {
        'action': JSON.stringify(action)
      },
      success: function() {
        addToJournal(pageElement.find('.journal'), action);
        if (action.type === 'fork') {
          return localStorage.removeItem(pageElement.attr('id'));
        }
      },
      error: function(xhr, type, msg) {
        return wiki.log("pageHandler.put ajax error callback", type, msg);
      }
    });
  };

  pageHandler.put = function(pageElement, action) {
    var checkedSite, forkFrom, pagePutInfo;
    checkedSite = function() {
      var site;
      switch (site = pageElement.data('site')) {
        case 'origin':
        case 'local':
        case 'view':
          return null;
        case location.host:
          return null;
        default:
          return site;
      }
    };
    pagePutInfo = {
      slug: pageElement.attr('id').split('_rev')[0],
      rev: pageElement.attr('id').split('_rev')[1],
      site: checkedSite(),
      local: pageElement.hasClass('local')
    };
    forkFrom = pagePutInfo.site;
    wiki.log('pageHandler.put', action, pagePutInfo);
    if (wiki.useLocalStorage()) {
      if (pagePutInfo.site != null) {
        wiki.log('remote => local');
      } else if (!pagePutInfo.local) {
        wiki.log('origin => local');
        action.site = forkFrom = location.host;
      }
    }
    action.date = (new Date()).getTime();
    if (action.site === 'origin') {
      delete action.site;
    }
    if (forkFrom) {
      pageElement.find('h1 img').attr('src', '/favicon.png');
      pageElement.find('h1 a').attr('href', '/');
      pageElement.data('site', null);
      pageElement.removeClass('remote');
      state.setUrl();
      if (action.type !== 'fork') {
        action.fork = forkFrom;
        addToJournal(pageElement.find('.journal'), {
          type: 'fork',
          site: forkFrom,
          date: action.date
        });
      }
    }
    if (wiki.useLocalStorage() || pagePutInfo.site === 'local') {
      pushToLocal(pageElement, pagePutInfo, action);
      return pageElement.addClass("local");
    } else {
      return pushToServer(pageElement, pagePutInfo, action);
    }
  };

}).call(this);

/*
//@ sourceMappingURL=pageHandler.js.map
*/
},{"./addToJournal":3,"./page":7,"./revision":13,"./state":15,"./util":17,"./wiki":18,"underscore":19}],9:[function(require,module,exports){
(function() {
  module.exports = function(owner) {
    var failureDlg;
    $("#user-email").hide();
    $("#persona-login-btn").hide();
    $("#persona-logout-btn").hide();
    failureDlg = function(message) {
      return $("<div></div>").dialog({
        open: function(event, ui) {
          return $(".ui-dialog-titlebar-close").hide();
        },
        buttons: {
          "Ok": function() {
            $(this).dialog("close");
            return navigator.id.logout();
          }
        },
        close: function(event, ui) {
          return $(this).remove();
        },
        resizable: false,
        title: "Login Failure",
        modal: true
      }).html(message);
    };
    navigator.id.watch({
      loggedInUser: owner,
      onlogin: function(assertion) {
        return $.post("/persona_login", {
          assertion: assertion
        }, function(verified) {
          var failureMsg;
          verified = JSON.parse(verified);
          if ("okay" === verified.status) {
            return window.location = "/";
          } else if ("wrong-address" === verified.status) {
            return failureDlg("<p>Sign in is currently only available for the site owner.</p>");
          } else if ("failure" === verified.status) {
            if (/domain mismatch/.test(verified.reason)) {
              failureMsg = "<p>It looks as if you are accessing the site using an alternative address.</p>" + "<p>Please check that you are using the correct address to access this site.</p>";
            } else {
              failureMsg = "<p>Unable to log you in.</p>";
            }
            return failureDlg(failureMsg);
          } else {
            return navigator.id.logout();
          }
        });
      },
      onlogout: function() {
        return $.post("/persona_logout", function() {
          return window.location = "/";
        });
      },
      onready: function() {
        if (owner) {
          $("#persona-login-btn").hide();
          return $("#persona-logout-btn").show();
        } else {
          $("#persona-login-btn").show();
          return $("#persona-logout-btn").hide();
        }
      }
    });
    $("#persona-login-btn").click(function(e) {
      e.preventDefault();
      return navigator.id.request({});
    });
    return $("#persona-logout-btn").click(function(e) {
      e.preventDefault();
      return navigator.id.logout();
    });
  };

}).call(this);

/*
//@ sourceMappingURL=persona.js.map
*/
},{}],10:[function(require,module,exports){
(function() {
  var cachedScript, getScript, plugin, scripts, util, wiki,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('./util');

  wiki = require('./wiki');

  module.exports = plugin = {};

  cachedScript = function(url, options) {
    options = $.extend(options || {}, {
      dataType: "script",
      cache: true,
      url: url
    });
    return $.ajax(options);
  };

  scripts = [];

  getScript = wiki.getScript = function(url, callback) {
    if (callback == null) {
      callback = function() {};
    }
    if (__indexOf.call(scripts, url) >= 0) {
      return callback();
    } else {
      return cachedScript(url).done(function() {
        scripts.push(url);
        return callback();
      }).fail(function() {
        return callback();
      });
    }
  };

  plugin.get = wiki.getPlugin = function(name, callback) {
    if (window.plugins[name]) {
      return callback(window.plugins[name]);
    }
    return getScript("/plugins/" + name + "/" + name + ".js", function() {
      if (window.plugins[name]) {
        return callback(window.plugins[name]);
      }
      return getScript("/plugins/" + name + ".js", function() {
        return callback(window.plugins[name]);
      });
    });
  };

  plugin["do"] = wiki.doPlugin = function(div, item, done) {
    var error;
    if (done == null) {
      done = function() {};
    }
    error = function(ex) {
      var errorElement;
      errorElement = $("<div />").addClass('error');
      errorElement.text(ex.toString());
      return div.append(errorElement);
    };
    div.data('pageElement', div.parents(".page"));
    div.data('item', item);
    return plugin.get(item.type, function(script) {
      var err;
      try {
        if (script == null) {
          throw TypeError("Can't find plugin for '" + item.type + "'");
        }
        if (script.emit.length > 2) {
          return script.emit(div, item, function() {
            script.bind(div, item);
            return done();
          });
        } else {
          script.emit(div, item);
          script.bind(div, item);
          return done();
        }
      } catch (_error) {
        err = _error;
        wiki.log('plugin error', err);
        error(err);
        return done();
      }
    });
  };

  wiki.registerPlugin = function(pluginName, pluginFn) {
    return window.plugins[pluginName] = pluginFn($);
  };

  window.plugins = {
    reference: require('./reference'),
    factory: require('./factory'),
    paragraph: {
      emit: function(div, item) {
        var text, _i, _len, _ref, _results;
        _ref = item.text.split(/\n\n+/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          text = _ref[_i];
          if (text.match(/\S/)) {
            _results.push(div.append("<p>" + (wiki.resolveLinks(text)) + "</p>"));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      bind: function(div, item) {
        return div.dblclick(function() {
          return wiki.textEditor(div, item, null, true);
        });
      }
    },
    image: {
      emit: function(div, item) {
        item.text || (item.text = item.caption);
        return div.append("<img class=thumbnail src=\"" + item.url + "\"> <p>" + (wiki.resolveLinks(item.text)) + "</p>");
      },
      bind: function(div, item) {
        div.dblclick(function() {
          return wiki.textEditor(div, item);
        });
        return div.find('img').dblclick(function() {
          return wiki.dialog(item.text, this);
        });
      }
    },
    future: {
      emit: function(div, item) {
        var info, _i, _len, _ref, _results;
        div.append("" + item.text + "<br><br><button class=\"create\">create</button> new blank page");
        if (((info = wiki.neighborhood[location.host]) != null) && (info.sitemap != null)) {
          _ref = info.sitemap;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.slug.match(/-template$/)) {
              _results.push(div.append("<br><button class=\"create\" data-slug=" + item.slug + ">create</button> from " + (wiki.resolveLinks("[[" + item.title + "]]"))));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      },
      bind: function(div, item) {}
    }
  };

}).call(this);

/*
//@ sourceMappingURL=plugin.js.map
*/
},{"./factory":4,"./reference":11,"./util":17,"./wiki":18}],11:[function(require,module,exports){
(function() {
  var bind, emit;

  emit = function($item, item) {
    var site, slug;
    slug = item.slug || 'welcome-visitors';
    site = item.site;
    return wiki.resolveFrom(site, function() {
      return $item.append("<p style='margin-bottom:3px;'>\n  <img class='remote'\n    src='//" + site + "/favicon.png'\n    title='" + site + "'\n    data-site=\"" + site + "\"\n    data-slug=\"" + slug + "\"\n  >\n  " + (wiki.resolveLinks("[[" + (item.title || slug) + "]]")) + "\n</p>\n<div>\n  " + (wiki.resolveLinks(item.text)) + "\n</div>");
    });
  };

  bind = function($item, item) {
    return $item.dblclick(function() {
      return wiki.textEditor($item, item);
    });
  };

  module.exports = {
    emit: emit,
    bind: bind
  };

}).call(this);

/*
//@ sourceMappingURL=reference.js.map
*/
},{}],12:[function(require,module,exports){
(function() {
  var addToJournal, createFactory, createMissingFlag, emitControls, emitFooter, emitHeader, emitTimestamp, emitTwins, handleDragging, initAddButton, initDragging, neighborhood, pageHandler, plugin, refresh, renderPageIntoPageElement, state, util, wiki, _;

  _ = require('underscore');

  util = require('./util');

  pageHandler = require('./pageHandler');

  plugin = require('./plugin');

  state = require('./state');

  neighborhood = require('./neighborhood');

  addToJournal = require('./addToJournal');

  wiki = require('./wiki');

  handleDragging = function(evt, ui) {
    var $before, $destinationPage, $item, $sourcePage, $thisPage, action, before, equals, item, moveFromPage, moveToPage, moveWithinPage, order, sourceSite;
    $item = ui.item;
    item = wiki.getItem($item);
    $thisPage = $(this).parents('.page:first');
    $sourcePage = $item.data('pageElement');
    sourceSite = $sourcePage.data('site');
    $destinationPage = $item.parents('.page:first');
    equals = function(a, b) {
      return a && b && a.get(0) === b.get(0);
    };
    moveWithinPage = !$sourcePage || equals($sourcePage, $destinationPage);
    moveFromPage = !moveWithinPage && equals($thisPage, $sourcePage);
    moveToPage = !moveWithinPage && equals($thisPage, $destinationPage);
    if (moveFromPage) {
      if ($sourcePage.hasClass('ghost') || $sourcePage.attr('id') === $destinationPage.attr('id')) {
        return;
      }
    }
    action = moveWithinPage ? (order = $(this).children().map(function(_, value) {
      return $(value).attr('data-id');
    }).get(), {
      type: 'move',
      order: order
    }) : moveFromPage ? (wiki.log('drag from', $sourcePage.find('h1').text()), {
      type: 'remove'
    }) : moveToPage ? ($item.data('pageElement', $thisPage), $before = $item.prev('.item'), before = wiki.getItem($before), {
      type: 'add',
      item: item,
      after: before != null ? before.id : void 0
    }) : void 0;
    action.id = item.id;
    return pageHandler.put($thisPage, action);
  };

  initDragging = function($page) {
    var $story, options;
    options = {
      connectWith: '.page .story',
      placeholder: 'item-placeholder',
      forcePlaceholderSize: true
    };
    $story = $page.find('.story');
    return $story.sortable(options).on('sortupdate', handleDragging);
  };

  initAddButton = function($page) {
    return $page.find(".add-factory").live("click", function(evt) {
      if ($page.hasClass('ghost')) {
        return;
      }
      evt.preventDefault();
      return createFactory($page);
    });
  };

  createFactory = function($page) {
    var $before, $item, before, item;
    item = {
      type: "factory",
      id: util.randomBytes(8)
    };
    $item = $("<div />", {
      "class": "item factory"
    }).data('item', item).attr('data-id', item.id);
    $item.data('pageElement', $page);
    $page.find(".story").append($item);
    plugin["do"]($item, item);
    $before = $item.prev('.item');
    before = wiki.getItem($before);
    return pageHandler.put($page, {
      item: item,
      id: item.id,
      type: "add",
      after: before != null ? before.id : void 0
    });
  };

  emitHeader = function($header, $page, pageObject) {
    var absolute, tooltip, viewHere;
    viewHere = pageObject.getSlug() === 'welcome-visitors' ? "" : "/view/" + (pageObject.getSlug());
    absolute = pageObject.isRemote() ? "//" + (pageObject.getRemoteSite()) : "";
    tooltip = pageObject.getRemoteSite(location.host);
    if (pageObject.isPlugin()) {
      tooltip += "\n" + (pageObject.getRawPage().plugin) + " plugin";
    }
    return $header.append("<h1 title=\"" + tooltip + "\">\n  <a href=\"" + absolute + "/view/welcome-visitors" + viewHere + "\">\n    <img src=\"" + absolute + "/favicon.png\" height=\"32px\" class=\"favicon\">\n  </a> " + (pageObject.getTitle()) + "\n</h1>");
  };

  emitTimestamp = function($header, $page, pageObject) {
    var date, page, rev;
    if ($page.attr('id').match(/_rev/)) {
      page = pageObject.getRawPage();
      rev = page.journal.length - 1;
      date = page.journal[rev].date;
      $page.addClass('ghost').data('rev', rev);
      return $header.append($("<h2 class=\"revision\">\n  <span>\n    " + (date != null ? util.formatDate(date) : "Revision " + rev) + "\n  </span>\n</h2>"));
    }
  };

  emitControls = function($journal) {
    return $journal.append("<div class=\"control-buttons\">\n  <a href=\"#\" class=\"button fork-page\" title=\"fork this page\">" + util.symbols['fork'] + "</a>\n  <a href=\"#\" class=\"button add-factory\" title=\"add paragraph\">" + util.symbols['add'] + "</a>\n</div>");
  };

  emitFooter = function($footer, pageObject) {
    var host, slug;
    host = pageObject.getRemoteSite(location.host);
    slug = pageObject.getSlug();
    return $footer.append("<a id=\"license\" href=\"http://creativecommons.org/licenses/by-sa/3.0/\">CC BY-SA 3.0</a> .\n<a class=\"show-page-source\" href=\"/" + slug + ".json?random=" + (util.randomBytes(4)) + "\" title=\"source\">JSON</a> .\n<a href= \"//" + host + "/" + slug + ".html\">" + host + "</a>");
  };

  emitTwins = wiki.emitTwins = function($page) {
    var actions, bin, bins, flags, i, info, item, legend, page, remoteSite, site, slug, twins, viewing, _i, _len, _ref, _ref1, _ref2, _ref3;
    page = $page.data('data');
    site = $page.data('site') || window.location.host;
    if (site === 'view' || site === 'origin') {
      site = window.location.host;
    }
    slug = wiki.asSlug(page.title);
    if (((actions = (_ref = page.journal) != null ? _ref.length : void 0) != null) && ((viewing = (_ref1 = page.journal[actions - 1]) != null ? _ref1.date : void 0) != null)) {
      viewing = Math.floor(viewing / 1000) * 1000;
      bins = {
        newer: [],
        same: [],
        older: []
      };
      _ref2 = wiki.neighborhood;
      for (remoteSite in _ref2) {
        info = _ref2[remoteSite];
        if (remoteSite !== site && (info.sitemap != null)) {
          _ref3 = info.sitemap;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            item = _ref3[_i];
            if (item.slug === slug) {
              bin = item.date > viewing ? bins.newer : item.date < viewing ? bins.older : bins.same;
              bin.push({
                remoteSite: remoteSite,
                item: item
              });
            }
          }
        }
      }
      twins = [];
      for (legend in bins) {
        bin = bins[legend];
        if (!bin.length) {
          continue;
        }
        bin.sort(function(a, b) {
          return a.item.date < b.item.date;
        });
        flags = (function() {
          var _j, _len1, _ref4, _results;
          _results = [];
          for (i = _j = 0, _len1 = bin.length; _j < _len1; i = ++_j) {
            _ref4 = bin[i], remoteSite = _ref4.remoteSite, item = _ref4.item;
            if (i >= 8) {
              break;
            }
            _results.push("<img class=\"remote\"\nsrc=\"http://" + remoteSite + "/favicon.png\"\ndata-slug=\"" + slug + "\"\ndata-site=\"" + remoteSite + "\"\ntitle=\"" + remoteSite + "\">");
          }
          return _results;
        })();
        twins.push("" + (flags.join('&nbsp;')) + " " + legend);
      }
      if (twins) {
        return $page.find('.twins').html("<p>" + (twins.join(", ")) + "</p>");
      }
    }
  };

  renderPageIntoPageElement = function(pageObject, $page) {
    var $footer, $header, $journal, $story, $twins, _ref;
    $page.data("data", pageObject.getRawPage());
    if (pageObject.isRemote()) {
      $page.data("site", pageObject.getRemoteSite());
    }
    wiki.resolutionContext = pageObject.getContext();
    $page.empty();
    _ref = ['twins', 'header', 'story', 'journal', 'footer'].map(function(className) {
      return $("<div />").addClass(className).appendTo($page);
    }), $twins = _ref[0], $header = _ref[1], $story = _ref[2], $journal = _ref[3], $footer = _ref[4];
    emitHeader($header, $page, pageObject);
    emitTimestamp($header, $page, pageObject);
    pageObject.seqItems(function(item, done) {
      var $item;
      if ((item != null ? item.type : void 0) && (item != null ? item.id : void 0)) {
        $item = $("<div class=\"item " + item.type + "\" data-id=\"" + item.id + "\">");
        $story.append($item);
        return plugin["do"]($item, item, done);
      } else {
        $story.append($("<div><p class=\"error\">Can't make sense of story[" + i + "]</p></div>"));
        return done();
      }
    });
    pageObject.seqActions(function(each, done) {
      if (each.separator) {
        addToJournal($journal, each.separator);
      }
      addToJournal($journal, each.action);
      return done();
    });
    emitTwins($page);
    emitControls($journal);
    return emitFooter($footer, pageObject);
  };

  createMissingFlag = function($page, pageObject) {
    if (!pageObject.isRemote()) {
      return $('img.favicon', $page).error(function() {
        return plugin.get('favicon', function(favicon) {
          return favicon.create();
        });
      });
    }
  };

  wiki.buildPage = function(pageObject, $page) {
    if (pageObject.isLocal()) {
      $page.addClass('local');
    }
    if (pageObject.isRemote()) {
      $page.addClass('remote');
    }
    if (pageObject.isPlugin()) {
      $page.addClass('plugin');
    }
    renderPageIntoPageElement(pageObject, $page);
    createMissingFlag($page, pageObject);
    state.setUrl();
    initDragging($page);
    initAddButton($page);
    return $page;
  };

  module.exports = refresh = wiki.refresh = function() {
    var $page, createGhostPage, emptyPage, pageInformation, rev, slug, whenGotten, _ref;
    $page = $(this);
    _ref = $page.attr('id').split('_rev'), slug = _ref[0], rev = _ref[1];
    pageInformation = {
      slug: slug,
      rev: rev,
      site: $page.data('site')
    };
    emptyPage = require('./page').emptyPage;
    createGhostPage = function() {
      var hit, hits, info, pageObject, result, site, title, _i, _len, _ref1;
      title = $("a[href=\"/" + slug + ".html\"]:last").text() || slug;
      pageObject = emptyPage();
      pageObject.setTitle(title);
      hits = [];
      _ref1 = wiki.neighborhood;
      for (site in _ref1) {
        info = _ref1[site];
        if (info.sitemap != null) {
          result = _.find(info.sitemap, function(each) {
            return each.slug === slug;
          });
          if (result != null) {
            hits.push({
              "type": "reference",
              "site": site,
              "slug": slug,
              "title": result.title || slug,
              "text": result.synopsis || ''
            });
          }
        }
      }
      if (hits.length > 0) {
        pageObject.addItem({
          'type': 'future',
          'text': 'We could not find this page in the expected context.',
          'title': title
        });
        pageObject.addItem({
          'type': 'paragraph',
          'text': "We did find the page in your current neighborhood."
        });
        for (_i = 0, _len = hits.length; _i < _len; _i++) {
          hit = hits[_i];
          pageObject.addItem(hit);
        }
      } else {
        pageObject.addItem({
          'type': 'future',
          'text': 'We could not find this page.',
          'title': title
        });
      }
      return wiki.buildPage(pageObject, $page).addClass('ghost');
    };
    whenGotten = function(pageObject) {
      var site, _i, _len, _ref1, _results;
      wiki.buildPage(pageObject, $page);
      _ref1 = pageObject.getNeighbors(location.host);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        site = _ref1[_i];
        _results.push(neighborhood.registerNeighbor(site));
      }
      return _results;
    };
    return pageHandler.get({
      whenGotten: whenGotten,
      whenNotGotten: createGhostPage,
      pageInformation: pageInformation
    });
  };

}).call(this);

/*
//@ sourceMappingURL=refresh.js.map
*/
},{"./addToJournal":3,"./neighborhood":6,"./page":7,"./pageHandler":8,"./plugin":10,"./state":15,"./util":17,"./wiki":18,"underscore":19}],13:[function(require,module,exports){
(function() {
  var create;

  create = function(revIndex, data) {
    var afterIndex, editIndex, itemId, items, journal, journalEntry, removeIndex, revJournal, revStory, revStoryIds, revTitle, storyItem, _i, _j, _k, _len, _len1, _len2, _ref;
    journal = data.journal;
    revTitle = data.title;
    revStory = [];
    revJournal = journal.slice(0, +(+revIndex) + 1 || 9e9);
    for (_i = 0, _len = revJournal.length; _i < _len; _i++) {
      journalEntry = revJournal[_i];
      revStoryIds = revStory.map(function(storyItem) {
        return storyItem.id;
      });
      switch (journalEntry.type) {
        case 'create':
          if (journalEntry.item.title != null) {
            revTitle = journalEntry.item.title;
            revStory = journalEntry.item.story || [];
          }
          break;
        case 'add':
          if ((afterIndex = revStoryIds.indexOf(journalEntry.after)) !== -1) {
            revStory.splice(afterIndex + 1, 0, journalEntry.item);
          } else {
            revStory.push(journalEntry.item);
          }
          break;
        case 'edit':
          if ((editIndex = revStoryIds.indexOf(journalEntry.id)) !== -1) {
            revStory.splice(editIndex, 1, journalEntry.item);
          } else {
            revStory.push(journalEntry.item);
          }
          break;
        case 'move':
          items = {};
          for (_j = 0, _len1 = revStory.length; _j < _len1; _j++) {
            storyItem = revStory[_j];
            items[storyItem.id] = storyItem;
          }
          revStory = [];
          _ref = journalEntry.order;
          for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            itemId = _ref[_k];
            if (items[itemId] != null) {
              revStory.push(items[itemId]);
            }
          }
          break;
        case 'remove':
          if ((removeIndex = revStoryIds.indexOf(journalEntry.id)) !== -1) {
            revStory.splice(removeIndex, 1);
          }
      }
    }
    return {
      story: revStory,
      journal: revJournal,
      title: revTitle
    };
  };

  exports.create = create;

}).call(this);

/*
//@ sourceMappingURL=revision.js.map
*/
},{}],14:[function(require,module,exports){
(function() {
  var active, createSearch, emptyPage, util, wiki;

  wiki = require('./wiki');

  util = require('./util');

  active = require('./active');

  emptyPage = require('./page').emptyPage;

  createSearch = function(_arg) {
    var neighborhood, performSearch;
    neighborhood = _arg.neighborhood;
    performSearch = function(searchQuery) {
      var $resultPage, result, resultPage, searchResults, tally, _i, _len, _ref;
      searchResults = neighborhood.search(searchQuery);
      tally = searchResults.tally;
      resultPage = emptyPage();
      resultPage.setTitle("Search for '" + searchQuery + "'");
      resultPage.addParagraph("String '" + searchQuery + "' found on " + (tally.finds || 'none') + " of " + (tally.pages || 'no') + " pages from " + (tally.sites || 'no') + " sites.\nText matched on " + (tally.title || 'no') + " titles, " + (tally.text || 'no') + " paragraphs, and " + (tally.slug || 'no') + " slugs.\nElapsed time " + tally.msec + " milliseconds.");
      _ref = searchResults.finds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        resultPage.addItem({
          "type": "reference",
          "site": result.site,
          "slug": result.page.slug,
          "title": result.page.title,
          "text": result.page.synopsis || ''
        });
      }
      $resultPage = wiki.createPage(resultPage.getSlug()).addClass('ghost');
      $resultPage.appendTo($('.main'));
      wiki.buildPage(resultPage, $resultPage);
      return active.set($('.page').last());
    };
    return {
      performSearch: performSearch
    };
  };

  module.exports = createSearch;

}).call(this);

/*
//@ sourceMappingURL=search.js.map
*/
},{"./active":2,"./page":7,"./util":17,"./wiki":18}],15:[function(require,module,exports){
(function() {
  var active, state, wiki,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  wiki = require('./wiki');

  active = require('./active');

  module.exports = state = {};

  state.pagesInDom = function() {
    return $.makeArray($(".page").map(function(_, el) {
      return el.id;
    }));
  };

  state.urlPages = function() {
    var i;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = $(location).attr('pathname').split('/');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i += 2) {
        i = _ref[_i];
        _results.push(i);
      }
      return _results;
    })()).slice(1);
  };

  state.locsInDom = function() {
    return $.makeArray($(".page").map(function(_, el) {
      return $(el).data('site') || 'view';
    }));
  };

  state.urlLocs = function() {
    var j, _i, _len, _ref, _results;
    _ref = $(location).attr('pathname').split('/').slice(1);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i += 2) {
      j = _ref[_i];
      _results.push(j);
    }
    return _results;
  };

  state.setUrl = function() {
    var idx, locs, page, pages, url, _ref;
    document.title = (_ref = $('.page:last').data('data')) != null ? _ref.title : void 0;
    if (history && history.pushState) {
      locs = state.locsInDom();
      pages = state.pagesInDom();
      url = ((function() {
        var _i, _len, _results;
        _results = [];
        for (idx = _i = 0, _len = pages.length; _i < _len; idx = ++_i) {
          page = pages[idx];
          _results.push("/" + ((locs != null ? locs[idx] : void 0) || 'view') + "/" + page);
        }
        return _results;
      })()).join('');
      if (url !== $(location).attr('pathname')) {
        return history.pushState(null, null, url);
      }
    }
  };

  state.show = function(e) {
    var idx, name, newLocs, newPages, old, oldLocs, oldPages, previous, _i, _len, _ref;
    oldPages = state.pagesInDom();
    newPages = state.urlPages();
    oldLocs = state.locsInDom();
    newLocs = state.urlLocs();
    if (!location.pathname || location.pathname === '/') {
      return;
    }
    previous = $('.page').eq(0);
    for (idx = _i = 0, _len = newPages.length; _i < _len; idx = ++_i) {
      name = newPages[idx];
      if (name !== oldPages[idx]) {
        old = $('.page').eq(idx);
        if (old) {
          old.remove();
        }
        wiki.createPage(name, newLocs[idx]).insertAfter(previous).each(wiki.refresh);
      }
      previous = $('.page').eq(idx);
    }
    previous.nextAll().remove();
    active.set($('.page').last());
    return document.title = (_ref = $('.page:last').data('data')) != null ? _ref.title : void 0;
  };

  state.first = function() {
    var firstUrlLocs, firstUrlPages, idx, oldPages, urlPage, _i, _len, _results;
    state.setUrl();
    firstUrlPages = state.urlPages();
    firstUrlLocs = state.urlLocs();
    oldPages = state.pagesInDom();
    _results = [];
    for (idx = _i = 0, _len = firstUrlPages.length; _i < _len; idx = ++_i) {
      urlPage = firstUrlPages[idx];
      if (__indexOf.call(oldPages, urlPage) < 0) {
        if (urlPage !== '') {
          _results.push(wiki.createPage(urlPage, firstUrlLocs[idx]).appendTo('.main'));
        } else {
          _results.push(void 0);
        }
      }
    }
    return _results;
  };

}).call(this);

/*
//@ sourceMappingURL=state.js.map
*/
},{"./active":2,"./wiki":18}],16:[function(require,module,exports){
(function() {
  module.exports = function(page) {
    var p1, p2, synopsis;
    synopsis = page.synopsis;
    if ((page != null) && (page.story != null)) {
      p1 = page.story[0];
      p2 = page.story[1];
      if (p1 && p1.type === 'paragraph') {
        synopsis || (synopsis = p1.text);
      }
      if (p2 && p2.type === 'paragraph') {
        synopsis || (synopsis = p2.text);
      }
      if (p1 && (p1.text != null)) {
        synopsis || (synopsis = p1.text);
      }
      if (p2 && (p2.text != null)) {
        synopsis || (synopsis = p2.text);
      }
      synopsis || (synopsis = (page.story != null) && ("A page with " + page.story.length + " items."));
    } else {
      synopsis = 'A page with no story.';
    }
    return synopsis;
  };

}).call(this);

/*
//@ sourceMappingURL=synopsis.js.map
*/
},{}],17:[function(require,module,exports){
(function() {
  var util, wiki;

  wiki = require('./wiki');

  module.exports = wiki.util = util = {};

  util.symbols = {
    create: '☼',
    add: '+',
    edit: '✎',
    fork: '⚑',
    move: '↕',
    remove: '✕'
  };

  util.randomByte = function() {
    return (((1 + Math.random()) * 0x100) | 0).toString(16).substring(1);
  };

  util.randomBytes = function(n) {
    return ((function() {
      var _i, _results;
      _results = [];
      for (_i = 1; 1 <= n ? _i <= n : _i >= n; 1 <= n ? _i++ : _i--) {
        _results.push(util.randomByte());
      }
      return _results;
    })()).join('');
  };

  util.formatTime = function(time) {
    var am, d, h, mi, mo;
    d = new Date((time > 10000000000 ? time : time * 1000));
    mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    h = d.getHours();
    am = h < 12 ? 'AM' : 'PM';
    h = h === 0 ? 12 : h > 12 ? h - 12 : h;
    mi = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    return "" + h + ":" + mi + " " + am + "<br>" + (d.getDate()) + " " + mo + " " + (d.getFullYear());
  };

  util.formatDate = function(msSinceEpoch) {
    var am, d, day, h, mi, mo, sec, wk, yr;
    d = new Date(msSinceEpoch);
    wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    day = d.getDate();
    yr = d.getFullYear();
    h = d.getHours();
    am = h < 12 ? 'AM' : 'PM';
    h = h === 0 ? 12 : h > 12 ? h - 12 : h;
    mi = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    sec = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
    return "" + wk + " " + mo + " " + day + ", " + yr + "<br>" + h + ":" + mi + ":" + sec + " " + am;
  };

  util.formatElapsedTime = function(msSinceEpoch) {
    var days, hrs, mins, months, msecs, secs, weeks, years;
    msecs = new Date().getTime() - msSinceEpoch;
    if ((secs = msecs / 1000) < 2) {
      return "" + (Math.floor(msecs)) + " milliseconds ago";
    }
    if ((mins = secs / 60) < 2) {
      return "" + (Math.floor(secs)) + " seconds ago";
    }
    if ((hrs = mins / 60) < 2) {
      return "" + (Math.floor(mins)) + " minutes ago";
    }
    if ((days = hrs / 24) < 2) {
      return "" + (Math.floor(hrs)) + " hours ago";
    }
    if ((weeks = days / 7) < 2) {
      return "" + (Math.floor(days)) + " days ago";
    }
    if ((months = days / 31) < 2) {
      return "" + (Math.floor(weeks)) + " weeks ago";
    }
    if ((years = days / 365) < 2) {
      return "" + (Math.floor(months)) + " months ago";
    }
    return "" + (Math.floor(years)) + " years ago";
  };

  util.emptyPage = function() {
    return {
      title: 'empty',
      story: [],
      journal: []
    };
  };

  util.getSelectionPos = function(jQueryElement) {
    var el, iePos, sel;
    el = jQueryElement.get(0);
    if (document.selection) {
      el.focus();
      sel = document.selection.createRange();
      sel.moveStart('character', -el.value.length);
      iePos = sel.text.length;
      return {
        start: iePos,
        end: iePos
      };
    } else {
      return {
        start: el.selectionStart,
        end: el.selectionEnd
      };
    }
  };

  util.setCaretPosition = function(jQueryElement, caretPos) {
    var el, range;
    el = jQueryElement.get(0);
    if (el != null) {
      if (el.createTextRange) {
        range = el.createTextRange();
        range.move("character", caretPos);
        range.select();
      } else {
        el.setSelectionRange(caretPos, caretPos);
      }
      return el.focus();
    }
  };

}).call(this);

/*
//@ sourceMappingURL=util.js.map
*/
},{"./wiki":18}],18:[function(require,module,exports){
(function() {
  var createSynopsis, wiki,
    __slice = [].slice;

  createSynopsis = require('./synopsis');

  wiki = {
    createSynopsis: createSynopsis
  };

  wiki.persona = require('./persona');

  wiki.log = function() {
    var things;
    things = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) {
      return console.log.apply(console, things);
    }
  };

  wiki.asSlug = function(name) {
    return name.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
  };

  wiki.useLocalStorage = function() {
    return $(".login").length > 0;
  };

  wiki.resolutionContext = [];

  wiki.resolveFrom = function(addition, callback) {
    wiki.resolutionContext.push(addition);
    try {
      return callback();
    } finally {
      wiki.resolutionContext.pop();
    }
  };

  wiki.getData = function(vis) {
    var idx, who;
    if (vis) {
      idx = $('.item').index(vis);
      who = $(".item:lt(" + idx + ")").filter('.chart,.data,.calculator').last();
      if (who != null) {
        return who.data('item').data;
      } else {
        return {};
      }
    } else {
      who = $('.chart,.data,.calculator').last();
      if (who != null) {
        return who.data('item').data;
      } else {
        return {};
      }
    }
  };

  wiki.getDataNodes = function(vis) {
    var idx, who;
    if (vis) {
      idx = $('.item').index(vis);
      who = $(".item:lt(" + idx + ")").filter('.chart,.data,.calculator').toArray().reverse();
      return $(who);
    } else {
      who = $('.chart,.data,.calculator').toArray().reverse();
      return $(who);
    }
  };

  wiki.createPage = function(name, loc) {
    var $page, site;
    if (loc && loc !== 'view') {
      site = loc;
    }
    $page = $("<div class=\"page\" id=\"" + name + "\">\n  <div class=\"twins\"> <p> </p> </div>\n  <div class=\"header\">\n    <h1> <img class=\"favicon\" src=\"" + (site ? "//" + site : "") + "/favicon.png\" height=\"32px\"> " + name + " </h1>\n  </div>\n</div>");
    if (site) {
      $page.data('site', site);
    }
    return $page;
  };

  wiki.getItem = function(element) {
    if ($(element).length > 0) {
      return $(element).data("item") || $(element).data('staticItem');
    }
  };

  wiki.resolveLinks = function(string) {
    var renderInternalLink;
    renderInternalLink = function(match, name) {
      var slug;
      slug = wiki.asSlug(name);
      return "<a class=\"internal\" href=\"/" + slug + ".html\" data-page-name=\"" + slug + "\" title=\"" + (wiki.resolutionContext.join(' => ')) + "\">" + name + "</a>";
    };
    return string.replace(/\[\[([^\]]+)\]\]/gi, renderInternalLink).replace(/\[((http|https|ftp):.*?) (.*?)\]/gi, "<a class=\"external\" target=\"_blank\" href=\"$1\" title=\"$1\" rel=\"nofollow\">$3 <img src=\"/images/external-link-ltr-icon.png\"></a>");
  };

  module.exports = wiki;

}).call(this);

/*
//@ sourceMappingURL=wiki.js.map
*/
},{"./persona":9,"./synopsis":16}],19:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvd2N1bm5pbmdoYW0vdGVzdC1yZXBvcy93aWtpLWNsaWVudC9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvY2xpZW50LmNvZmZlZSIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi9hY3RpdmUuanMiLCIvVXNlcnMvd2N1bm5pbmdoYW0vdGVzdC1yZXBvcy93aWtpLWNsaWVudC9saWIvYWRkVG9Kb3VybmFsLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL2ZhY3RvcnkuanMiLCIvVXNlcnMvd2N1bm5pbmdoYW0vdGVzdC1yZXBvcy93aWtpLWNsaWVudC9saWIvbGVnYWN5LmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL25laWdoYm9yaG9vZC5qcyIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi9wYWdlLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3BhZ2VIYW5kbGVyLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3BlcnNvbmEuanMiLCIvVXNlcnMvd2N1bm5pbmdoYW0vdGVzdC1yZXBvcy93aWtpLWNsaWVudC9saWIvcGx1Z2luLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3JlZmVyZW5jZS5qcyIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi9yZWZyZXNoLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3JldmlzaW9uLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3NlYXJjaC5qcyIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi9zdGF0ZS5qcyIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi9zeW5vcHNpcy5qcyIsIi9Vc2Vycy93Y3VubmluZ2hhbS90ZXN0LXJlcG9zL3dpa2ktY2xpZW50L2xpYi91dGlsLmpzIiwiL1VzZXJzL3djdW5uaW5naGFtL3Rlc3QtcmVwb3Mvd2lraS1jbGllbnQvbGliL3dpa2kuanMiLCIvVXNlcnMvd2N1bm5pbmdoYW0vdGVzdC1yZXBvcy93aWtpLWNsaWVudC9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsTUFBTSxDQUFDLElBQVAsR0FBYyxPQUFBLENBQVEsWUFBUixDQUFkLENBQUE7O0FBQUEsT0FDQSxDQUFRLGNBQVIsQ0FEQSxDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIndpbmRvdy53aWtpID0gcmVxdWlyZSgnLi9saWIvd2lraScpXG5yZXF1aXJlKCcuL2xpYi9sZWdhY3knKVxuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYWN0aXZlLCBmaW5kU2Nyb2xsQ29udGFpbmVyLCBzY3JvbGxUbztcblxuICBtb2R1bGUuZXhwb3J0cyA9IGFjdGl2ZSA9IHt9O1xuXG4gIGFjdGl2ZS5zY3JvbGxDb250YWluZXIgPSB2b2lkIDA7XG5cbiAgZmluZFNjcm9sbENvbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY3JvbGxlZDtcbiAgICBzY3JvbGxlZCA9ICQoXCJib2R5LCBodG1sXCIpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKHRoaXMpLnNjcm9sbExlZnQoKSA+IDA7XG4gICAgfSk7XG4gICAgaWYgKHNjcm9sbGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBzY3JvbGxlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICQoXCJib2R5LCBodG1sXCIpLnNjcm9sbExlZnQoMTIpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQodGhpcykuc2Nyb2xsTGVmdCgpID4gMDtcbiAgICAgIH0pLnNjcm9sbFRvcCgwKTtcbiAgICB9XG4gIH07XG5cbiAgc2Nyb2xsVG8gPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciBib2R5V2lkdGgsIGNvbnRlbnRXaWR0aCwgbWF4WCwgbWluWCwgdGFyZ2V0LCB3aWR0aDtcbiAgICBpZiAoYWN0aXZlLnNjcm9sbENvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyID0gZmluZFNjcm9sbENvbnRhaW5lcigpO1xuICAgIH1cbiAgICBib2R5V2lkdGggPSAkKFwiYm9keVwiKS53aWR0aCgpO1xuICAgIG1pblggPSBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyLnNjcm9sbExlZnQoKTtcbiAgICBtYXhYID0gbWluWCArIGJvZHlXaWR0aDtcbiAgICB0YXJnZXQgPSBlbC5wb3NpdGlvbigpLmxlZnQ7XG4gICAgd2lkdGggPSBlbC5vdXRlcldpZHRoKHRydWUpO1xuICAgIGNvbnRlbnRXaWR0aCA9ICQoXCIucGFnZVwiKS5vdXRlcldpZHRoKHRydWUpICogJChcIi5wYWdlXCIpLnNpemUoKTtcbiAgICBpZiAodGFyZ2V0IDwgbWluWCkge1xuICAgICAgcmV0dXJuIGFjdGl2ZS5zY3JvbGxDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgIHNjcm9sbExlZnQ6IHRhcmdldFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgKyB3aWR0aCA+IG1heFgpIHtcbiAgICAgIHJldHVybiBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyLmFuaW1hdGUoe1xuICAgICAgICBzY3JvbGxMZWZ0OiB0YXJnZXQgLSAoYm9keVdpZHRoIC0gd2lkdGgpXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG1heFggPiAkKFwiLnBhZ2VzXCIpLm91dGVyV2lkdGgoKSkge1xuICAgICAgcmV0dXJuIGFjdGl2ZS5zY3JvbGxDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgIHNjcm9sbExlZnQ6IE1hdGgubWluKHRhcmdldCwgY29udGVudFdpZHRoIC0gYm9keVdpZHRoKVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGFjdGl2ZS5zZXQgPSBmdW5jdGlvbihlbCkge1xuICAgIGVsID0gJChlbCk7XG4gICAgJChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgcmV0dXJuIHNjcm9sbFRvKGVsLmFkZENsYXNzKFwiYWN0aXZlXCIpKTtcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPWFjdGl2ZS5qcy5tYXBcbiovIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgdXRpbDtcblxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqb3VybmFsRWxlbWVudCwgYWN0aW9uKSB7XG4gICAgdmFyIGFjdGlvbkVsZW1lbnQsIGFjdGlvblRpdGxlLCBjb250cm9scywgcGFnZUVsZW1lbnQ7XG4gICAgcGFnZUVsZW1lbnQgPSBqb3VybmFsRWxlbWVudC5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgIGFjdGlvblRpdGxlID0gYWN0aW9uLnR5cGUgfHwgJ3NlcGFyYXRvcic7XG4gICAgaWYgKGFjdGlvbi5kYXRlICE9IG51bGwpIHtcbiAgICAgIGFjdGlvblRpdGxlICs9IFwiIFwiICsgKHV0aWwuZm9ybWF0RWxhcHNlZFRpbWUoYWN0aW9uLmRhdGUpKTtcbiAgICB9XG4gICAgYWN0aW9uRWxlbWVudCA9ICQoXCI8YSBocmVmPVxcXCIjXFxcIiAvPiBcIikuYWRkQ2xhc3MoXCJhY3Rpb25cIikuYWRkQ2xhc3MoYWN0aW9uLnR5cGUgfHwgJ3NlcGFyYXRvcicpLnRleHQoYWN0aW9uLnN5bWJvbCB8fCB1dGlsLnN5bWJvbHNbYWN0aW9uLnR5cGVdKS5hdHRyKCd0aXRsZScsIGFjdGlvblRpdGxlKS5hdHRyKCdkYXRhLWlkJywgYWN0aW9uLmlkIHx8IFwiMFwiKS5kYXRhKCdhY3Rpb24nLCBhY3Rpb24pO1xuICAgIGNvbnRyb2xzID0gam91cm5hbEVsZW1lbnQuY2hpbGRyZW4oJy5jb250cm9sLWJ1dHRvbnMnKTtcbiAgICBpZiAoY29udHJvbHMubGVuZ3RoID4gMCkge1xuICAgICAgYWN0aW9uRWxlbWVudC5pbnNlcnRCZWZvcmUoY29udHJvbHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY3Rpb25FbGVtZW50LmFwcGVuZFRvKGpvdXJuYWxFbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSAnZm9yaycgJiYgKGFjdGlvbi5zaXRlICE9IG51bGwpKSB7XG4gICAgICByZXR1cm4gYWN0aW9uRWxlbWVudC5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKC8vXCIgKyBhY3Rpb24uc2l0ZSArIFwiL2Zhdmljb24ucG5nKVwiKS5hdHRyKFwiaHJlZlwiLCBcIi8vXCIgKyBhY3Rpb24uc2l0ZSArIFwiL1wiICsgKHBhZ2VFbGVtZW50LmF0dHIoJ2lkJykpICsgXCIuaHRtbFwiKS5kYXRhKFwic2l0ZVwiLCBhY3Rpb24uc2l0ZSkuZGF0YShcInNsdWdcIiwgcGFnZUVsZW1lbnQuYXR0cignaWQnKSk7XG4gICAgfVxuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9YWRkVG9Kb3VybmFsLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhcnJheVRvSnNvbiwgYmluZCwgY3N2VG9BcnJheSwgZW1pdCxcbiAgICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBlbWl0ID0gZnVuY3Rpb24oZGl2LCBpdGVtKSB7XG4gICAgdmFyIHNob3dNZW51LCBzaG93UHJvbXB0O1xuICAgIGRpdi5hcHBlbmQoJzxwPkRvdWJsZS1DbGljayB0byBFZGl0PGJyPkRyb3AgVGV4dCBvciBJbWFnZSB0byBJbnNlcnQ8L3A+Jyk7XG4gICAgc2hvd01lbnUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbmZvLCBsZWZ0LCBtZW51LCBtZW51SXRlbSwgbmFtZSwgX2ksIF9sZW4sIF9yZWYsIF9yZWYxO1xuICAgICAgbWVudSA9IGRpdi5maW5kKCdwJykuYXBwZW5kKFwiPGJyPk9yIENob29zZSBhIFBsdWdpblwiKTtcbiAgICAgIG1lbnUuYXBwZW5kKChsZWZ0ID0gJChcIjxkaXYgc3R5bGU9XFxcInRleHQtYWxpZ246bGVmdDsgcGFkZGluZy1sZWZ0OiA0MCVcXFwiPjwvZGl2PlwiKSkpO1xuICAgICAgbWVudSA9IGxlZnQ7XG4gICAgICBtZW51SXRlbSA9IGZ1bmN0aW9uKHRpdGxlLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBtZW51LmFwcGVuZChcIjxsaT48YSBjbGFzcz1cXFwibWVudVxcXCIgaHJlZj1cXFwiI1xcXCIgdGl0bGU9XFxcIlwiICsgdGl0bGUgKyBcIlxcXCI+XCIgKyBuYW1lICsgXCI8L2E+PC9saT5cIik7XG4gICAgICB9O1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkod2luZG93LmNhdGFsb2cpKSB7XG4gICAgICAgIF9yZWYgPSB3aW5kb3cuY2F0YWxvZztcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgaW5mbyA9IF9yZWZbX2ldO1xuICAgICAgICAgIG1lbnVJdGVtKGluZm8udGl0bGUsIGluZm8ubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9yZWYxID0gd2luZG93LmNhdGFsb2c7XG4gICAgICAgIGZvciAobmFtZSBpbiBfcmVmMSkge1xuICAgICAgICAgIGluZm8gPSBfcmVmMVtuYW1lXTtcbiAgICAgICAgICBtZW51SXRlbShpbmZvLm1lbnUsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVudS5maW5kKCdhLm1lbnUnKS5jbGljayhmdW5jdGlvbihldnQpIHtcbiAgICAgICAgZGl2LnJlbW92ZUNsYXNzKCdmYWN0b3J5JykuYWRkQ2xhc3MoaXRlbS50eXBlID0gZXZ0LnRhcmdldC50ZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBkaXYudW5iaW5kKCk7XG4gICAgICAgIHJldHVybiB3aWtpLnRleHRFZGl0b3IoZGl2LCBpdGVtKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgc2hvd1Byb21wdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRpdi5hcHBlbmQoXCI8cD5cIiArICh3aWtpLnJlc29sdmVMaW5rcyhpdGVtLnByb21wdCkpICsgXCI8L2I+XCIpO1xuICAgIH07XG4gICAgaWYgKGl0ZW0ucHJvbXB0KSB7XG4gICAgICByZXR1cm4gc2hvd1Byb21wdCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmNhdGFsb2cgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHNob3dNZW51KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAkLmdldEpTT04oJy9zeXN0ZW0vZmFjdG9yaWVzLmpzb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHdpbmRvdy5jYXRhbG9nID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHNob3dNZW51KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgYmluZCA9IGZ1bmN0aW9uKGRpdiwgaXRlbSkge1xuICAgIHZhciBzeW5jRWRpdEFjdGlvbjtcbiAgICBzeW5jRWRpdEFjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVyciwgcGFnZUVsZW1lbnQ7XG4gICAgICB3aWtpLmxvZygnZmFjdG9yeSBpdGVtJywgaXRlbSk7XG4gICAgICBkaXYuZW1wdHkoKS51bmJpbmQoKTtcbiAgICAgIGRpdi5yZW1vdmVDbGFzcyhcImZhY3RvcnlcIikuYWRkQ2xhc3MoaXRlbS50eXBlKTtcbiAgICAgIHBhZ2VFbGVtZW50ID0gZGl2LnBhcmVudHMoJy5wYWdlOmZpcnN0Jyk7XG4gICAgICB0cnkge1xuICAgICAgICBkaXYuZGF0YSgncGFnZUVsZW1lbnQnLCBwYWdlRWxlbWVudCk7XG4gICAgICAgIGRpdi5kYXRhKCdpdGVtJywgaXRlbSk7XG4gICAgICAgIHdpa2kuZ2V0UGx1Z2luKGl0ZW0udHlwZSwgZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgICAgICAgcGx1Z2luLmVtaXQoZGl2LCBpdGVtKTtcbiAgICAgICAgICByZXR1cm4gcGx1Z2luLmJpbmQoZGl2LCBpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgZXJyID0gX2Vycm9yO1xuICAgICAgICBkaXYuYXBwZW5kKFwiPHAgY2xhc3M9J2Vycm9yJz5cIiArIGVyciArIFwiPC9wPlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aWtpLnBhZ2VIYW5kbGVyLnB1dChwYWdlRWxlbWVudCwge1xuICAgICAgICB0eXBlOiAnZWRpdCcsXG4gICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICBpdGVtOiBpdGVtXG4gICAgICB9KTtcbiAgICB9O1xuICAgIGRpdi5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICAgIGRpdi5yZW1vdmVDbGFzcygnZmFjdG9yeScpLmFkZENsYXNzKGl0ZW0udHlwZSA9ICdwYXJhZ3JhcGgnKTtcbiAgICAgIGRpdi51bmJpbmQoKTtcbiAgICAgIHJldHVybiB3aWtpLnRleHRFZGl0b3IoZGl2LCBpdGVtKTtcbiAgICB9KTtcbiAgICBkaXYuYmluZCgnZHJhZ2VudGVyJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG4gICAgZGl2LmJpbmQoJ2RyYWdvdmVyJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpdi5iaW5kKFwiZHJvcFwiLCBmdW5jdGlvbihkcm9wRXZlbnQpIHtcbiAgICAgIHZhciBkdCwgZm91bmQsIGlnbm9yZSwgb3JpZ2luLCBwdW50LCByZWFkRmlsZSwgdXJsO1xuICAgICAgcHVudCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaXRlbS5wcm9tcHQgPSBcIjxiPlVuZXhwZWN0ZWQgSXRlbTwvYj48YnI+V2UgY2FuJ3QgbWFrZSBzZW5zZSBvZiB0aGUgZHJvcC48YnI+XCIgKyAoSlNPTi5zdHJpbmdpZnkoZGF0YSkpICsgXCI8YnI+VHJ5IHNvbWV0aGluZyBlbHNlIG9yIHNlZSBbW0Fib3V0IEZhY3RvcnkgUGx1Z2luXV0uXCI7XG4gICAgICAgIGRhdGEudXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgICAgaXRlbS5wdW50ID0gZGF0YTtcbiAgICAgICAgd2lraS5sb2coJ2ZhY3RvcnkgcHVudCcsIGRyb3BFdmVudCk7XG4gICAgICAgIHJldHVybiBzeW5jRWRpdEFjdGlvbigpO1xuICAgICAgfTtcbiAgICAgIHJlYWRGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICB2YXIgbWFqb3JUeXBlLCBtaW5vclR5cGUsIHJlYWRlciwgX3JlZjtcbiAgICAgICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgICAgIF9yZWYgPSBmaWxlLnR5cGUuc3BsaXQoXCIvXCIpLCBtYWpvclR5cGUgPSBfcmVmWzBdLCBtaW5vclR5cGUgPSBfcmVmWzFdO1xuICAgICAgICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgaWYgKG1ham9yVHlwZSA9PT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24obG9hZEV2ZW50KSB7XG4gICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdpbWFnZSc7XG4gICAgICAgICAgICAgIGl0ZW0udXJsID0gbG9hZEV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgIGl0ZW0uY2FwdGlvbiB8fCAoaXRlbS5jYXB0aW9uID0gXCJVcGxvYWRlZCBpbWFnZVwiKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobWFqb3JUeXBlID09PSBcInRleHRcIikge1xuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGxvYWRFdmVudCkge1xuICAgICAgICAgICAgICB2YXIgYXJyYXksIHJlc3VsdDtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gbG9hZEV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgIGlmIChtaW5vclR5cGUgPT09ICdjc3YnKSB7XG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ2RhdGEnO1xuICAgICAgICAgICAgICAgIGl0ZW0uY29sdW1ucyA9IChhcnJheSA9IGNzdlRvQXJyYXkocmVzdWx0KSlbMF07XG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gYXJyYXlUb0pzb24oYXJyYXkpO1xuICAgICAgICAgICAgICAgIGl0ZW0udGV4dCA9IGZpbGUuZmlsZU5hbWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ3BhcmFncmFwaCc7XG4gICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBzeW5jRWRpdEFjdGlvbigpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHB1bnQoe1xuICAgICAgICAgICAgICBudW1iZXI6IDEsXG4gICAgICAgICAgICAgIG5hbWU6IGZpbGUuZmlsZU5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IGZpbGUudHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBwdW50KHtcbiAgICAgICAgICAgIG51bWJlcjogMixcbiAgICAgICAgICAgIHR5cGVzOiBkcm9wRXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIudHlwZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGRyb3BFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKChkdCA9IGRyb3BFdmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcikgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKGR0LnR5cGVzICE9IG51bGwpICYmIChfX2luZGV4T2YuY2FsbChkdC50eXBlcywgJ3RleHQvdXJpLWxpc3QnKSA+PSAwIHx8IF9faW5kZXhPZi5jYWxsKGR0LnR5cGVzLCAndGV4dC94LW1vei11cmwnKSA+PSAwKSAmJiAhKF9faW5kZXhPZi5jYWxsKGR0LnR5cGVzLCAnRmlsZXMnKSA+PSAwKSkge1xuICAgICAgICAgIHVybCA9IGR0LmdldERhdGEoJ1VSTCcpO1xuICAgICAgICAgIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvXmh0dHA6XFwvXFwvKFthLXpBLVowLTk6Li1dKykoXFwvKFthLXpBLVowLTk6Li1dKylcXC8oW2EtejAtOS1dKyhfcmV2XFxkKyk/KSkrJC8pKSB7XG4gICAgICAgICAgICB3aWtpLmxvZygnZmFjdG9yeSBkcm9wIHVybCcsIGZvdW5kKTtcbiAgICAgICAgICAgIGlnbm9yZSA9IGZvdW5kWzBdLCBvcmlnaW4gPSBmb3VuZFsxXSwgaWdub3JlID0gZm91bmRbMl0sIGl0ZW0uc2l0ZSA9IGZvdW5kWzNdLCBpdGVtLnNsdWcgPSBmb3VuZFs0XSwgaWdub3JlID0gZm91bmRbNV07XG4gICAgICAgICAgICBpZiAoJC5pbkFycmF5KGl0ZW0uc2l0ZSwgWyd2aWV3JywgJ2xvY2FsJywgJ29yaWdpbiddKSA+PSAwKSB7XG4gICAgICAgICAgICAgIGl0ZW0uc2l0ZSA9IG9yaWdpbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAkLmdldEpTT04oXCJodHRwOi8vXCIgKyBpdGVtLnNpdGUgKyBcIi9cIiArIGl0ZW0uc2x1ZyArIFwiLmpzb25cIiwgZnVuY3Rpb24ocmVtb3RlKSB7XG4gICAgICAgICAgICAgIHdpa2kubG9nKCdmYWN0b3J5IHJlbW90ZScsIHJlbW90ZSk7XG4gICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdyZWZlcmVuY2UnO1xuICAgICAgICAgICAgICBpdGVtLnRpdGxlID0gcmVtb3RlLnRpdGxlIHx8IGl0ZW0uc2x1ZztcbiAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gd2lraS5jcmVhdGVTeW5vcHNpcyhyZW1vdGUpO1xuICAgICAgICAgICAgICBzeW5jRWRpdEFjdGlvbigpO1xuICAgICAgICAgICAgICBpZiAoaXRlbS5zaXRlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2lraS5yZWdpc3Rlck5laWdoYm9yKGl0ZW0uc2l0ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcHVudCh7XG4gICAgICAgICAgICAgIG51bWJlcjogNCxcbiAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgIHR5cGVzOiBkdC50eXBlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF9faW5kZXhPZi5jYWxsKGR0LnR5cGVzLCAnRmlsZXMnKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRGaWxlKGR0LmZpbGVzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcHVudCh7XG4gICAgICAgICAgICBudW1iZXI6IDUsXG4gICAgICAgICAgICB0eXBlczogZHQudHlwZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHB1bnQoe1xuICAgICAgICAgIG51bWJlcjogNixcbiAgICAgICAgICB0cm91YmxlOiBcIm5vIGRhdGEgdHJhbnNmZXIgb2JqZWN0XCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgY3N2VG9BcnJheSA9IGZ1bmN0aW9uKHN0ckRhdGEsIHN0ckRlbGltaXRlcikge1xuICAgIHZhciBhcnJEYXRhLCBhcnJNYXRjaGVzLCBvYmpQYXR0ZXJuLCBzdHJNYXRjaGVkRGVsaW1pdGVyLCBzdHJNYXRjaGVkVmFsdWU7XG4gICAgc3RyRGVsaW1pdGVyID0gc3RyRGVsaW1pdGVyIHx8IFwiLFwiO1xuICAgIG9ialBhdHRlcm4gPSBuZXcgUmVnRXhwKFwiKFxcXFxcIiArIHN0ckRlbGltaXRlciArIFwifFxcXFxyP1xcXFxufFxcXFxyfF4pXCIgKyBcIig/OlxcXCIoW15cXFwiXSooPzpcXFwiXFxcIlteXFxcIl0qKSopXFxcInxcIiArIFwiKFteXFxcIlxcXFxcIiArIHN0ckRlbGltaXRlciArIFwiXFxcXHJcXFxcbl0qKSlcIiwgXCJnaVwiKTtcbiAgICBhcnJEYXRhID0gW1tdXTtcbiAgICBhcnJNYXRjaGVzID0gbnVsbDtcbiAgICB3aGlsZSAoYXJyTWF0Y2hlcyA9IG9ialBhdHRlcm4uZXhlYyhzdHJEYXRhKSkge1xuICAgICAgc3RyTWF0Y2hlZERlbGltaXRlciA9IGFyck1hdGNoZXNbMV07XG4gICAgICBpZiAoc3RyTWF0Y2hlZERlbGltaXRlci5sZW5ndGggJiYgKHN0ck1hdGNoZWREZWxpbWl0ZXIgIT09IHN0ckRlbGltaXRlcikpIHtcbiAgICAgICAgYXJyRGF0YS5wdXNoKFtdKTtcbiAgICAgIH1cbiAgICAgIGlmIChhcnJNYXRjaGVzWzJdKSB7XG4gICAgICAgIHN0ck1hdGNoZWRWYWx1ZSA9IGFyck1hdGNoZXNbMl0ucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcIlxcXCJcIiwgXCJnXCIpLCBcIlxcXCJcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWzNdO1xuICAgICAgfVxuICAgICAgYXJyRGF0YVthcnJEYXRhLmxlbmd0aCAtIDFdLnB1c2goc3RyTWF0Y2hlZFZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyckRhdGE7XG4gIH07XG5cbiAgYXJyYXlUb0pzb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciBjb2xzLCByb3csIHJvd1RvT2JqZWN0LCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgY29scyA9IGFycmF5LnNoaWZ0KCk7XG4gICAgcm93VG9PYmplY3QgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgIHZhciBrLCBvYmosIHYsIF9pLCBfbGVuLCBfcmVmLCBfcmVmMTtcbiAgICAgIG9iaiA9IHt9O1xuICAgICAgX3JlZiA9IF8uemlwKGNvbHMsIHJvdyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgX3JlZjEgPSBfcmVmW19pXSwgayA9IF9yZWYxWzBdLCB2ID0gX3JlZjFbMV07XG4gICAgICAgIGlmICgodiAhPSBudWxsKSAmJiAodi5tYXRjaCgvXFxTLykpICYmIHYgIT09ICdOVUxMJykge1xuICAgICAgICAgIG9ialtrXSA9IHY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYXJyYXkubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIHJvdyA9IGFycmF5W19pXTtcbiAgICAgIF9yZXN1bHRzLnB1c2gocm93VG9PYmplY3Qocm93KSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBlbWl0OiBlbWl0LFxuICAgIGJpbmQ6IGJpbmRcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPWZhY3RvcnkuanMubWFwXG4qLyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGFjdGl2ZSwgbmV3UGFnZSwgcGFnZUhhbmRsZXIsIHBsdWdpbiwgcmVmcmVzaCwgc3RhdGUsIHV0aWwsIHdpa2k7XG5cbiAgd2lraSA9IHJlcXVpcmUoJy4vd2lraScpO1xuXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuICBwYWdlSGFuZGxlciA9IHdpa2kucGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL3BhZ2VIYW5kbGVyJyk7XG5cbiAgcGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKTtcblxuICBzdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxuICBhY3RpdmUgPSByZXF1aXJlKCcuL2FjdGl2ZScpO1xuXG4gIHJlZnJlc2ggPSByZXF1aXJlKCcuL3JlZnJlc2gnKTtcblxuICBuZXdQYWdlID0gcmVxdWlyZSgnLi9wYWdlJykubmV3UGFnZTtcblxuICBBcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG4gIH07XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgTEVGVEFSUk9XLCBSSUdIVEFSUk9XLCBjcmVhdGVUZXh0RWxlbWVudCwgZG9JbnRlcm5hbExpbmssIGZpbmlzaENsaWNrLCBnZXRUZW1wbGF0ZSwgc2xlZXAsIHRleHRFZGl0b3I7XG4gICAgd2luZG93LmRpYWxvZyA9ICQoJzxkaXY+PC9kaXY+JykuaHRtbCgnVGhpcyBkaWFsb2cgd2lsbCBzaG93IGV2ZXJ5IHRpbWUhJykuZGlhbG9nKHtcbiAgICAgIGF1dG9PcGVuOiBmYWxzZSxcbiAgICAgIHRpdGxlOiAnQmFzaWMgRGlhbG9nJyxcbiAgICAgIGhlaWdodDogNjAwLFxuICAgICAgd2lkdGg6IDgwMFxuICAgIH0pO1xuICAgIHdpa2kuZGlhbG9nID0gZnVuY3Rpb24odGl0bGUsIGh0bWwpIHtcbiAgICAgIHdpbmRvdy5kaWFsb2cuaHRtbChodG1sKTtcbiAgICAgIHdpbmRvdy5kaWFsb2cuZGlhbG9nKFwib3B0aW9uXCIsIFwidGl0bGVcIiwgd2lraS5yZXNvbHZlTGlua3ModGl0bGUpKTtcbiAgICAgIHJldHVybiB3aW5kb3cuZGlhbG9nLmRpYWxvZygnb3BlbicpO1xuICAgIH07XG4gICAgc2xlZXAgPSBmdW5jdGlvbih0aW1lLCBkb25lKSB7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChkb25lLCB0aW1lKTtcbiAgICB9O1xuICAgIHdpa2kucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gICAgICBwYWdlSGFuZGxlci5wdXQoJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKSwge1xuICAgICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICRpdGVtLnJlbW92ZSgpO1xuICAgIH07XG4gICAgd2lraS5jcmVhdGVJdGVtID0gZnVuY3Rpb24oJHBhZ2UsICRiZWZvcmUsIGl0ZW0pIHtcbiAgICAgIHZhciAkaXRlbSwgYmVmb3JlO1xuICAgICAgaWYgKCRwYWdlID09IG51bGwpIHtcbiAgICAgICAgJHBhZ2UgPSAkYmVmb3JlLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgICB9XG4gICAgICBpdGVtLmlkID0gdXRpbC5yYW5kb21CeXRlcyg4KTtcbiAgICAgICRpdGVtID0gJChcIjxkaXYgY2xhc3M9XFxcIml0ZW0gXCIgKyBpdGVtLnR5cGUgKyBcIlxcXCIgZGF0YS1pZD1cXFwiXCIgKyBcIlxcXCI8L2Rpdj5cIik7XG4gICAgICAkaXRlbS5kYXRhKCdpdGVtJywgaXRlbSkuZGF0YSgncGFnZUVsZW1lbnQnLCAkcGFnZSk7XG4gICAgICBpZiAoJGJlZm9yZSAhPSBudWxsKSB7XG4gICAgICAgICRiZWZvcmUuYWZ0ZXIoJGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHBhZ2UuZmluZCgnLnN0b3J5JykuYXBwZW5kKCRpdGVtKTtcbiAgICAgIH1cbiAgICAgIHBsdWdpbltcImRvXCJdKCRpdGVtLCBpdGVtKTtcbiAgICAgIGJlZm9yZSA9IHdpa2kuZ2V0SXRlbSgkYmVmb3JlKTtcbiAgICAgIHNsZWVwKDUwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgIHR5cGU6ICdhZGQnLFxuICAgICAgICAgIGFmdGVyOiBiZWZvcmUgIT0gbnVsbCA/IGJlZm9yZS5pZCA6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICRpdGVtO1xuICAgIH07XG4gICAgY3JlYXRlVGV4dEVsZW1lbnQgPSBmdW5jdGlvbihwYWdlRWxlbWVudCwgYmVmb3JlRWxlbWVudCwgaW5pdGlhbFRleHQpIHtcbiAgICAgIHZhciBpdGVtLCBpdGVtQmVmb3JlLCBpdGVtRWxlbWVudDtcbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICBpZDogdXRpbC5yYW5kb21CeXRlcyg4KSxcbiAgICAgICAgdGV4dDogaW5pdGlhbFRleHRcbiAgICAgIH07XG4gICAgICBpdGVtRWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJpdGVtIHBhcmFncmFwaFxcXCIgZGF0YS1pZD1cIiArIGl0ZW0uaWQgKyBcIj48L2Rpdj5cIik7XG4gICAgICBpdGVtRWxlbWVudC5kYXRhKCdpdGVtJywgaXRlbSkuZGF0YSgncGFnZUVsZW1lbnQnLCBwYWdlRWxlbWVudCk7XG4gICAgICBiZWZvcmVFbGVtZW50LmFmdGVyKGl0ZW1FbGVtZW50KTtcbiAgICAgIHBsdWdpbltcImRvXCJdKGl0ZW1FbGVtZW50LCBpdGVtKTtcbiAgICAgIGl0ZW1CZWZvcmUgPSB3aWtpLmdldEl0ZW0oYmVmb3JlRWxlbWVudCk7XG4gICAgICB3aWtpLnRleHRFZGl0b3IoaXRlbUVsZW1lbnQsIGl0ZW0pO1xuICAgICAgcmV0dXJuIHNsZWVwKDUwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQocGFnZUVsZW1lbnQsIHtcbiAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgIHR5cGU6ICdhZGQnLFxuICAgICAgICAgIGFmdGVyOiBpdGVtQmVmb3JlICE9IG51bGwgPyBpdGVtQmVmb3JlLmlkIDogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICB0ZXh0RWRpdG9yID0gd2lraS50ZXh0RWRpdG9yID0gZnVuY3Rpb24oZGl2LCBpdGVtLCBjYXJldFBvcywgZG91YmxlQ2xpY2tlZCkge1xuICAgICAgdmFyIG9yaWdpbmFsLCB0ZXh0YXJlYSwgX3JlZjtcbiAgICAgIGlmIChkaXYuaGFzQ2xhc3MoJ3RleHRFZGl0aW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZGl2LmFkZENsYXNzKCd0ZXh0RWRpdGluZycpO1xuICAgICAgdGV4dGFyZWEgPSAkKFwiPHRleHRhcmVhPlwiICsgKG9yaWdpbmFsID0gKF9yZWYgPSBpdGVtLnRleHQpICE9IG51bGwgPyBfcmVmIDogJycpICsgXCI8L3RleHRhcmVhPlwiKS5mb2N1c291dChmdW5jdGlvbigpIHtcbiAgICAgICAgZGl2LnJlbW92ZUNsYXNzKCd0ZXh0RWRpdGluZycpO1xuICAgICAgICBpZiAoaXRlbS50ZXh0ID0gdGV4dGFyZWEudmFsKCkpIHtcbiAgICAgICAgICBwbHVnaW5bXCJkb1wiXShkaXYuZW1wdHkoKSwgaXRlbSk7XG4gICAgICAgICAgaWYgKGl0ZW0udGV4dCA9PT0gb3JpZ2luYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFnZUhhbmRsZXIucHV0KGRpdi5wYXJlbnRzKCcucGFnZTpmaXJzdCcpLCB7XG4gICAgICAgICAgICB0eXBlOiAnZWRpdCcsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdlSGFuZGxlci5wdXQoZGl2LnBhcmVudHMoJy5wYWdlOmZpcnN0JyksIHtcbiAgICAgICAgICAgIHR5cGU6ICdyZW1vdmUnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkaXYucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KS5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgbWlkZGxlLCBwYWdlLCBwYWdlRWxlbWVudCwgcHJlZml4LCBwcmV2SXRlbSwgcHJldlRleHRMZW4sIHNlbCwgc3VmZml4LCB0ZXh0O1xuICAgICAgICBpZiAoKGUuYWx0S2V5IHx8IGUuY3RsS2V5IHx8IGUubWV0YUtleSkgJiYgZS53aGljaCA9PT0gODMpIHtcbiAgICAgICAgICB0ZXh0YXJlYS5mb2N1c291dCgpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGUuYWx0S2V5IHx8IGUuY3RsS2V5IHx8IGUubWV0YUtleSkgJiYgZS53aGljaCA9PT0gNzMpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBwYWdlID0gJChlLnRhcmdldCkucGFyZW50cygnLnBhZ2UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9JbnRlcm5hbExpbmsoXCJhYm91dCBcIiArIGl0ZW0udHlwZSArIFwiIHBsdWdpblwiLCBwYWdlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICBzZWwgPSB1dGlsLmdldFNlbGVjdGlvblBvcyh0ZXh0YXJlYSk7XG4gICAgICAgICAgaWYgKGUud2hpY2ggPT09ICQudWkua2V5Q29kZS5CQUNLU1BBQ0UgJiYgc2VsLnN0YXJ0ID09PSAwICYmIHNlbC5zdGFydCA9PT0gc2VsLmVuZCkge1xuICAgICAgICAgICAgcHJldkl0ZW0gPSB3aWtpLmdldEl0ZW0oZGl2LnByZXYoKSk7XG4gICAgICAgICAgICBpZiAocHJldkl0ZW0udHlwZSAhPT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldlRleHRMZW4gPSBwcmV2SXRlbS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIHByZXZJdGVtLnRleHQgKz0gdGV4dGFyZWEudmFsKCk7XG4gICAgICAgICAgICB0ZXh0YXJlYS52YWwoJycpO1xuICAgICAgICAgICAgdGV4dEVkaXRvcihkaXYucHJldigpLCBwcmV2SXRlbSwgcHJldlRleHRMZW4pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gJC51aS5rZXlDb2RlLkVOVEVSICYmIGl0ZW0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgIGlmICghc2VsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRleHQgPSB0ZXh0YXJlYS52YWwoKTtcbiAgICAgICAgICAgIHByZWZpeCA9IHRleHQuc3Vic3RyaW5nKDAsIHNlbC5zdGFydCk7XG4gICAgICAgICAgICBpZiAoc2VsLnN0YXJ0ICE9PSBzZWwuZW5kKSB7XG4gICAgICAgICAgICAgIG1pZGRsZSA9IHRleHQuc3Vic3RyaW5nKHNlbC5zdGFydCwgc2VsLmVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWZmaXggPSB0ZXh0LnN1YnN0cmluZyhzZWwuZW5kKTtcbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09ICcnKSB7XG4gICAgICAgICAgICAgIHRleHRhcmVhLnZhbCgnICcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGV4dGFyZWEudmFsKHByZWZpeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXh0YXJlYS5mb2N1c291dCgpO1xuICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSBkaXYucGFyZW50KCkucGFyZW50KCk7XG4gICAgICAgICAgICBjcmVhdGVUZXh0RWxlbWVudChwYWdlRWxlbWVudCwgZGl2LCBzdWZmaXgpO1xuICAgICAgICAgICAgaWYgKG1pZGRsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGNyZWF0ZVRleHRFbGVtZW50KHBhZ2VFbGVtZW50LCBkaXYsIG1pZGRsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSAnJykge1xuICAgICAgICAgICAgICBjcmVhdGVUZXh0RWxlbWVudChwYWdlRWxlbWVudCwgZGl2LCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpdi5odG1sKHRleHRhcmVhKTtcbiAgICAgIGlmIChjYXJldFBvcyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1dGlsLnNldENhcmV0UG9zaXRpb24odGV4dGFyZWEsIGNhcmV0UG9zKTtcbiAgICAgIH0gZWxzZSBpZiAoZG91YmxlQ2xpY2tlZCkge1xuICAgICAgICB1dGlsLnNldENhcmV0UG9zaXRpb24odGV4dGFyZWEsIHRleHRhcmVhLnZhbCgpLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiB0ZXh0YXJlYS5zY3JvbGxUb3AodGV4dGFyZWFbMF0uc2Nyb2xsSGVpZ2h0IC0gdGV4dGFyZWEuaGVpZ2h0KCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRleHRhcmVhLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBkb0ludGVybmFsTGluayA9IHdpa2kuZG9JbnRlcm5hbExpbmsgPSBmdW5jdGlvbihuYW1lLCBwYWdlLCBzaXRlKSB7XG4gICAgICBpZiAoc2l0ZSA9PSBudWxsKSB7XG4gICAgICAgIHNpdGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgbmFtZSA9IHdpa2kuYXNTbHVnKG5hbWUpO1xuICAgICAgaWYgKHBhZ2UgIT0gbnVsbCkge1xuICAgICAgICAkKHBhZ2UpLm5leHRBbGwoKS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIHdpa2kuY3JlYXRlUGFnZShuYW1lLCBzaXRlKS5hcHBlbmRUbygkKCcubWFpbicpKS5lYWNoKHJlZnJlc2gpO1xuICAgICAgcmV0dXJuIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xuICAgIH07XG4gICAgTEVGVEFSUk9XID0gMzc7XG4gICAgUklHSFRBUlJPVyA9IDM5O1xuICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sIG5ld0luZGV4LCBwYWdlcztcbiAgICAgIGRpcmVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgc3dpdGNoIChldmVudC53aGljaCkge1xuICAgICAgICAgIGNhc2UgTEVGVEFSUk9XOlxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIGNhc2UgUklHSFRBUlJPVzpcbiAgICAgICAgICAgIHJldHVybiArMTtcbiAgICAgICAgfVxuICAgICAgfSkoKTtcbiAgICAgIGlmIChkaXJlY3Rpb24gJiYgIShldmVudC50YXJnZXQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSkge1xuICAgICAgICBwYWdlcyA9ICQoJy5wYWdlJyk7XG4gICAgICAgIG5ld0luZGV4ID0gcGFnZXMuaW5kZXgoJCgnLmFjdGl2ZScpKSArIGRpcmVjdGlvbjtcbiAgICAgICAgaWYgKCgwIDw9IG5ld0luZGV4ICYmIG5ld0luZGV4IDwgcGFnZXMubGVuZ3RoKSkge1xuICAgICAgICAgIHJldHVybiBhY3RpdmUuc2V0KHBhZ2VzLmVxKG5ld0luZGV4KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgc3RhdGUuc2hvdyk7XG4gICAgJChkb2N1bWVudCkuYWpheEVycm9yKGZ1bmN0aW9uKGV2ZW50LCByZXF1ZXN0LCBzZXR0aW5ncykge1xuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwIHx8IHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpa2kubG9nKCdhamF4IGVycm9yJywgZXZlbnQsIHJlcXVlc3QsIHNldHRpbmdzKTtcbiAgICB9KTtcbiAgICBnZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHNsdWcsIGRvbmUpIHtcbiAgICAgIGlmICghc2x1Zykge1xuICAgICAgICByZXR1cm4gZG9uZShudWxsKTtcbiAgICAgIH1cbiAgICAgIHdpa2kubG9nKCdnZXRUZW1wbGF0ZScsIHNsdWcpO1xuICAgICAgcmV0dXJuIHBhZ2VIYW5kbGVyLmdldCh7XG4gICAgICAgIHdoZW5Hb3R0ZW46IGZ1bmN0aW9uKHBhZ2VPYmplY3QsIHNpdGVGb3VuZCkge1xuICAgICAgICAgIHJldHVybiBkb25lKHBhZ2VPYmplY3QuZ2V0UmF3UGFnZSgpLnN0b3J5KTtcbiAgICAgICAgfSxcbiAgICAgICAgd2hlbk5vdEdvdHRlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGRvbmUobnVsbCk7XG4gICAgICAgIH0sXG4gICAgICAgIHBhZ2VJbmZvcm1hdGlvbjoge1xuICAgICAgICAgIHNsdWc6IHNsdWdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICBmaW5pc2hDbGljayA9IGZ1bmN0aW9uKGUsIG5hbWUpIHtcbiAgICAgIHZhciBwYWdlO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgIHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZScpO1xuICAgICAgfVxuICAgICAgZG9JbnRlcm5hbExpbmsobmFtZSwgcGFnZSwgJChlLnRhcmdldCkuZGF0YSgnc2l0ZScpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgICQoJy5tYWluJykuZGVsZWdhdGUoJy5zaG93LXBhZ2Utc291cmNlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGpzb24sIHBhZ2VFbGVtZW50O1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcGFnZUVsZW1lbnQgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAganNvbiA9IHBhZ2VFbGVtZW50LmRhdGEoJ2RhdGEnKTtcbiAgICAgIHJldHVybiB3aWtpLmRpYWxvZyhcIkpTT04gZm9yIFwiICsganNvbi50aXRsZSwgJCgnPHByZS8+JykudGV4dChKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSkpO1xuICAgIH0pLmRlbGVnYXRlKCcucGFnZScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICghJChlLnRhcmdldCkuaXMoXCJhXCIpKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmUuc2V0KHRoaXMpO1xuICAgICAgfVxuICAgIH0pLmRlbGVnYXRlKCcuaW50ZXJuYWwnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgbmFtZTtcbiAgICAgIG5hbWUgPSAkKGUudGFyZ2V0KS5kYXRhKCdwYWdlTmFtZScpO1xuICAgICAgcGFnZUhhbmRsZXIuY29udGV4dCA9ICQoZS50YXJnZXQpLmF0dHIoJ3RpdGxlJykuc3BsaXQoJyA9PiAnKTtcbiAgICAgIHJldHVybiBmaW5pc2hDbGljayhlLCBuYW1lKTtcbiAgICB9KS5kZWxlZ2F0ZSgnaW1nLnJlbW90ZScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBuYW1lO1xuICAgICAgbmFtZSA9ICQoZS50YXJnZXQpLmRhdGEoJ3NsdWcnKTtcbiAgICAgIHBhZ2VIYW5kbGVyLmNvbnRleHQgPSBbJChlLnRhcmdldCkuZGF0YSgnc2l0ZScpXTtcbiAgICAgIHJldHVybiBmaW5pc2hDbGljayhlLCBuYW1lKTtcbiAgICB9KS5kZWxlZ2F0ZSgnLnJldmlzaW9uJywgJ2RibGNsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyICRwYWdlLCBhY3Rpb24sIGpzb24sIHBhZ2UsIHJldjtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRwYWdlID0gJCh0aGlzKS5wYXJlbnRzKCcucGFnZScpO1xuICAgICAgcGFnZSA9ICRwYWdlLmRhdGEoJ2RhdGEnKTtcbiAgICAgIHJldiA9IHBhZ2Uuam91cm5hbC5sZW5ndGggLSAxO1xuICAgICAgYWN0aW9uID0gcGFnZS5qb3VybmFsW3Jldl07XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWN0aW9uLCBudWxsLCAyKTtcbiAgICAgIHJldHVybiB3aWtpLmRpYWxvZyhcIlJldmlzaW9uIFwiICsgcmV2ICsgXCIsIFwiICsgYWN0aW9uLnR5cGUgKyBcIiBhY3Rpb25cIiwgJCgnPHByZS8+JykudGV4dChqc29uKSk7XG4gICAgfSkuZGVsZWdhdGUoJy5hY3Rpb24nLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgJGFjdGlvbiwgJHBhZ2UsIG5hbWUsIHJldiwgc2x1ZztcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRhY3Rpb24gPSAkKGUudGFyZ2V0KTtcbiAgICAgIGlmICgkYWN0aW9uLmlzKCcuZm9yaycpICYmICgobmFtZSA9ICRhY3Rpb24uZGF0YSgnc2x1ZycpKSAhPSBudWxsKSkge1xuICAgICAgICBwYWdlSGFuZGxlci5jb250ZXh0ID0gWyRhY3Rpb24uZGF0YSgnc2l0ZScpXTtcbiAgICAgICAgcmV0dXJuIGZpbmlzaENsaWNrKGUsIChuYW1lLnNwbGl0KCdfJykpWzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRwYWdlID0gJCh0aGlzKS5wYXJlbnRzKCcucGFnZScpO1xuICAgICAgICBzbHVnID0gd2lraS5hc1NsdWcoJHBhZ2UuZGF0YSgnZGF0YScpLnRpdGxlKTtcbiAgICAgICAgcmV2ID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbigpLm5vdCgnLnNlcGFyYXRvcicpLmluZGV4KCRhY3Rpb24pO1xuICAgICAgICBpZiAocmV2IDwgMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAkcGFnZS5uZXh0QWxsKCkucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgd2lraS5jcmVhdGVQYWdlKFwiXCIgKyBzbHVnICsgXCJfcmV2XCIgKyByZXYsICRwYWdlLmRhdGEoJ3NpdGUnKSkuYXBwZW5kVG8oJCgnLm1haW4nKSkuZWFjaChyZWZyZXNoKTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xuICAgICAgfVxuICAgIH0pLmRlbGVnYXRlKCcuZm9yay1wYWdlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGl0ZW0sIHBhZ2VFbGVtZW50LCByZW1vdGVTaXRlO1xuICAgICAgcGFnZUVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZScpO1xuICAgICAgaWYgKHBhZ2VFbGVtZW50Lmhhc0NsYXNzKCdsb2NhbCcpKSB7XG4gICAgICAgIGlmICghd2lraS51c2VMb2NhbFN0b3JhZ2UoKSkge1xuICAgICAgICAgIGl0ZW0gPSBwYWdlRWxlbWVudC5kYXRhKCdkYXRhJyk7XG4gICAgICAgICAgcGFnZUVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2xvY2FsJyk7XG4gICAgICAgICAgcmV0dXJuIHBhZ2VIYW5kbGVyLnB1dChwYWdlRWxlbWVudCwge1xuICAgICAgICAgICAgdHlwZTogJ2ZvcmsnLFxuICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoKHJlbW90ZVNpdGUgPSBwYWdlRWxlbWVudC5kYXRhKCdzaXRlJykpICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KHBhZ2VFbGVtZW50LCB7XG4gICAgICAgICAgICB0eXBlOiAnZm9yaycsXG4gICAgICAgICAgICBzaXRlOiByZW1vdGVTaXRlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5kZWxlZ2F0ZSgnLmFjdGlvbicsICdob3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGlkO1xuICAgICAgaWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgICAgICQoXCJbZGF0YS1pZD1cIiArIGlkICsgXCJdXCIpLnRvZ2dsZUNsYXNzKCd0YXJnZXQnKTtcbiAgICAgIHJldHVybiAkKCcubWFpbicpLnRyaWdnZXIoJ3JldicpO1xuICAgIH0pLmRlbGVnYXRlKCcuaXRlbScsICdob3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGlkO1xuICAgICAgaWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgICAgIHJldHVybiAkKFwiLmFjdGlvbltkYXRhLWlkPVwiICsgaWQgKyBcIl1cIikudG9nZ2xlQ2xhc3MoJ3RhcmdldCcpO1xuICAgIH0pLmRlbGVnYXRlKCdidXR0b24uY3JlYXRlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGdldFRlbXBsYXRlKCQoZS50YXJnZXQpLmRhdGEoJ3NsdWcnKSwgZnVuY3Rpb24oc3RvcnkpIHtcbiAgICAgICAgdmFyICRwYWdlLCBwYWdlLCBwYWdlT2JqZWN0O1xuICAgICAgICAkcGFnZSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJy5wYWdlOmZpcnN0Jyk7XG4gICAgICAgICRwYWdlLnJlbW92ZUNsYXNzKCdnaG9zdCcpO1xuICAgICAgICBwYWdlID0gJHBhZ2UuZGF0YSgnZGF0YScpO1xuICAgICAgICBwYWdlLnN0b3J5ID0gc3RvcnkgfHwgW107XG4gICAgICAgIHBhZ2VPYmplY3QgPSBuZXdQYWdlKHBhZ2UsIG51bGwpO1xuICAgICAgICBwYWdlID0gcGFnZU9iamVjdC5nZXRSYXdQYWdlKCk7XG4gICAgICAgIHBhZ2VIYW5kbGVyLnB1dCgkcGFnZSwge1xuICAgICAgICAgIHR5cGU6ICdjcmVhdGUnLFxuICAgICAgICAgIGlkOiBwYWdlLmlkLFxuICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgIHRpdGxlOiBwYWdlLnRpdGxlLFxuICAgICAgICAgICAgc3Rvcnk6IHBhZ2Uuc3RvcnlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gd2lraS5idWlsZFBhZ2UocGFnZU9iamVjdCwgJHBhZ2UuZW1wdHkoKSk7XG4gICAgICB9KTtcbiAgICB9KS5kZWxlZ2F0ZSgnLmdob3N0JywgJ3JldicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkaXRlbSwgJHBhZ2UsIHBvc2l0aW9uO1xuICAgICAgd2lraS5sb2coJ3JldicsIGUpO1xuICAgICAgJHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgICAgJGl0ZW0gPSAkcGFnZS5maW5kKCcudGFyZ2V0Jyk7XG4gICAgICBwb3NpdGlvbiA9ICRpdGVtLm9mZnNldCgpLnRvcCArICRwYWdlLnNjcm9sbFRvcCgpIC0gJHBhZ2UuaGVpZ2h0KCkgLyAyO1xuICAgICAgd2lraS5sb2coJ3Njcm9sbCcsICRwYWdlLCAkaXRlbSwgcG9zaXRpb24pO1xuICAgICAgcmV0dXJuICRwYWdlLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgc2Nyb2xsVG9wOiBwb3N0aW9uXG4gICAgICB9LCAnc2xvdycpO1xuICAgIH0pLmRlbGVnYXRlKCcuc2NvcmUnLCAnaG92ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gJCgnLm1haW4nKS50cmlnZ2VyKCd0aHVtYicsICQoZS50YXJnZXQpLmRhdGEoJ3RodW1iJykpO1xuICAgIH0pO1xuICAgICQoXCIucHJvdmlkZXIgaW5wdXRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAkKFwiZm9vdGVyIGlucHV0OmZpcnN0XCIpLnZhbCgkKHRoaXMpLmF0dHIoJ2RhdGEtcHJvdmlkZXInKSk7XG4gICAgICByZXR1cm4gJChcImZvb3RlciBmb3JtXCIpLnN1Ym1pdCgpO1xuICAgIH0pO1xuICAgICQoJ2JvZHknKS5vbignbmV3LW5laWdoYm9yLWRvbmUnLCBmdW5jdGlvbihlLCBuZWlnaGJvcikge1xuICAgICAgcmV0dXJuICQoJy5wYWdlJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gd2lraS5lbWl0VHdpbnMoJChlbGVtZW50KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gJChmdW5jdGlvbigpIHtcbiAgICAgIHN0YXRlLmZpcnN0KCk7XG4gICAgICAkKCcucGFnZScpLmVhY2gocmVmcmVzaCk7XG4gICAgICByZXR1cm4gYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG4gICAgfSk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9bGVnYWN5LmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhY3RpdmUsIGNyZWF0ZVNlYXJjaCwgbmVpZ2hib3Job29kLCBuZXh0QXZhaWxhYmxlRmV0Y2gsIG5leHRGZXRjaEludGVydmFsLCBwb3B1bGF0ZVNpdGVJbmZvRm9yLCB0b3RhbFBhZ2VzLCB1dGlsLCB3aWtpLCBfLFxuICAgIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4gIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbiAgd2lraSA9IHJlcXVpcmUoJy4vd2lraScpO1xuXG4gIGFjdGl2ZSA9IHJlcXVpcmUoJy4vYWN0aXZlJyk7XG5cbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4gIGNyZWF0ZVNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJyk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBuZWlnaGJvcmhvb2QgPSB7fTtcblxuICBpZiAod2lraS5uZWlnaGJvcmhvb2QgPT0gbnVsbCkge1xuICAgIHdpa2kubmVpZ2hib3Job29kID0ge307XG4gIH1cblxuICBuZXh0QXZhaWxhYmxlRmV0Y2ggPSAwO1xuXG4gIG5leHRGZXRjaEludGVydmFsID0gMjAwMDtcblxuICB0b3RhbFBhZ2VzID0gMDtcblxuICBwb3B1bGF0ZVNpdGVJbmZvRm9yID0gZnVuY3Rpb24oc2l0ZSwgbmVpZ2hib3JJbmZvKSB7XG4gICAgdmFyIGZldGNoTWFwLCBub3csIHRyYW5zaXRpb247XG4gICAgaWYgKG5laWdoYm9ySW5mby5zaXRlbWFwUmVxdWVzdEluZmxpZ2h0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5laWdoYm9ySW5mby5zaXRlbWFwUmVxdWVzdEluZmxpZ2h0ID0gdHJ1ZTtcbiAgICB0cmFuc2l0aW9uID0gZnVuY3Rpb24oc2l0ZSwgZnJvbSwgdG8pIHtcbiAgICAgIHJldHVybiAkKFwiLm5laWdoYm9yW2RhdGEtc2l0ZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiXVwiKS5maW5kKCdkaXYnKS5yZW1vdmVDbGFzcyhmcm9tKS5hZGRDbGFzcyh0byk7XG4gICAgfTtcbiAgICBmZXRjaE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlcXVlc3QsIHNpdGVtYXBVcmw7XG4gICAgICBzaXRlbWFwVXJsID0gXCJodHRwOi8vXCIgKyBzaXRlICsgXCIvc3lzdGVtL3NpdGVtYXAuanNvblwiO1xuICAgICAgdHJhbnNpdGlvbihzaXRlLCAnd2FpdCcsICdmZXRjaCcpO1xuICAgICAgcmVxdWVzdCA9ICQuYWpheCh7XG4gICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICB1cmw6IHNpdGVtYXBVcmxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcXVlc3QuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3JJbmZvLnNpdGVtYXBSZXF1ZXN0SW5mbGlnaHQgPSBmYWxzZTtcbiAgICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBuZWlnaGJvckluZm8uc2l0ZW1hcCA9IGRhdGE7XG4gICAgICAgIHRyYW5zaXRpb24oc2l0ZSwgJ2ZldGNoJywgJ2RvbmUnKTtcbiAgICAgICAgcmV0dXJuICQoJ2JvZHknKS50cmlnZ2VyKCduZXctbmVpZ2hib3ItZG9uZScsIHNpdGUpO1xuICAgICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9uKHNpdGUsICdmZXRjaCcsICdmYWlsJyk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKG5vdyA+IG5leHRBdmFpbGFibGVGZXRjaCkge1xuICAgICAgbmV4dEF2YWlsYWJsZUZldGNoID0gbm93ICsgbmV4dEZldGNoSW50ZXJ2YWw7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChmZXRjaE1hcCwgMTAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChmZXRjaE1hcCwgbmV4dEF2YWlsYWJsZUZldGNoIC0gbm93KTtcbiAgICAgIHJldHVybiBuZXh0QXZhaWxhYmxlRmV0Y2ggKz0gbmV4dEZldGNoSW50ZXJ2YWw7XG4gICAgfVxuICB9O1xuXG4gIHdpa2kucmVnaXN0ZXJOZWlnaGJvciA9IG5laWdoYm9yaG9vZC5yZWdpc3Rlck5laWdoYm9yID0gZnVuY3Rpb24oc2l0ZSkge1xuICAgIHZhciBuZWlnaGJvckluZm87XG4gICAgaWYgKHdpa2kubmVpZ2hib3Job29kW3NpdGVdICE9IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbmVpZ2hib3JJbmZvID0ge307XG4gICAgd2lraS5uZWlnaGJvcmhvb2Rbc2l0ZV0gPSBuZWlnaGJvckluZm87XG4gICAgcG9wdWxhdGVTaXRlSW5mb0ZvcihzaXRlLCBuZWlnaGJvckluZm8pO1xuICAgIHJldHVybiAkKCdib2R5JykudHJpZ2dlcignbmV3LW5laWdoYm9yJywgc2l0ZSk7XG4gIH07XG5cbiAgbmVpZ2hib3Job29kLmxpc3ROZWlnaGJvcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5rZXlzKHdpa2kubmVpZ2hib3Job29kKTtcbiAgfTtcblxuICBuZWlnaGJvcmhvb2Quc2VhcmNoID0gZnVuY3Rpb24oc2VhcmNoUXVlcnkpIHtcbiAgICB2YXIgZmluZHMsIG1hdGNoLCBtYXRjaGluZ1BhZ2VzLCBuZWlnaGJvckluZm8sIG5laWdoYm9yU2l0ZSwgc2l0ZW1hcCwgc3RhcnQsIHRhbGx5LCB0aWNrLCBfcmVmO1xuICAgIGZpbmRzID0gW107XG4gICAgdGFsbHkgPSB7fTtcbiAgICB0aWNrID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAodGFsbHlba2V5XSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0YWxseVtrZXldKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGFsbHlba2V5XSA9IDE7XG4gICAgICB9XG4gICAgfTtcbiAgICBtYXRjaCA9IGZ1bmN0aW9uKGtleSwgdGV4dCkge1xuICAgICAgdmFyIGhpdDtcbiAgICAgIGhpdCA9ICh0ZXh0ICE9IG51bGwpICYmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpID49IDA7XG4gICAgICBpZiAoaGl0KSB7XG4gICAgICAgIHRpY2soa2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoaXQ7XG4gICAgfTtcbiAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgX3JlZiA9IHdpa2kubmVpZ2hib3Job29kO1xuICAgIGZvciAobmVpZ2hib3JTaXRlIGluIF9yZWYpIHtcbiAgICAgIGlmICghX19oYXNQcm9wLmNhbGwoX3JlZiwgbmVpZ2hib3JTaXRlKSkgY29udGludWU7XG4gICAgICBuZWlnaGJvckluZm8gPSBfcmVmW25laWdoYm9yU2l0ZV07XG4gICAgICBzaXRlbWFwID0gbmVpZ2hib3JJbmZvLnNpdGVtYXA7XG4gICAgICBpZiAoc2l0ZW1hcCAhPSBudWxsKSB7XG4gICAgICAgIHRpY2soJ3NpdGVzJyk7XG4gICAgICB9XG4gICAgICBtYXRjaGluZ1BhZ2VzID0gXy5lYWNoKHNpdGVtYXAsIGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgICAgdGljaygncGFnZXMnKTtcbiAgICAgICAgaWYgKCEobWF0Y2goJ3RpdGxlJywgcGFnZS50aXRsZSkgfHwgbWF0Y2goJ3RleHQnLCBwYWdlLnN5bm9wc2lzKSB8fCBtYXRjaCgnc2x1ZycsIHBhZ2Uuc2x1ZykpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRpY2soJ2ZpbmRzJyk7XG4gICAgICAgIHJldHVybiBmaW5kcy5wdXNoKHtcbiAgICAgICAgICBwYWdlOiBwYWdlLFxuICAgICAgICAgIHNpdGU6IG5laWdoYm9yU2l0ZSxcbiAgICAgICAgICByYW5rOiAxXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRhbGx5Wydtc2VjJ10gPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbmRzOiBmaW5kcyxcbiAgICAgIHRhbGx5OiB0YWxseVxuICAgIH07XG4gIH07XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgJG5laWdoYm9yaG9vZCwgZmxhZywgc2VhcmNoO1xuICAgICRuZWlnaGJvcmhvb2QgPSAkKCcubmVpZ2hib3Job29kJyk7XG4gICAgZmxhZyA9IGZ1bmN0aW9uKHNpdGUpIHtcbiAgICAgIHJldHVybiBcIjxzcGFuIGNsYXNzPVxcXCJuZWlnaGJvclxcXCIgZGF0YS1zaXRlPVxcXCJcIiArIHNpdGUgKyBcIlxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJ3YWl0XFxcIj5cXG4gICAgPGltZyBzcmM9XFxcImh0dHA6Ly9cIiArIHNpdGUgKyBcIi9mYXZpY29uLnBuZ1xcXCIgdGl0bGU9XFxcIlwiICsgc2l0ZSArIFwiXFxcIj5cXG4gIDwvZGl2Plxcbjwvc3Bhbj5cIjtcbiAgICB9O1xuICAgICQoJ2JvZHknKS5vbignbmV3LW5laWdoYm9yJywgZnVuY3Rpb24oZSwgc2l0ZSkge1xuICAgICAgcmV0dXJuICRuZWlnaGJvcmhvb2QuYXBwZW5kKGZsYWcoc2l0ZSkpO1xuICAgIH0pLm9uKCduZXctbmVpZ2hib3ItZG9uZScsIGZ1bmN0aW9uKGUsIHNpdGUpIHtcbiAgICAgIHZhciBpbWcsIHBhZ2VDb3VudDtcbiAgICAgIHBhZ2VDb3VudCA9IHdpa2kubmVpZ2hib3Job29kW3NpdGVdLnNpdGVtYXAubGVuZ3RoO1xuICAgICAgaW1nID0gJChcIi5uZWlnaGJvcmhvb2QgLm5laWdoYm9yW2RhdGEtc2l0ZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiXVwiKS5maW5kKCdpbWcnKTtcbiAgICAgIGltZy5hdHRyKCd0aXRsZScsIFwiXCIgKyBzaXRlICsgXCJcXG4gXCIgKyBwYWdlQ291bnQgKyBcIiBwYWdlc1wiKTtcbiAgICAgIHRvdGFsUGFnZXMgKz0gcGFnZUNvdW50O1xuICAgICAgcmV0dXJuICQoJy5zZWFyY2hib3ggLnBhZ2VzJykudGV4dChcIlwiICsgdG90YWxQYWdlcyArIFwiIHBhZ2VzXCIpO1xuICAgIH0pLmRlbGVnYXRlKCcubmVpZ2hib3IgaW1nJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIHdpa2kuZG9JbnRlcm5hbExpbmsoJ3dlbGNvbWUtdmlzaXRvcnMnLCBudWxsLCB0aGlzLnRpdGxlLnNwbGl0KFwiXFxuXCIpWzBdKTtcbiAgICB9KTtcbiAgICBzZWFyY2ggPSBjcmVhdGVTZWFyY2goe1xuICAgICAgbmVpZ2hib3Job29kOiBuZWlnaGJvcmhvb2RcbiAgICB9KTtcbiAgICByZXR1cm4gJCgnaW5wdXQuc2VhcmNoJykub24oJ2tleXByZXNzJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHNlYXJjaFF1ZXJ5O1xuICAgICAgaWYgKGUua2V5Q29kZSAhPT0gMTMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhcmNoUXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgc2VhcmNoLnBlcmZvcm1TZWFyY2goc2VhcmNoUXVlcnkpO1xuICAgICAgcmV0dXJuICQodGhpcykudmFsKFwiXCIpO1xuICAgIH0pO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPW5laWdoYm9yaG9vZC5qcy5tYXBcbiovIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYXNTbHVnLCBlbXB0eVBhZ2UsIG5ld1BhZ2UsIG5vd1NlY3Rpb25zLCB1dGlsLCBfO1xuXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuICBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4gIGFzU2x1ZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZS5yZXBsYWNlKC9cXHMvZywgJy0nKS5yZXBsYWNlKC9bXkEtWmEtejAtOS1dL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuICB9O1xuXG4gIGVtcHR5UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXdQYWdlKHt9LCBudWxsKTtcbiAgfTtcblxuICBub3dTZWN0aW9ucyA9IGZ1bmN0aW9uKG5vdykge1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIHN5bWJvbDogJ+KdhCcsXG4gICAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwICogMjQgKiAzNjYsXG4gICAgICAgIHBlcmlvZDogJ2EgWWVhcidcbiAgICAgIH0sIHtcbiAgICAgICAgc3ltYm9sOiAn4pqYJyxcbiAgICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDMxICogMyxcbiAgICAgICAgcGVyaW9kOiAnYSBTZWFzb24nXG4gICAgICB9LCB7XG4gICAgICAgIHN5bWJvbDogJ+KaqicsXG4gICAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwICogMjQgKiAzMSxcbiAgICAgICAgcGVyaW9kOiAnYSBNb250aCdcbiAgICAgIH0sIHtcbiAgICAgICAgc3ltYm9sOiAn4pi9JyxcbiAgICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDcsXG4gICAgICAgIHBlcmlvZDogJ2EgV2VlaydcbiAgICAgIH0sIHtcbiAgICAgICAgc3ltYm9sOiAn4piAJyxcbiAgICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCxcbiAgICAgICAgcGVyaW9kOiAnYSBEYXknXG4gICAgICB9LCB7XG4gICAgICAgIHN5bWJvbDogJ+KMmicsXG4gICAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwLFxuICAgICAgICBwZXJpb2Q6ICdhbiBIb3VyJ1xuICAgICAgfVxuICAgIF07XG4gIH07XG5cbiAgbmV3UGFnZSA9IGZ1bmN0aW9uKGpzb24sIHNpdGUpIHtcbiAgICB2YXIgYWRkSXRlbSwgYWRkUGFyYWdyYXBoLCBnZXRDb250ZXh0LCBnZXROZWlnaGJvcnMsIGdldFJhd1BhZ2UsIGdldFJlbW90ZVNpdGUsIGdldFNsdWcsIGdldFRpdGxlLCBpc0xvY2FsLCBpc1BsdWdpbiwgaXNSZW1vdGUsIHBhZ2UsIHNlcUFjdGlvbnMsIHNlcUl0ZW1zLCBzZXRUaXRsZTtcbiAgICBwYWdlID0gXy5leHRlbmQoe30sIHV0aWwuZW1wdHlQYWdlKCksIGpzb24pO1xuICAgIHBhZ2Uuc3RvcnkgfHwgKHBhZ2Uuc3RvcnkgPSBbXSk7XG4gICAgcGFnZS5qb3VybmFsIHx8IChwYWdlLmpvdXJuYWwgPSBbXSk7XG4gICAgZ2V0UmF3UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfTtcbiAgICBnZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0aW9uLCBhZGRDb250ZXh0LCBjb250ZXh0LCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIGNvbnRleHQgPSBbJ3ZpZXcnXTtcbiAgICAgIGlmIChpc1JlbW90ZSgpKSB7XG4gICAgICAgIGNvbnRleHQucHVzaChzaXRlKTtcbiAgICAgIH1cbiAgICAgIGFkZENvbnRleHQgPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgICAgIGlmICgoc2l0ZSAhPSBudWxsKSAmJiAhXy5pbmNsdWRlKGNvbnRleHQsIHNpdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnRleHQucHVzaChzaXRlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIF9yZWYgPSBwYWdlLmpvdXJuYWwuc2xpY2UoMCkucmV2ZXJzZSgpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGFjdGlvbiA9IF9yZWZbX2ldO1xuICAgICAgICBhZGRDb250ZXh0KGFjdGlvbi5zaXRlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0O1xuICAgIH07XG4gICAgaXNQbHVnaW4gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwYWdlLnBsdWdpbiAhPSBudWxsO1xuICAgIH07XG4gICAgaXNSZW1vdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhKHNpdGUgPT09ICh2b2lkIDApIHx8IHNpdGUgPT09IG51bGwgfHwgc2l0ZSA9PT0gJ3ZpZXcnIHx8IHNpdGUgPT09ICdvcmlnaW4nIHx8IHNpdGUgPT09ICdsb2NhbCcpO1xuICAgIH07XG4gICAgaXNMb2NhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNpdGUgPT09ICdsb2NhbCc7XG4gICAgfTtcbiAgICBnZXRSZW1vdGVTaXRlID0gZnVuY3Rpb24oaG9zdCkge1xuICAgICAgaWYgKGhvc3QgPT0gbnVsbCkge1xuICAgICAgICBob3N0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChpc1JlbW90ZSgpKSB7XG4gICAgICAgIHJldHVybiBzaXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgICB9XG4gICAgfTtcbiAgICBnZXRTbHVnID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYXNTbHVnKHBhZ2UudGl0bGUpO1xuICAgIH07XG4gICAgZ2V0TmVpZ2hib3JzID0gZnVuY3Rpb24oaG9zdCkge1xuICAgICAgdmFyIGFjdGlvbiwgaXRlbSwgbmVpZ2hib3JzLCBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmLCBfcmVmMTtcbiAgICAgIG5laWdoYm9ycyA9IFtdO1xuICAgICAgaWYgKGlzUmVtb3RlKCkpIHtcbiAgICAgICAgbmVpZ2hib3JzLnB1c2goc2l0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaG9zdCAhPSBudWxsKSB7XG4gICAgICAgICAgbmVpZ2hib3JzLnB1c2goaG9zdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9yZWYgPSBwYWdlLnN0b3J5O1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGl0ZW0uc2l0ZSAhPSBudWxsKSB7XG4gICAgICAgICAgbmVpZ2hib3JzLnB1c2goaXRlbS5zaXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX3JlZjEgPSBwYWdlLmpvdXJuYWw7XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMS5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgYWN0aW9uID0gX3JlZjFbX2pdO1xuICAgICAgICBpZiAoYWN0aW9uLnNpdGUgIT0gbnVsbCkge1xuICAgICAgICAgIG5laWdoYm9ycy5wdXNoKGFjdGlvbi5zaXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIF8udW5pcShuZWlnaGJvcnMpO1xuICAgIH07XG4gICAgZ2V0VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwYWdlLnRpdGxlO1xuICAgIH07XG4gICAgc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSkge1xuICAgICAgcmV0dXJuIHBhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9O1xuICAgIGFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpdGVtID0gXy5leHRlbmQoe30sIHtcbiAgICAgICAgaWQ6IHV0aWwucmFuZG9tQnl0ZXMoOClcbiAgICAgIH0sIGl0ZW0pO1xuICAgICAgcmV0dXJuIHBhZ2Uuc3RvcnkucHVzaChpdGVtKTtcbiAgICB9O1xuICAgIHNlcUl0ZW1zID0gZnVuY3Rpb24oZWFjaCkge1xuICAgICAgdmFyIGVtaXRJdGVtO1xuICAgICAgZW1pdEl0ZW0gPSBmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmIChpID49IHBhZ2Uuc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlYWNoKHBhZ2Uuc3RvcnlbaV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBlbWl0SXRlbShpICsgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBlbWl0SXRlbSgwKTtcbiAgICB9O1xuICAgIGFkZFBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHZhciB0eXBlO1xuICAgICAgdHlwZSA9IFwicGFyYWdyYXBoXCI7XG4gICAgICByZXR1cm4gYWRkSXRlbSh7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIHRleHQ6IHRleHRcbiAgICAgIH0pO1xuICAgIH07XG4gICAgc2VxQWN0aW9ucyA9IGZ1bmN0aW9uKGVhY2gpIHtcbiAgICAgIHZhciBlbWl0QWN0aW9uLCBzZWN0aW9ucywgc21hbGxlcjtcbiAgICAgIHNtYWxsZXIgPSAwO1xuICAgICAgc2VjdGlvbnMgPSBub3dTZWN0aW9ucygobmV3IERhdGUpLmdldFRpbWUoKSk7XG4gICAgICBlbWl0QWN0aW9uID0gZnVuY3Rpb24oaSkge1xuICAgICAgICB2YXIgYWN0aW9uLCBiaWdnZXIsIHNlY3Rpb24sIHNlcGFyYXRvciwgX2ksIF9sZW47XG4gICAgICAgIGlmIChpID49IHBhZ2Uuam91cm5hbC5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9uID0gcGFnZS5qb3VybmFsW2ldO1xuICAgICAgICBiaWdnZXIgPSBhY3Rpb24uZGF0ZSB8fCAwO1xuICAgICAgICBzZXBhcmF0b3IgPSBudWxsO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHNlY3Rpb25zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zW19pXTtcbiAgICAgICAgICBpZiAoc2VjdGlvbi5kYXRlID4gc21hbGxlciAmJiBzZWN0aW9uLmRhdGUgPCBiaWdnZXIpIHtcbiAgICAgICAgICAgIHNlcGFyYXRvciA9IHNlY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNtYWxsZXIgPSBiaWdnZXI7XG4gICAgICAgIHJldHVybiBlYWNoKHtcbiAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICBzZXBhcmF0b3I6IHNlcGFyYXRvclxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZW1pdEFjdGlvbihpICsgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBlbWl0QWN0aW9uKDApO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFJhd1BhZ2U6IGdldFJhd1BhZ2UsXG4gICAgICBnZXRDb250ZXh0OiBnZXRDb250ZXh0LFxuICAgICAgaXNQbHVnaW46IGlzUGx1Z2luLFxuICAgICAgaXNSZW1vdGU6IGlzUmVtb3RlLFxuICAgICAgaXNMb2NhbDogaXNMb2NhbCxcbiAgICAgIGdldFJlbW90ZVNpdGU6IGdldFJlbW90ZVNpdGUsXG4gICAgICBnZXRTbHVnOiBnZXRTbHVnLFxuICAgICAgZ2V0TmVpZ2hib3JzOiBnZXROZWlnaGJvcnMsXG4gICAgICBnZXRUaXRsZTogZ2V0VGl0bGUsXG4gICAgICBzZXRUaXRsZTogc2V0VGl0bGUsXG4gICAgICBhZGRJdGVtOiBhZGRJdGVtLFxuICAgICAgYWRkUGFyYWdyYXBoOiBhZGRQYXJhZ3JhcGgsXG4gICAgICBzZXFJdGVtczogc2VxSXRlbXMsXG4gICAgICBzZXFBY3Rpb25zOiBzZXFBY3Rpb25zXG4gICAgfTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuZXdQYWdlOiBuZXdQYWdlLFxuICAgIGVtcHR5UGFnZTogZW1wdHlQYWdlXG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1wYWdlLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhZGRUb0pvdXJuYWwsIG5ld1BhZ2UsIHBhZ2VGcm9tTG9jYWxTdG9yYWdlLCBwYWdlSGFuZGxlciwgcHVzaFRvTG9jYWwsIHB1c2hUb1NlcnZlciwgcmVjdXJzaXZlR2V0LCByZXZpc2lvbiwgc3RhdGUsIHV0aWwsIHdpa2ksIF87XG5cbiAgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuICB3aWtpID0gcmVxdWlyZSgnLi93aWtpJyk7XG5cbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4gIHN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG4gIHJldmlzaW9uID0gcmVxdWlyZSgnLi9yZXZpc2lvbicpO1xuXG4gIGFkZFRvSm91cm5hbCA9IHJlcXVpcmUoJy4vYWRkVG9Kb3VybmFsJyk7XG5cbiAgbmV3UGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpLm5ld1BhZ2U7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBwYWdlSGFuZGxlciA9IHt9O1xuXG4gIHBhZ2VGcm9tTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24oc2x1Zykge1xuICAgIHZhciBqc29uO1xuICAgIGlmIChqc29uID0gbG9jYWxTdG9yYWdlW3NsdWddKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gIH07XG5cbiAgcmVjdXJzaXZlR2V0ID0gZnVuY3Rpb24oX2FyZykge1xuICAgIHZhciBsb2NhbENvbnRleHQsIGxvY2FsUGFnZSwgcGFnZUluZm9ybWF0aW9uLCByZXYsIHNpdGUsIHNsdWcsIHVybCwgd2hlbkdvdHRlbiwgd2hlbk5vdEdvdHRlbjtcbiAgICBwYWdlSW5mb3JtYXRpb24gPSBfYXJnLnBhZ2VJbmZvcm1hdGlvbiwgd2hlbkdvdHRlbiA9IF9hcmcud2hlbkdvdHRlbiwgd2hlbk5vdEdvdHRlbiA9IF9hcmcud2hlbk5vdEdvdHRlbiwgbG9jYWxDb250ZXh0ID0gX2FyZy5sb2NhbENvbnRleHQ7XG4gICAgc2x1ZyA9IHBhZ2VJbmZvcm1hdGlvbi5zbHVnLCByZXYgPSBwYWdlSW5mb3JtYXRpb24ucmV2LCBzaXRlID0gcGFnZUluZm9ybWF0aW9uLnNpdGU7XG4gICAgaWYgKHNpdGUpIHtcbiAgICAgIGxvY2FsQ29udGV4dCA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaXRlID0gbG9jYWxDb250ZXh0LnNoaWZ0KCk7XG4gICAgfVxuICAgIGlmIChzaXRlID09PSB3aW5kb3cubG9jYXRpb24uaG9zdCkge1xuICAgICAgc2l0ZSA9ICdvcmlnaW4nO1xuICAgIH1cbiAgICBpZiAoc2l0ZSA9PT0gJ3ZpZXcnKSB7XG4gICAgICBzaXRlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHNpdGUgIT0gbnVsbCkge1xuICAgICAgaWYgKHNpdGUgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgaWYgKGxvY2FsUGFnZSA9IHBhZ2VGcm9tTG9jYWxTdG9yYWdlKHBhZ2VJbmZvcm1hdGlvbi5zbHVnKSkge1xuICAgICAgICAgIHJldHVybiB3aGVuR290dGVuKG5ld1BhZ2UobG9jYWxQYWdlLCAnbG9jYWwnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHdoZW5Ob3RHb3R0ZW4oKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNpdGUgPT09ICdvcmlnaW4nKSB7XG4gICAgICAgICAgdXJsID0gXCIvXCIgKyBzbHVnICsgXCIuanNvblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVybCA9IFwiaHR0cDovL1wiICsgc2l0ZSArIFwiL1wiICsgc2x1ZyArIFwiLmpzb25cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB1cmwgPSBcIi9cIiArIHNsdWcgKyBcIi5qc29uXCI7XG4gICAgfVxuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgdXJsOiB1cmwgKyAoXCI/cmFuZG9tPVwiICsgKHV0aWwucmFuZG9tQnl0ZXMoNCkpKSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgICAgaWYgKHJldikge1xuICAgICAgICAgIHBhZ2UgPSByZXZpc2lvbi5jcmVhdGUocmV2LCBwYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2hlbkdvdHRlbihuZXdQYWdlKHBhZ2UsIHNpdGUpKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCB0eXBlLCBtc2cpIHtcbiAgICAgICAgdmFyIHRyb3VibGVQYWdlT2JqZWN0O1xuICAgICAgICBpZiAoKHhoci5zdGF0dXMgIT09IDQwNCkgJiYgKHhoci5zdGF0dXMgIT09IDApKSB7XG4gICAgICAgICAgd2lraS5sb2coJ3BhZ2VIYW5kbGVyLmdldCBlcnJvcicsIHhociwgeGhyLnN0YXR1cywgdHlwZSwgbXNnKTtcbiAgICAgICAgICB0cm91YmxlUGFnZU9iamVjdCA9IG5ld1BhZ2Uoe1xuICAgICAgICAgICAgdGl0bGU6IFwiVHJvdWJsZTogQ2FuJ3QgR2V0IFBhZ2VcIlxuICAgICAgICAgIH0sIG51bGwpO1xuICAgICAgICAgIHRyb3VibGVQYWdlT2JqZWN0LmFkZFBhcmFncmFwaChcIlRoZSBwYWdlIGhhbmRsZXIgaGFzIHJ1biBpbnRvIHByb2JsZW1zIHdpdGggdGhpcyAgIHJlcXVlc3QuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIChKU09OLnN0cmluZ2lmeShwYWdlSW5mb3JtYXRpb24pKSArIFwiPC9wcmU+XFxuVGhlIHJlcXVlc3RlZCB1cmwuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIHVybCArIFwiPC9wcmU+XFxuVGhlIHNlcnZlciByZXBvcnRlZCBzdGF0dXMuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIHhoci5zdGF0dXMgKyBcIjwvcHJlPlxcblRoZSBlcnJvciB0eXBlLlxcbjxwcmUgY2xhc3M9ZXJyb3I+XCIgKyB0eXBlICsgXCI8L3ByZT5cXG5UaGUgZXJyb3IgbWVzc2FnZS5cXG48cHJlIGNsYXNzPWVycm9yPlwiICsgbXNnICsgXCI8L3ByZT5cXG5UaGVzZSBwcm9ibGVtcyBhcmUgcmFyZWx5IHNvbHZlZCBieSByZXBvcnRpbmcgaXNzdWVzLlxcblRoZXJlIGNvdWxkIGJlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcmVwb3J0ZWQgaW4gdGhlIGJyb3dzZXIncyBjb25zb2xlLmxvZy5cXG5Nb3JlIGluZm9ybWF0aW9uIG1pZ2h0IGJlIGFjY2Vzc2libGUgYnkgZmV0Y2hpbmcgdGhlIHBhZ2Ugb3V0c2lkZSBvZiB3aWtpLlxcbjxhIGhyZWY9XFxcIlwiICsgdXJsICsgXCJcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj50cnktbm93PC9hPlwiKTtcbiAgICAgICAgICByZXR1cm4gd2hlbkdvdHRlbih0cm91YmxlUGFnZU9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsQ29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY3Vyc2l2ZUdldCh7XG4gICAgICAgICAgICBwYWdlSW5mb3JtYXRpb246IHBhZ2VJbmZvcm1hdGlvbixcbiAgICAgICAgICAgIHdoZW5Hb3R0ZW46IHdoZW5Hb3R0ZW4sXG4gICAgICAgICAgICB3aGVuTm90R290dGVuOiB3aGVuTm90R290dGVuLFxuICAgICAgICAgICAgbG9jYWxDb250ZXh0OiBsb2NhbENvbnRleHRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gd2hlbk5vdEdvdHRlbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcGFnZUhhbmRsZXIuZ2V0ID0gZnVuY3Rpb24oX2FyZykge1xuICAgIHZhciBsb2NhbFBhZ2UsIHBhZ2VJbmZvcm1hdGlvbiwgd2hlbkdvdHRlbiwgd2hlbk5vdEdvdHRlbjtcbiAgICB3aGVuR290dGVuID0gX2FyZy53aGVuR290dGVuLCB3aGVuTm90R290dGVuID0gX2FyZy53aGVuTm90R290dGVuLCBwYWdlSW5mb3JtYXRpb24gPSBfYXJnLnBhZ2VJbmZvcm1hdGlvbjtcbiAgICBpZiAoIXBhZ2VJbmZvcm1hdGlvbi5zaXRlKSB7XG4gICAgICBpZiAobG9jYWxQYWdlID0gcGFnZUZyb21Mb2NhbFN0b3JhZ2UocGFnZUluZm9ybWF0aW9uLnNsdWcpKSB7XG4gICAgICAgIGlmIChwYWdlSW5mb3JtYXRpb24ucmV2KSB7XG4gICAgICAgICAgbG9jYWxQYWdlID0gcmV2aXNpb24uY3JlYXRlKHBhZ2VJbmZvcm1hdGlvbi5yZXYsIGxvY2FsUGFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdoZW5Hb3R0ZW4obmV3UGFnZShsb2NhbFBhZ2UsICdsb2NhbCcpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFwYWdlSGFuZGxlci5jb250ZXh0Lmxlbmd0aCkge1xuICAgICAgcGFnZUhhbmRsZXIuY29udGV4dCA9IFsndmlldyddO1xuICAgIH1cbiAgICByZXR1cm4gcmVjdXJzaXZlR2V0KHtcbiAgICAgIHBhZ2VJbmZvcm1hdGlvbjogcGFnZUluZm9ybWF0aW9uLFxuICAgICAgd2hlbkdvdHRlbjogd2hlbkdvdHRlbixcbiAgICAgIHdoZW5Ob3RHb3R0ZW46IHdoZW5Ob3RHb3R0ZW4sXG4gICAgICBsb2NhbENvbnRleHQ6IF8uY2xvbmUocGFnZUhhbmRsZXIuY29udGV4dClcbiAgICB9KTtcbiAgfTtcblxuICBwYWdlSGFuZGxlci5jb250ZXh0ID0gW107XG5cbiAgcHVzaFRvTG9jYWwgPSBmdW5jdGlvbihwYWdlRWxlbWVudCwgcGFnZVB1dEluZm8sIGFjdGlvbikge1xuICAgIHZhciBwYWdlLCBzaXRlO1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgIHBhZ2UgPSB7XG4gICAgICAgIHRpdGxlOiBhY3Rpb24uaXRlbS50aXRsZSxcbiAgICAgICAgc3Rvcnk6IFtdLFxuICAgICAgICBqb3VybmFsOiBbXVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZSA9IHBhZ2VGcm9tTG9jYWxTdG9yYWdlKHBhZ2VQdXRJbmZvLnNsdWcpO1xuICAgICAgcGFnZSB8fCAocGFnZSA9IHBhZ2VFbGVtZW50LmRhdGEoXCJkYXRhXCIpKTtcbiAgICAgIGlmIChwYWdlLmpvdXJuYWwgPT0gbnVsbCkge1xuICAgICAgICBwYWdlLmpvdXJuYWwgPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmICgoc2l0ZSA9IGFjdGlvblsnZm9yayddKSAhPSBudWxsKSB7XG4gICAgICAgIHBhZ2Uuam91cm5hbCA9IHBhZ2Uuam91cm5hbC5jb25jYXQoe1xuICAgICAgICAgICd0eXBlJzogJ2ZvcmsnLFxuICAgICAgICAgICdzaXRlJzogc2l0ZVxuICAgICAgICB9KTtcbiAgICAgICAgZGVsZXRlIGFjdGlvblsnZm9yayddO1xuICAgICAgfVxuICAgICAgcGFnZS5zdG9yeSA9ICQocGFnZUVsZW1lbnQpLmZpbmQoXCIuaXRlbVwiKS5tYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkKHRoaXMpLmRhdGEoXCJpdGVtXCIpO1xuICAgICAgfSkuZ2V0KCk7XG4gICAgfVxuICAgIHBhZ2Uuam91cm5hbCA9IHBhZ2Uuam91cm5hbC5jb25jYXQoYWN0aW9uKTtcbiAgICBsb2NhbFN0b3JhZ2VbcGFnZVB1dEluZm8uc2x1Z10gPSBKU09OLnN0cmluZ2lmeShwYWdlKTtcbiAgICByZXR1cm4gYWRkVG9Kb3VybmFsKHBhZ2VFbGVtZW50LmZpbmQoJy5qb3VybmFsJyksIGFjdGlvbik7XG4gIH07XG5cbiAgcHVzaFRvU2VydmVyID0gZnVuY3Rpb24ocGFnZUVsZW1lbnQsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgdXJsOiBcIi9wYWdlL1wiICsgcGFnZVB1dEluZm8uc2x1ZyArIFwiL2FjdGlvblwiLFxuICAgICAgZGF0YToge1xuICAgICAgICAnYWN0aW9uJzogSlNPTi5zdHJpbmdpZnkoYWN0aW9uKVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZGRUb0pvdXJuYWwocGFnZUVsZW1lbnQuZmluZCgnLmpvdXJuYWwnKSwgYWN0aW9uKTtcbiAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnZm9yaycpIHtcbiAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0ocGFnZUVsZW1lbnQuYXR0cignaWQnKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCB0eXBlLCBtc2cpIHtcbiAgICAgICAgcmV0dXJuIHdpa2kubG9nKFwicGFnZUhhbmRsZXIucHV0IGFqYXggZXJyb3IgY2FsbGJhY2tcIiwgdHlwZSwgbXNnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBwYWdlSGFuZGxlci5wdXQgPSBmdW5jdGlvbihwYWdlRWxlbWVudCwgYWN0aW9uKSB7XG4gICAgdmFyIGNoZWNrZWRTaXRlLCBmb3JrRnJvbSwgcGFnZVB1dEluZm87XG4gICAgY2hlY2tlZFNpdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzaXRlO1xuICAgICAgc3dpdGNoIChzaXRlID0gcGFnZUVsZW1lbnQuZGF0YSgnc2l0ZScpKSB7XG4gICAgICAgIGNhc2UgJ29yaWdpbic6XG4gICAgICAgIGNhc2UgJ2xvY2FsJzpcbiAgICAgICAgY2FzZSAndmlldyc6XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNhc2UgbG9jYXRpb24uaG9zdDpcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gc2l0ZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHBhZ2VQdXRJbmZvID0ge1xuICAgICAgc2x1ZzogcGFnZUVsZW1lbnQuYXR0cignaWQnKS5zcGxpdCgnX3JldicpWzBdLFxuICAgICAgcmV2OiBwYWdlRWxlbWVudC5hdHRyKCdpZCcpLnNwbGl0KCdfcmV2JylbMV0sXG4gICAgICBzaXRlOiBjaGVja2VkU2l0ZSgpLFxuICAgICAgbG9jYWw6IHBhZ2VFbGVtZW50Lmhhc0NsYXNzKCdsb2NhbCcpXG4gICAgfTtcbiAgICBmb3JrRnJvbSA9IHBhZ2VQdXRJbmZvLnNpdGU7XG4gICAgd2lraS5sb2coJ3BhZ2VIYW5kbGVyLnB1dCcsIGFjdGlvbiwgcGFnZVB1dEluZm8pO1xuICAgIGlmICh3aWtpLnVzZUxvY2FsU3RvcmFnZSgpKSB7XG4gICAgICBpZiAocGFnZVB1dEluZm8uc2l0ZSAhPSBudWxsKSB7XG4gICAgICAgIHdpa2kubG9nKCdyZW1vdGUgPT4gbG9jYWwnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXBhZ2VQdXRJbmZvLmxvY2FsKSB7XG4gICAgICAgIHdpa2kubG9nKCdvcmlnaW4gPT4gbG9jYWwnKTtcbiAgICAgICAgYWN0aW9uLnNpdGUgPSBmb3JrRnJvbSA9IGxvY2F0aW9uLmhvc3Q7XG4gICAgICB9XG4gICAgfVxuICAgIGFjdGlvbi5kYXRlID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICBpZiAoYWN0aW9uLnNpdGUgPT09ICdvcmlnaW4nKSB7XG4gICAgICBkZWxldGUgYWN0aW9uLnNpdGU7XG4gICAgfVxuICAgIGlmIChmb3JrRnJvbSkge1xuICAgICAgcGFnZUVsZW1lbnQuZmluZCgnaDEgaW1nJykuYXR0cignc3JjJywgJy9mYXZpY29uLnBuZycpO1xuICAgICAgcGFnZUVsZW1lbnQuZmluZCgnaDEgYScpLmF0dHIoJ2hyZWYnLCAnLycpO1xuICAgICAgcGFnZUVsZW1lbnQuZGF0YSgnc2l0ZScsIG51bGwpO1xuICAgICAgcGFnZUVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3JlbW90ZScpO1xuICAgICAgc3RhdGUuc2V0VXJsKCk7XG4gICAgICBpZiAoYWN0aW9uLnR5cGUgIT09ICdmb3JrJykge1xuICAgICAgICBhY3Rpb24uZm9yayA9IGZvcmtGcm9tO1xuICAgICAgICBhZGRUb0pvdXJuYWwocGFnZUVsZW1lbnQuZmluZCgnLmpvdXJuYWwnKSwge1xuICAgICAgICAgIHR5cGU6ICdmb3JrJyxcbiAgICAgICAgICBzaXRlOiBmb3JrRnJvbSxcbiAgICAgICAgICBkYXRlOiBhY3Rpb24uZGF0ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdpa2kudXNlTG9jYWxTdG9yYWdlKCkgfHwgcGFnZVB1dEluZm8uc2l0ZSA9PT0gJ2xvY2FsJykge1xuICAgICAgcHVzaFRvTG9jYWwocGFnZUVsZW1lbnQsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pO1xuICAgICAgcmV0dXJuIHBhZ2VFbGVtZW50LmFkZENsYXNzKFwibG9jYWxcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwdXNoVG9TZXJ2ZXIocGFnZUVsZW1lbnQsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pO1xuICAgIH1cbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBhZ2VIYW5kbGVyLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3duZXIpIHtcbiAgICB2YXIgZmFpbHVyZURsZztcbiAgICAkKFwiI3VzZXItZW1haWxcIikuaGlkZSgpO1xuICAgICQoXCIjcGVyc29uYS1sb2dpbi1idG5cIikuaGlkZSgpO1xuICAgICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLmhpZGUoKTtcbiAgICBmYWlsdXJlRGxnID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgcmV0dXJuICQoXCI8ZGl2PjwvZGl2PlwiKS5kaWFsb2coe1xuICAgICAgICBvcGVuOiBmdW5jdGlvbihldmVudCwgdWkpIHtcbiAgICAgICAgICByZXR1cm4gJChcIi51aS1kaWFsb2ctdGl0bGViYXItY2xvc2VcIikuaGlkZSgpO1xuICAgICAgICB9LFxuICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgXCJPa1wiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhpcykuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmlkLmxvZ291dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9LFxuICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICB0aXRsZTogXCJMb2dpbiBGYWlsdXJlXCIsXG4gICAgICAgIG1vZGFsOiB0cnVlXG4gICAgICB9KS5odG1sKG1lc3NhZ2UpO1xuICAgIH07XG4gICAgbmF2aWdhdG9yLmlkLndhdGNoKHtcbiAgICAgIGxvZ2dlZEluVXNlcjogb3duZXIsXG4gICAgICBvbmxvZ2luOiBmdW5jdGlvbihhc3NlcnRpb24pIHtcbiAgICAgICAgcmV0dXJuICQucG9zdChcIi9wZXJzb25hX2xvZ2luXCIsIHtcbiAgICAgICAgICBhc3NlcnRpb246IGFzc2VydGlvblxuICAgICAgICB9LCBmdW5jdGlvbih2ZXJpZmllZCkge1xuICAgICAgICAgIHZhciBmYWlsdXJlTXNnO1xuICAgICAgICAgIHZlcmlmaWVkID0gSlNPTi5wYXJzZSh2ZXJpZmllZCk7XG4gICAgICAgICAgaWYgKFwib2theVwiID09PSB2ZXJpZmllZC5zdGF0dXMpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24gPSBcIi9cIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKFwid3JvbmctYWRkcmVzc1wiID09PSB2ZXJpZmllZC5zdGF0dXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWlsdXJlRGxnKFwiPHA+U2lnbiBpbiBpcyBjdXJyZW50bHkgb25seSBhdmFpbGFibGUgZm9yIHRoZSBzaXRlIG93bmVyLjwvcD5cIik7XG4gICAgICAgICAgfSBlbHNlIGlmIChcImZhaWx1cmVcIiA9PT0gdmVyaWZpZWQuc3RhdHVzKSB7XG4gICAgICAgICAgICBpZiAoL2RvbWFpbiBtaXNtYXRjaC8udGVzdCh2ZXJpZmllZC5yZWFzb24pKSB7XG4gICAgICAgICAgICAgIGZhaWx1cmVNc2cgPSBcIjxwPkl0IGxvb2tzIGFzIGlmIHlvdSBhcmUgYWNjZXNzaW5nIHRoZSBzaXRlIHVzaW5nIGFuIGFsdGVybmF0aXZlIGFkZHJlc3MuPC9wPlwiICsgXCI8cD5QbGVhc2UgY2hlY2sgdGhhdCB5b3UgYXJlIHVzaW5nIHRoZSBjb3JyZWN0IGFkZHJlc3MgdG8gYWNjZXNzIHRoaXMgc2l0ZS48L3A+XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmYWlsdXJlTXNnID0gXCI8cD5VbmFibGUgdG8gbG9nIHlvdSBpbi48L3A+XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFpbHVyZURsZyhmYWlsdXJlTXNnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5pZC5sb2dvdXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9ubG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQucG9zdChcIi9wZXJzb25hX2xvZ291dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uID0gXCIvXCI7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9ucmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAob3duZXIpIHtcbiAgICAgICAgICAkKFwiI3BlcnNvbmEtbG9naW4tYnRuXCIpLmhpZGUoKTtcbiAgICAgICAgICByZXR1cm4gJChcIiNwZXJzb25hLWxvZ291dC1idG5cIikuc2hvdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoXCIjcGVyc29uYS1sb2dpbi1idG5cIikuc2hvdygpO1xuICAgICAgICAgIHJldHVybiAkKFwiI3BlcnNvbmEtbG9nb3V0LWJ0blwiKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAkKFwiI3BlcnNvbmEtbG9naW4tYnRuXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBuYXZpZ2F0b3IuaWQucmVxdWVzdCh7fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBuYXZpZ2F0b3IuaWQubG9nb3V0KCk7XG4gICAgfSk7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1wZXJzb25hLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBjYWNoZWRTY3JpcHQsIGdldFNjcmlwdCwgcGx1Z2luLCBzY3JpcHRzLCB1dGlsLCB3aWtpLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuICB3aWtpID0gcmVxdWlyZSgnLi93aWtpJyk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBwbHVnaW4gPSB7fTtcblxuICBjYWNoZWRTY3JpcHQgPSBmdW5jdGlvbih1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucyB8fCB7fSwge1xuICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXG4gICAgICBjYWNoZTogdHJ1ZSxcbiAgICAgIHVybDogdXJsXG4gICAgfSk7XG4gICAgcmV0dXJuICQuYWpheChvcHRpb25zKTtcbiAgfTtcblxuICBzY3JpcHRzID0gW107XG5cbiAgZ2V0U2NyaXB0ID0gd2lraS5nZXRTY3JpcHQgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gICAgaWYgKF9faW5kZXhPZi5jYWxsKHNjcmlwdHMsIHVybCkgPj0gMCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWNoZWRTY3JpcHQodXJsKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzY3JpcHRzLnB1c2godXJsKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBwbHVnaW4uZ2V0ID0gd2lraS5nZXRQbHVnaW4gPSBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICh3aW5kb3cucGx1Z2luc1tuYW1lXSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHdpbmRvdy5wbHVnaW5zW25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIGdldFNjcmlwdChcIi9wbHVnaW5zL1wiICsgbmFtZSArIFwiL1wiICsgbmFtZSArIFwiLmpzXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHdpbmRvdy5wbHVnaW5zW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh3aW5kb3cucGx1Z2luc1tuYW1lXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZ2V0U2NyaXB0KFwiL3BsdWdpbnMvXCIgKyBuYW1lICsgXCIuanNcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh3aW5kb3cucGx1Z2luc1tuYW1lXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBwbHVnaW5bXCJkb1wiXSA9IHdpa2kuZG9QbHVnaW4gPSBmdW5jdGlvbihkaXYsIGl0ZW0sIGRvbmUpIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGRvbmUgPT0gbnVsbCkge1xuICAgICAgZG9uZSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICAgIGVycm9yID0gZnVuY3Rpb24oZXgpIHtcbiAgICAgIHZhciBlcnJvckVsZW1lbnQ7XG4gICAgICBlcnJvckVsZW1lbnQgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcygnZXJyb3InKTtcbiAgICAgIGVycm9yRWxlbWVudC50ZXh0KGV4LnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuIGRpdi5hcHBlbmQoZXJyb3JFbGVtZW50KTtcbiAgICB9O1xuICAgIGRpdi5kYXRhKCdwYWdlRWxlbWVudCcsIGRpdi5wYXJlbnRzKFwiLnBhZ2VcIikpO1xuICAgIGRpdi5kYXRhKCdpdGVtJywgaXRlbSk7XG4gICAgcmV0dXJuIHBsdWdpbi5nZXQoaXRlbS50eXBlLCBmdW5jdGlvbihzY3JpcHQpIHtcbiAgICAgIHZhciBlcnI7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoc2NyaXB0ID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBmaW5kIHBsdWdpbiBmb3IgJ1wiICsgaXRlbS50eXBlICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY3JpcHQuZW1pdC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgcmV0dXJuIHNjcmlwdC5lbWl0KGRpdiwgaXRlbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzY3JpcHQuYmluZChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY3JpcHQuZW1pdChkaXYsIGl0ZW0pO1xuICAgICAgICAgIHNjcmlwdC5iaW5kKGRpdiwgaXRlbSk7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGVyciA9IF9lcnJvcjtcbiAgICAgICAgd2lraS5sb2coJ3BsdWdpbiBlcnJvcicsIGVycik7XG4gICAgICAgIGVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgd2lraS5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uKHBsdWdpbk5hbWUsIHBsdWdpbkZuKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5wbHVnaW5zW3BsdWdpbk5hbWVdID0gcGx1Z2luRm4oJCk7XG4gIH07XG5cbiAgd2luZG93LnBsdWdpbnMgPSB7XG4gICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3JlZmVyZW5jZScpLFxuICAgIGZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeScpLFxuICAgIHBhcmFncmFwaDoge1xuICAgICAgZW1pdDogZnVuY3Rpb24oZGl2LCBpdGVtKSB7XG4gICAgICAgIHZhciB0ZXh0LCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZWYgPSBpdGVtLnRleHQuc3BsaXQoL1xcblxcbisvKTtcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgdGV4dCA9IF9yZWZbX2ldO1xuICAgICAgICAgIGlmICh0ZXh0Lm1hdGNoKC9cXFMvKSkge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChkaXYuYXBwZW5kKFwiPHA+XCIgKyAod2lraS5yZXNvbHZlTGlua3ModGV4dCkpICsgXCI8L3A+XCIpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9LFxuICAgICAgYmluZDogZnVuY3Rpb24oZGl2LCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBkaXYuZGJsY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHdpa2kudGV4dEVkaXRvcihkaXYsIGl0ZW0sIG51bGwsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGltYWdlOiB7XG4gICAgICBlbWl0OiBmdW5jdGlvbihkaXYsIGl0ZW0pIHtcbiAgICAgICAgaXRlbS50ZXh0IHx8IChpdGVtLnRleHQgPSBpdGVtLmNhcHRpb24pO1xuICAgICAgICByZXR1cm4gZGl2LmFwcGVuZChcIjxpbWcgY2xhc3M9dGh1bWJuYWlsIHNyYz1cXFwiXCIgKyBpdGVtLnVybCArIFwiXFxcIj4gPHA+XCIgKyAod2lraS5yZXNvbHZlTGlua3MoaXRlbS50ZXh0KSkgKyBcIjwvcD5cIik7XG4gICAgICB9LFxuICAgICAgYmluZDogZnVuY3Rpb24oZGl2LCBpdGVtKSB7XG4gICAgICAgIGRpdi5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2lraS50ZXh0RWRpdG9yKGRpdiwgaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGl2LmZpbmQoJ2ltZycpLmRibGNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB3aWtpLmRpYWxvZyhpdGVtLnRleHQsIHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZ1dHVyZToge1xuICAgICAgZW1pdDogZnVuY3Rpb24oZGl2LCBpdGVtKSB7XG4gICAgICAgIHZhciBpbmZvLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgIGRpdi5hcHBlbmQoXCJcIiArIGl0ZW0udGV4dCArIFwiPGJyPjxicj48YnV0dG9uIGNsYXNzPVxcXCJjcmVhdGVcXFwiPmNyZWF0ZTwvYnV0dG9uPiBuZXcgYmxhbmsgcGFnZVwiKTtcbiAgICAgICAgaWYgKCgoaW5mbyA9IHdpa2kubmVpZ2hib3Job29kW2xvY2F0aW9uLmhvc3RdKSAhPSBudWxsKSAmJiAoaW5mby5zaXRlbWFwICE9IG51bGwpKSB7XG4gICAgICAgICAgX3JlZiA9IGluZm8uc2l0ZW1hcDtcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgaXRlbSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgaWYgKGl0ZW0uc2x1Zy5tYXRjaCgvLXRlbXBsYXRlJC8pKSB7XG4gICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goZGl2LmFwcGVuZChcIjxicj48YnV0dG9uIGNsYXNzPVxcXCJjcmVhdGVcXFwiIGRhdGEtc2x1Zz1cIiArIGl0ZW0uc2x1ZyArIFwiPmNyZWF0ZTwvYnV0dG9uPiBmcm9tIFwiICsgKHdpa2kucmVzb2x2ZUxpbmtzKFwiW1tcIiArIGl0ZW0udGl0bGUgKyBcIl1dXCIpKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiaW5kOiBmdW5jdGlvbihkaXYsIGl0ZW0pIHt9XG4gICAgfVxuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9cGx1Z2luLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBiaW5kLCBlbWl0O1xuXG4gIGVtaXQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICAgIHZhciBzaXRlLCBzbHVnO1xuICAgIHNsdWcgPSBpdGVtLnNsdWcgfHwgJ3dlbGNvbWUtdmlzaXRvcnMnO1xuICAgIHNpdGUgPSBpdGVtLnNpdGU7XG4gICAgcmV0dXJuIHdpa2kucmVzb2x2ZUZyb20oc2l0ZSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGl0ZW0uYXBwZW5kKFwiPHAgc3R5bGU9J21hcmdpbi1ib3R0b206M3B4Oyc+XFxuICA8aW1nIGNsYXNzPSdyZW1vdGUnXFxuICAgIHNyYz0nLy9cIiArIHNpdGUgKyBcIi9mYXZpY29uLnBuZydcXG4gICAgdGl0bGU9J1wiICsgc2l0ZSArIFwiJ1xcbiAgICBkYXRhLXNpdGU9XFxcIlwiICsgc2l0ZSArIFwiXFxcIlxcbiAgICBkYXRhLXNsdWc9XFxcIlwiICsgc2x1ZyArIFwiXFxcIlxcbiAgPlxcbiAgXCIgKyAod2lraS5yZXNvbHZlTGlua3MoXCJbW1wiICsgKGl0ZW0udGl0bGUgfHwgc2x1ZykgKyBcIl1dXCIpKSArIFwiXFxuPC9wPlxcbjxkaXY+XFxuICBcIiArICh3aWtpLnJlc29sdmVMaW5rcyhpdGVtLnRleHQpKSArIFwiXFxuPC9kaXY+XCIpO1xuICAgIH0pO1xuICB9O1xuXG4gIGJpbmQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICAgIHJldHVybiAkaXRlbS5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB3aWtpLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0pO1xuICAgIH0pO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGVtaXQ6IGVtaXQsXG4gICAgYmluZDogYmluZFxuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9cmVmZXJlbmNlLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhZGRUb0pvdXJuYWwsIGNyZWF0ZUZhY3RvcnksIGNyZWF0ZU1pc3NpbmdGbGFnLCBlbWl0Q29udHJvbHMsIGVtaXRGb290ZXIsIGVtaXRIZWFkZXIsIGVtaXRUaW1lc3RhbXAsIGVtaXRUd2lucywgaGFuZGxlRHJhZ2dpbmcsIGluaXRBZGRCdXR0b24sIGluaXREcmFnZ2luZywgbmVpZ2hib3Job29kLCBwYWdlSGFuZGxlciwgcGx1Z2luLCByZWZyZXNoLCByZW5kZXJQYWdlSW50b1BhZ2VFbGVtZW50LCBzdGF0ZSwgdXRpbCwgd2lraSwgXztcblxuICBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuICBwYWdlSGFuZGxlciA9IHJlcXVpcmUoJy4vcGFnZUhhbmRsZXInKTtcblxuICBwbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpO1xuXG4gIHN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG4gIG5laWdoYm9yaG9vZCA9IHJlcXVpcmUoJy4vbmVpZ2hib3Job29kJyk7XG5cbiAgYWRkVG9Kb3VybmFsID0gcmVxdWlyZSgnLi9hZGRUb0pvdXJuYWwnKTtcblxuICB3aWtpID0gcmVxdWlyZSgnLi93aWtpJyk7XG5cbiAgaGFuZGxlRHJhZ2dpbmcgPSBmdW5jdGlvbihldnQsIHVpKSB7XG4gICAgdmFyICRiZWZvcmUsICRkZXN0aW5hdGlvblBhZ2UsICRpdGVtLCAkc291cmNlUGFnZSwgJHRoaXNQYWdlLCBhY3Rpb24sIGJlZm9yZSwgZXF1YWxzLCBpdGVtLCBtb3ZlRnJvbVBhZ2UsIG1vdmVUb1BhZ2UsIG1vdmVXaXRoaW5QYWdlLCBvcmRlciwgc291cmNlU2l0ZTtcbiAgICAkaXRlbSA9IHVpLml0ZW07XG4gICAgaXRlbSA9IHdpa2kuZ2V0SXRlbSgkaXRlbSk7XG4gICAgJHRoaXNQYWdlID0gJCh0aGlzKS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgICRzb3VyY2VQYWdlID0gJGl0ZW0uZGF0YSgncGFnZUVsZW1lbnQnKTtcbiAgICBzb3VyY2VTaXRlID0gJHNvdXJjZVBhZ2UuZGF0YSgnc2l0ZScpO1xuICAgICRkZXN0aW5hdGlvblBhZ2UgPSAkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgIGVxdWFscyA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhICYmIGIgJiYgYS5nZXQoMCkgPT09IGIuZ2V0KDApO1xuICAgIH07XG4gICAgbW92ZVdpdGhpblBhZ2UgPSAhJHNvdXJjZVBhZ2UgfHwgZXF1YWxzKCRzb3VyY2VQYWdlLCAkZGVzdGluYXRpb25QYWdlKTtcbiAgICBtb3ZlRnJvbVBhZ2UgPSAhbW92ZVdpdGhpblBhZ2UgJiYgZXF1YWxzKCR0aGlzUGFnZSwgJHNvdXJjZVBhZ2UpO1xuICAgIG1vdmVUb1BhZ2UgPSAhbW92ZVdpdGhpblBhZ2UgJiYgZXF1YWxzKCR0aGlzUGFnZSwgJGRlc3RpbmF0aW9uUGFnZSk7XG4gICAgaWYgKG1vdmVGcm9tUGFnZSkge1xuICAgICAgaWYgKCRzb3VyY2VQYWdlLmhhc0NsYXNzKCdnaG9zdCcpIHx8ICRzb3VyY2VQYWdlLmF0dHIoJ2lkJykgPT09ICRkZXN0aW5hdGlvblBhZ2UuYXR0cignaWQnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGFjdGlvbiA9IG1vdmVXaXRoaW5QYWdlID8gKG9yZGVyID0gJCh0aGlzKS5jaGlsZHJlbigpLm1hcChmdW5jdGlvbihfLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuICQodmFsdWUpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgICB9KS5nZXQoKSwge1xuICAgICAgdHlwZTogJ21vdmUnLFxuICAgICAgb3JkZXI6IG9yZGVyXG4gICAgfSkgOiBtb3ZlRnJvbVBhZ2UgPyAod2lraS5sb2coJ2RyYWcgZnJvbScsICRzb3VyY2VQYWdlLmZpbmQoJ2gxJykudGV4dCgpKSwge1xuICAgICAgdHlwZTogJ3JlbW92ZSdcbiAgICB9KSA6IG1vdmVUb1BhZ2UgPyAoJGl0ZW0uZGF0YSgncGFnZUVsZW1lbnQnLCAkdGhpc1BhZ2UpLCAkYmVmb3JlID0gJGl0ZW0ucHJldignLml0ZW0nKSwgYmVmb3JlID0gd2lraS5nZXRJdGVtKCRiZWZvcmUpLCB7XG4gICAgICB0eXBlOiAnYWRkJyxcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBhZnRlcjogYmVmb3JlICE9IG51bGwgPyBiZWZvcmUuaWQgOiB2b2lkIDBcbiAgICB9KSA6IHZvaWQgMDtcbiAgICBhY3Rpb24uaWQgPSBpdGVtLmlkO1xuICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHRoaXNQYWdlLCBhY3Rpb24pO1xuICB9O1xuXG4gIGluaXREcmFnZ2luZyA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gICAgdmFyICRzdG9yeSwgb3B0aW9ucztcbiAgICBvcHRpb25zID0ge1xuICAgICAgY29ubmVjdFdpdGg6ICcucGFnZSAuc3RvcnknLFxuICAgICAgcGxhY2Vob2xkZXI6ICdpdGVtLXBsYWNlaG9sZGVyJyxcbiAgICAgIGZvcmNlUGxhY2Vob2xkZXJTaXplOiB0cnVlXG4gICAgfTtcbiAgICAkc3RvcnkgPSAkcGFnZS5maW5kKCcuc3RvcnknKTtcbiAgICByZXR1cm4gJHN0b3J5LnNvcnRhYmxlKG9wdGlvbnMpLm9uKCdzb3J0dXBkYXRlJywgaGFuZGxlRHJhZ2dpbmcpO1xuICB9O1xuXG4gIGluaXRBZGRCdXR0b24gPSBmdW5jdGlvbigkcGFnZSkge1xuICAgIHJldHVybiAkcGFnZS5maW5kKFwiLmFkZC1mYWN0b3J5XCIpLmxpdmUoXCJjbGlja1wiLCBmdW5jdGlvbihldnQpIHtcbiAgICAgIGlmICgkcGFnZS5oYXNDbGFzcygnZ2hvc3QnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBjcmVhdGVGYWN0b3J5KCRwYWdlKTtcbiAgICB9KTtcbiAgfTtcblxuICBjcmVhdGVGYWN0b3J5ID0gZnVuY3Rpb24oJHBhZ2UpIHtcbiAgICB2YXIgJGJlZm9yZSwgJGl0ZW0sIGJlZm9yZSwgaXRlbTtcbiAgICBpdGVtID0ge1xuICAgICAgdHlwZTogXCJmYWN0b3J5XCIsXG4gICAgICBpZDogdXRpbC5yYW5kb21CeXRlcyg4KVxuICAgIH07XG4gICAgJGl0ZW0gPSAkKFwiPGRpdiAvPlwiLCB7XG4gICAgICBcImNsYXNzXCI6IFwiaXRlbSBmYWN0b3J5XCJcbiAgICB9KS5kYXRhKCdpdGVtJywgaXRlbSkuYXR0cignZGF0YS1pZCcsIGl0ZW0uaWQpO1xuICAgICRpdGVtLmRhdGEoJ3BhZ2VFbGVtZW50JywgJHBhZ2UpO1xuICAgICRwYWdlLmZpbmQoXCIuc3RvcnlcIikuYXBwZW5kKCRpdGVtKTtcbiAgICBwbHVnaW5bXCJkb1wiXSgkaXRlbSwgaXRlbSk7XG4gICAgJGJlZm9yZSA9ICRpdGVtLnByZXYoJy5pdGVtJyk7XG4gICAgYmVmb3JlID0gd2lraS5nZXRJdGVtKCRiZWZvcmUpO1xuICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBpZDogaXRlbS5pZCxcbiAgICAgIHR5cGU6IFwiYWRkXCIsXG4gICAgICBhZnRlcjogYmVmb3JlICE9IG51bGwgPyBiZWZvcmUuaWQgOiB2b2lkIDBcbiAgICB9KTtcbiAgfTtcblxuICBlbWl0SGVhZGVyID0gZnVuY3Rpb24oJGhlYWRlciwgJHBhZ2UsIHBhZ2VPYmplY3QpIHtcbiAgICB2YXIgYWJzb2x1dGUsIHRvb2x0aXAsIHZpZXdIZXJlO1xuICAgIHZpZXdIZXJlID0gcGFnZU9iamVjdC5nZXRTbHVnKCkgPT09ICd3ZWxjb21lLXZpc2l0b3JzJyA/IFwiXCIgOiBcIi92aWV3L1wiICsgKHBhZ2VPYmplY3QuZ2V0U2x1ZygpKTtcbiAgICBhYnNvbHV0ZSA9IHBhZ2VPYmplY3QuaXNSZW1vdGUoKSA/IFwiLy9cIiArIChwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGUoKSkgOiBcIlwiO1xuICAgIHRvb2x0aXAgPSBwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGUobG9jYXRpb24uaG9zdCk7XG4gICAgaWYgKHBhZ2VPYmplY3QuaXNQbHVnaW4oKSkge1xuICAgICAgdG9vbHRpcCArPSBcIlxcblwiICsgKHBhZ2VPYmplY3QuZ2V0UmF3UGFnZSgpLnBsdWdpbikgKyBcIiBwbHVnaW5cIjtcbiAgICB9XG4gICAgcmV0dXJuICRoZWFkZXIuYXBwZW5kKFwiPGgxIHRpdGxlPVxcXCJcIiArIHRvb2x0aXAgKyBcIlxcXCI+XFxuICA8YSBocmVmPVxcXCJcIiArIGFic29sdXRlICsgXCIvdmlldy93ZWxjb21lLXZpc2l0b3JzXCIgKyB2aWV3SGVyZSArIFwiXFxcIj5cXG4gICAgPGltZyBzcmM9XFxcIlwiICsgYWJzb2x1dGUgKyBcIi9mYXZpY29uLnBuZ1xcXCIgaGVpZ2h0PVxcXCIzMnB4XFxcIiBjbGFzcz1cXFwiZmF2aWNvblxcXCI+XFxuICA8L2E+IFwiICsgKHBhZ2VPYmplY3QuZ2V0VGl0bGUoKSkgKyBcIlxcbjwvaDE+XCIpO1xuICB9O1xuXG4gIGVtaXRUaW1lc3RhbXAgPSBmdW5jdGlvbigkaGVhZGVyLCAkcGFnZSwgcGFnZU9iamVjdCkge1xuICAgIHZhciBkYXRlLCBwYWdlLCByZXY7XG4gICAgaWYgKCRwYWdlLmF0dHIoJ2lkJykubWF0Y2goL19yZXYvKSkge1xuICAgICAgcGFnZSA9IHBhZ2VPYmplY3QuZ2V0UmF3UGFnZSgpO1xuICAgICAgcmV2ID0gcGFnZS5qb3VybmFsLmxlbmd0aCAtIDE7XG4gICAgICBkYXRlID0gcGFnZS5qb3VybmFsW3Jldl0uZGF0ZTtcbiAgICAgICRwYWdlLmFkZENsYXNzKCdnaG9zdCcpLmRhdGEoJ3JldicsIHJldik7XG4gICAgICByZXR1cm4gJGhlYWRlci5hcHBlbmQoJChcIjxoMiBjbGFzcz1cXFwicmV2aXNpb25cXFwiPlxcbiAgPHNwYW4+XFxuICAgIFwiICsgKGRhdGUgIT0gbnVsbCA/IHV0aWwuZm9ybWF0RGF0ZShkYXRlKSA6IFwiUmV2aXNpb24gXCIgKyByZXYpICsgXCJcXG4gIDwvc3Bhbj5cXG48L2gyPlwiKSk7XG4gICAgfVxuICB9O1xuXG4gIGVtaXRDb250cm9scyA9IGZ1bmN0aW9uKCRqb3VybmFsKSB7XG4gICAgcmV0dXJuICRqb3VybmFsLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcImNvbnRyb2wtYnV0dG9uc1xcXCI+XFxuICA8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiYnV0dG9uIGZvcmstcGFnZVxcXCIgdGl0bGU9XFxcImZvcmsgdGhpcyBwYWdlXFxcIj5cIiArIHV0aWwuc3ltYm9sc1snZm9yayddICsgXCI8L2E+XFxuICA8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiYnV0dG9uIGFkZC1mYWN0b3J5XFxcIiB0aXRsZT1cXFwiYWRkIHBhcmFncmFwaFxcXCI+XCIgKyB1dGlsLnN5bWJvbHNbJ2FkZCddICsgXCI8L2E+XFxuPC9kaXY+XCIpO1xuICB9O1xuXG4gIGVtaXRGb290ZXIgPSBmdW5jdGlvbigkZm9vdGVyLCBwYWdlT2JqZWN0KSB7XG4gICAgdmFyIGhvc3QsIHNsdWc7XG4gICAgaG9zdCA9IHBhZ2VPYmplY3QuZ2V0UmVtb3RlU2l0ZShsb2NhdGlvbi5ob3N0KTtcbiAgICBzbHVnID0gcGFnZU9iamVjdC5nZXRTbHVnKCk7XG4gICAgcmV0dXJuICRmb290ZXIuYXBwZW5kKFwiPGEgaWQ9XFxcImxpY2Vuc2VcXFwiIGhyZWY9XFxcImh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzMuMC9cXFwiPkNDIEJZLVNBIDMuMDwvYT4gLlxcbjxhIGNsYXNzPVxcXCJzaG93LXBhZ2Utc291cmNlXFxcIiBocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuanNvbj9yYW5kb209XCIgKyAodXRpbC5yYW5kb21CeXRlcyg0KSkgKyBcIlxcXCIgdGl0bGU9XFxcInNvdXJjZVxcXCI+SlNPTjwvYT4gLlxcbjxhIGhyZWY9IFxcXCIvL1wiICsgaG9zdCArIFwiL1wiICsgc2x1ZyArIFwiLmh0bWxcXFwiPlwiICsgaG9zdCArIFwiPC9hPlwiKTtcbiAgfTtcblxuICBlbWl0VHdpbnMgPSB3aWtpLmVtaXRUd2lucyA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gICAgdmFyIGFjdGlvbnMsIGJpbiwgYmlucywgZmxhZ3MsIGksIGluZm8sIGl0ZW0sIGxlZ2VuZCwgcGFnZSwgcmVtb3RlU2l0ZSwgc2l0ZSwgc2x1ZywgdHdpbnMsIHZpZXdpbmcsIF9pLCBfbGVuLCBfcmVmLCBfcmVmMSwgX3JlZjIsIF9yZWYzO1xuICAgIHBhZ2UgPSAkcGFnZS5kYXRhKCdkYXRhJyk7XG4gICAgc2l0ZSA9ICRwYWdlLmRhdGEoJ3NpdGUnKSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdDtcbiAgICBpZiAoc2l0ZSA9PT0gJ3ZpZXcnIHx8IHNpdGUgPT09ICdvcmlnaW4nKSB7XG4gICAgICBzaXRlID0gd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgfVxuICAgIHNsdWcgPSB3aWtpLmFzU2x1ZyhwYWdlLnRpdGxlKTtcbiAgICBpZiAoKChhY3Rpb25zID0gKF9yZWYgPSBwYWdlLmpvdXJuYWwpICE9IG51bGwgPyBfcmVmLmxlbmd0aCA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgKCh2aWV3aW5nID0gKF9yZWYxID0gcGFnZS5qb3VybmFsW2FjdGlvbnMgLSAxXSkgIT0gbnVsbCA/IF9yZWYxLmRhdGUgOiB2b2lkIDApICE9IG51bGwpKSB7XG4gICAgICB2aWV3aW5nID0gTWF0aC5mbG9vcih2aWV3aW5nIC8gMTAwMCkgKiAxMDAwO1xuICAgICAgYmlucyA9IHtcbiAgICAgICAgbmV3ZXI6IFtdLFxuICAgICAgICBzYW1lOiBbXSxcbiAgICAgICAgb2xkZXI6IFtdXG4gICAgICB9O1xuICAgICAgX3JlZjIgPSB3aWtpLm5laWdoYm9yaG9vZDtcbiAgICAgIGZvciAocmVtb3RlU2l0ZSBpbiBfcmVmMikge1xuICAgICAgICBpbmZvID0gX3JlZjJbcmVtb3RlU2l0ZV07XG4gICAgICAgIGlmIChyZW1vdGVTaXRlICE9PSBzaXRlICYmIChpbmZvLnNpdGVtYXAgIT0gbnVsbCkpIHtcbiAgICAgICAgICBfcmVmMyA9IGluZm8uc2l0ZW1hcDtcbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtID0gX3JlZjNbX2ldO1xuICAgICAgICAgICAgaWYgKGl0ZW0uc2x1ZyA9PT0gc2x1Zykge1xuICAgICAgICAgICAgICBiaW4gPSBpdGVtLmRhdGUgPiB2aWV3aW5nID8gYmlucy5uZXdlciA6IGl0ZW0uZGF0ZSA8IHZpZXdpbmcgPyBiaW5zLm9sZGVyIDogYmlucy5zYW1lO1xuICAgICAgICAgICAgICBiaW4ucHVzaCh7XG4gICAgICAgICAgICAgICAgcmVtb3RlU2l0ZTogcmVtb3RlU2l0ZSxcbiAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdHdpbnMgPSBbXTtcbiAgICAgIGZvciAobGVnZW5kIGluIGJpbnMpIHtcbiAgICAgICAgYmluID0gYmluc1tsZWdlbmRdO1xuICAgICAgICBpZiAoIWJpbi5sZW5ndGgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBiaW4uc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuaXRlbS5kYXRlIDwgYi5pdGVtLmRhdGU7XG4gICAgICAgIH0pO1xuICAgICAgICBmbGFncyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2osIF9sZW4xLCBfcmVmNCwgX3Jlc3VsdHM7XG4gICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSBfaiA9IDAsIF9sZW4xID0gYmluLmxlbmd0aDsgX2ogPCBfbGVuMTsgaSA9ICsrX2opIHtcbiAgICAgICAgICAgIF9yZWY0ID0gYmluW2ldLCByZW1vdGVTaXRlID0gX3JlZjQucmVtb3RlU2l0ZSwgaXRlbSA9IF9yZWY0Lml0ZW07XG4gICAgICAgICAgICBpZiAoaSA+PSA4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChcIjxpbWcgY2xhc3M9XFxcInJlbW90ZVxcXCJcXG5zcmM9XFxcImh0dHA6Ly9cIiArIHJlbW90ZVNpdGUgKyBcIi9mYXZpY29uLnBuZ1xcXCJcXG5kYXRhLXNsdWc9XFxcIlwiICsgc2x1ZyArIFwiXFxcIlxcbmRhdGEtc2l0ZT1cXFwiXCIgKyByZW1vdGVTaXRlICsgXCJcXFwiXFxudGl0bGU9XFxcIlwiICsgcmVtb3RlU2l0ZSArIFwiXFxcIj5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfSkoKTtcbiAgICAgICAgdHdpbnMucHVzaChcIlwiICsgKGZsYWdzLmpvaW4oJyZuYnNwOycpKSArIFwiIFwiICsgbGVnZW5kKTtcbiAgICAgIH1cbiAgICAgIGlmICh0d2lucykge1xuICAgICAgICByZXR1cm4gJHBhZ2UuZmluZCgnLnR3aW5zJykuaHRtbChcIjxwPlwiICsgKHR3aW5zLmpvaW4oXCIsIFwiKSkgKyBcIjwvcD5cIik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlclBhZ2VJbnRvUGFnZUVsZW1lbnQgPSBmdW5jdGlvbihwYWdlT2JqZWN0LCAkcGFnZSkge1xuICAgIHZhciAkZm9vdGVyLCAkaGVhZGVyLCAkam91cm5hbCwgJHN0b3J5LCAkdHdpbnMsIF9yZWY7XG4gICAgJHBhZ2UuZGF0YShcImRhdGFcIiwgcGFnZU9iamVjdC5nZXRSYXdQYWdlKCkpO1xuICAgIGlmIChwYWdlT2JqZWN0LmlzUmVtb3RlKCkpIHtcbiAgICAgICRwYWdlLmRhdGEoXCJzaXRlXCIsIHBhZ2VPYmplY3QuZ2V0UmVtb3RlU2l0ZSgpKTtcbiAgICB9XG4gICAgd2lraS5yZXNvbHV0aW9uQ29udGV4dCA9IHBhZ2VPYmplY3QuZ2V0Q29udGV4dCgpO1xuICAgICRwYWdlLmVtcHR5KCk7XG4gICAgX3JlZiA9IFsndHdpbnMnLCAnaGVhZGVyJywgJ3N0b3J5JywgJ2pvdXJuYWwnLCAnZm9vdGVyJ10ubWFwKGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKGNsYXNzTmFtZSkuYXBwZW5kVG8oJHBhZ2UpO1xuICAgIH0pLCAkdHdpbnMgPSBfcmVmWzBdLCAkaGVhZGVyID0gX3JlZlsxXSwgJHN0b3J5ID0gX3JlZlsyXSwgJGpvdXJuYWwgPSBfcmVmWzNdLCAkZm9vdGVyID0gX3JlZls0XTtcbiAgICBlbWl0SGVhZGVyKCRoZWFkZXIsICRwYWdlLCBwYWdlT2JqZWN0KTtcbiAgICBlbWl0VGltZXN0YW1wKCRoZWFkZXIsICRwYWdlLCBwYWdlT2JqZWN0KTtcbiAgICBwYWdlT2JqZWN0LnNlcUl0ZW1zKGZ1bmN0aW9uKGl0ZW0sIGRvbmUpIHtcbiAgICAgIHZhciAkaXRlbTtcbiAgICAgIGlmICgoaXRlbSAhPSBudWxsID8gaXRlbS50eXBlIDogdm9pZCAwKSAmJiAoaXRlbSAhPSBudWxsID8gaXRlbS5pZCA6IHZvaWQgMCkpIHtcbiAgICAgICAgJGl0ZW0gPSAkKFwiPGRpdiBjbGFzcz1cXFwiaXRlbSBcIiArIGl0ZW0udHlwZSArIFwiXFxcIiBkYXRhLWlkPVxcXCJcIiArIGl0ZW0uaWQgKyBcIlxcXCI+XCIpO1xuICAgICAgICAkc3RvcnkuYXBwZW5kKCRpdGVtKTtcbiAgICAgICAgcmV0dXJuIHBsdWdpbltcImRvXCJdKCRpdGVtLCBpdGVtLCBkb25lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzdG9yeS5hcHBlbmQoJChcIjxkaXY+PHAgY2xhc3M9XFxcImVycm9yXFxcIj5DYW4ndCBtYWtlIHNlbnNlIG9mIHN0b3J5W1wiICsgaSArIFwiXTwvcD48L2Rpdj5cIikpO1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBhZ2VPYmplY3Quc2VxQWN0aW9ucyhmdW5jdGlvbihlYWNoLCBkb25lKSB7XG4gICAgICBpZiAoZWFjaC5zZXBhcmF0b3IpIHtcbiAgICAgICAgYWRkVG9Kb3VybmFsKCRqb3VybmFsLCBlYWNoLnNlcGFyYXRvcik7XG4gICAgICB9XG4gICAgICBhZGRUb0pvdXJuYWwoJGpvdXJuYWwsIGVhY2guYWN0aW9uKTtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG4gICAgZW1pdFR3aW5zKCRwYWdlKTtcbiAgICBlbWl0Q29udHJvbHMoJGpvdXJuYWwpO1xuICAgIHJldHVybiBlbWl0Rm9vdGVyKCRmb290ZXIsIHBhZ2VPYmplY3QpO1xuICB9O1xuXG4gIGNyZWF0ZU1pc3NpbmdGbGFnID0gZnVuY3Rpb24oJHBhZ2UsIHBhZ2VPYmplY3QpIHtcbiAgICBpZiAoIXBhZ2VPYmplY3QuaXNSZW1vdGUoKSkge1xuICAgICAgcmV0dXJuICQoJ2ltZy5mYXZpY29uJywgJHBhZ2UpLmVycm9yKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcGx1Z2luLmdldCgnZmF2aWNvbicsIGZ1bmN0aW9uKGZhdmljb24pIHtcbiAgICAgICAgICByZXR1cm4gZmF2aWNvbi5jcmVhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgd2lraS5idWlsZFBhZ2UgPSBmdW5jdGlvbihwYWdlT2JqZWN0LCAkcGFnZSkge1xuICAgIGlmIChwYWdlT2JqZWN0LmlzTG9jYWwoKSkge1xuICAgICAgJHBhZ2UuYWRkQ2xhc3MoJ2xvY2FsJyk7XG4gICAgfVxuICAgIGlmIChwYWdlT2JqZWN0LmlzUmVtb3RlKCkpIHtcbiAgICAgICRwYWdlLmFkZENsYXNzKCdyZW1vdGUnKTtcbiAgICB9XG4gICAgaWYgKHBhZ2VPYmplY3QuaXNQbHVnaW4oKSkge1xuICAgICAgJHBhZ2UuYWRkQ2xhc3MoJ3BsdWdpbicpO1xuICAgIH1cbiAgICByZW5kZXJQYWdlSW50b1BhZ2VFbGVtZW50KHBhZ2VPYmplY3QsICRwYWdlKTtcbiAgICBjcmVhdGVNaXNzaW5nRmxhZygkcGFnZSwgcGFnZU9iamVjdCk7XG4gICAgc3RhdGUuc2V0VXJsKCk7XG4gICAgaW5pdERyYWdnaW5nKCRwYWdlKTtcbiAgICBpbml0QWRkQnV0dG9uKCRwYWdlKTtcbiAgICByZXR1cm4gJHBhZ2U7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSByZWZyZXNoID0gd2lraS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRwYWdlLCBjcmVhdGVHaG9zdFBhZ2UsIGVtcHR5UGFnZSwgcGFnZUluZm9ybWF0aW9uLCByZXYsIHNsdWcsIHdoZW5Hb3R0ZW4sIF9yZWY7XG4gICAgJHBhZ2UgPSAkKHRoaXMpO1xuICAgIF9yZWYgPSAkcGFnZS5hdHRyKCdpZCcpLnNwbGl0KCdfcmV2JyksIHNsdWcgPSBfcmVmWzBdLCByZXYgPSBfcmVmWzFdO1xuICAgIHBhZ2VJbmZvcm1hdGlvbiA9IHtcbiAgICAgIHNsdWc6IHNsdWcsXG4gICAgICByZXY6IHJldixcbiAgICAgIHNpdGU6ICRwYWdlLmRhdGEoJ3NpdGUnKVxuICAgIH07XG4gICAgZW1wdHlQYWdlID0gcmVxdWlyZSgnLi9wYWdlJykuZW1wdHlQYWdlO1xuICAgIGNyZWF0ZUdob3N0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhpdCwgaGl0cywgaW5mbywgcGFnZU9iamVjdCwgcmVzdWx0LCBzaXRlLCB0aXRsZSwgX2ksIF9sZW4sIF9yZWYxO1xuICAgICAgdGl0bGUgPSAkKFwiYVtocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuaHRtbFxcXCJdOmxhc3RcIikudGV4dCgpIHx8IHNsdWc7XG4gICAgICBwYWdlT2JqZWN0ID0gZW1wdHlQYWdlKCk7XG4gICAgICBwYWdlT2JqZWN0LnNldFRpdGxlKHRpdGxlKTtcbiAgICAgIGhpdHMgPSBbXTtcbiAgICAgIF9yZWYxID0gd2lraS5uZWlnaGJvcmhvb2Q7XG4gICAgICBmb3IgKHNpdGUgaW4gX3JlZjEpIHtcbiAgICAgICAgaW5mbyA9IF9yZWYxW3NpdGVdO1xuICAgICAgICBpZiAoaW5mby5zaXRlbWFwICE9IG51bGwpIHtcbiAgICAgICAgICByZXN1bHQgPSBfLmZpbmQoaW5mby5zaXRlbWFwLCBmdW5jdGlvbihlYWNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZWFjaC5zbHVnID09PSBzbHVnO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaGl0cy5wdXNoKHtcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicmVmZXJlbmNlXCIsXG4gICAgICAgICAgICAgIFwic2l0ZVwiOiBzaXRlLFxuICAgICAgICAgICAgICBcInNsdWdcIjogc2x1ZyxcbiAgICAgICAgICAgICAgXCJ0aXRsZVwiOiByZXN1bHQudGl0bGUgfHwgc2x1ZyxcbiAgICAgICAgICAgICAgXCJ0ZXh0XCI6IHJlc3VsdC5zeW5vcHNpcyB8fCAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGl0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhZ2VPYmplY3QuYWRkSXRlbSh7XG4gICAgICAgICAgJ3R5cGUnOiAnZnV0dXJlJyxcbiAgICAgICAgICAndGV4dCc6ICdXZSBjb3VsZCBub3QgZmluZCB0aGlzIHBhZ2UgaW4gdGhlIGV4cGVjdGVkIGNvbnRleHQuJyxcbiAgICAgICAgICAndGl0bGUnOiB0aXRsZVxuICAgICAgICB9KTtcbiAgICAgICAgcGFnZU9iamVjdC5hZGRJdGVtKHtcbiAgICAgICAgICAndHlwZSc6ICdwYXJhZ3JhcGgnLFxuICAgICAgICAgICd0ZXh0JzogXCJXZSBkaWQgZmluZCB0aGUgcGFnZSBpbiB5b3VyIGN1cnJlbnQgbmVpZ2hib3Job29kLlwiXG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGhpdHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBoaXQgPSBoaXRzW19pXTtcbiAgICAgICAgICBwYWdlT2JqZWN0LmFkZEl0ZW0oaGl0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZU9iamVjdC5hZGRJdGVtKHtcbiAgICAgICAgICAndHlwZSc6ICdmdXR1cmUnLFxuICAgICAgICAgICd0ZXh0JzogJ1dlIGNvdWxkIG5vdCBmaW5kIHRoaXMgcGFnZS4nLFxuICAgICAgICAgICd0aXRsZSc6IHRpdGxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpa2kuYnVpbGRQYWdlKHBhZ2VPYmplY3QsICRwYWdlKS5hZGRDbGFzcygnZ2hvc3QnKTtcbiAgICB9O1xuICAgIHdoZW5Hb3R0ZW4gPSBmdW5jdGlvbihwYWdlT2JqZWN0KSB7XG4gICAgICB2YXIgc2l0ZSwgX2ksIF9sZW4sIF9yZWYxLCBfcmVzdWx0cztcbiAgICAgIHdpa2kuYnVpbGRQYWdlKHBhZ2VPYmplY3QsICRwYWdlKTtcbiAgICAgIF9yZWYxID0gcGFnZU9iamVjdC5nZXROZWlnaGJvcnMobG9jYXRpb24uaG9zdCk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmMS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBzaXRlID0gX3JlZjFbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKG5laWdoYm9yaG9vZC5yZWdpc3Rlck5laWdoYm9yKHNpdGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICAgIHJldHVybiBwYWdlSGFuZGxlci5nZXQoe1xuICAgICAgd2hlbkdvdHRlbjogd2hlbkdvdHRlbixcbiAgICAgIHdoZW5Ob3RHb3R0ZW46IGNyZWF0ZUdob3N0UGFnZSxcbiAgICAgIHBhZ2VJbmZvcm1hdGlvbjogcGFnZUluZm9ybWF0aW9uXG4gICAgfSk7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1yZWZyZXNoLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBjcmVhdGU7XG5cbiAgY3JlYXRlID0gZnVuY3Rpb24ocmV2SW5kZXgsIGRhdGEpIHtcbiAgICB2YXIgYWZ0ZXJJbmRleCwgZWRpdEluZGV4LCBpdGVtSWQsIGl0ZW1zLCBqb3VybmFsLCBqb3VybmFsRW50cnksIHJlbW92ZUluZGV4LCByZXZKb3VybmFsLCByZXZTdG9yeSwgcmV2U3RvcnlJZHMsIHJldlRpdGxlLCBzdG9yeUl0ZW0sIF9pLCBfaiwgX2ssIF9sZW4sIF9sZW4xLCBfbGVuMiwgX3JlZjtcbiAgICBqb3VybmFsID0gZGF0YS5qb3VybmFsO1xuICAgIHJldlRpdGxlID0gZGF0YS50aXRsZTtcbiAgICByZXZTdG9yeSA9IFtdO1xuICAgIHJldkpvdXJuYWwgPSBqb3VybmFsLnNsaWNlKDAsICsoK3JldkluZGV4KSArIDEgfHwgOWU5KTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHJldkpvdXJuYWwubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGpvdXJuYWxFbnRyeSA9IHJldkpvdXJuYWxbX2ldO1xuICAgICAgcmV2U3RvcnlJZHMgPSByZXZTdG9yeS5tYXAoZnVuY3Rpb24oc3RvcnlJdGVtKSB7XG4gICAgICAgIHJldHVybiBzdG9yeUl0ZW0uaWQ7XG4gICAgICB9KTtcbiAgICAgIHN3aXRjaCAoam91cm5hbEVudHJ5LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICBpZiAoam91cm5hbEVudHJ5Lml0ZW0udGl0bGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV2VGl0bGUgPSBqb3VybmFsRW50cnkuaXRlbS50aXRsZTtcbiAgICAgICAgICAgIHJldlN0b3J5ID0gam91cm5hbEVudHJ5Lml0ZW0uc3RvcnkgfHwgW107XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhZGQnOlxuICAgICAgICAgIGlmICgoYWZ0ZXJJbmRleCA9IHJldlN0b3J5SWRzLmluZGV4T2Yoam91cm5hbEVudHJ5LmFmdGVyKSkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXZTdG9yeS5zcGxpY2UoYWZ0ZXJJbmRleCArIDEsIDAsIGpvdXJuYWxFbnRyeS5pdGVtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV2U3RvcnkucHVzaChqb3VybmFsRW50cnkuaXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdlZGl0JzpcbiAgICAgICAgICBpZiAoKGVkaXRJbmRleCA9IHJldlN0b3J5SWRzLmluZGV4T2Yoam91cm5hbEVudHJ5LmlkKSkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXZTdG9yeS5zcGxpY2UoZWRpdEluZGV4LCAxLCBqb3VybmFsRW50cnkuaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldlN0b3J5LnB1c2goam91cm5hbEVudHJ5Lml0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgaXRlbXMgPSB7fTtcbiAgICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSByZXZTdG9yeS5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgIHN0b3J5SXRlbSA9IHJldlN0b3J5W19qXTtcbiAgICAgICAgICAgIGl0ZW1zW3N0b3J5SXRlbS5pZF0gPSBzdG9yeUl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldlN0b3J5ID0gW107XG4gICAgICAgICAgX3JlZiA9IGpvdXJuYWxFbnRyeS5vcmRlcjtcbiAgICAgICAgICBmb3IgKF9rID0gMCwgX2xlbjIgPSBfcmVmLmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgICAgICAgaXRlbUlkID0gX3JlZltfa107XG4gICAgICAgICAgICBpZiAoaXRlbXNbaXRlbUlkXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldlN0b3J5LnB1c2goaXRlbXNbaXRlbUlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZW1vdmUnOlxuICAgICAgICAgIGlmICgocmVtb3ZlSW5kZXggPSByZXZTdG9yeUlkcy5pbmRleE9mKGpvdXJuYWxFbnRyeS5pZCkpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV2U3Rvcnkuc3BsaWNlKHJlbW92ZUluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzdG9yeTogcmV2U3RvcnksXG4gICAgICBqb3VybmFsOiByZXZKb3VybmFsLFxuICAgICAgdGl0bGU6IHJldlRpdGxlXG4gICAgfTtcbiAgfTtcblxuICBleHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXJldmlzaW9uLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhY3RpdmUsIGNyZWF0ZVNlYXJjaCwgZW1wdHlQYWdlLCB1dGlsLCB3aWtpO1xuXG4gIHdpa2kgPSByZXF1aXJlKCcuL3dpa2knKTtcblxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbiAgYWN0aXZlID0gcmVxdWlyZSgnLi9hY3RpdmUnKTtcblxuICBlbXB0eVBhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKS5lbXB0eVBhZ2U7XG5cbiAgY3JlYXRlU2VhcmNoID0gZnVuY3Rpb24oX2FyZykge1xuICAgIHZhciBuZWlnaGJvcmhvb2QsIHBlcmZvcm1TZWFyY2g7XG4gICAgbmVpZ2hib3Job29kID0gX2FyZy5uZWlnaGJvcmhvb2Q7XG4gICAgcGVyZm9ybVNlYXJjaCA9IGZ1bmN0aW9uKHNlYXJjaFF1ZXJ5KSB7XG4gICAgICB2YXIgJHJlc3VsdFBhZ2UsIHJlc3VsdCwgcmVzdWx0UGFnZSwgc2VhcmNoUmVzdWx0cywgdGFsbHksIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgc2VhcmNoUmVzdWx0cyA9IG5laWdoYm9yaG9vZC5zZWFyY2goc2VhcmNoUXVlcnkpO1xuICAgICAgdGFsbHkgPSBzZWFyY2hSZXN1bHRzLnRhbGx5O1xuICAgICAgcmVzdWx0UGFnZSA9IGVtcHR5UGFnZSgpO1xuICAgICAgcmVzdWx0UGFnZS5zZXRUaXRsZShcIlNlYXJjaCBmb3IgJ1wiICsgc2VhcmNoUXVlcnkgKyBcIidcIik7XG4gICAgICByZXN1bHRQYWdlLmFkZFBhcmFncmFwaChcIlN0cmluZyAnXCIgKyBzZWFyY2hRdWVyeSArIFwiJyBmb3VuZCBvbiBcIiArICh0YWxseS5maW5kcyB8fCAnbm9uZScpICsgXCIgb2YgXCIgKyAodGFsbHkucGFnZXMgfHwgJ25vJykgKyBcIiBwYWdlcyBmcm9tIFwiICsgKHRhbGx5LnNpdGVzIHx8ICdubycpICsgXCIgc2l0ZXMuXFxuVGV4dCBtYXRjaGVkIG9uIFwiICsgKHRhbGx5LnRpdGxlIHx8ICdubycpICsgXCIgdGl0bGVzLCBcIiArICh0YWxseS50ZXh0IHx8ICdubycpICsgXCIgcGFyYWdyYXBocywgYW5kIFwiICsgKHRhbGx5LnNsdWcgfHwgJ25vJykgKyBcIiBzbHVncy5cXG5FbGFwc2VkIHRpbWUgXCIgKyB0YWxseS5tc2VjICsgXCIgbWlsbGlzZWNvbmRzLlwiKTtcbiAgICAgIF9yZWYgPSBzZWFyY2hSZXN1bHRzLmZpbmRzO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IF9yZWZbX2ldO1xuICAgICAgICByZXN1bHRQYWdlLmFkZEl0ZW0oe1xuICAgICAgICAgIFwidHlwZVwiOiBcInJlZmVyZW5jZVwiLFxuICAgICAgICAgIFwic2l0ZVwiOiByZXN1bHQuc2l0ZSxcbiAgICAgICAgICBcInNsdWdcIjogcmVzdWx0LnBhZ2Uuc2x1ZyxcbiAgICAgICAgICBcInRpdGxlXCI6IHJlc3VsdC5wYWdlLnRpdGxlLFxuICAgICAgICAgIFwidGV4dFwiOiByZXN1bHQucGFnZS5zeW5vcHNpcyB8fCAnJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgICRyZXN1bHRQYWdlID0gd2lraS5jcmVhdGVQYWdlKHJlc3VsdFBhZ2UuZ2V0U2x1ZygpKS5hZGRDbGFzcygnZ2hvc3QnKTtcbiAgICAgICRyZXN1bHRQYWdlLmFwcGVuZFRvKCQoJy5tYWluJykpO1xuICAgICAgd2lraS5idWlsZFBhZ2UocmVzdWx0UGFnZSwgJHJlc3VsdFBhZ2UpO1xuICAgICAgcmV0dXJuIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIHBlcmZvcm1TZWFyY2g6IHBlcmZvcm1TZWFyY2hcbiAgICB9O1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY3JlYXRlU2VhcmNoO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9c2VhcmNoLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBhY3RpdmUsIHN0YXRlLCB3aWtpLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIHdpa2kgPSByZXF1aXJlKCcuL3dpa2knKTtcblxuICBhY3RpdmUgPSByZXF1aXJlKCcuL2FjdGl2ZScpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gc3RhdGUgPSB7fTtcblxuICBzdGF0ZS5wYWdlc0luRG9tID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQubWFrZUFycmF5KCQoXCIucGFnZVwiKS5tYXAoZnVuY3Rpb24oXywgZWwpIHtcbiAgICAgIHJldHVybiBlbC5pZDtcbiAgICB9KSk7XG4gIH07XG5cbiAgc3RhdGUudXJsUGFnZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaTtcbiAgICByZXR1cm4gKChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gJChsb2NhdGlvbikuYXR0cigncGF0aG5hbWUnKS5zcGxpdCgnLycpO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2kgKz0gMikge1xuICAgICAgICBpID0gX3JlZltfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2goaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSkoKSkuc2xpY2UoMSk7XG4gIH07XG5cbiAgc3RhdGUubG9jc0luRG9tID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQubWFrZUFycmF5KCQoXCIucGFnZVwiKS5tYXAoZnVuY3Rpb24oXywgZWwpIHtcbiAgICAgIHJldHVybiAkKGVsKS5kYXRhKCdzaXRlJykgfHwgJ3ZpZXcnO1xuICAgIH0pKTtcbiAgfTtcblxuICBzdGF0ZS51cmxMb2NzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGosIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICBfcmVmID0gJChsb2NhdGlvbikuYXR0cigncGF0aG5hbWUnKS5zcGxpdCgnLycpLnNsaWNlKDEpO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSArPSAyKSB7XG4gICAgICBqID0gX3JlZltfaV07XG4gICAgICBfcmVzdWx0cy5wdXNoKGopO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG5cbiAgc3RhdGUuc2V0VXJsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlkeCwgbG9jcywgcGFnZSwgcGFnZXMsIHVybCwgX3JlZjtcbiAgICBkb2N1bWVudC50aXRsZSA9IChfcmVmID0gJCgnLnBhZ2U6bGFzdCcpLmRhdGEoJ2RhdGEnKSkgIT0gbnVsbCA/IF9yZWYudGl0bGUgOiB2b2lkIDA7XG4gICAgaWYgKGhpc3RvcnkgJiYgaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIGxvY3MgPSBzdGF0ZS5sb2NzSW5Eb20oKTtcbiAgICAgIHBhZ2VzID0gc3RhdGUucGFnZXNJbkRvbSgpO1xuICAgICAgdXJsID0gKChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChpZHggPSBfaSA9IDAsIF9sZW4gPSBwYWdlcy5sZW5ndGg7IF9pIDwgX2xlbjsgaWR4ID0gKytfaSkge1xuICAgICAgICAgIHBhZ2UgPSBwYWdlc1tpZHhdO1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goXCIvXCIgKyAoKGxvY3MgIT0gbnVsbCA/IGxvY3NbaWR4XSA6IHZvaWQgMCkgfHwgJ3ZpZXcnKSArIFwiL1wiICsgcGFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKSkuam9pbignJyk7XG4gICAgICBpZiAodXJsICE9PSAkKGxvY2F0aW9uKS5hdHRyKCdwYXRobmFtZScpKSB7XG4gICAgICAgIHJldHVybiBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB1cmwpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBzdGF0ZS5zaG93ID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciBpZHgsIG5hbWUsIG5ld0xvY3MsIG5ld1BhZ2VzLCBvbGQsIG9sZExvY3MsIG9sZFBhZ2VzLCBwcmV2aW91cywgX2ksIF9sZW4sIF9yZWY7XG4gICAgb2xkUGFnZXMgPSBzdGF0ZS5wYWdlc0luRG9tKCk7XG4gICAgbmV3UGFnZXMgPSBzdGF0ZS51cmxQYWdlcygpO1xuICAgIG9sZExvY3MgPSBzdGF0ZS5sb2NzSW5Eb20oKTtcbiAgICBuZXdMb2NzID0gc3RhdGUudXJsTG9jcygpO1xuICAgIGlmICghbG9jYXRpb24ucGF0aG5hbWUgfHwgbG9jYXRpb24ucGF0aG5hbWUgPT09ICcvJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwcmV2aW91cyA9ICQoJy5wYWdlJykuZXEoMCk7XG4gICAgZm9yIChpZHggPSBfaSA9IDAsIF9sZW4gPSBuZXdQYWdlcy5sZW5ndGg7IF9pIDwgX2xlbjsgaWR4ID0gKytfaSkge1xuICAgICAgbmFtZSA9IG5ld1BhZ2VzW2lkeF07XG4gICAgICBpZiAobmFtZSAhPT0gb2xkUGFnZXNbaWR4XSkge1xuICAgICAgICBvbGQgPSAkKCcucGFnZScpLmVxKGlkeCk7XG4gICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgd2lraS5jcmVhdGVQYWdlKG5hbWUsIG5ld0xvY3NbaWR4XSkuaW5zZXJ0QWZ0ZXIocHJldmlvdXMpLmVhY2god2lraS5yZWZyZXNoKTtcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzID0gJCgnLnBhZ2UnKS5lcShpZHgpO1xuICAgIH1cbiAgICBwcmV2aW91cy5uZXh0QWxsKCkucmVtb3ZlKCk7XG4gICAgYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG4gICAgcmV0dXJuIGRvY3VtZW50LnRpdGxlID0gKF9yZWYgPSAkKCcucGFnZTpsYXN0JykuZGF0YSgnZGF0YScpKSAhPSBudWxsID8gX3JlZi50aXRsZSA6IHZvaWQgMDtcbiAgfTtcblxuICBzdGF0ZS5maXJzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaXJzdFVybExvY3MsIGZpcnN0VXJsUGFnZXMsIGlkeCwgb2xkUGFnZXMsIHVybFBhZ2UsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICBzdGF0ZS5zZXRVcmwoKTtcbiAgICBmaXJzdFVybFBhZ2VzID0gc3RhdGUudXJsUGFnZXMoKTtcbiAgICBmaXJzdFVybExvY3MgPSBzdGF0ZS51cmxMb2NzKCk7XG4gICAgb2xkUGFnZXMgPSBzdGF0ZS5wYWdlc0luRG9tKCk7XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGlkeCA9IF9pID0gMCwgX2xlbiA9IGZpcnN0VXJsUGFnZXMubGVuZ3RoOyBfaSA8IF9sZW47IGlkeCA9ICsrX2kpIHtcbiAgICAgIHVybFBhZ2UgPSBmaXJzdFVybFBhZ2VzW2lkeF07XG4gICAgICBpZiAoX19pbmRleE9mLmNhbGwob2xkUGFnZXMsIHVybFBhZ2UpIDwgMCkge1xuICAgICAgICBpZiAodXJsUGFnZSAhPT0gJycpIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKHdpa2kuY3JlYXRlUGFnZSh1cmxQYWdlLCBmaXJzdFVybExvY3NbaWR4XSkuYXBwZW5kVG8oJy5tYWluJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1zdGF0ZS5qcy5tYXBcbiovIiwiKGZ1bmN0aW9uKCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICB2YXIgcDEsIHAyLCBzeW5vcHNpcztcbiAgICBzeW5vcHNpcyA9IHBhZ2Uuc3lub3BzaXM7XG4gICAgaWYgKChwYWdlICE9IG51bGwpICYmIChwYWdlLnN0b3J5ICE9IG51bGwpKSB7XG4gICAgICBwMSA9IHBhZ2Uuc3RvcnlbMF07XG4gICAgICBwMiA9IHBhZ2Uuc3RvcnlbMV07XG4gICAgICBpZiAocDEgJiYgcDEudHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDEudGV4dCk7XG4gICAgICB9XG4gICAgICBpZiAocDIgJiYgcDIudHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDIudGV4dCk7XG4gICAgICB9XG4gICAgICBpZiAocDEgJiYgKHAxLnRleHQgIT0gbnVsbCkpIHtcbiAgICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDEudGV4dCk7XG4gICAgICB9XG4gICAgICBpZiAocDIgJiYgKHAyLnRleHQgIT0gbnVsbCkpIHtcbiAgICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDIudGV4dCk7XG4gICAgICB9XG4gICAgICBzeW5vcHNpcyB8fCAoc3lub3BzaXMgPSAocGFnZS5zdG9yeSAhPSBudWxsKSAmJiAoXCJBIHBhZ2Ugd2l0aCBcIiArIHBhZ2Uuc3RvcnkubGVuZ3RoICsgXCIgaXRlbXMuXCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3lub3BzaXMgPSAnQSBwYWdlIHdpdGggbm8gc3RvcnkuJztcbiAgICB9XG4gICAgcmV0dXJuIHN5bm9wc2lzO1xuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9c3lub3BzaXMuanMubWFwXG4qLyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHV0aWwsIHdpa2k7XG5cbiAgd2lraSA9IHJlcXVpcmUoJy4vd2lraScpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gd2lraS51dGlsID0gdXRpbCA9IHt9O1xuXG4gIHV0aWwuc3ltYm9scyA9IHtcbiAgICBjcmVhdGU6ICfimLwnLFxuICAgIGFkZDogJysnLFxuICAgIGVkaXQ6ICfinI4nLFxuICAgIGZvcms6ICfimpEnLFxuICAgIG1vdmU6ICfihpUnLFxuICAgIHJlbW92ZTogJ+KclSdcbiAgfTtcblxuICB1dGlsLnJhbmRvbUJ5dGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbiAgfTtcblxuICB1dGlsLnJhbmRvbUJ5dGVzID0gZnVuY3Rpb24obikge1xuICAgIHJldHVybiAoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9pLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMTsgMSA8PSBuID8gX2kgPD0gbiA6IF9pID49IG47IDEgPD0gbiA/IF9pKysgOiBfaS0tKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2godXRpbC5yYW5kb21CeXRlKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0pKCkpLmpvaW4oJycpO1xuICB9O1xuXG4gIHV0aWwuZm9ybWF0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICB2YXIgYW0sIGQsIGgsIG1pLCBtbztcbiAgICBkID0gbmV3IERhdGUoKHRpbWUgPiAxMDAwMDAwMDAwMCA/IHRpbWUgOiB0aW1lICogMTAwMCkpO1xuICAgIG1vID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddW2QuZ2V0TW9udGgoKV07XG4gICAgaCA9IGQuZ2V0SG91cnMoKTtcbiAgICBhbSA9IGggPCAxMiA/ICdBTScgOiAnUE0nO1xuICAgIGggPSBoID09PSAwID8gMTIgOiBoID4gMTIgPyBoIC0gMTIgOiBoO1xuICAgIG1pID0gKGQuZ2V0TWludXRlcygpIDwgMTAgPyBcIjBcIiA6IFwiXCIpICsgZC5nZXRNaW51dGVzKCk7XG4gICAgcmV0dXJuIFwiXCIgKyBoICsgXCI6XCIgKyBtaSArIFwiIFwiICsgYW0gKyBcIjxicj5cIiArIChkLmdldERhdGUoKSkgKyBcIiBcIiArIG1vICsgXCIgXCIgKyAoZC5nZXRGdWxsWWVhcigpKTtcbiAgfTtcblxuICB1dGlsLmZvcm1hdERhdGUgPSBmdW5jdGlvbihtc1NpbmNlRXBvY2gpIHtcbiAgICB2YXIgYW0sIGQsIGRheSwgaCwgbWksIG1vLCBzZWMsIHdrLCB5cjtcbiAgICBkID0gbmV3IERhdGUobXNTaW5jZUVwb2NoKTtcbiAgICB3ayA9IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11bZC5nZXREYXkoKV07XG4gICAgbW8gPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ11bZC5nZXRNb250aCgpXTtcbiAgICBkYXkgPSBkLmdldERhdGUoKTtcbiAgICB5ciA9IGQuZ2V0RnVsbFllYXIoKTtcbiAgICBoID0gZC5nZXRIb3VycygpO1xuICAgIGFtID0gaCA8IDEyID8gJ0FNJyA6ICdQTSc7XG4gICAgaCA9IGggPT09IDAgPyAxMiA6IGggPiAxMiA/IGggLSAxMiA6IGg7XG4gICAgbWkgPSAoZC5nZXRNaW51dGVzKCkgPCAxMCA/IFwiMFwiIDogXCJcIikgKyBkLmdldE1pbnV0ZXMoKTtcbiAgICBzZWMgPSAoZC5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiIDogXCJcIikgKyBkLmdldFNlY29uZHMoKTtcbiAgICByZXR1cm4gXCJcIiArIHdrICsgXCIgXCIgKyBtbyArIFwiIFwiICsgZGF5ICsgXCIsIFwiICsgeXIgKyBcIjxicj5cIiArIGggKyBcIjpcIiArIG1pICsgXCI6XCIgKyBzZWMgKyBcIiBcIiArIGFtO1xuICB9O1xuXG4gIHV0aWwuZm9ybWF0RWxhcHNlZFRpbWUgPSBmdW5jdGlvbihtc1NpbmNlRXBvY2gpIHtcbiAgICB2YXIgZGF5cywgaHJzLCBtaW5zLCBtb250aHMsIG1zZWNzLCBzZWNzLCB3ZWVrcywgeWVhcnM7XG4gICAgbXNlY3MgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG1zU2luY2VFcG9jaDtcbiAgICBpZiAoKHNlY3MgPSBtc2VjcyAvIDEwMDApIDwgMikge1xuICAgICAgcmV0dXJuIFwiXCIgKyAoTWF0aC5mbG9vcihtc2VjcykpICsgXCIgbWlsbGlzZWNvbmRzIGFnb1wiO1xuICAgIH1cbiAgICBpZiAoKG1pbnMgPSBzZWNzIC8gNjApIDwgMikge1xuICAgICAgcmV0dXJuIFwiXCIgKyAoTWF0aC5mbG9vcihzZWNzKSkgKyBcIiBzZWNvbmRzIGFnb1wiO1xuICAgIH1cbiAgICBpZiAoKGhycyA9IG1pbnMgLyA2MCkgPCAyKSB7XG4gICAgICByZXR1cm4gXCJcIiArIChNYXRoLmZsb29yKG1pbnMpKSArIFwiIG1pbnV0ZXMgYWdvXCI7XG4gICAgfVxuICAgIGlmICgoZGF5cyA9IGhycyAvIDI0KSA8IDIpIHtcbiAgICAgIHJldHVybiBcIlwiICsgKE1hdGguZmxvb3IoaHJzKSkgKyBcIiBob3VycyBhZ29cIjtcbiAgICB9XG4gICAgaWYgKCh3ZWVrcyA9IGRheXMgLyA3KSA8IDIpIHtcbiAgICAgIHJldHVybiBcIlwiICsgKE1hdGguZmxvb3IoZGF5cykpICsgXCIgZGF5cyBhZ29cIjtcbiAgICB9XG4gICAgaWYgKChtb250aHMgPSBkYXlzIC8gMzEpIDwgMikge1xuICAgICAgcmV0dXJuIFwiXCIgKyAoTWF0aC5mbG9vcih3ZWVrcykpICsgXCIgd2Vla3MgYWdvXCI7XG4gICAgfVxuICAgIGlmICgoeWVhcnMgPSBkYXlzIC8gMzY1KSA8IDIpIHtcbiAgICAgIHJldHVybiBcIlwiICsgKE1hdGguZmxvb3IobW9udGhzKSkgKyBcIiBtb250aHMgYWdvXCI7XG4gICAgfVxuICAgIHJldHVybiBcIlwiICsgKE1hdGguZmxvb3IoeWVhcnMpKSArIFwiIHllYXJzIGFnb1wiO1xuICB9O1xuXG4gIHV0aWwuZW1wdHlQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAnZW1wdHknLFxuICAgICAgc3Rvcnk6IFtdLFxuICAgICAgam91cm5hbDogW11cbiAgICB9O1xuICB9O1xuXG4gIHV0aWwuZ2V0U2VsZWN0aW9uUG9zID0gZnVuY3Rpb24oalF1ZXJ5RWxlbWVudCkge1xuICAgIHZhciBlbCwgaWVQb3MsIHNlbDtcbiAgICBlbCA9IGpRdWVyeUVsZW1lbnQuZ2V0KDApO1xuICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgIGVsLmZvY3VzKCk7XG4gICAgICBzZWwgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgIHNlbC5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1lbC52YWx1ZS5sZW5ndGgpO1xuICAgICAgaWVQb3MgPSBzZWwudGV4dC5sZW5ndGg7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogaWVQb3MsXG4gICAgICAgIGVuZDogaWVQb3NcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBlbC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgZW5kOiBlbC5zZWxlY3Rpb25FbmRcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIHV0aWwuc2V0Q2FyZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGpRdWVyeUVsZW1lbnQsIGNhcmV0UG9zKSB7XG4gICAgdmFyIGVsLCByYW5nZTtcbiAgICBlbCA9IGpRdWVyeUVsZW1lbnQuZ2V0KDApO1xuICAgIGlmIChlbCAhPSBudWxsKSB7XG4gICAgICBpZiAoZWwuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgICAgIHJhbmdlID0gZWwuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgIHJhbmdlLm1vdmUoXCJjaGFyYWN0ZXJcIiwgY2FyZXRQb3MpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKGNhcmV0UG9zLCBjYXJldFBvcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWwuZm9jdXMoKTtcbiAgICB9XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD11dGlsLmpzLm1hcFxuKi8iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBjcmVhdGVTeW5vcHNpcywgd2lraSxcbiAgICBfX3NsaWNlID0gW10uc2xpY2U7XG5cbiAgY3JlYXRlU3lub3BzaXMgPSByZXF1aXJlKCcuL3N5bm9wc2lzJyk7XG5cbiAgd2lraSA9IHtcbiAgICBjcmVhdGVTeW5vcHNpczogY3JlYXRlU3lub3BzaXNcbiAgfTtcblxuICB3aWtpLnBlcnNvbmEgPSByZXF1aXJlKCcuL3BlcnNvbmEnKTtcblxuICB3aWtpLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGluZ3M7XG4gICAgdGhpbmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICBpZiAoKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwgPyBjb25zb2xlLmxvZyA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIHRoaW5ncyk7XG4gICAgfVxuICB9O1xuXG4gIHdpa2kuYXNTbHVnID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBuYW1lLnJlcGxhY2UoL1xccy9nLCAnLScpLnJlcGxhY2UoL1teQS1aYS16MC05LV0vZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIH07XG5cbiAgd2lraS51c2VMb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJChcIi5sb2dpblwiKS5sZW5ndGggPiAwO1xuICB9O1xuXG4gIHdpa2kucmVzb2x1dGlvbkNvbnRleHQgPSBbXTtcblxuICB3aWtpLnJlc29sdmVGcm9tID0gZnVuY3Rpb24oYWRkaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgd2lraS5yZXNvbHV0aW9uQ29udGV4dC5wdXNoKGFkZGl0aW9uKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHdpa2kucmVzb2x1dGlvbkNvbnRleHQucG9wKCk7XG4gICAgfVxuICB9O1xuXG4gIHdpa2kuZ2V0RGF0YSA9IGZ1bmN0aW9uKHZpcykge1xuICAgIHZhciBpZHgsIHdobztcbiAgICBpZiAodmlzKSB7XG4gICAgICBpZHggPSAkKCcuaXRlbScpLmluZGV4KHZpcyk7XG4gICAgICB3aG8gPSAkKFwiLml0ZW06bHQoXCIgKyBpZHggKyBcIilcIikuZmlsdGVyKCcuY2hhcnQsLmRhdGEsLmNhbGN1bGF0b3InKS5sYXN0KCk7XG4gICAgICBpZiAod2hvICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHdoby5kYXRhKCdpdGVtJykuZGF0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hvID0gJCgnLmNoYXJ0LC5kYXRhLC5jYWxjdWxhdG9yJykubGFzdCgpO1xuICAgICAgaWYgKHdobyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB3aG8uZGF0YSgnaXRlbScpLmRhdGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHdpa2kuZ2V0RGF0YU5vZGVzID0gZnVuY3Rpb24odmlzKSB7XG4gICAgdmFyIGlkeCwgd2hvO1xuICAgIGlmICh2aXMpIHtcbiAgICAgIGlkeCA9ICQoJy5pdGVtJykuaW5kZXgodmlzKTtcbiAgICAgIHdobyA9ICQoXCIuaXRlbTpsdChcIiArIGlkeCArIFwiKVwiKS5maWx0ZXIoJy5jaGFydCwuZGF0YSwuY2FsY3VsYXRvcicpLnRvQXJyYXkoKS5yZXZlcnNlKCk7XG4gICAgICByZXR1cm4gJCh3aG8pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aG8gPSAkKCcuY2hhcnQsLmRhdGEsLmNhbGN1bGF0b3InKS50b0FycmF5KCkucmV2ZXJzZSgpO1xuICAgICAgcmV0dXJuICQod2hvKTtcbiAgICB9XG4gIH07XG5cbiAgd2lraS5jcmVhdGVQYWdlID0gZnVuY3Rpb24obmFtZSwgbG9jKSB7XG4gICAgdmFyICRwYWdlLCBzaXRlO1xuICAgIGlmIChsb2MgJiYgbG9jICE9PSAndmlldycpIHtcbiAgICAgIHNpdGUgPSBsb2M7XG4gICAgfVxuICAgICRwYWdlID0gJChcIjxkaXYgY2xhc3M9XFxcInBhZ2VcXFwiIGlkPVxcXCJcIiArIG5hbWUgKyBcIlxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJ0d2luc1xcXCI+IDxwPiA8L3A+IDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cXG4gICAgPGgxPiA8aW1nIGNsYXNzPVxcXCJmYXZpY29uXFxcIiBzcmM9XFxcIlwiICsgKHNpdGUgPyBcIi8vXCIgKyBzaXRlIDogXCJcIikgKyBcIi9mYXZpY29uLnBuZ1xcXCIgaGVpZ2h0PVxcXCIzMnB4XFxcIj4gXCIgKyBuYW1lICsgXCIgPC9oMT5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiKTtcbiAgICBpZiAoc2l0ZSkge1xuICAgICAgJHBhZ2UuZGF0YSgnc2l0ZScsIHNpdGUpO1xuICAgIH1cbiAgICByZXR1cm4gJHBhZ2U7XG4gIH07XG5cbiAgd2lraS5nZXRJdGVtID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGlmICgkKGVsZW1lbnQpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiAkKGVsZW1lbnQpLmRhdGEoXCJpdGVtXCIpIHx8ICQoZWxlbWVudCkuZGF0YSgnc3RhdGljSXRlbScpO1xuICAgIH1cbiAgfTtcblxuICB3aWtpLnJlc29sdmVMaW5rcyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHZhciByZW5kZXJJbnRlcm5hbExpbms7XG4gICAgcmVuZGVySW50ZXJuYWxMaW5rID0gZnVuY3Rpb24obWF0Y2gsIG5hbWUpIHtcbiAgICAgIHZhciBzbHVnO1xuICAgICAgc2x1ZyA9IHdpa2kuYXNTbHVnKG5hbWUpO1xuICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImludGVybmFsXFxcIiBocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuaHRtbFxcXCIgZGF0YS1wYWdlLW5hbWU9XFxcIlwiICsgc2x1ZyArIFwiXFxcIiB0aXRsZT1cXFwiXCIgKyAod2lraS5yZXNvbHV0aW9uQ29udGV4dC5qb2luKCcgPT4gJykpICsgXCJcXFwiPlwiICsgbmFtZSArIFwiPC9hPlwiO1xuICAgIH07XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9cXFtcXFsoW15cXF1dKylcXF1cXF0vZ2ksIHJlbmRlckludGVybmFsTGluaykucmVwbGFjZSgvXFxbKChodHRwfGh0dHBzfGZ0cCk6Lio/KSAoLio/KVxcXS9naSwgXCI8YSBjbGFzcz1cXFwiZXh0ZXJuYWxcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCIkMVxcXCIgdGl0bGU9XFxcIiQxXFxcIiByZWw9XFxcIm5vZm9sbG93XFxcIj4kMyA8aW1nIHNyYz1cXFwiL2ltYWdlcy9leHRlcm5hbC1saW5rLWx0ci1pY29uLnBuZ1xcXCI+PC9hPlwiKTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHdpa2k7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD13aWtpLmpzLm1hcFxuKi8iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjYuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSBvYmplY3QgdGhhdCBnZXRzIHJldHVybmVkIHRvIGJyZWFrIG91dCBvZiBhIGxvb3AgaXRlcmF0aW9uLlxuICB2YXIgYnJlYWtlciA9IHt9O1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUZvckVhY2ggICAgICA9IEFycmF5UHJvdG8uZm9yRWFjaCxcbiAgICBuYXRpdmVNYXAgICAgICAgICAgPSBBcnJheVByb3RvLm1hcCxcbiAgICBuYXRpdmVSZWR1Y2UgICAgICAgPSBBcnJheVByb3RvLnJlZHVjZSxcbiAgICBuYXRpdmVSZWR1Y2VSaWdodCAgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0LFxuICAgIG5hdGl2ZUZpbHRlciAgICAgICA9IEFycmF5UHJvdG8uZmlsdGVyLFxuICAgIG5hdGl2ZUV2ZXJ5ICAgICAgICA9IEFycmF5UHJvdG8uZXZlcnksXG4gICAgbmF0aXZlU29tZSAgICAgICAgID0gQXJyYXlQcm90by5zb21lLFxuICAgIG5hdGl2ZUluZGV4T2YgICAgICA9IEFycmF5UHJvdG8uaW5kZXhPZixcbiAgICBuYXRpdmVMYXN0SW5kZXhPZiAgPSBBcnJheVByb3RvLmxhc3RJbmRleE9mLFxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0IHZpYSBhIHN0cmluZyBpZGVudGlmaWVyLFxuICAvLyBmb3IgQ2xvc3VyZSBDb21waWxlciBcImFkdmFuY2VkXCIgbW9kZS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS42LjAnO1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgb2JqZWN0cyB3aXRoIHRoZSBidWlsdC1pbiBgZm9yRWFjaGAsIGFycmF5cywgYW5kIHJhdyBvYmplY3RzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZm9yRWFjaGAgaWYgYXZhaWxhYmxlLlxuICB2YXIgZWFjaCA9IF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZSBbV2ViS2l0IEJ1ZyA4MDc5N10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3KVxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbShpbmRleCsrKTtcbiAgICAgIHNodWZmbGVkW2luZGV4IC0gMV0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XS5wdXNoKHZhbHVlKSA6IHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W21pZF0pIDwgdmFsdWUgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgc2hhbGxvdyA/IHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSkgOiBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBvdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBTcGxpdCBhbiBhcnJheSBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgZWFjaChhcnJheSwgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgKHByZWRpY2F0ZShlbGVtKSA/IHBhc3MgOiBmYWlsKS5wdXNoKGVsZW0pO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5jb250YWlucyhvdGhlciwgaXRlbSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmd1bWVudHMsICdsZW5ndGgnKS5jb25jYXQoMCkpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCAnJyArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZShpZHggPCBsZW5ndGgpIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IGN0b3I7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZWFjaChmdW5jcywgZnVuY3Rpb24oZikgeyBvYmpbZl0gPSBfLmJpbmQob2JqW2ZdLCBvYmopOyB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vID0ge307XG4gICAgaGFzaGVyIHx8IChoYXNoZXIgPSBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gXy5oYXMobWVtbywga2V5KSA/IG1lbW9ba2V5XSA6IChtZW1vW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7IH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUgPSAwLCByZXN1bHQgPSB0cnVlO1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PT0gYXR0cnMpIHJldHVybiB0cnVlOyAvL2F2b2lkIGNvbXBhcmluZyBhbiBvYmplY3QgdG8gaXRzZWxmLlxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIGVzY2FwZToge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmI3gyNzsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHQnOiAgICAgJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHR8XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIGRhdGEsIHNldHRpbmdzKSB7XG4gICAgdmFyIHJlbmRlcjtcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgICAgICAucmVwbGFjZShlc2NhcGVyLCBmdW5jdGlvbihtYXRjaCkgeyByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07IH0pO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgXCJyZXR1cm4gX19wO1xcblwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkgcmV0dXJuIHJlbmRlcihkYXRhLCBfKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIChzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJykgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbiwgd2hpY2ggd2lsbCBkZWxlZ2F0ZSB0byB0aGUgd3JhcHBlci5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfKG9iaikuY2hhaW4oKTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT0gJ3NoaWZ0JyB8fCBuYW1lID09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgXy5leHRlbmQoXy5wcm90b3R5cGUsIHtcblxuICAgIC8vIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgICBjaGFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jaGFpbiA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
