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
 * Implements a First In First Out list.
 *
 * Equivalent to a stack where elements are removed from
 * the *opposite* end to where the are added. Hence the
 * Stack terms "push" and pop" are used.
 */
NodeFifo = DiffXmlUtils.createClass(null, {
  /**
   * Default constructor.
   * @constructs
   */
  init: function () {
    // Underlying list.
    this._fifo = new Array();
  },
  proto : /** @lends NodeFifo.prototype */ {
    
    push: function (n) {
      this._fifo.push(n);
    },

    /**
     * Checks if the Fifo contains any objects.
     *
     * @return true if there are any objects in the Fifo
     */

    isEmpty: function () {
       return this._fifo.length == 0;
    },

    /**
     * Remove a Node from the Fifo.
     *
     * This Node is always the oldest item in the array.
     *
     * @return the oldest item in the Fifo
     */
    pop: function () {
      if (this.isEmpty()) {
        return null;
      }
      
      return this._fifo.shift();
    },

    /**
     * Adds the children of a node to the fifo.
     *
     * @param x the node whose children are to be added
     */
    addChildrenOfNode: function (x) {
      var kids = x.childNodes;

      if (kids != null) {
        for (var i = 0, l = kids.length; i < l; i++) {
          if ((kids.item(i).nodeType == Node.DOCUMENT_TYPE_NODE)) {
            continue;
          }

          this.push(kids.item(i));
        }
      }
    }
  }  
});