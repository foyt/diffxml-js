function MatchTest(name) {
  TestCase.call(this, name);
}

MatchTest.prototype = new TestCase();
MatchTest.prototype.setUp = function() {
  this._testDoc1a = parseXmlDocument("<a><b><c/></b></a>");
  this._testDoc1b = parseXmlDocument("<a><b><c/></b></a>");
  this._testDoc2a = parseXmlDocument("<a>text1<b attr='b'><!-- comment --></b></a>");
  this._testDoc2b = parseXmlDocument("<a>text1<b attr='b'><!-- comment --></b></a>");
  this._testDoc3a = parseXmlDocument("<x><y><z/></y></x>");
  this._testDoc3b = parseXmlDocument("<x>different<y><!-- different --></y></x>");
  this._testDoc4a = parseXmlDocument("<a>newtext<b attr='c'><!-- comment --></b></a>");
};

/**
 * Just make sure a simple identical document with only elements matches correctly.
 */
MatchTest.prototype.testSimpleIdenticalDoc = function() {
  var all = Match.easyMatch(this._testDoc1a, this._testDoc1b);
  var aDocEl = this._testDoc1a.documentElement;
  var partner = all.getPartner(aDocEl);
  var bDocEl = this._testDoc1b.documentElement;
  this.assertEquals(bDocEl, partner);
  var aB = aDocEl.firstChild;
  var partner = all.getPartner(aB);

  var bB = bDocEl.firstChild;
  this.assertEquals(bB, partner);

  var aC = aB.firstChild;
  var partner = all.getPartner(aC);

  var bC = bB.firstChild;
  this.assertEquals(bC, partner);
};

/**
 * Now test identical doc with comments and text matches correctly.
 */
MatchTest.prototype.testIdenticalDocWithTextAndComments = function() {

  var all = Match.easyMatch(this._testDoc2a, this._testDoc2b);

  var aDocEl = this._testDoc2a.documentElement;
  var partner = all.getPartner(aDocEl);

  var bDocEl = this._testDoc2b.documentElement;
  this.assertEquals(bDocEl, partner);

  var aText = aDocEl.firstChild;
  partner = all.getPartner(aText);

  var bText = bDocEl.firstChild;
  this.assertEquals(bText, partner);

  var aB = aText.nextSibling;
  partner = all.getPartner(aB);

  var bB = bText.nextSibling;
  this.assertEquals(bB, partner);

  var aComment = aB.firstChild;
  partner = all.getPartner(aComment);

  var bComment = bB.firstChild;
  this.assertEquals(bComment, partner);
};

/**
 * Test completely different docs - only root nodes should match.
 */
MatchTest.prototype.testDifferentDocs = function() {

  // Remember both root and doc elements are forced to match
  var matches = Match.easyMatch(this._testDoc1a, this._testDoc3a);
  this.assertEquals(4, matches.size());

  var matches = Match.easyMatch(this._testDoc2a, this._testDoc3b);
  this.assertEquals(4, matches.size());
};

/**
 * Test similar documents match partly.
 */
MatchTest.prototype.testSimilarDocs = function() {
  var matches = Match.easyMatch(this._testDoc2a, this._testDoc4a);

  var aDocEl = this._testDoc2a.documentElement;
  var partner = matches.getPartner(aDocEl);

  var bDocEl = this._testDoc4a.documentElement;
  this.assertEquals(bDocEl, partner);

  var aText = aDocEl.firstChild;
  this.assertNull(matches.getPartner(aText));

  var aB = aText.nextSibling;
  this.assertNull(matches.getPartner(aB));

  var aComment = aB.firstChild;
  partner = matches.getPartner(aComment);

  var bComment = bDocEl.firstChild.nextSibling.firstChild;
  this.assertEquals(bComment, partner);

};

/**
 * Test documents with same elements but in different order match completely.
 */
MatchTest.prototype.testDifferentOrdering = function() {
  var doc1 = parseXmlDocument("<a><b/>c<z/><d/>e<f/></a>");
  var doc2 = parseXmlDocument("<a><b/>c<d/>e<f/><z/></a>");

  var matches = Match.easyMatch(doc1, doc2);

  var aDocEl = doc1.documentElement;
  var bDocEl = doc2.documentElement;
  this.assertEquals(bDocEl, matches.getPartner(aDocEl));

  var aB = aDocEl.firstChild;
  var bB = bDocEl.firstChild;
  this.assertEquals(bB, matches.getPartner(aB));

  var aC = aB.nextSibling;
  var bC = bB.nextSibling;
  this.assertEquals(bC, matches.getPartner(aC));

  var aZ = aC.nextSibling;
  var bD = bC.nextSibling;
  var aD = aZ.nextSibling;
  this.assertEquals(bD, matches.getPartner(aD));

  var aE = aD.nextSibling;
  var bE = bD.nextSibling;
  this.assertEquals(bE, matches.getPartner(aE));

  var aF = aE.nextSibling;
  var bF = bE.nextSibling;
  this.assertEquals(bF, matches.getPartner(aF));

  var bZ = bF.nextSibling;
  this.assertEquals(bZ, matches.getPartner(aZ));
};

/**
 * Test elements with different attributes don't match.
 */
MatchTest.prototype.testElementsWithDiffAttrs = function() {
  var doc1 = parseXmlDocument("<a><b/><c a=\"1\"/></a>");
  var doc2 = parseXmlDocument("<a><b a=\"1\"/><c a=\"1\"/></a>");

  // a and c should match, b shouldn't
  var matches = Match.easyMatch(doc1, doc2);

  var decEl1 = doc1.documentElement;
  var docEl2 = doc2.documentElement;
  this.assertEquals(decEl1, matches.getPartner(docEl2));

  var b1 = decEl1.firstChild;
  this.assertNull(matches.getPartner(b1));

  var c1 = b1.nextSibling;
  var c2 = docEl2.firstChild.nextSibling;
  this.assertEquals(c2, matches.getPartner(c1));
};

/**
 * Test elements with different attributes aren't matched.
 * 
 */
MatchTest.prototype.testDifferingAttributes = function() {
  var doc1 = parseXmlDocument("<a><b a1=\"y\"/></a>");
  var doc2 = parseXmlDocument("<a><b a2=\"n\"/></a>");

  var matches = Match.easyMatch(doc1, doc2);
  var aDocEl = doc1.documentElement;
  var bDocEl = doc2.documentElement;
  this.assertEquals(bDocEl, matches.getPartner(aDocEl));

  var aB = aDocEl.firstChild;
  this.assertNull(matches.getPartner(aB));
};

function MatchTestSuite() {
  TestSuite.call(this, "MatchTestSuite");
  this.addTestSuite(MatchTest);
}

MatchTestSuite.prototype = new TestSuite();
MatchTestSuite.prototype.suite = function() {
  return new MatchTestSuite();
};
