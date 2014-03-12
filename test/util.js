(function() {
  var expect, timezoneOffset, util, wiki;

  wiki = require('../lib/wiki');

  util = require('../lib/util');

  expect = require('expect.js');

  timezoneOffset = function() {
    return (new Date(1333843344000)).getTimezoneOffset() * 60;
  };

  describe('wiki', function() {
    describe('link resolution', function() {
      it('should pass free text as is', function() {
        var s;
        s = wiki.resolveLinks("hello world");
        return expect(s).to.be('hello world');
      });
      describe('internal links', function() {
        var s;
        s = wiki.resolveLinks("hello [[world]]");
        it('should be class internal', function() {
          return expect(s).to.contain('class="internal"');
        });
        it('should relative reference html', function() {
          return expect(s).to.contain('href="/world.html"');
        });
        return it('should have data-page-name', function() {
          return expect(s).to.contain('data-page-name="world"');
        });
      });
      return describe('external links', function() {
        var s;
        s = wiki.resolveLinks("hello [http://world.com?foo=1&bar=2 world]");
        it('should be class external', function() {
          return expect(s).to.contain('class="external"');
        });
        it('should absolute reference html', function() {
          return expect(s).to.contain('href="http://world.com?foo=1&bar=2"');
        });
        return it('should not have data-page-name', function() {
          return expect(s).to.not.contain('data-page-name');
        });
      });
    });
    return describe('slug formation', function() {
      it('should convert capitals to lowercase', function() {
        var s;
        s = wiki.asSlug('WelcomeVisitors');
        return expect(s).to.be('welcomevisitors');
      });
      it('should convert spaces to dashes', function() {
        var s;
        s = wiki.asSlug(' now is  the time ');
        return expect(s).to.be('-now-is--the-time-');
      });
      it('should pass letters, numbers and dash', function() {
        var s;
        s = wiki.asSlug('THX-1138');
        return expect(s).to.be('thx-1138');
      });
      return it('should discard other puctuation', function() {
        var s;
        s = wiki.asSlug('(The) World, Finally.');
        return expect(s).to.be('the-world-finally');
      });
    });
  });

  describe('util', function() {
    it('should make random bytes', function() {
      var a;
      a = util.randomByte();
      expect(a).to.be.a('string');
      return expect(a.length).to.be(2);
    });
    it('should make random byte strings', function() {
      var s;
      s = util.randomBytes(4);
      expect(s).to.be.a('string');
      return expect(s.length).to.be(8);
    });
    it('should format unix time', function() {
      var s;
      s = util.formatTime(1333843344 + timezoneOffset());
      return expect(s).to.be('12:02 AM<br>8 Apr 2012');
    });
    it('should format javascript time', function() {
      var s;
      s = util.formatTime(1333843344000 + timezoneOffset() * 1000);
      return expect(s).to.be('12:02 AM<br>8 Apr 2012');
    });
    it('should format revision date', function() {
      var s;
      s = util.formatDate(1333843344000 + timezoneOffset() * 1000);
      return expect(s).to.be('Sun Apr 8, 2012<br>12:02:24 AM');
    });
    it('should make emptyPage page with title, story and journal', function() {
      var page;
      page = util.emptyPage();
      expect(page.title).to.be('empty');
      expect(page.story).to.eql([]);
      return expect(page.journal).to.eql([]);
    });
    return it('should make fresh empty page each call', function() {
      var page;
      page = util.emptyPage();
      page.story.push({
        type: 'junk'
      });
      page = util.emptyPage();
      return expect(page.story).to.eql([]);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=util.js.map
*/