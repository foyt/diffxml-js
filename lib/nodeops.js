/**
 * @class 
 * Class to handle general diffxml operations on Nodes.
 */
NodeOps = /** @lends NodeOps */ {
    
  /**
   * Replacement for obsolete Node.setUserData
   * 
   * @param node node
   * @param name userKey
   * @param value userData
   */
  setUserData: function (node, name, value) {
    // TODO: Use Element.dataSet (https://developer.mozilla.org/en-US/docs/DOM/element.dataset) when supported
    
    if (!node._userData) {
      node._userData = {};
    }
    
    node._userData[name] = value;
  },
  
  /**
   * Replacement for obsolete Node.getUserData
   * 
   * @param node node
   * @param name userKey
   */
  getUserData: function (node, name) {
    // TODO: Use Element.dataSet (https://developer.mozilla.org/en-US/docs/DOM/element.dataset) when supported

    if (node._userData) {
      return node._userData[name];
    }
    
    return null;
  },
  
  /**
   * Returns a index of a node from array of nodes or NodeList
   * 
   * @param list array / NodeList
   * @param node node
   * @returns index of node or -1 if not found
   */
  getNodeIndex: function (list, node) {
    // TODO: Is this method really necessary?
    if (list instanceof Array) {
      return list.indexOf(node);
    } else if (list instanceof NodeList) {
      for (var i = 0, l = list.length; i < l; i++) {
        if (list.item(i) == node) {
          return i;
        }
      }
    }
    
    return -1;
  },

  /**
   * Mark the node as being "inorder".
   *
   * @param n the node to mark as "inorder"
   */
  setInOrder: function (n) {
    NodeOps.setUserData(n, "inorder", true);
  },

  /**
   * Mark the node as not being "inorder".
   *
   * @param n the node to mark as not "inorder"
   */
  setOutOfOrder: function (n) {
    NodeOps.setUserData(n, "inorder", false);
  },

  /**
   * Check if node is marked "inorder".
   *
   * Note that nodes are inorder by default.
   *
   * @param n node to check
   * @return false if UserData set to False, true otherwise
   */
  isInOrder: function (n) {
    var data = NodeOps.getUserData(n, "inorder");
    return data == null ? true : data;
  },

  /**
   * Check if nodes are the same.
   * 
   * @param x first node to check
   * @param y second node to check
   * @return true if same node, false otherwise
   */

  checkIfSameNode: function (x, y) {
    if (x != null && y != null) {
      return x == y;
    } 

    return false;
  },
  
  /**
   * Calculates an XPath that uniquely identifies the given node.
   * For text nodes note that the given node may only be part of the returned
   * node due to coalescing issues; use an offset and length to identify it
   * unambiguously.
   * 
   * @param n The node to calculate the XPath for.
   * @return The XPath to the node as a String
   */
  getXPath: function(n) {
    var xpath;
    if (n.nodeType == Node.ATTRIBUTE_NODE) {
        //Slightly special case for attributes as they are considered to
        //have no parent
      // TODO: ownerElement property is deprecated.
      xpath = this.getXPath(n.ownerElement) + "/@" + n.nodeName;
    } else if (n.nodeType == Node.DOCUMENT_NODE) {
      xpath = "/";
    } else if (n.nodeType == Node.DOCUMENT_TYPE_NODE) {
      throw new Error("DocumentType nodes cannot be identified with XPath");
    } else if (n.parentNode.nodeType == Node.DOCUMENT_NODE) {
      var cn = new ChildNumber(n);
      xpath = "/node()[" + cn.getXPath() + "]"; 
    } else {
      var cn = new ChildNumber(n);
      xpath = this.getXPath(n.parentNode) + "/node()[" + cn.getXPath() + "]";
    }
    
    return xpath;
  },
  
  /**
   * Check if node is an empty text node.
   * 
   * @param n The Node to test.
   * @return True if it is a 0 sized text node
   */
  nodeIsEmptyText: function (n) {
    if (n.nodeType = Node.TEXT_NODE) {
      return n.length == 0;
    }
    
    return false;
  }
};
