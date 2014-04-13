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

  describe('MatchSuite', function(){
    
    beforeEach(function(done){
      testDoc1a = parseXmlDocument("<a><b><c/></b></a>");
      testDoc1b = parseXmlDocument("<a><b><c/></b></a>");
      testDoc2a = parseXmlDocument("<a>text1<b attr='b'><!-- comment --></b></a>");
      testDoc2b = parseXmlDocument("<a>text1<b attr='b'><!-- comment --></b></a>");
      testDoc3a = parseXmlDocument("<x><y><z/></y></x>");
      testDoc3b = parseXmlDocument("<x>different<y><!-- different --></y></x>");
      testDoc4a = parseXmlDocument("<a>newtext<b attr='c'><!-- comment --></b></a>");
     
      done();
    });
  
    describe('Just make sure a simple identical document with only elements matches correctly.', function(){
      it('testSimpleIdenticalDoc', function() {
        var all = Match.easyMatch(testDoc1a, testDoc1b);
        var aDocEl = testDoc1a.documentElement;
        var partner = all.getPartner(aDocEl);
        var bDocEl = testDoc1b.documentElement;
        assert.equal(bDocEl, partner);
        var aB = aDocEl.firstChild;
        var partner = all.getPartner(aB);

        var bB = bDocEl.firstChild;
        assert.equal(bB, partner);

        var aC = aB.firstChild;
        var partner = all.getPartner(aC);

        var bC = bB.firstChild;
        assert.equal(bC, partner);
      });
    });
  
    describe('Now test identical doc with comments and text matches correctly.', function(){
      it('testIdenticalDocWithTextAndComments', function() {
        var all = Match.easyMatch(testDoc2a, testDoc2b);

        var aDocEl = testDoc2a.documentElement;
        var partner = all.getPartner(aDocEl);

        var bDocEl = testDoc2b.documentElement;
        assert.equal(bDocEl, partner);

        var aText = aDocEl.firstChild;
        partner = all.getPartner(aText);

        var bText = bDocEl.firstChild;
        assert.equal(bText, partner);

        var aB = aText.nextSibling;
        partner = all.getPartner(aB);

        var bB = bText.nextSibling;
        assert.equal(bB, partner);

        var aComment = aB.firstChild;
        partner = all.getPartner(aComment);

        var bComment = bB.firstChild;
        assert.equal(bComment, partner);
      });
    });
  
    describe('Test completely different docs - only root nodes should match.', function(){
      it('testDifferentDocs', function() {
        // Remember both root and doc elements are forced to match
        var matches = Match.easyMatch(testDoc1a, testDoc3a);
        assert.equal(4, matches.size());

        var matches = Match.easyMatch(testDoc2a, testDoc3b);
        assert.equal(4, matches.size());
      });
    });
  
    describe('Test similar documents match partly.', function(){
      it('testSimilarDocs', function() {
        var matches = Match.easyMatch(testDoc2a, testDoc4a);

        var aDocEl = testDoc2a.documentElement;
        var partner = matches.getPartner(aDocEl);

        var bDocEl = testDoc4a.documentElement;
        assert.equal(bDocEl, partner);

        var aText = aDocEl.firstChild;
        assert.equal(null, matches.getPartner(aText));

        var aB = aText.nextSibling;
        assert.equal(null,matches.getPartner(aB));

        var aComment = aB.firstChild;
        partner = matches.getPartner(aComment);

        var bComment = bDocEl.firstChild.nextSibling.firstChild;
        assert.equal(bComment, partner);
      });
    });
  
    describe('Test documents with same elements but in different order match completely.', function(){
      it('testDifferentOrdering', function() {
        var doc1 = parseXmlDocument("<a><b/>c<z/><d/>e<f/></a>");
        var doc2 = parseXmlDocument("<a><b/>c<d/>e<f/><z/></a>");

        var matches = Match.easyMatch(doc1, doc2);

        var aDocEl = doc1.documentElement;
        var bDocEl = doc2.documentElement;
        assert.equal(bDocEl, matches.getPartner(aDocEl));

        var aB = aDocEl.firstChild;
        var bB = bDocEl.firstChild;
        assert.equal(bB, matches.getPartner(aB));

        var aC = aB.nextSibling;
        var bC = bB.nextSibling;
        assert.equal(bC, matches.getPartner(aC));

        var aZ = aC.nextSibling;
        var bD = bC.nextSibling;
        var aD = aZ.nextSibling;
        assert.equal(bD, matches.getPartner(aD));

        var aE = aD.nextSibling;
        var bE = bD.nextSibling;
        assert.equal(bE, matches.getPartner(aE));

        var aF = aE.nextSibling;
        var bF = bE.nextSibling;
        assert.equal(bF, matches.getPartner(aF));

        var bZ = bF.nextSibling;
        assert.equal(bZ, matches.getPartner(aZ));
      });
    });
  
    describe('Test elements with different attributes don\'t match.', function(){
      it('testElementsWithDiffAttrs', function() {
        var doc1 = parseXmlDocument("<a><b/><c a=\"1\"/></a>");
        var doc2 = parseXmlDocument("<a><b a=\"1\"/><c a=\"1\"/></a>");

        // a and c should match, b shouldn't
        var matches = Match.easyMatch(doc1, doc2);

        var decEl1 = doc1.documentElement;
        var docEl2 = doc2.documentElement;
        assert.equal(decEl1, matches.getPartner(docEl2));

        var b1 = decEl1.firstChild;
        assert.equal(null,matches.getPartner(b1));

        var c1 = b1.nextSibling;
        var c2 = docEl2.firstChild.nextSibling;
        assert.equal(c2, matches.getPartner(c1));
      });
    });
  
    describe('Test elements with different attributes aren\'t matched.', function(){
      it('testDifferingAttributes', function() {
        var doc1 = parseXmlDocument("<a><b a1=\"y\"/></a>");
        var doc2 = parseXmlDocument("<a><b a2=\"n\"/></a>");

        var matches = Match.easyMatch(doc1, doc2);
        var aDocEl = doc1.documentElement;
        var bDocEl = doc2.documentElement;
        assert.equal(bDocEl, matches.getPartner(aDocEl));

        var aB = aDocEl.firstChild;
        assert.equal(null,matches.getPartner(aB));
      });
    });

  });

}).call(this);