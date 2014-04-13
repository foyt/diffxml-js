(function() {
  var diffXmlJs = require('../diffxml');
  var Match = diffXmlJs.Match;
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };

  describe('FindPositionSuite', function(){
  
    describe('FindPositionTest', function(){
      it('FindPositionTest', function() {
        var testDoc1 = parseXmlDocument("<a><b/></a>");
        var testDoc2 = parseXmlDocument("<a><b/><c/></a>");
        var pairs = Match.easyMatch(testDoc1, testDoc2);
        var c = testDoc2.firstChild.firstChild.nextSibling;
        assert.equal("c", c.nodeName);
        var fp = new FindPosition(c, pairs);
        assert.equal(1, fp.getDOMInsertPosition());
        assert.equal(2, fp.getXPathInsertPosition());
        assert.equal(1, fp.getCharInsertPosition());
      });
    });
  
    describe('Test where no leftmost match.', function(){
      it('simpleInsert', function() {
        var testDoc1 = parseXmlDocument("<a><b/><c/></a>");
        var testDoc2 = parseXmlDocument("<a><d/><e/></a>");
        var pairs = Match.easyMatch(testDoc1, testDoc2);
        // Need to mark d out-of-order for the algorithm to work
        NodeOps.setOutOfOrder(testDoc2.firstChild.firstChild);
        var e = testDoc2.firstChild.firstChild.nextSibling;
        assert.equal("e", e.nodeName);
        var fp = new FindPosition(e, pairs);
        assert.equal(0, fp.getDOMInsertPosition());
        assert.equal(1, fp.getXPathInsertPosition());
        assert.equal(1, fp.getCharInsertPosition());
      });
    });
  
    describe('Test inserting a node after text with a leftmost match.', function(){
      it('insertingAfterText', function() {
        var testDoc1 = parseXmlDocument("<a>sometext</a>");
        var testDoc2 = parseXmlDocument("<a>sometext<b/></a>");
        var pairs = Match.easyMatch(testDoc1, testDoc2);
        var b = testDoc2.firstChild.firstChild.nextSibling;
        assert.equal("b", b.nodeName);
        var fp = new FindPosition(b, pairs);
        assert.equal(1, fp.getDOMInsertPosition());
        assert.equal(2, fp.getXPathInsertPosition());
        assert.equal(9, fp.getCharInsertPosition());
      });
    });

  });
  
}).call(this);