(function() {
  var diffXmlJs = require('../diffxml');
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;
  var NodeFifo = diffXmlJs.NodeFifo;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };

  describe('NodeFifo', function(){
    
    describe('Test an empty fifo is empty.', function(){
      it('testEmptyFifo', function() {
        var fifo = new NodeFifo();
        assert.equal(true, fifo.isEmpty());
        assert.equal(null,fifo.pop());
      });
    });
  
    describe('Test nodes are pushed and popped in the right order.', function(){
      it('testPushPopOrder', function() {
        var testDoc = parseXmlDocument("<a><b><c/></b></a>");
        var fifo = new NodeFifo();
        var docEl = testDoc.documentElement;
        fifo.push(docEl);
        assert.equal(docEl, fifo.pop());
        assert.equal(null,fifo.pop());

        var b = docEl.firstChild;
        var c = docEl.firstChild.firstChild;

        fifo.push(docEl);
        fifo.push(b);
        fifo.push(c);

        assert.equal(docEl, fifo.pop());
        assert.equal(b, fifo.pop());
        assert.equal(c, fifo.pop());
        assert.equal(null,fifo.pop());
      });
    });

    describe('Test that children of a node are added in the correct order.', function(){
      it('testAddChildrenOfNode', function() {
        var testDoc = parseXmlDocument("<a><b/><c/><d/></a>");

        var fifo = new NodeFifo();
        var docEl = testDoc.documentElement;
        fifo.push(docEl);
        fifo.addChildrenOfNode(docEl);

        assert.equal(docEl, fifo.pop());
        assert.equal("b", fifo.pop().nodeName);
        assert.equal("c", fifo.pop().nodeName);
        assert.equal("d", fifo.pop().nodeName);
        assert.equal(null,fifo.pop());

        // Check nothing happens if add node with no children
        fifo.addChildrenOfNode(docEl.firstChild);
        assert.equal(null,fifo.pop());
      });
    });
  
  });

}).call(this);