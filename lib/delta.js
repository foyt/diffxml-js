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
 * @class Interface for Delta formats.
 */
Delta = DiffXmlUtils.createClass(null, {
  /**
   * Constructor
   * @constructs
   */
  init: function () {
  },
  proto : /** @lends Delta.prototype */ {
    /**
     * Appends an insert operation to the delta.
     * 
     * Set charpos to 1 if not needed.
     * 
     * @param n The node to insert
     * @param parent The path to the node to be parent of n
     * @param childno The child number of the parent node that n will become
     * @param charpos The character position to insert at
     */
    insert: function (n, parent, childno, charpos) {},
    
    /**
     * Adds a delete operation to the delta for the given Node.
     * 
     * @param node The Node that is to be deleted
     */
    deleteNode: function(node) {},

    /**
     * Adds a Move operation to the delta. 
     * 
     * @param node The node being moved
     * @param parent XPath to the new parent Node
     * @param childno Child number of the parent n will become
     * @param ncharpos The new character position for the Node
     */
    move: function (node, parent, childno, ncharpos) {},

    /**
     * Adds an update operation to the delta.
     * 
     * @param w The node to update
     * @param x The node to update it to
     */
    update: function (w, x) {}
  }
});