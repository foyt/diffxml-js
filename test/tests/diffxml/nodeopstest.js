function NodeOpsTest(name) {
  TestCase.call(this, name);
}

NodeOpsTest.prototype = new TestCase();
NodeOpsTest.prototype.setUp = function() {
};

/**
 * Test getting the unique XPath for nodes.
 */

NodeOpsTest.prototype.testGetXPath = function () {
  //Create an XML doc, loop through nodes, confirming that doing a
  //getXPath then a select returns the node

  var testDoc = parseXmlDocument("<a>aa<b attr='test'>b<!-- comment -->c<c/></b>d</a>");
  var b = testDoc.documentElement.firstChild.nextSibling;
  
  //Old test to ensure comment nodes are processed
  this.assertEquals(b.firstChild.nextSibling.nodeType, Node.COMMENT_NODE);
  this.assertEquals(b.childNodes.item(1).nodeType, Node.COMMENT_NODE); 
  this._testXPathForNode(testDoc.documentElement);
};

/**
 * Test for the horrible coalesced text nodes issue.
 */

NodeOpsTest.prototype.testGetXPathWithTextNodes = function () {
    var testDoc = parseXmlDocument("<a>b</a>");
    var docEl = testDoc.documentElement;
    var b = docEl.firstChild;
    var c = testDoc.createTextNode("c\n");
    docEl.appendChild(c);
    var d = testDoc.createElement("d");
    docEl.appendChild(d);
    var e = testDoc.createTextNode("e");
    docEl.appendChild(e);
    var bxpath = NodeOps.getXPath(b);
    var cxpath = NodeOps.getXPath(c);
    var dxpath = NodeOps.getXPath(d);
    var expath = NodeOps.getXPath(e);

    //Have to normalize the doc for the XPath context to be correct.
    testDoc.normalize();
    
    //Move to beforeclass method
    // XPathFactory xPathFac = XPathFactory.newInstance();
    // XPath xp = xPathFac.newXPath();

    this._compareXPathResult(b, bxpath);       
    this._compareXPathResult(c, cxpath);       
    this._compareXPathResult(d, dxpath);       
    this._compareXPathResult(e, expath);       
};

/**
 * Test getting XPath for attributes.
 */

NodeOpsTest.prototype.testGetXPathForAttributes = function () {
  var testDoc = parseXmlDocument("<a><b attr=\"test\"/></a>");
  var docEl = testDoc.documentElement;
  var attrs = docEl.firstChild.attributes;
  this._testXPathForNode(attrs.item(0));
};

/**
 * Test getting XPath with namespaced element.
 */

NodeOpsTest.prototype.testGetXPathWithNamespace = function () {
  var testDoc = parseXmlDocument("<d:a xmlns:d=\"http://test.com\"><b/></d:a>");
  var docEl = testDoc.documentElement;
  this._testXPathForNode(docEl);
  this._testXPathForNode(docEl.firstChild);
};

/**
 * Test check for blank text nodes.
 */

NodeOpsTest.prototype.testCheckForBlankText = function () {
  var testDoc = parseXmlDocument("<a></a>");

  var nonBlank = testDoc.createTextNode("a");
  this.assertFalse(NodeOps.nodeIsEmptyText(nonBlank));

  var blank = testDoc.createTextNode("");
  this.assertTrue(NodeOps.nodeIsEmptyText(blank));
};

/**
 * Test getxPath with DTD thing in prolog.
 */

NodeOpsTest.prototype.testGetXPathWithDTDProlog = function () {
  var testDoc = parseXmlDocument("<!DOCTYPE a [ <!ELEMENT a (#PCDATA)>]><a>text</a>");
  this._testXPathForNode(testDoc);
};

/**
 * Test getXPath with comment in prolog.
 */

NodeOpsTest.prototype.testGetXPathWithCommentProlog = function () {
  var testDoc = parseXmlDocument("<!-- comment --><a>text</a>");
  this._testXPathForNode(testDoc);
};

/**
 * Test handling of newlines in text nodes.
 */

NodeOpsTest.prototype.testNewlineIsNotEmpty = function () {
  var testDoc = parseXmlDocument("<a>text</a>");
  var text1 = testDoc.createTextNode("\r");
  var text2 = testDoc.createTextNode("\r\n");
  var text3 = testDoc.createTextNode("\n");
  
  this.assertFalse(NodeOps.nodeIsEmptyText(text1));
  this.assertEquals(1, text1.nodeValue.length);
  this.assertFalse(NodeOps.nodeIsEmptyText(text2));
  this.assertEquals(2, text2.nodeValue.length);
  this.assertFalse(NodeOps.nodeIsEmptyText(text3));
  this.assertEquals(1, text3.nodeValue.length);
};

/**
 * Test getting XPath with spaced text nodes.
 */
NodeOpsTest.prototype.testGetXPathWithSpacedText = function () {
  var testDoc = parseXmlDocument("<a>x<b>4</b>y</a>");
  var docEl = testDoc.documentElement;
  this._testXPathForNode(docEl);
  this._testXPathForNode(docEl.firstChild);
};

/**
 * Helper method for testGetXPath.
 * 
 * Gets the XPath for the node and evaluates it, checking if the same node
 * is returned. 
 * 
 * DocumentType nodes are ignored as they cannot be identified by an XPath
 * 
 * @param n The node to test
 */
NodeOpsTest.prototype._testXPathForNode = function (n, xp) {
  if (n.nodeType != Node.DOCUMENT_TYPE_NODE) {
    var xpath = NodeOps.getXPath(n);
    this._compareXPathResult(n, xpath);
  };
};

/**
 * Compares the result of the xpath expression to the expected Node n.
 * 
 * Also tests children.
 *
 * @param n The expected result node
 * @param xpath The expression to evaluate
 */
NodeOpsTest.prototype._compareXPathResult = function (n, xpath) {
  var doc;
  if (n.nodeType == Node.DOCUMENT_NODE) {
    doc = n;
  } else {
    doc = n.ownerDocument;
  }
  
  var result = doc.evaluate(xpath, doc, null, XPathResult.NODE, null);
  var ret = result.iterateNext(); 
  this.assertNotNull(ret);

  if (n.nodeType == Node.TEXT_NODE) {
    this.assertTrue(ret.textContent + " does not contain " + n.textContent, ret.textContent.indexOf(n.textContent) != -1);
  } else {
    this.assertTrue(ret.nodeName + ":" + ret.nodeValue + " is not " + n.nodeName + ":" + n.nodeValue, n.isEqualNode(ret));
  }
    
  //Test children
  if (!(n.nodeType == Node.ATTRIBUTE_NODE)) {
    var list = n.childNodes;
    for (var i = 0; i < list.length; i++) {
      this._testXPathForNode(list.item(i));
    };
  };
};

function NodeOpsTestSuite() {
  TestSuite.call(this, "NodeOpsTestSuite");
  this.addTestSuite(NodeOpsTest);
}

NodeOpsTestSuite.prototype = new TestSuite();
NodeOpsTestSuite.prototype.suite = function() {
  return new NodeOpsTestSuite();
};
