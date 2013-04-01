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
 * @class Creates the edit script for the fmes algorithm.
 *
 * Uses the algorithm described in the paper
 * "Change Detection in Hierarchically Structure Information".
 */
EditScript = DiffXmlUtils.createClass(null, {  
  
  /**
   * Constructor for EditScript.
   * Used to create a list of modifications that will turn document1 into document2,
   * given a set of matching nodes.
   * 
   * @param document1 the original document
   * @param document2 the modified document
   * @param matchings the set of matching nodes
   */
  init: function (document1, document2, matchings) {
    /**
     * The original document.
     */
    this._document1 = document1;
    /**
     * The modified document.
     */
    this._document2 = document2;
    /**
     * The set of matching nodes.
     */
    this._matchings = matchings;
    /**
     * Delta
     */
    this._delta = null;
  },
  proto : /** @lends EditScript.prototype */ {
    
    /**
     * Creates an Edit Script conforming to matchings that transforms
     * document1 into document2.
     *
     * Uses algorithm in "Change Detection in Hierarchically Structured
     * Information".
     *
     * @return the resultant Edit Script
     */
    create: function(delta) {
      this._delta = delta||new DefaultDelta();
      
      // Fifo used to do a breadth first traversal of doc2
      var fifo = new NodeFifo();
      fifo.addChildrenOfNode(this._document2);
      
      var doc2docEl = this._document2.documentElement;
      //Special case for aligning children of root node
      this._alignChildren(this._document1, this._document2, this._matchings);

      while (!fifo.isEmpty()) {
          var x = fifo.pop();
          fifo.addChildrenOfNode(x);

          var y = x.parentNode;
          var z = this._matchings.getPartner(y);
          var w = this._matchings.getPartner(x);

          if (!this._matchings.isMatched(x)) {
            w = this._doInsert(x, z);
          } else {
            // TODO: Update should go here
            // Special case for document element
              if (NodeOps.checkIfSameNode(x, doc2docEl) && !Match.compareElements(w, x)) {
                w = this._doUpdate(w, x);
              } else { 
                if (!(this._matchings.getPartner(y) == w.parentNode)) {
                  this._doMove(w, x, z, this._matchings);
                }
              }
          }

          this._alignChildren(w, x, this._matchings);
      }

      this._deletePhase(this._document1, this._matchings);

      // TODO: Assert following
      // Post-Condition es is a minimum cost edit script,
      // Matchings is a total matching and
      // doc1 is isomorphic to doc2

      return this._delta;
    },

    /**
     * Updates a Node to the value of another node.
     * 
     * @param w The Node to be updated
     * @param x The Node to make it like
     * @return The new Node
     */
    _doUpdate: function (w, x) {
      var doc1 = w.ownerDocument;
      var newW = null;
      if (w.nodeType == Node.ELEMENT_NODE) {

          this._delta.update(w, x);

          //Unfortunately, you can't change the node name in DOM, so we need
          //to create a new node and copy it all over
          
          //TODO: Note you don't actually *need* to do this!!!
          //TODO: Only call this when in debug
          newW = doc1.createElement(x.nodeName);
          
          // Copy x's attributes to the new element
          var attrs = x.attributes;
          for (var i = 0; i < attrs.length; i++) {
            newW.attributes[attrs[i].name] = attrs[i].value;
          }
          
          while (w.hasChildNodes()) {
            newW.appendChild(w.firstChild);
          }

          w.parentNode.replaceChild(newW, w);
          this._matchings.remove(w);
          this._matchings.add(newW, x);   
      }
      
      return newW;
    },
    /**
     * Inserts (clone of) node x as child of z according to the algorithm 
     * and updates the Edit Script.
     *
     * @param x          current node
     * @param z          partner of x's parent
     * @return           the inserted node
     */
    _doInsert: function (x, z) {
        //Find the child number (k) to insert w as child of z 
        var pos = new FindPosition(x, this._matchings);

        //Apply insert to doc1
        //The node we want to insert is the import of x with attributes but no children

        var w = x.cloneNode(false);
        
        //Need to set in order as won't be revisited
        NodeOps.setInOrder(w);
        NodeOps.setInOrder(x);

        this._delta.insert(w, z, pos.getXPathInsertPosition(), pos.getCharInsertPosition());

        //Take match of parent (z), and insert
        w = this._insertAsChild(pos.getDOMInsertPosition(), z, w);

        this._matchings.add(w, x);

        return w;
    },

    /**
     * Performs a move operation according to the algorithm and updates
     * the EditScript.
     *
     * @param w          the node to be moved
     * @param x          the matching node
     * @param z          the partner of x's parent
     * @param matchings  the set of matching nodes
     */
    _doMove: function (w, x, z, matchings) {
      
      var v = w.parentNode;
      var y = x.parentNode;
      
      // Apply move if parents not matched and not null

      var partnerY = matchings.getPartner(y);
      if (NodeOps.checkIfSameNode(v, partnerY)) {
        throw new Error("v is same as partnerY");
      }
      
      var pos = new FindPosition(x, matchings);
      
      NodeOps.setInOrder(w);
      NodeOps.setInOrder(x);

      this._delta.move(w, z, pos.getXPathInsertPosition(), pos.getCharInsertPosition());

      //Apply move to T1
      this._insertAsChild(pos.getDOMInsertPosition(), z, w);
    },

    /**
     * Performs the deletePhase of the algorithm.
     *
     * @param n          the current node
     * @param matchings  the set of matching nodes
     */
    _deletePhase: function (n, matchings) {
      var kids = n.childNodes;
      if (kids != null) {
        // Note that we loop *backward* through kids
        for (var i = (kids.length - 1); i >= 0; i--) {
          this._deletePhase(kids.item(i), matchings);
        }
      }

      // If node isn't matched, delete it
      if (!matchings.isMatched(n) && n.nodeType != Node.DOCUMENT_TYPE_NODE) {
        this._delta.deleteNode(n);
        n.parentNode.removeChild(n);
      }
    },

    /**
     * Mark the children of a node out of order.
     *
     * @param n the parent of the nodes to mark out of order
     */
    _markChildrenOutOfOrder: function (n) {
      for (var i = 0, l = n.childNodes.length; i < l; i++) {
        NodeOps.setOutOfOrder(n.childNodes.item(i));
      }
    },

    /**
     * Mark the children of a node in order.
     *
     * @param n the parent of the nodes to mark in order
     */
    _markChildrenInOrder: function (n) {
      for (var i = 0, l = n.childNodes.length; i < l; i++) {
        NodeOps.setInOrder(n.childNodes.item(i));
      }
    },
    
    /**
     * Marks the Nodes in the given list and their partners "inorder".
     *
     * @param seq  the Nodes to mark "inorder"
     * @param matchings the set of matching Nodes
     */
    _setNodesInOrder: function (seq, matchings) {
      for (var i = 0, l = seq.length; i < l; i++) {
        var node = seq[i];
        NodeOps.setInOrder(node);
        NodeOps.setInOrder(matchings.getPartner(node));
      }
    },

    /**
     * Moves nodes that are not in order to correct position.
     *
     * @param w Node with potentially misaligned children
     * @param wSeq Sequence of children of w that have matches in the children of x
     * @param stay The List of nodes not to be moved
     * @param matchings The set of matching nodes
     */
    _moveMisalignedNodes: function (w, wSeq, stay, matchings) {
      for (var wSeqIndex = 0, wSeqLength = wSeq.length; wSeqIndex < wSeqLength; wSeqIndex++) {
        var a = wSeq[wSeqIndex];
        if (NodeOps.getNodeIndex(stay, a) == -1) {
          var b = matchings.getPartner(a);
          var pos = new FindPosition(b, matchings);
          this._delta.move(a, w, pos.getXPathInsertPosition(), pos.getCharInsertPosition());
          this._insertAsChild(pos.getDOMInsertPosition(), w, a);
          NodeOps.setInOrder(a);
          NodeOps.setInOrder(b);
        }
      }
    },

    /**
     * Aligns children of current node that are not in order.
     *
     * @param w  the match of the current node.
     * @param x  the current node

     * @param matchings  the set of matchings
     */
    _alignChildren: function (w, x, matchings) {
      //Order of w and x is important
      this._markChildrenOutOfOrder(w);
      this._markChildrenOutOfOrder(x);

      var wKids = w.childNodes;
      var xKids = x.childNodes;

      var wSeq = NodeSequence.getSequence(wKids, xKids, matchings);
      var xSeq = NodeSequence.getSequence(xKids, wKids, matchings);

      var lcsSeq = NodeSequence.getLCS(wSeq, xSeq, matchings);
      this._setNodesInOrder(lcsSeq, matchings);
      
      this._moveMisalignedNodes(w, wSeq, lcsSeq, matchings);
      
      //The following is missing from the algorithm, but is important
      this._markChildrenInOrder(w);
      this._markChildrenInOrder(x);
    },
    
    /**
     * Inserts a given node as numbered child of a parent node.
     *
     * If childNum doesn't exist the node is simply appended.
     *
     * @param childNum  the position to add the node to
     * @param parent    the node that is to be the parent
     * @param insNode   the node to be inserted
     * @return The inserted Node
     */
    _insertAsChild: function (childNum, parent, insNode) {
      if (insNode.parentNode) {
        insNode.parentNode.removeChild(insNode);
      }
      
      var child = parent.childNodes.item(childNum);
      if (child) {
        parent.insertBefore(insNode, child);
      } else {
        parent.appendChild(insNode);
      }
      
      return insNode;
    }
  }
});