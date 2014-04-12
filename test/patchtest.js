(function() {
  var diffXmlJs = require('../diffxml');
  var DULParser = diffXmlJs.DULParser;
  var InternalPatch = diffXmlJs.InternalPatch;
  
  var DOMParser = require('xmldom').DOMParser;
  var assert = require('assert');

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };
  
  describe('PatchTestSuite', function(){
    
    it('Simple insert operation', function(){
      var doc1 = parseXmlDocument("<a></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"1\" name=\"b\"/></delta>"));
      var patch = new InternalPatch();
      patch.apply(doc1, delta);
      assert.equal("b", doc1.documentElement.firstChild.nodeName);
    });
    
    it('Insert element after text', function(){
      var doc1 = parseXmlDocument("<a>text</a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"2\" name=\"b\" charpos=\"5\" /></delta>"));
      (new InternalPatch()).apply(doc1, delta);
      var textNode = doc1.documentElement.firstChild;
      assert.equal("text", textNode.nodeValue);
      assert.equal("b", textNode.nextSibling.nodeName);
    });

    it('Insert element before text', function() {
      var doc1 = parseXmlDocument("<a>text</a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"1\" name=\"b\" charpos=\"1\" /></delta>"));
      (new InternalPatch()).apply(doc1, delta);
      var b = doc1.documentElement.firstChild;
      assert.equal("b", b.nodeName);
      assert.equal("text", b.nextSibling.nodeValue);
    });
    
    it('Insert element into text', function() {
      var doc1 = parseXmlDocument("<a>text</a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"1\" childno=\"2\" name=\"b\" charpos=\"2\" /></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var text1 = doc1.documentElement.firstChild;
      assert.equal("t", text1.nodeValue);
      assert.equal("b", text1.nextSibling.nodeName);
      assert.equal("ext", text1.nextSibling.nextSibling.nodeValue);
    });
    
    it('Insert element into text', function() {
      var doc1 = parseXmlDocument("<a>xy<b/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert charpos=\"2\" childno=\"2\" name=\"p\" nodetype=\"1\" parent=\"/node()[1]\"/></delta>"));
      (new InternalPatch()).apply(doc1, delta);
      var text1 = doc1.documentElement.firstChild;
      assert.equal("x", text1.nodeValue);
      assert.equal("p", text1.nextSibling.nodeName);
      assert.equal("y", text1.nextSibling.nextSibling.nodeValue);
    });
    
    it('Test inserting attribute', function() {
    
      var doc1 = parseXmlDocument("<a><b/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a/node()[1]\" nodetype=\"2\" name=\"attr\">val</insert></delta>"));

      (new InternalPatch()).apply(doc1, delta);
      var b = doc1.documentElement.firstChild;
      assert.equal("b", b.nodeName);
      assert.equal("val", b.attributes.getNamedItem("attr").value);
    });
    
    it('Test inserting comment', function() {
    
      var doc1 = parseXmlDocument("<a></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"" + Node.COMMENT_NODE + "\">val</insert>" + "</delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var comment = doc1.documentElement.firstChild;
      assert.equal(Node.COMMENT_NODE, comment.nodeType);
      assert.equal("val", comment.nodeValue);
    });
    
    it('Test inserting CDATA section', function() {
    
      var doc1 = parseXmlDocument("<a></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/a\" nodetype=\"" + Node.CDATA_SECTION_NODE + "\">val</insert>" + "</delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var comment = doc1.documentElement.firstChild;
      assert.equal(Node.CDATA_SECTION_NODE, comment.nodeType);
      assert.equal("val", comment.nodeValue);
    });
    
    it('Test simple delete operation', function() {
      var doc1 = parseXmlDocument("<a><b/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));

      (new InternalPatch()).apply(doc1, delta);
      assert.equal(null, doc1.documentElement.firstChild);
    });
    
    it('Test deleting attribute', function() {
      var doc1 = parseXmlDocument("<a><b attr=\"val\"/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]/@attr\" /></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      assert.equal(false, doc1.documentElement.firstChild.hasAttribute("attr"));
    });
    
    it('Test deleting comment', function() {
    
      var doc1 = parseXmlDocument("<a><!-- comment --></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
       assert.equal(null, doc1.documentElement.firstChild);
    });
    
    it('Test deleting whole text node and part of', function() {
    
      var doc1 = parseXmlDocument("<a>12<b/>3456</a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[1]\" /></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      assert.equal("b", doc1.documentElement.firstChild.nodeName);
    
      delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[2]\" charpos=\"2\" length=\"2\"/></delta>"));
      (new InternalPatch()).apply(doc1, delta);
      assert.equal(true, doc1.documentElement.firstChild.nextSibling != null);
      assert.equal("36", doc1.documentElement.firstChild.nextSibling.nodeValue);
    
      delta = DULParser.parseDULPatch(parseXmlDocument("<delta><delete node=\"/a/node()[2]\" charpos=\"1\" length=\"1\"/></delta>"));
      (new InternalPatch()).apply(doc1, delta);
      assert.equal(true, doc1.documentElement.firstChild.nextSibling != null);
      assert.equal("6", doc1.documentElement.firstChild.nextSibling.nodeValue);
    });
    
    it('Test simple move operation', function() {
    
      var doc1 = parseXmlDocument("<a><b/><c><d/></c></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"1\" /></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      assert.equal("d", doc1.documentElement.firstChild.firstChild.nodeName);
      assert.equal(null, doc1.documentElement.firstChild.nextSibling.firstChild);
    });
    
    it('Test moving into text', function() {
    
      var doc1 = parseXmlDocument("<a><b>text</b><c><d/></c></a>");
      var delta = DULParser
          .parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"2\" new_charpos=\"3\"/></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var b = doc1.documentElement.firstChild;
      assert.equal(null, b.nextSibling.firstChild);
      assert.equal("te", b.firstChild.nodeValue);
      assert.equal("d", b.firstChild.nextSibling.nodeName);
      assert.equal("xt", b.firstChild.nextSibling.nextSibling.nodeValue);
    });
    
    it('Test moving part of text', function() {
    
      var doc1 = parseXmlDocument("<a><b></b><c>text</c></a>");
      var delta = DULParser
          .parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[2]/node()[1]\" parent=\"/a/node()[1]\" childno=\"1\" old_charpos=\"2\" length=\"2\" new_charpos=\"3\"/></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var b = doc1.documentElement.firstChild;
      assert.equal("tt", b.nextSibling.firstChild.nodeValue);
      assert.equal("ex", b.firstChild.nodeValue);
    });
    
    it('Test moves don\'t count moved node', function() {
    
      var doc1 = parseXmlDocument("<a><b/><c/><d/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><move node=\"/a/node()[1]\" parent=\"/a\" childno=\"2\"/></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      c = doc1.documentElement.firstChild;
      assert.equal("c", c.nodeName);
      assert.equal("b", c.nextSibling.nodeName);
  });
    
    it('Test update of element', function() {
    
      var doc1 = parseXmlDocument("<a><b/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><update node=\"/a/b\">c</update></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      var c = doc1.documentElement.firstChild;
      assert.equal("c", c.nodeName);
    });
    
    it('Test update of attribute', function() {
    
      var doc1 = parseXmlDocument("<a><b attr=\"test\"/></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><update node=\"/a/b/@attr\">newval</update></delta>"));
      
      (new InternalPatch()).apply(doc1, delta);
      var c = doc1.documentElement.firstChild;
      assert.equal("newval", c.getAttribute("attr"));
    });
    
    it('Simple insert operation', function() {
    
      var doc1 = parseXmlDocument("<a></a>");
      var delta = DULParser.parseDULPatch(parseXmlDocument("<delta><insert parent=\"/\" nodetype=\"" + Node.COMMENT_NODE
          + "\" childno=\"1\">comment</insert></delta>"));
    
      (new InternalPatch()).apply(doc1, delta);
      assert.equal("comment", doc1.firstChild.nodeValue);
    });
  });
  
  
}).call(this);