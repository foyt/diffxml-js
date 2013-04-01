function NodeSequenceTest(name) {
  TestCase.call(this, name);
}

NodeSequenceTest.prototype = new TestCase();

/**
 * Test getting sequence with all members in common.
 */
NodeSequenceTest.prototype.testSequenceAllInCommon = function() {

  var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var seq2 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var pairs = Match.easyMatch(seq1, seq2);

  var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);

  this.assertEquals(4, commSeq.length);
  this.assertEquals("b", commSeq[0].nodeName);
  this.assertEquals("#text", commSeq[1].nodeName);
  this.assertEquals("#comment", commSeq[2].nodeName);
  this.assertEquals("d", commSeq[3].nodeName);
};

/**
 * Test getting a sequence with some in common.
 */
NodeSequenceTest.prototype.testSequenceSomeInCommon = function() {

  var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var seq2 = parseXmlDocument("<a><b/>d<!--comment--><d/></a>");

  var pairs = Match.easyMatch(seq1, seq2);
  var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);

  this.assertEquals(3, commSeq.length);
  this.assertEquals("b", commSeq[0].nodeName);
  this.assertEquals("#comment", commSeq[1].nodeName);
  this.assertEquals("d", commSeq[2].nodeName);
};

/**
 * Test a sequence with no Nodes in common.
 */
NodeSequenceTest.prototype.testSequenceNoneInCommon = function() {

  var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var seq2 = parseXmlDocument("<a><e/>f<!--g--><h/></a>");
  var pairs = Match.easyMatch(seq1, seq2);
  var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);
  this.assertEquals(0, commSeq.length);
};

/**
 * Test passing null to getSequence.
 */
NodeSequenceTest.prototype.testSequenceWithNull = function() {

  var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var seq2 = parseXmlDocument("<a><e/>f<!--g--><h/></a>");
  var pairs = Match.easyMatch(seq1, seq2);

  var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, null, pairs);
  this.assertNull(commSeq);
};

/**
 * Test LCS with all Nodes in common.
 */
NodeSequenceTest.prototype.testLCSAllInCommon = function() {
  var set1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var set2 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");

  var pairs = Match.easyMatch(set1, set2);
  this.assertEquals(12, pairs.size());

  var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
  var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

  this.assertEquals(4, seq1.length);
  this.assertEquals(4, seq2.length);

  var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

  this.assertEquals(4, lcs.length);
  this.assertEquals("b", lcs[0].nodeName);
  this.assertEquals("#text", lcs[1].nodeName);
  this.assertEquals("#comment", lcs[2].nodeName);
  this.assertEquals("d", lcs[3].nodeName);
};

/**
 * Test LCS with one Node moved.
 */
NodeSequenceTest.prototype.testLCSNodeMoved = function() {

  var set1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
  var set2 = parseXmlDocument("<a>c<!--comment--><d/><b/></a>");
  var pairs = Match.easyMatch(set1, set2);

  var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
  var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

  this.assertEquals(4, seq1.length);
  this.assertEquals(4, seq2.length);

  var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

  this.assertEquals(3, lcs.length);
  this.assertEquals("#text", lcs[0].nodeName);
  this.assertEquals("#comment", lcs[1].nodeName);
  this.assertEquals("d", lcs[2].nodeName);
};

/**
 * Test two sequences separated by a common misplaced element.
 */
NodeSequenceTest.prototype.testLCSWith2Seqs = function() {

  var set1 = parseXmlDocument("<a><b/>c<z/><d/>e<f/></a>");
  var set2 = parseXmlDocument("<a><b/>c<d/>e<f/><z/></a>");
  var pairs = Match.easyMatch(set1, set2);
  this.assertEquals(16, pairs.size());

  var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
  var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

  this.assertEquals(6, seq1.length);
  this.assertEquals(6, seq2.length);

  var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

  this.assertEquals(5, lcs.length);
  this.assertEquals("b", lcs[0].nodeName);
  this.assertEquals("c", lcs[1].nodeValue);
  this.assertEquals("d", lcs[2].nodeName);
  this.assertEquals("e", lcs[3].nodeValue);
  this.assertEquals("f", lcs[4].nodeName);
};

/**
 * Test two sequences with nothing in common.
 */
NodeSequenceTest.prototype.testLCSWithNoneInCommon = function() {

  var set1 = parseXmlDocument("<a><b/></a>");
  var set2 = parseXmlDocument("<d><e/></d>");
  var pairs = Match.easyMatch(set1, set2);
  // Remember root nodes and document elements always match
  this.assertEquals(4, pairs.size());

  var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
  var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

  this.assertEquals(0, seq1.length);
  this.assertEquals(0, seq2.length);

  var lcs = NodeSequence.getLCS(seq1, seq2, pairs);
  this.assertEquals(0, lcs.length);

};

function NodeSequenceTestSuite() {
  TestSuite.call(this, "NodeSequenceTestSuite");
  this.addTestSuite(NodeSequenceTest);
}

NodeSequenceTestSuite.prototype = new TestSuite();
NodeSequenceTestSuite.prototype.suite = function() {
  return new NodeSequenceTestSuite();
};
