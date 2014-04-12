function PatchTest(name) {
  TestCase.call(this, name);
};

PatchTest.prototype = new TestCase();
PatchTest.prototype.setUp = function() {
};

/**
 * Simple insert operation.
 */

PatchTest.prototype.testSimpleInsert = function() {
  var doc1 = parseXmlDocument("<a></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"1\" name=\"b\"/></delta>"));
  var patch = new InternalPatch();

  patch.apply(doc1, delta);

  this.assertEquals("b", doc1.documentElement.firstChild.nodeName);
};

/**
 * Insert element after text.
 */

PatchTest.prototype.testInsertAfterText = function() {
  var doc1 = parseXmlDocument("<a>text</a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"2\" name=\"b\" charpos=\"5\" /></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  var textNode = doc1.documentElement.firstChild;
  this.assertEquals("text", textNode.nodeValue);
  this.assertEquals("b", textNode.nextSibling.nodeName);
};

/**
 * Insert element before text.
 */

PatchTest.prototype.testInsertBeforeText = function() {
  var doc1 = parseXmlDocument("<a>text</a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"1\" name=\"b\" charpos=\"1\" /></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  var b = doc1.documentElement.firstChild;
  this.assertEquals("b", b.nodeName);
  this.assertEquals("text", b.nextSibling.nodeValue);
};

/**
 * Insert element into text.
 */

PatchTest.prototype.testInsertIntoText = function() {
  var doc1 = parseXmlDocument("<a>text</a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"2\" name=\"b\" charpos=\"2\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var text1 = doc1.documentElement.firstChild;
  this.assertEquals("t", text1.nodeValue);
  this.assertEquals("b", text1.nextSibling.nodeName);
  this.assertEquals("ext", text1.nextSibling.nextSibling.nodeValue);
};

/**
 * Insert element into text.
 */

PatchTest.prototype.testInsertIntoText2 = function() {
  var doc1 = parseXmlDocument("<a>xy<b/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert charpos=\"2\" childno=\"2\" name=\"p\" nodetype=\"1\" parent=\"/node()[1]\"/></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  var text1 = doc1.documentElement.firstChild;
  this.assertEquals("x", text1.nodeValue);
  this.assertEquals("p", text1.nextSibling.nodeName);
  this.assertEquals("y", text1.nextSibling.nextSibling.nodeValue);
};

/**
 * Test inserting attribute.
 */

PatchTest.prototype.testInsertingAttr = function() {

  var doc1 = parseXmlDocument("<a><b/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a/node()[1]\" nodetype=\"2\" name=\"attr\">val</insert></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var b = doc1.documentElement.firstChild;
  this.assertEquals("b", b.nodeName);
  this.assertEquals("val", b.attributes["attr"].value);
};

/**
 * Test inserting comment.
 */

PatchTest.prototype.testInsertingComment = function() {

  var doc1 = parseXmlDocument("<a></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"" + Node.COMMENT_NODE + "\">val</insert>" + "</delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var comment = doc1.documentElement.firstChild;
  this.assertEquals(Node.COMMENT_NODE, comment.nodeType);
  this.assertEquals("val", comment.nodeValue);
};

/**
 * Test inserting CDATA section.
 */

PatchTest.prototype.testInsertingCDATA = function() {

  var doc1 = parseXmlDocument("<a></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"" + Node.CDATA_SECTION_NODE + "\">val</insert>" + "</delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var comment = doc1.documentElement.firstChild;
  this.assertEquals(Node.CDATA_SECTION_NODE, comment.nodeType);
  this.assertEquals("val", comment.nodeValue);
};

/**
 * Test simple delete operation.
 */

PatchTest.prototype.testSimpleDelete = function() {

  var doc1 = parseXmlDocument("<a><b/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertNull(doc1.documentElement.firstChild);
};

/**
 * Test deleting attribute.
 */

PatchTest.prototype.testDeleteAttribute = function() {

  var doc1 = parseXmlDocument("<a><b attr=\"val\"/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]/@attr\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertNull(doc1.documentElement.firstChild.getAttribute("attr"));
};

/**
 * Test deleting comment.
 */

PatchTest.prototype.testDeleteComment = function() {

  var doc1 = parseXmlDocument("<a><!-- comment --></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertNull(doc1.documentElement.firstChild);
};

/**
 * Test deleting text.
 * 
 * Test deleting whole text node and part of.
 */

PatchTest.prototype.testDeleteText = function() {

  var doc1 = parseXmlDocument("<a>12<b/>3456</a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertEquals("b", doc1.documentElement.firstChild.nodeName);

  delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[2]\" charpos=\"2\" length=\"2\"/></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  this.assertTrue(doc1.documentElement.firstChild.nextSibling != null);
  this.assertEquals("36", doc1.documentElement.firstChild.nextSibling.nodeValue);

  delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[2]\" charpos=\"1\" length=\"1\"/></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  this.assertTrue(doc1.documentElement.firstChild.nextSibling != null);
  this.assertEquals("6", doc1.documentElement.firstChild.nextSibling.nodeValue);
};

/**
 * Test simple move operation.
 */

PatchTest.prototype.testSimpleMove = function() {

  var doc1 = parseXmlDocument("<a><b/><c><d/></c></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"1\" /></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertEquals("d", doc1.documentElement.firstChild.firstChild.nodeName);
  this.assertNull(doc1.documentElement.firstChild.nextSibling.firstChild);
};

/**
 * Test moving into text.
 */

PatchTest.prototype.testMoveIntoText = function() {

  var doc1 = parseXmlDocument("<a><b>text</b><c><d/></c></a>");
  var delta = DULParser
      .parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"2\" new_charpos=\"3\"/></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var b = doc1.documentElement.firstChild;
  this.assertNull(b.nextSibling.firstChild);
  this.assertEquals("te", b.firstChild.nodeValue);
  this.assertEquals("d", b.firstChild.nextSibling.nodeName);
  this.assertEquals("xt", b.firstChild.nextSibling.nextSibling.nodeValue);
};

/**
 * Test moving part of text.
 */

PatchTest.prototype.testMovePartOfText = function() {

  var doc1 = parseXmlDocument("<a><b></b><c>text</c></a>");
  var delta = DULParser
      .parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"1\" old_charpos=\"2\" length=\"2\" new_charpos=\"3\"/></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var b = doc1.documentElement.firstChild;
  this.assertEquals("tt", b.nextSibling.firstChild.nodeValue);
  this.assertEquals("ex", b.firstChild.nodeValue);
};

/**
 * Test moves don't count moved node.
 */

PatchTest.prototype.testMoveCount = function() {

  var doc1 = parseXmlDocument("<a><b/><c/><d/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[1]\" parent=\"/a\" childno=\"2\"/></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  c = doc1.documentElement.firstChild;
  this.assertEquals("c", c.nodeName);
  this.assertEquals("b", c.nextSibling.nodeName);
};

/**
 * Test update of element.
 */

PatchTest.prototype.testUpdateElement = function() {

  var doc1 = parseXmlDocument("<a><b/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><update node=\"/a/b\">c</update></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  var c = doc1.documentElement.firstChild;
  this.assertEquals("c", c.nodeName);
};

/**
 * Test update of attribute.
 */

PatchTest.prototype.testUpdateAttribute = function() {

  var doc1 = parseXmlDocument("<a><b attr=\"test\"/></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><update node=\"/a/b/@attr\">newval</update></delta>"));
  (new InternalPatch()).apply(doc1, delta);
  var c = doc1.documentElement.firstChild;
  this.assertEquals("newval", c.attributes["attr"].value);
};

/**
 * Simple insert operation.
 */

PatchTest.prototype.testInsertAtRoot = function() {

  var doc1 = parseXmlDocument("<a></a>");
  var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/\" nodetype=\"" + Node.COMMENT_NODE
      + "\" childno=\"1\">comment</insert></delta>"));

  (new InternalPatch()).apply(doc1, delta);
  this.assertEquals("comment", doc1.firstChild.nodeValue);
};

function PatchTestSuite() {
  TestSuite.call(this, "PatchTestSuite");
  this.addTestSuite(PatchTest);
}

PatchTestSuite.prototype = new TestSuite();
PatchTestSuite.prototype.suite = function() {
  return new PatchTestSuite();
};
