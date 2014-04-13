(function() {
  var diffXmlJs = require('../diffxml');
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;
  var NodeDepth = diffXmlJs.NodeDepth;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };
  
  /**
   * Helper method for testing nodes.
   * 
   * @param n The node to test
   * @param expectedDepth The expected depth of the node
   */
  function testCreatingNodeDepth(n, expectedDepth) {
    var depthTest = new NodeDepth(n);
    assert.equal(expectedDepth, depthTest.getDepth());
    assert.equal(n, depthTest.getNode());
  };


  describe('NodeDepth', function(){
  
    describe('Test calculating depth of nodes in document.', function(){
      it('testCorrectDepthCalculated', function() {
        var testDoc1 = parseXmlDocument("<x>text1<y><!-- comment --><z/>text2</y></x>");

        // Try root
        testCreatingNodeDepth(testDoc1, 0);

        // Try document element
        var docEl = testDoc1.documentElement;
        testCreatingNodeDepth(docEl, 1);

        // Try first text node
        var text1 = docEl.firstChild;
        testCreatingNodeDepth(text1, 2);

        // y Node
        var y = text1.nextSibling;
        testCreatingNodeDepth(y, 2);

        // Comment node
        var comment = y.firstChild;
        testCreatingNodeDepth(comment, 3);

        // z Node
        var z = comment.nextSibling;
        testCreatingNodeDepth(z, 3);

        // second text node
        var text2 = z.nextSibling;
        testCreatingNodeDepth(text2, 3);
      });
    });

  });

}).call(this);