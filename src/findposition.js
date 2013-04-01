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
 * @class 
 * Finds the position to insert a Node at.
 * 
 * Calculates XPath, DOM and character position.
 */
FindPosition = DiffXmlUtils.createClass(null, {
  
  /**
   * Finds the child number to insert a node as.
   *
   * (Equivalent to the current child number of the node to insert
   * before)
   *
   * @param x         the node with no partner
   * @param matchings the set of matching nodes
   */
  init: function (x, matchings) {
    
    /** The DOM position. */
    this._insertPositionDOM = null;
    
    /** The XPath position. */
    this._insertPositionXPath = null;
    
    /** The character position. */
    this._charInsertPosition = null;
    
    var v = this._getInOrderLeftSibling(x);
    if (v == null) {
      this._insertPositionDOM = 0;
      this._insertPositionXPath = 1;
      this._charInsertPosition = 1;
    } else {
      /**
        * Get partner of v and return index after
        * (we want to insert after the previous in-order node, so that
        * w's position is equivalent to x's).
        */
      var u = matchings.getPartner(v);
      var uChildNo = new ChildNumber(u);
      //Need position after u
      this._insertPositionDOM = uChildNo.getInOrderDOM() + 1;
      this._insertPositionXPath = uChildNo.getInOrderXPath() + 1;
      //For xpath, character position is used if node is text node
      if (u.nodeType == Node.TEXT_NODE) {
        this._charInsertPosition = uChildNo.getInOrderXPathCharPos() + u.length;
      } else {
       this._charInsertPosition = 1;
      }
    }
  },
  proto : /** @lends FindPosition.prototype */ {
    /**
     * Gets the rightmost left sibling of n marked "inorder".
     *
     * @param n Node to find "in order" left sibling of
     * @return  Either the "in order" left sibling or null if none
     */
    _getInOrderLeftSibling: function (n) {
      var curr = n.previousSibling;
      while (curr != null && !NodeOps.isInOrder(curr)) {
        curr = curr.previousSibling;
      }

      return curr;
    },

    /**
     * Returns the DOM number the node should have when inserted.
     * 
     * @return the DOM number to insert the node as
     */
    getDOMInsertPosition: function () {
      return this._insertPositionDOM;
    },
    
    /**
     * Returns the XPath number the node should have when inserted.
     * 
     * @return The XPath number to insert the node as
     */
    getXPathInsertPosition: function () {
      return this._insertPositionXPath;
    },
    
    /**
     * Returns the character position to insert the node as.
     * 
     * @return The character position to insert the node at
     */
    getCharInsertPosition: function () {
      return this._charInsertPosition;
    }
  }  
});