(function() {
  var diffXmlJs = require('../diffxml');
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;
  var NodePairs = diffXmlJs.NodePairs;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };
  
  describe('NodePair', function(){
    var testDoc1 = null;
    var testDoc2 = null;
    
    beforeEach(function(done){
      testDoc1 = parseXmlDocument("<a><b/><c/><d/></a>");
      testDoc2 = parseXmlDocument("<w><x/><y/><z/></w>");
      
      done();
    });
  
    describe('Make sure the correct partner for a node is found.', function(){
      it('testGetsCorrectPartner', function() {
        var pairs = new NodePairs();
        assert.equal(0, pairs.size());
        var a = testDoc1.documentElement;
        var w = testDoc2.documentElement;
        assert.equal(null,pairs.getPartner(a));
        assert.equal(false,pairs.isMatched(a));
        assert.equal(false,pairs.isMatched(w));
        pairs.add(a, w);
        assert.equal(w, pairs.getPartner(a));
        assert.equal(a, pairs.getPartner(w));
        assert.equal(2, pairs.size());
        assert.equal(true,pairs.isMatched(a));
        assert.equal(true,pairs.isMatched(w));

        var b = a.firstChild;
        var x = w.firstChild;
        pairs.add(x, b);

        var c = b.nextSibling;
        var y = x.nextSibling;
        pairs.add(c, y);

        var d = c.nextSibling;
        var z = y.nextSibling;
        assert.equal(null, pairs.getPartner(z));
        pairs.add(d, z);

        assert.equal(b, pairs.getPartner(x));
        assert.equal(x, pairs.getPartner(b));
        assert.equal(c, pairs.getPartner(y));
        assert.equal(y, pairs.getPartner(c));
        assert.equal(d, pairs.getPartner(z));
        assert.equal(z, pairs.getPartner(d));
        assert.equal(8, pairs.size());
      });
    });

  });

}).call(this);