function NodePairsTest(name) {
  TestCase.call(this, name);
}

NodePairsTest.prototype = new TestCase();
NodePairsTest.prototype.setUp = function() {
  this._testDoc1 = parseXmlDocument("<a><b/><c/><d/></a>");
  this._testDoc2 = parseXmlDocument("<w><x/><y/><z/></w>");
};

/**
 * Make sure the correct partner for a node is found.
 */
NodePairsTest.prototype.testGetsCorrectPartner = function() {
  var pairs = new NodePairs();
  this.assertEquals(0, pairs.size());
  var a = this._testDoc1.documentElement;
  var w = this._testDoc2.documentElement;
  this.assertNull(pairs.getPartner(a));
  this.assertFalse(pairs.isMatched(a));
  this.assertFalse(pairs.isMatched(w));
  pairs.add(a, w);
  this.assertEquals(w, pairs.getPartner(a));
  this.assertEquals(a, pairs.getPartner(w));
  this.assertEquals(2, pairs.size());
  this.assertTrue(pairs.isMatched(a));
  this.assertTrue(pairs.isMatched(w));

  var b = a.firstChild;
  var x = w.firstChild;
  pairs.add(x, b);

  var c = b.nextSibling;
  var y = x.nextSibling;
  pairs.add(c, y);

  var d = c.nextSibling;
  var z = y.nextSibling;
  this.assertNull(pairs.getPartner(z));
  pairs.add(d, z);

  this.assertEquals(b, pairs.getPartner(x));
  this.assertEquals(x, pairs.getPartner(b));
  this.assertEquals(c, pairs.getPartner(y));
  this.assertEquals(y, pairs.getPartner(c));
  this.assertEquals(d, pairs.getPartner(z));
  this.assertEquals(z, pairs.getPartner(d));
  this.assertEquals(8, pairs.size());
};

function NodePairsTestSuite() {
  TestSuite.call(this, "NodePairsTestSuite");
  this.addTestSuite(NodePairsTest);
}

NodePairsTestSuite.prototype = new TestSuite();
NodePairsTestSuite.prototype.suite = function() {
  return new NodePairsTestSuite();
};
