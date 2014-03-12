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