function NodeFifoTest(name) {
  TestCase.call(this, name);
}

NodeFifoTest.prototype = new TestCase();
NodeFifoTest.prototype.setUp = function() {
};

/**
 * Test an empty fifo is empty.
 */
NodeFifoTest.prototype.testEmptyFifo = function() {
  var fifo = new NodeFifo();
  this.assertTrue(fifo.isEmpty());
  this.assertNull(fifo.pop());
};

/**
 * Test nodes are pushed and popped in the right order.
 */
NodeFifoTest.prototype.testPushPopOrder = function() {

  var testDoc = parseXmlDocument("<a><b><c/></b></a>");
  var fifo = new NodeFifo();
  var docEl = testDoc.documentElement;
  fifo.push(docEl);
  this.assertEquals(docEl, fifo.pop());
  this.assertNull(fifo.pop());

  var b = docEl.firstChild;
  var c = docEl.firstChild.firstChild;

  fifo.push(docEl);
  fifo.push(b);
  fifo.push(c);

  this.assertEquals(docEl, fifo.pop());
  this.assertEquals(b, fifo.pop());
  this.assertEquals(c, fifo.pop());
  this.assertNull(fifo.pop());

};

/**
 * Test that children of a node are added in the correct order.
 */
NodeFifoTest.prototype.testAddChildrenOfNode = function() {

  var testDoc = parseXmlDocument("<a><b/><c/><d/></a>");

  var fifo = new NodeFifo();
  var docEl = testDoc.documentElement;
  fifo.push(docEl);
  fifo.addChildrenOfNode(docEl);

  this.assertEquals(docEl, fifo.pop());
  this.assertEquals("b", fifo.pop().nodeName);
  this.assertEquals("c", fifo.pop().nodeName);
  this.assertEquals("d", fifo.pop().nodeName);
  this.assertNull(fifo.pop());

  // Check nothing happens if add node with no children
  fifo.addChildrenOfNode(docEl.firstChild);
  this.assertNull(fifo.pop());

};

function NodeFifoTestSuite() {
  TestSuite.call(this, "NodeFifoTestSuite");
  this.addTestSuite(NodeFifoTest);
}

NodeFifoTestSuite.prototype = new TestSuite();
NodeFifoTestSuite.prototype.suite = function() {
  return new NodeFifoTestSuite();
};
