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
 * Solves the "good matchings" problem for the FMES algorithm.
 *
 * Essentially pairs nodes that match between documents.
 * Uses the "fast match" algorithm is detailed in the paper
 * "Change Detection in Hierarchically Structure Information".
 *
 * WARNING: Will only work correctly with acylic documents.
 * TODO: Add alternate matching code for cylic documents.
 * See: http://www.devarticles.com/c/a/Development-Cycles/How-to-Strike-a-Match/
 * for information on how to match strings.
 */
Match = /** @lends Match */ {
  /**
   * Performs fast match algorithm on given DOM documents.
   * 
   *  TODO: May want to consider starting at same point in 2nd tree somehow, 
   *  may lead to better matches.
   * 
   * @param document1 The original document
   * @param document2 The modified document
   * 
   * @return NodeSet containing pairs of matching nodes.
   */
  easyMatch: function (document1, document2) {
    var matchSet = new NodePairs();
    
    document1.documentElement.normalize();
    document2.documentElement.normalize();
    
    var list1 = this._initialiseAndOrderNodes(document1);
    var list2 = this._initialiseAndOrderNodes(document2);
    
    //Explicitly add document elements and root
    matchSet.add(document1, document2);
    matchSet.add(document1.documentElement, document2.documentElement);
    
    // Proceed bottom up on List 1
    for (var i = 0, l = list1.length; i < l; i++) {
      var nd1 = list1[i];
      var n1 = nd1.getNode();
      for (var j = 0, jl = list2.length; j < jl; j++) {
        var nd2 = list2[j];
        var n2 = nd2.getNode();
        
        if (this._compareNodes(n1, n2)) {
          matchSet.add(n1, n2);
          //Don't want to consider it again
          this._removeItemFromNodeDepth(list2, nd2);
          break;
        }
      }
    }

    return matchSet;
  },
  
  /**
   * Compares two elements two determine whether they should be matched.
   * 
   * TODO: This method is critical in getting good results. Will need to be
   * tweaked. In addition, it may be an idea to allow certain doc types to
   * override it. Consider comparing position, matching of kids etc.
   * 
   * @param a First element
   * @param b Potential match for b
   * @return true if nodes match, false otherwise
   */
  compareElements: function (a, b) {
    var ret = false;

    if (a.nodeName == b.nodeName) {
        //Compare attributes
        
        //Attributes are equal until we find one that doesn't match
        ret = true;
        
        var aAttrs = a.attributes;
        var bAttrs = b.attributes;

        var numberAAttrs = 0;
        if (aAttrs != null) {
            numberAAttrs = aAttrs.length;
        }
        var numberBAttrs = 0;
        if (bAttrs != null) {
            numberBAttrs = bAttrs.length;
        }
        if (numberAAttrs != numberBAttrs) {
            ret = false;
        }

        var i = 0;
        while (ret && (i < numberAAttrs)) {
            // Check if attr exists in other tag
            var bItem = bAttrs[aAttrs.item(i).nodeName]; 
            if (bItem == null || (bItem.value != aAttrs.item(i).value)) {
                ret = false;
            } 
            i++;
        }
    }
    
    return ret;
  },
  
  /**
   * Compares two text nodes to determine if they should be matched.
   * 
   * Takes into account whitespace options.
   * 
   * @param a First node
   * @param b Potential match for a
   * @return True if nodes match, false otherwise
   */

  compareTextNodes: function (a, b) {
    var aString = a.data;
    var bString = b.data;

    return aString == bString;
  },

  /**
   * Compares 2 nodes to determine whether they should match.
   * 
   * TODO: Check if more comparisons are needed
   * TODO: Consider moving out to a separate class, implementing an interface
   * 
   * @param a first node
   * @param b potential match for a
   * @return true if nodes match, false otherwise
   */
  _compareNodes: function (a, b) {
    var ret = false;

    if (a.nodeType == b.nodeType) { 
      switch (a.nodeType) {
        case Node.ELEMENT_NODE :
          ret = this.compareElements(a, b);
        break;
        case Node.TEXT_NODE :
          ret = this.compareTextNodes(a, b);
        break;
        case Node.DOCUMENT_NODE :
          //Always match document nodes
          ret = true;
        break;
        default :
          ret = a.nodeValue == b.nodeValue;
        break;
      }
    }
    
    return ret;
  },

  /**
   * Returns a list of Nodes sorted according to their depths.
   * 
   * Does *NOT* include root or documentElement
   * 
   * TreeSet is sorted in reverse order of depth according to
   * NodeInfoComparator.
   * 
   * @param doc The document to be initialised and ordered.
   * @return A depth-ordered list of the nodes in the doc.
   */
  _initialiseAndOrderNodes: function (doc) {
    var depthSorted = [];
    if ((typeof doc.createNodeIterator) !== 'undefined') {
      var ni = doc.createNodeIterator(doc, NodeFilter.SHOW_ALL, null);
      var n;
      while ((n = ni.nextNode()) != null) {
        if (!(NodeOps.checkIfSameNode(doc, n) || NodeOps.checkIfSameNode(doc.documentElement, n) || n.nodeType == Node.DOCUMENT_TYPE_NODE)) {
          depthSorted.push(new NodeDepth(n));
        }
      }
    
      ni.detach();
    } else {
      if ((typeof (global||window).xpath) !== 'undefined') {
        var nodes = (global||window).xpath.select("/descendant-or-self::node()", doc.documentElement);
        for (var i = 0, l = nodes.length; i < l; i++) {
          var n = nodes[i];
          if (!(NodeOps.checkIfSameNode(doc, n) || NodeOps.checkIfSameNode(doc.documentElement, n) || n.nodeType == Node.DOCUMENT_TYPE_NODE)) {
            depthSorted.push(new NodeDepth(n));
          }
        }
      }
    }
  
    depthSorted.sort(function (nodeInfo1, nodeInfo2) {
      return nodeInfo2.getDepth() - nodeInfo1.getDepth();
    });
  
    return depthSorted;
  },
  
  /**
   * Removes nodeDepth from array of nodeDepths
   * 
   * @param list array of nodeDepths
   * @param nodeDepth nodeDepth to be removed
   */
  _removeItemFromNodeDepth: function (list, nodeDepth) {
    var index = list.indexOf(nodeDepth);
    if (index != -1) {
      list.splice(index, 1);
    }
  }

};