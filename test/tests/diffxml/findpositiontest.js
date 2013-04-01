function FindPositionTest(name) {
  TestCase.call(this, name);
}

FindPositionTest.prototype = new TestCase();
FindPositionTest.prototype.setUp = function() {
};

FindPositionTest.prototype.testElementInsert = function() {
  var testDoc1 = parseXmlDocument("<a><b/></a>");
  var testDoc2 = parseXmlDocument("<a><b/><c/></a>");
  var pairs = Match.easyMatch(testDoc1, testDoc2);
  var c = testDoc2.firstChild.firstChild.nextSibling;
  this.assertEquals("c", c.nodeName);
  var fp = new FindPosition(c, pairs);
  this.assertEquals(1, fp.getDOMInsertPosition());
  this.assertEquals(2, fp.getXPathInsertPosition());
  this.assertEquals(1, fp.getCharInsertPosition());
};

/**
 * Test where no leftmost match.
 */
FindPositionTest.prototype.testSimpleInsert = function() {
  var testDoc1 = parseXmlDocument("<a><b/><c/></a>");
  var testDoc2 = parseXmlDocument("<a><d/><e/></a>");
  var pairs = Match.easyMatch(testDoc1, testDoc2);
  // Need to mark d out-of-order for the algorithm to work
  NodeOps.setOutOfOrder(testDoc2.firstChild.firstChild);
  var e = testDoc2.firstChild.firstChild.nextSibling;
  this.assertEquals("e", e.nodeName);
  var fp = new FindPosition(e, pairs);
  this.assertEquals(0, fp.getDOMInsertPosition());
  this.assertEquals(1, fp.getXPathInsertPosition());
  this.assertEquals(1, fp.getCharInsertPosition());
};

/**
 * Test inserting a node after text with a leftmost match.
 */
FindPositionTest.prototype.testInsertingAfterText = function() {
  var testDoc1 = parseXmlDocument("<a>sometext</a>");
  var testDoc2 = parseXmlDocument("<a>sometext<b/></a>");
  var pairs = Match.easyMatch(testDoc1, testDoc2);
  var b = testDoc2.firstChild.firstChild.nextSibling;
  this.assertEquals("b", b.nodeName);
  var fp = new FindPosition(b, pairs);
  this.assertEquals(1, fp.getDOMInsertPosition());
  this.assertEquals(2, fp.getXPathInsertPosition());
  this.assertEquals(9, fp.getCharInsertPosition());
};

function FindPositionTestSuite() {
  TestSuite.call(this, "FindPositionTestSuite");
  this.addTestSuite(FindPositionTest);
}

FindPositionTestSuite.prototype = new TestSuite();
FindPositionTestSuite.prototype.suite = function() {
  return new FindPositionTestSuite();
};
