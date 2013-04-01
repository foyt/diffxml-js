/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Class to hold and calculate DOM and XPath child numbers of node.
 */
ChildNumber = DiffXmlUtils.createClass(null, {  
  /**
   * Default constructor.
   * 
   * @constructs
   * @param node Node to find the child numbers of
   */
  init: function (node) {
    if (node == null) {
      throw new Error("Node cannot be null");
    }
    
    if (node.parentNode == null) {
      throw new Error("Node must have parent");
    }
    
    // DOM child number.
    this._domChildNo = -1;

    // XPath child number.
    this._xPathChildNo = -1;

    // XPath char position.
    this._xPathCharPos = -1;

    // In-order DOM child number.
    this._inOrderDOMChildNo = -1;

    // In-order XPath child number.
    this._inOrderXPathChildNo = -1;
    
    // In-order XPath text position.
    this._inOrderXPathCharPos = -1;
    
    // The node we are doing the calcs on.
    this._node = node;
    
    // The siblings of the node and the node itself. 
    this._siblings = this._node.parentNode.childNodes;
  },
  proto : /** @lends ChildNumber.prototype */ {
    /**
     * Get the DOM child number.
     * 
     * @return DOM child number of associated node.
     */
    getDOM: function () {
      if (this._domChildNo == -1) {
        this._calculateDOMChildNumber();
      }
      
      return this._domChildNo;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getXPathCharPos: function() {
      if (this._xPathCharPos == -1) {
        this._calculateXPathChildNumberAndPosition();
      }
      
      return this._xPathCharPos;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getInOrderXPathCharPos: function () {
      if (this._inOrderXPathCharPos == -1) {
        this._calculateInOrderXPathChildNumberAndPosition();
      }
      
      return this._inOrderXPathCharPos;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getXPath: function() {
      if (this._xPathChildNo == -1) {
        this._calculateXPathChildNumberAndPosition();
      }
      
      return this._xPathChildNo;
    },

    /**
     * Get the in-order XPath child number.
     * 
     * Only counts nodes marked in-order.
     * 
     * @return In-order XPath child number of associated node.
     */
    getInOrderXPath: function() {
      if (this._inOrderXPathChildNo == -1) {
        this._calculateInOrderXPathChildNumberAndPosition();
      }
      
      return this._inOrderXPathChildNo;
    },

    /**
     * Get the in-order DOM child number.
     * 
     * Only counts nodes marked in-order.
     * 
     * @return In-order DOM child number of associated node.
     */
    getInOrderDOM: function () {
      if (this._inOrderXPathChildNo == -1) {
        this._calculateInOrderDOMChildNumber();
      }
      
      return this._inOrderDOMChildNo;
    },
    
    /**
     * Determines whether XPath index should be incremented.
     * 
     * Handles differences between DOM index and XPath index
     * 
     * @param i The current position in siblings
     * @return true If index should be incremented
     */
    _incIndex: function (i) {
      var inc = true;
      var curr = this._siblings.item(i);
      // Handle non-coalescing of text nodes
      if ((i > 0 && this._nodesAreTextNodes([curr, this._siblings.item(i - 1)])) || NodeOps.nodeIsEmptyText(curr)) {
        inc = false;
      }

      return inc;
    },
    
    /**
     * Determines whether the given Nodes are all text nodes or not.
     * 
     * @param nodes The Nodes to checks.
     * @return true if all the given Nodes are text nodes
     */
    _nodesAreTextNodes: function(nodes) {
      var areText = true;
      for (var i = 0, l = nodes.length; i < l; i++) {
        var n = nodes[i];
        if ((n == null) || (n.nodeType != Node.TEXT_NODE)) {
          areText = false;
          break;
        }
      }
        
      return areText;
    },

    /**
     * Calculates the DOM index of the node.
     */
    _calculateDOMChildNumber: function () {
      var cn;

      for (cn = 0; cn < this._siblings.length; cn++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(cn), this._node)) {
          break;
        }
      }
        
      this._domChildNo = cn;
    },

    /**
     * Calculates the "in order" DOM child number of the node.
     */
    _calculateInOrderDOMChildNumber: function () {
      this._inOrderDOMChildNo = 0;
      for (var i = 0; i < this._siblings.length; i++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(i), this._node)) {
          break;
        }
        
        if (NodeOps.isInOrder(this._siblings.item(i))) {
          this._inOrderDOMChildNo++;
        }
      }
    },

    /**
     * Sets the XPath child number and text position.
     */
    _calculateXPathChildNumberAndPosition: function () {
      var domIndex = this._calculateXPathChildNumber();
      this._calculateXPathTextPosition(domIndex);   
    },

    /**
     * Sets the XPath child number and text position.
     */
    _calculateInOrderXPathChildNumberAndPosition: function () {
      var domIndex = this._calculateInOrderXPathChildNumber();
      this._calculateInOrderXPathTextPosition(domIndex);   
    },
    
    /**
     * Calculate the character position of the node.
     * 
     * @param domIndex The DOM index of the node in its siblings.
     */
    _calculateXPathTextPosition: function(domIndex) {
      this._xPathCharPos = 1;
      for (var i = (domIndex - 1); i >= 0; i--) {
        if (this._siblings.item(i).nodeType == Node.TEXT_NODE) {
          this._xPathCharPos = this._xPathCharPos + this._siblings.item(i).length;
        } else {
          break;
        }
      }
    },

    /**
     * Set the XPath child number of the node.
     * 
     * @return The DOM index of the node in its siblings
     */
    _calculateXPathChildNumber: function () {
      var childNo = 1;
      var domIndex;
      for (domIndex = 0; domIndex < this._siblings.length; domIndex++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(domIndex), this._node)) {
          if (!this._incIndex(domIndex)) {
            childNo--;
          }
          break;
        }
        if (this._incIndex(domIndex)) {
          childNo++;
        }
      }
      
      this._xPathChildNo = childNo;
        
      return domIndex;
    },

    /**
     * Set the in-order XPath child number of the node.
     * 
     * @return The DOM index of the node in its siblings
     */
    _calculateInOrderXPathChildNumber: function () {

      var childNo = 0;
      var domIndex;
      var lastInOrderNode = null;
      var currNode = null;
      
      for (domIndex = 0; domIndex < this._siblings.length; domIndex++) {
        currNode = this._siblings.item(domIndex);
        if (NodeOps.isInOrder(currNode) && !(this._nodesAreTextNodes([currNode, lastInOrderNode]) || NodeOps.nodeIsEmptyText(currNode))) {
          childNo++;
        } 
        
        if (NodeOps.checkIfSameNode(currNode, this._node)) {
          break;
        }
        
        if (NodeOps.isInOrder(currNode)) {
          lastInOrderNode = currNode;
        }
      }
 
      //Add 1 if the given node wasn't in order
      if (currNode != null && !NodeOps.isInOrder(currNode)) {
        childNo++;
      }
 
      this._inOrderXPathChildNo = childNo;
      return domIndex;
    },

    /**
     * Calculate the character position of the node.
     * 
     * @param domIndex The DOM index of the node in its siblings.
     */
    _calculateInOrderXPathTextPosition: function (domIndex) {
      this._inOrderXPathCharPos = 1;
      
      for (var i = (domIndex - 1); i >= 0; i--) {
        if (this._siblings.item(i).nodeType == Node.TEXT_NODE) {
          if (NodeOps.isInOrder(this._siblings.item(i))) { 
            this._inOrderXPathCharPos = this._inOrderXPathCharPos + this._siblings.item(i).length;
          }
        } else if (NodeOps.isInOrder(this._siblings.item(i))) {
          break;
        }
      }
    }
  }  
});