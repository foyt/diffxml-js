(function() {
  var diffXmlJs = require('../diffxml');
  var xmldom = require('xmldom');
  var assert = require('assert');
  var xpath = require('xpath');
  
  var DOMParser = xmldom.DOMParser;
  var NodeOps = diffXmlJs.NodeOps;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };

  /**
   * Helper method for testGetXPath.
   * 
   * Gets the XPath for the node and evaluates it, checking if the same node is returned.
   * 
   * DocumentType nodes are ignored as they cannot be identified by an XPath
   * 
   * @param n
   *          The node to test
   */
  function testXPathForNode (n, xp) {
    if (n.nodeType != Node.DOCUMENT_TYPE_NODE) {
      var xpath = NodeOps.getXPath(n);
      compareXPathResult(n, xpath);
    };
  };

  /**
   * Compares the result of the xpath expression to the expected Node n.
   * 
   * Also tests children.
   * 
   * @param n
   *          The expected result node
   * @param xpath
   *          The expression to evaluate
   */
  function compareXPathResult (n, expression) {
    var doc;
    if (n.nodeType == Node.DOCUMENT_NODE) {
      doc = n;
    } else {
      doc = n.ownerDocument;
    }

    var ret = xpath.select1(expression, doc);
    assert.equal(true, !!ret);

    if (n.nodeType == Node.TEXT_NODE) {
      assert.equal(true, ret.textContent.indexOf(n.textContent) != -1, ret.textContent + " does not contain " + n.textContent);
    } else {
      assert.equal(true, n == ret, ret.nodeName + ":" + ret.nodeValue + " is not " + n.nodeName + ":" + n.nodeValue);
    }

    // Test children
    if (!(n.nodeType == Node.ATTRIBUTE_NODE)) {
      var list = n.childNodes;
      if (list) {
        for ( var i = 0; i < list.length; i++) {
          testXPathForNode(list.item(i));
        };
      }
    };
  };

  describe('NodeOps', function(){
  
    describe('Test getting the unique XPath for nodes.', function(){
      it('testGetXPath', function() {
        // Create an XML doc, loop through nodes, confirming that doing a
        // getXPath then a select returns the node

        var testDoc = parseXmlDocument("<a>aa<b attr='test'>b<!-- comment -->c<c/></b>d</a>");
        var b = testDoc.documentElement.firstChild.nextSibling;

        // Old test to ensure comment nodes are processed
        assert.equal(b.firstChild.nextSibling.nodeType, Node.COMMENT_NODE);
        assert.equal(b.childNodes.item(1).nodeType, Node.COMMENT_NODE);
        testXPathForNode(testDoc.documentElement);
      });
    });
    
    describe('testGetXPathWithTextNodes', function(){
      it('testGetXPathWithTextNodes', function() {
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

        // Have to normalize the doc for the XPath context to be correct.
        testDoc.normalize();

        // Move to beforeclass method
        // XPathFactory xPathFac = XPathFactory.newInstance();
        // XPath xp = xPathFac.newXPath();

        compareXPathResult(b, bxpath);
        compareXPathResult(c, cxpath);
        compareXPathResult(d, dxpath);
        compareXPathResult(e, expath);
      });
    });
  
    describe('Test getting XPath for attributes.', function(){
      it('testGetXPathForAttributes', function() {
        var testDoc = parseXmlDocument("<a><b attr=\"test\"/></a>");
        var docEl = testDoc.documentElement;
        var attrs = docEl.firstChild.attributes;
        testXPathForNode(attrs.item(0));
      });
    });
  
    describe('Test getting XPath with namespaced element.', function(){
      it('testGetXPathWithNamespace', function() {
        var testDoc = parseXmlDocument("<d:a xmlns:d=\"http://test.com\"><b/></d:a>");
        var docEl = testDoc.documentElement;
        testXPathForNode(docEl);
        testXPathForNode(docEl.firstChild);
      });
    });
  
    describe('Test check for blank text nodes.', function(){
      it('testCheckForBlankText', function() {
        var testDoc = parseXmlDocument("<a></a>");

        var nonBlank = testDoc.createTextNode("a");
        assert.equal(false,NodeOps.nodeIsEmptyText(nonBlank));

        var blank = testDoc.createTextNode("");
        assert.equal(true,NodeOps.nodeIsEmptyText(blank));
      });
    });
  
// TODO: Report this issue into xpath issue tracker
//    describe('Test getxPath with DTD thing in prolog.', function(){
//      it('testGetXPathWithDTDProlog', function() {
//        var testDoc = parseXmlDocument("<!DOCTYPE a [ <!ELEMENT a (#PCDATA)>]><a>text</a>");
//        testXPathForNode(testDoc);
//      });
//    });
  
    describe('Test getXPath with comment in prolog.', function(){
      it('testGetXPathWithCommentProlog', function() {
        var testDoc = parseXmlDocument("<!-- comment --><a>text</a>");
        testXPathForNode(testDoc);
      });
    });
  
    describe('Test handling of newlines in text nodes.', function(){
      it('testNewlineIsNotEmpty', function() {
        var testDoc = parseXmlDocument("<a>text</a>");
        var text1 = testDoc.createTextNode("\r");
        var text2 = testDoc.createTextNode("\r\n");
        var text3 = testDoc.createTextNode("\n");

        assert.equal(false,NodeOps.nodeIsEmptyText(text1));
        assert.equal(1, text1.nodeValue.length);
        assert.equal(false,NodeOps.nodeIsEmptyText(text2));
        assert.equal(2, text2.nodeValue.length);
        assert.equal(false,NodeOps.nodeIsEmptyText(text3));
        assert.equal(1, text3.nodeValue.length);
      });
    });
  
    describe('Test getting XPath with spaced text nodes.', function(){
      it('testGetXPathWithSpacedText', function() {
        var testDoc = parseXmlDocument("<a>x<b>4</b>y</a>");
        var docEl = testDoc.documentElement;
        testXPathForNode(docEl);
        testXPathForNode(docEl.firstChild);
      });
    });

  });

}).call(this);