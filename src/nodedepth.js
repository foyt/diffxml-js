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
 * @class Associates depth with a node.
 */
NodeDepth = DiffXmlUtils.createClass(null, {
  /**
   * Create a NodeDepth for the given node.
   *
   * @constructs
   * @param node The node to find the depth of
   */
  init: function (node) {
    // Node we're pointing to.
    this._node = node;

    // Field holding nodes depth.
    this._depth = this._calculateDepth(this._node);
  },
  proto : /** @lends NodeDepth.prototype */ {
    
    /**
     * Returns the depth value.
     *
     * @return The current depth value
     */
    getDepth: function () {
      return this._depth;
    },
    
    /**
     * Returns the underlying node.
     *
     * @return The Node.
     */
    getNode: function () {
      return this._node;  
    },
    
    /**
     * Calculates the depth of a Node.
     * 
     * The root Node is at depth 0.
     * 
     * @param node The Node to calculate the depth of
     * @return The depth of the node
     */
    _calculateDepth: function (node) {
      var depth = 0;
      var tmpNode = node;
      var doc;
      if (node.nodeType == Node.DOCUMENT_NODE) {
        doc = node;
      } else {
        doc = tmpNode.ownerDocument;
      }

      while (tmpNode != doc) {
        depth++;
        tmpNode = tmpNode.parentNode;
      }
      
      return depth;
    }
  }  
});