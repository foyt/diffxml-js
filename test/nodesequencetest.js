(function() {
  var diffXmlJs = require('../diffxml');
  var Match = diffXmlJs.Match;
  var NodeSequence = diffXmlJs.NodeSequence;
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };

  describe('NodeSequence', function(){
    
    describe('Test getting sequence with all members in common.', function(){
      it('testSequenceAllInCommon', function() {
        var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var seq2 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var pairs = Match.easyMatch(seq1, seq2);

        var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);

        assert.equal(4, commSeq.length);
        assert.equal("b", commSeq[0].nodeName);
        assert.equal("#text", commSeq[1].nodeName);
        assert.equal("#comment", commSeq[2].nodeName);
        assert.equal("d", commSeq[3].nodeName);
      });
    });
    
    describe('Test getting a sequence with some in common.', function(){
      it('testSequenceSomeInCommon', function() {
        var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var seq2 = parseXmlDocument("<a><b/>d<!--comment--><d/></a>");

        var pairs = Match.easyMatch(seq1, seq2);
        var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);

        assert.equal(3, commSeq.length);
        assert.equal("b", commSeq[0].nodeName);
        assert.equal("#comment", commSeq[1].nodeName);
        assert.equal("d", commSeq[2].nodeName);
      });
    });
    
    describe('Test a sequence with no Nodes in common.', function(){
      it('testSequenceNoneInCommon', function() {
        var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var seq2 = parseXmlDocument("<a><e/>f<!--g--><h/></a>");
        var pairs = Match.easyMatch(seq1, seq2);
        var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, seq2.documentElement.childNodes, pairs);
        assert.equal(0, commSeq.length);
      });
    });
    
    describe('Test passing null to getSequence.', function(){
      it('testSequenceWithNull', function() {
        var seq1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var seq2 = parseXmlDocument("<a><e/>f<!--g--><h/></a>");
        var pairs = Match.easyMatch(seq1, seq2);

        var commSeq = NodeSequence.getSequence(seq1.documentElement.childNodes, null, pairs);
        assert.equal(null, commSeq);
      });
    });
    
    describe('Test LCS with all Nodes in common.', function(){
      it('testLCSAllInCommon', function() {
        var set1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var set2 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");

        var pairs = Match.easyMatch(set1, set2);
        assert.equal(12, pairs.size());

        var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
        var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

        assert.equal(4, seq1.length);
        assert.equal(4, seq2.length);

        var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

        assert.equal(4, lcs.length);
        assert.equal("b", lcs[0].nodeName);
        assert.equal("#text", lcs[1].nodeName);
        assert.equal("#comment", lcs[2].nodeName);
        assert.equal("d", lcs[3].nodeName);
      });
    });
    
    describe('Test LCS with one Node moved.', function(){
      it('testLCSNodeMoved', function() {
        var set1 = parseXmlDocument("<a><b/>c<!--comment--><d/></a>");
        var set2 = parseXmlDocument("<a>c<!--comment--><d/><b/></a>");
        var pairs = Match.easyMatch(set1, set2);

        var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
        var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

        assert.equal(4, seq1.length);
        assert.equal(4, seq2.length);

        var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

        assert.equal(3, lcs.length);
        assert.equal("#text", lcs[0].nodeName);
        assert.equal("#comment", lcs[1].nodeName);
        assert.equal("d", lcs[2].nodeName);
      });
    });
    
    describe('Test two sequences separated by a common misplaced element.', function(){
      it('testLCSWith2Seqs', function() {
        var set1 = parseXmlDocument("<a><b/>c<z/><d/>e<f/></a>");
        var set2 = parseXmlDocument("<a><b/>c<d/>e<f/><z/></a>");
        var pairs = Match.easyMatch(set1, set2);
        assert.equal(16, pairs.size());

        var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
        var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

        assert.equal(6, seq1.length);
        assert.equal(6, seq2.length);

        var lcs = NodeSequence.getLCS(seq1, seq2, pairs);

        assert.equal(5, lcs.length);
        assert.equal("b", lcs[0].nodeName);
        assert.equal("c", lcs[1].nodeValue);
        assert.equal("d", lcs[2].nodeName);
        assert.equal("e", lcs[3].nodeValue);
        assert.equal("f", lcs[4].nodeName);
      });
    });
    
    describe('Test two sequences with nothing in common.', function(){
      it('testLCSWithNoneInCommon', function() {
        var set1 = parseXmlDocument("<a><b/></a>");
        var set2 = parseXmlDocument("<d><e/></d>");
        var pairs = Match.easyMatch(set1, set2);
        // Remember root nodes and document elements always match
        assert.equal(4, pairs.size());

        var seq1 = NodeSequence.getSequence(set1.documentElement.childNodes, set2.documentElement.childNodes, pairs);
        var seq2 = NodeSequence.getSequence(set2.documentElement.childNodes, set1.documentElement.childNodes, pairs);

        assert.equal(0, seq1.length);
        assert.equal(0, seq2.length);

        var lcs = NodeSequence.getLCS(seq1, seq2, pairs);
        assert.equal(0, lcs.length);
      });
    });

  });

}).call(this);