function NodeDepthTest(name) {
  TestCase.call(this, name);
}

NodeDepthTest.prototype = new TestCase();
NodeDepthTest.prototype.setUp = function() {
  this._testDoc1 = parseXmlDocument("<x>text1<y><!-- comment --><z/>text2</y></x>");
};

/**
 * Helper method for testing nodes.
 * 
 * @param n The node to test
 * @param expectedDepth The expected depth of the node
 */
NodeDepthTest.prototype._testCreatingNodeDepth = function(n, expectedDepth) {
  var depthTest = new NodeDepth(n);
  this.assertEquals(expectedDepth, depthTest.getDepth());
  this.assertEquals(n, depthTest.getNode());
};

/**
 * Test calculating depth of nodes in document.
 */
NodeDepthTest.prototype.testCorrectDepthCalculated = function() {

  // Try root
  this._testCreatingNodeDepth(this._testDoc1, 0);

  // Try document element
  var docEl = this._testDoc1.documentElement;
  this._testCreatingNodeDepth(docEl, 1);

  // Try first text node
  var text1 = docEl.firstChild;
  this._testCreatingNodeDepth(text1, 2);

  // y Node
  var y = text1.nextSibling;
  this._testCreatingNodeDepth(y, 2);

  // Comment node
  var comment = y.firstChild;
  this._testCreatingNodeDepth(comment, 3);

  // z Node
  var z = comment.nextSibling;
  this._testCreatingNodeDepth(z, 3);

  // second text node
  var text2 = z.nextSibling;
  this._testCreatingNodeDepth(text2, 3);
};

function NodeDepthTestSuite() {
  TestSuite.call(this, "NodeDepthTestSuite");
  this.addTestSuite(NodeDepthTest);
};

NodeDepthTestSuite.prototype = new TestSuite();
NodeDepthTestSuite.prototype.suite = function() {
  return new NodeDepthTestSuite();
};
