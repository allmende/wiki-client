(function() {
  var expect, plugin, sinon;

  plugin = require('../lib/plugin');

  sinon = require('sinon');

  expect = require('expect.js');

  describe('plugin', function() {
    var $page, fakeDeferred;
    fakeDeferred = void 0;
    $page = null;
    before(function() {
      $page = $('<div id="plugin" />');
      $page.appendTo('body');
      fakeDeferred = {};
      fakeDeferred.done = sinon.mock().returns(fakeDeferred);
      fakeDeferred.fail = sinon.mock().returns(fakeDeferred);
      return sinon.stub(jQuery, 'getScript').returns(fakeDeferred);
    });
    after(function() {
      jQuery.getScript.restore();
      return $page.empty();
    });
    it('should have default image type', function() {
      return expect(window.plugins).to.have.property('image');
    });
    it('should fetch a plugin script from the right location', function() {
      plugin.get('test');
      expect(jQuery.getScript.calledOnce).to.be(true);
      return expect(jQuery.getScript.args[0][0]).to.be('/plugins/test/test.js');
    });
    return it('should render a plugin', function() {
      var item;
      item = {
        type: 'paragraph',
        text: 'blah [[Link]] asdf'
      };
      plugin["do"]($('#plugin'), item);
      return expect($('#plugin').html()).to.be('<p>blah <a class="internal" href="/link.html" data-page-name="link" title="view">Link</a> asdf</p>');
    });
  });

}).call(this);

/*
//@ sourceMappingURL=plugin.js.map
*/