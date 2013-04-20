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
 * @class Class to hold pairs of nodes.
 */
NodePairs = DiffXmlUtils.createClass(null, {
  /**
   * Constructor
   * @constructs
   */
  init: function () {
    this._pairs = new Object();
    this._pairCount = 0;
    this._hashCounter = new Date().getTime();
  },
  proto : /** @lends NodePairs.prototype */ {
    /**
     * Adds a pair of nodes to the set. Sets UserData as matched.
     * 
     * @param x first node
     * @param y partner of first node
     */
    add: function (x, y) {
      var xHash = ++this._hashCounter; 
      var yHash = ++this._hashCounter; 
    
      this._pairs[xHash] = y;
      this._pairs[yHash] = x;
      this._pairCount += 2;
      
      NodeOps.setUserData(x, "hash", xHash);
      NodeOps.setUserData(y, "hash", yHash);

      this._setMatched(x, y);
    },

    /**
     * Mark the node as being "matched".
     *
     * @param n the node to mark as "matched"
     */
    _setMatchedNode: function (n) {
      NodeOps.setUserData(n, "matched", true);
    },

    /**
     * Check if node is marked "matched".
     *
     * Made static so that I can use a instance method later if it is faster or
     * better.
     * 
     * @param n node to check
     * @return true if marked "matched", false otherwise
     */
    isMatched: function (n) {
      var data = NodeOps.getUserData(n, "matched");
      return data == null ? false : data;
    },
    
    /**
     * Mark a pair of nodes as matched.
     *
     * @param nodeA  The unmatched partner of nodeB
     * @param nodeB  The unmatched partner of nodeA
     */
    _setMatched: function (nodeA, nodeB) {
      this._setMatchedNode(nodeA);
      this._setMatchedNode(nodeB);
    },
    
    /**
     * Returns the partner of a given node. Returns null if the node does not
     * exist.
     * 
     * @param n the node to find the partner of.
     * @return the partner of n.
     */
    getPartner: function (n) {
      if (n == null) {
        return null;
      } else {
        var hash = NodeOps.getUserData(n, "hash");
        return hash ? this._pairs[hash]||null : null;
      }
    },

    /**
     * Get the number of nodes stored. 
     * 
     * Note that this includes both nodes and partners.
     * 
     * @return The number of nodes stored.
     */
    size: function () {
      return this._pairCount;
    },
    
    /**
     * Remove a node and it's partner from the list of matchings.
     * 
     * @param n The Node to remove
     */
    remove: function (n) {
      var nHash = NodeOps.getUserData(n, "hash");
      var nMatch = this._pairs[nHash];
      NodeOps.setUserData(nMatch, "matched", null);
      NodeOps.setUserData(n, "matched", null);
      
      delete this._pairs[NodeOps.getUserData(nMatch, "hash")];
      delete this._pairs[nHash];
      
      this._pairCount -= 2;
    }
    
  }
});