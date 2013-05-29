function EditScriptTest(name) {
  TestCase.call(this, name);
}

EditScriptTest.prototype = new TestCase();
EditScriptTest.prototype.setUp = function() {
};

/**
 * Test handling documents with different document elements.
 */

EditScriptTest.prototype.testNonMatchingDocumentElements = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><c><b/></c>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(6, matchings.size());
  this.assertNull(matchings.getPartner(doc2.firstChild.firstChild.nextSibling));
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();
  this.assertEquals(1, delta.getUpdated().length);
  this.assertEquals("/node()[1]", delta.getUpdated()[0].node);
  this.assertEquals("c", delta.getUpdated()[0].nodeName);
};

/**
 * Test handling differences in prolog.
 */

EditScriptTest.prototype.testDifferentProlog = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><!-- prolog1 --><a><b/></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><!-- prolog2 --><a><b/></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(6, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();

  this.assertEquals(1, delta.getInserted().length);
  this.assertEquals("/", delta.getInserted()[0].parent);
  this.assertEquals(1, delta.getInserted()[0].childNo);
  this.assertEquals(Node.COMMENT_NODE, delta.getInserted()[0].nodeType);
  this.assertEquals(" prolog2 ", delta.getInserted()[0].value);

  this.assertEquals(1, delta.getDeleted().length);
  this.assertEquals("/node()[2]", delta.getDeleted()[0].node);
};

/**
 * Test the simple addition of an element.
 */

EditScriptTest.prototype.testSimpleInsert = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/><c/></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(6, matchings.size());
  this.assertNull(matchings.getPartner(doc2.firstChild.firstChild.nextSibling));
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();

  this.assertEquals(1, delta.getInserted().length);
  this.assertEquals(2, delta.getInserted()[0].childNo);
  this.assertEquals("c", delta.getInserted()[0].nodeName);
  this.assertEquals("/node()[1]", delta.getInserted()[0].parent);
  this.assertEquals(Node.ELEMENT_NODE, delta.getInserted()[0].nodeType);
};

/**
 * Test the simple deletion of an element.
 */

EditScriptTest.prototype.testSimpleDeletion = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/><c/></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(6, matchings.size());
  this.assertNull(matchings.getPartner(doc1.firstChild.firstChild.nextSibling));
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();
  this.assertEquals(1, delta.getDeleted().length);
  this.assertEquals('/node()[1]/node()[2]', delta.getDeleted()[0].node);
};

/**
 * Test the simple move of an element.
 */

EditScriptTest.prototype.testSimpleMove = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b><c/></b><d/></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/><d><c/></d></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(10, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();
  this.assertEquals(1, delta.getMoved().length);
  this.assertEquals("/node()[1]/node()[1]/node()[1]", delta.getMoved()[0].node);
  this.assertEquals(1, delta.getMoved()[0].childNo);
  this.assertEquals("/node()[1]/node()[2]", delta.getMoved()[0].parent);
};

/**
 * Test insert after text.
 */

EditScriptTest.prototype.testInsertAfterText = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a>text</a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a>text<b/></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(6, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();
  this.assertEquals(1, delta.getInserted().length);
  this.assertEquals(2, delta.getInserted()[0].childNo);
  this.assertEquals(5, delta.getInserted()[0].charpos);
  this.assertEquals(Node.ELEMENT_NODE, delta.getInserted()[0].nodeType);
  this.assertEquals("/node()[1]", delta.getInserted()[0].parent);
};

/**
 * Test mis-aligned nodes.
 */
EditScriptTest.prototype.testMisalignedNodes = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a>b<c/>b</a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a>z<c/>b</a>');
  var matchings = new NodePairs();
  var docEl1 = doc1.documentElement;
  var docEl2 = doc2.documentElement;

  matchings.add(doc1, doc2);
  matchings.add(docEl1, docEl2);
  matchings.add(docEl1.firstChild, docEl2.firstChild.nextSibling.nextSibling);
  matchings.add(docEl1.firstChild.nextSibling, docEl2.firstChild.nextSibling);
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();

  this.assertEquals(1, delta.getMoved().length);
  this.assertEquals(2, delta.getMoved()[0].childNo);
  this.assertEquals("/node()[1]", delta.getMoved()[0].parent);
  this.assertEquals("/node()[1]/node()[1]", delta.getMoved()[0].node);
  this.assertEquals(1, delta.getMoved()[0].ncharpos);
  this.assertEquals(1, delta.getMoved()[0].ocharpos);

  this.assertEquals(1, delta.getInserted().length);
  this.assertEquals(1, delta.getInserted()[0].childNo);
  this.assertEquals("/node()[1]", delta.getInserted()[0].parent);
  this.assertEquals(Node.TEXT_NODE, delta.getInserted()[0].nodeType);
  this.assertEquals("z", delta.getInserted()[0].value);

  this.assertEquals(1, delta.getDeleted().length);
  this.assertEquals("/node()[1]/node()[3]", delta.getDeleted()[0].node);
  this.assertEquals(1, delta.getDeleted()[0].length);
  this.assertEquals(2, delta.getDeleted()[0].charpos);
};

/**
 * Test inserting and moving where marked order of nodes is important.
 */
EditScriptTest.prototype.testOrdering = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a><c>6</c><b>7</b></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b>6</b><b>7</b></a>');

  var matchings = Match.easyMatch(doc1, doc2);

  this.assertEquals(10, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();

  this.assertEquals(4, delta.getChanges().length);

  this.assertEquals("insert", delta.getChanges()[0].type);
  this.assertEquals(Node.ELEMENT_NODE, delta.getChanges()[0].nodeType);
  this.assertEquals(3, delta.getChanges()[0].childNo);
  this.assertEquals('b', delta.getChanges()[0].nodeName);
  this.assertEquals("/node()[1]", delta.getChanges()[0].parent);

  this.assertEquals("move", delta.getChanges()[1].type);
  this.assertEquals(1, delta.getChanges()[1].childNo);
  this.assertEquals("/node()[1]/node()[2]", delta.getChanges()[1].parent);
  this.assertEquals("/node()[1]/node()[1]/node()[1]", delta.getChanges()[1].node);
  this.assertEquals(1, delta.getChanges()[1].ncharpos);
  this.assertEquals(1, delta.getChanges()[1].ocharpos);

  this.assertEquals("move", delta.getChanges()[2].type);
  this.assertEquals(1, delta.getChanges()[2].childNo);
  this.assertEquals("/node()[1]/node()[3]", delta.getChanges()[2].parent);
  this.assertEquals("/node()[1]/node()[2]/node()[1]", delta.getChanges()[2].node);
  this.assertEquals(1, delta.getChanges()[2].ncharpos);
  this.assertEquals(2, delta.getChanges()[2].ocharpos);

  this.assertEquals("delete", delta.getChanges()[3].type);
  this.assertEquals("/node()[1]/node()[1]", delta.getChanges()[3].node);
};

/**
 * Test for irritating bug where unmatched node breaks text.
 */
EditScriptTest.prototype.testNumberingBug = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><a>x<b/>y</a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a>x<p/>y<b/></a>');

  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(10, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();

  this.assertEquals(2, delta.getChanges().length);

  this.assertEquals("move", delta.getChanges()[0].type);
  this.assertEquals(2, delta.getChanges()[0].childNo);
  this.assertEquals("/node()[1]", delta.getChanges()[0].parent);
  this.assertEquals("/node()[1]/node()[2]", delta.getChanges()[0].node);
  this.assertEquals(3, delta.getChanges()[0].ncharpos);
  this.assertEquals(2, delta.getChanges()[0].ocharpos);
};

/**
 * Test for DocumentType node handling.
 * 
 * Note DocumentType nodes can't be differenced, as can't be referenced by XPath.
 */
EditScriptTest.prototype.testDocumentType = function() {
  var doc1 = parseXmlDocument('<?xml version="1.0"?><!DOCTYPE a [ ]><a></a>');
  var doc2 = parseXmlDocument('<?xml version="1.0"?><a></a>');
  var matchings = Match.easyMatch(doc1, doc2);
  this.assertEquals(4, matchings.size());
  var es = new EditScript(doc1, doc2, matchings);
  var delta = es.create();
  this.assertEquals(0, delta.getChanges().length);
};

function EditScriptTestSuite() {
  TestSuite.call(this, "EditScriptTestSuite");
  this.addTestSuite(EditScriptTest);
}

EditScriptTestSuite.prototype = new TestSuite();
EditScriptTestSuite.prototype.suite = function() {
  return new EditScriptTestSuite();
};
