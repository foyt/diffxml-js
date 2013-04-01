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
  init: function () {
    this._pairs = new Array();
  },
  proto : /** @lends NodePairs.prototype */ {
    /**
     * Adds a pair of nodes to the set. Sets UserData as matched.
     * 
     * @param x first node
     * @param y partner of first node
     */
    add: function (x, y) {
      this._pairs.push(x);
      this._pairs.push(y);
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
      var ret = null;
      var index = NodeOps.getNodeIndex(this._pairs, n);
      if (index != -1) {
        if ((index % 2) == 1) {
          ret = this._pairs[--index];
        } else {
          ret = this._pairs[++index];
        }
      }

      return ret;
    },

    /**
     * Get the number of nodes stored. 
     * 
     * Note that this includes both nodes and partners.
     * 
     * @return The number of nodes stored.
     */
    size: function () {
      return this._pairs.length;
    },
    
    /**
     * Remove a node and it's partner from the list of matchings.
     * 
     * @param n The Node to remove
     */
    remove: function (n) {
      var nMatch = this.getPartner(n);
      NodeOps.setUserData(nMatch, "matched", null);
      NodeOps.setUserData(n, "matched", null);
      
      var index = NodeOps.getNodeIndex(this._pairs, this.getPartner(n));
      if (index != -1)
        this._pairs.splice(index, 1);
      
      index = NodeOps.getNodeIndex(this._pairs, n);
      if (index != -1)
        this._pairs.splice(index, 1);
    }
    
  }
});