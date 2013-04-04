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
 */
InternalPatch = DiffXmlUtils.createClass(null, {

  init : function() {

  },
  proto : /** @lends InternalPatch.prototype */
  {

    /**
     * Apply patch to XML document.
     * 
     * @param doc
     *          the XML document to be patched
     * @param patch
     *          the patch
     * @throws PatchFormatException
     *           if there is an error parsing the patch
     */
    apply : function(doc, patch) {

      for ( var i = 0, l = patch.getChanges().length; i < l; i++) {
        // Normalize is essential for deletes to work
        doc.normalize();
        
        var operation = patch.getChanges()[i];
        switch (operation.type) {
          case 'insert':
            this._doInsert(doc, operation);
          break;
          case 'delete':
            this._doDelete(doc, operation);
          break;
          case 'move':
            this._doMove(doc, operation);
          break;
          case 'update':
            this._doUpdate(doc, operation);
          break;
        }
      }

    },

    /**
     * Apply insert operation to document.
     * 
     * @param doc
     *          the document to be patched
     * @param operation
     *          the insert operation node
     */
    _doInsert : function(doc, operation) {
      var charpos = parseInt(operation.charpos || 1);
      var parentNode = this._findNodeByXPath(doc, operation.parent);
      var siblings = parentNode.childNodes;
      var nodeType = operation.nodeType;
      var value = operation.value;
      var childNo = operation.childNo === undefined ? 1 : parseInt(operation.childNo);
      var domChildNo = this._getDOMChildNo(nodeType, siblings, childNo);
      var ins = null;

      switch (nodeType) {
        case Node.TEXT_NODE:
          ins = doc.createTextNode(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.CDATA_SECTION_NODE:
          ins = doc.createCDATASection(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.ELEMENT_NODE:
          ins = doc.createElement(operation.nodeName);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.COMMENT_NODE:
          ins = doc.createComment(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.ATTRIBUTE_NODE:
          if (parentNode.nodeType != Node.ELEMENT_NODE) {
            throw new Error("Parent not an element");
          }

          parentNode.setAttribute(operation.nodeName, value);
        break;
        default:
          throw new Error("Unknown NodeType " + nodeType);
      }
    },

    /**
     * Apply delete operation.
     * 
     * @param doc
     *          document to be patched
     * @param operation
     *          delete operation
     */
    _doDelete : function(doc, operation) {
      var deleteNode = this._findNodeByXPath(doc, operation.node);
      if (deleteNode.nodeType == Node.ATTRIBUTE_NODE) {
        deleteNode.ownerElement.removeAttributeNode(deleteNode);
      } else if (deleteNode.nodeType == Node.TEXT_NODE) {
        var charpos = operation.charpos === undefined ? 1 : operation.charpos;
        var length = operation.length;
        if (length === undefined) {
          this._deleteText2(deleteNode, charpos, doc);
        } else {
          try {
            this._deleteText(deleteNode, charpos, length, doc);
          } catch (e) {
            this._deleteText2(deleteNode, charpos, doc);
          }
        }
      } else {
        deleteNode.parentNode.removeChild(deleteNode);
      }
    },

    /**
     * Perform update operation.
     * 
     * @param doc
     *          The document being patched
     * @param operation
     *          The update operation
     */
    _doUpdate : function(doc, operation) {
      var node = this._findNodeByXPath(doc, operation.node);

      if (node.nodeType == Node.ELEMENT_NODE) {
        var newNode = doc.createElement(operation.nodeName);
        for ( var i = 0, l = node.attributes.length; i < l; i++) {
          newNode.attributes[node.attributes[i].name] = node.attributes[i].value;
        }

        // Move all the children over
        while (node.hasChildNodes()) {
          newNode.appendChild(updateNode.firstChild);
        }

        node.parentNode.replaceChild(newNode, node);
      } else {
        node.nodeValue = operation.nodeValue;
      }
    },

    /**
     * Apply move operation.
     * 
     * @param doc
     *          document to be patched
     * @param operation
     *          move operation
     */
    _doMove : function(doc, operation) {
      var node = this._findNodeByXPath(doc, operation.node);
      var oldCharPos = operation.ocharpos;
      var newCharPos = operation.ncharpos;

      if (node.nodeType == Node.TEXT_NODE) {
        var text = "";
        try {
          var length = operation.length;
          if (length) {
            text = this._deleteText(node, oldCharPos, length, doc);
          } else {
            text = this._deleteText2(node, oldCharPos, doc);
          }
        } catch (e) {
          text = this._deleteText2(node, oldCharPos, doc);
        }

        node = doc.createTextNode(text);
      }

      if (node.nodeType != Node.TEXT_NODE) {
        node = node.parentNode.removeChild(node);
      }

      // Find position to move to
      // Get parent
      var parent = this._findNodeByXPath(doc, operation.parent);
      var newSiblings = parent.childNodes;
      var domcn = this._getDOMChildNo(node.nodeType, newSiblings, operation.childNo);

      // Perform insert
      this._insertNode(newSiblings, parent, domcn, newCharPos, node, doc);
    },

    _findNodeByXPath : function(document, xpath) {
      var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      return result.iterateNext();
    },

    /**
     * Get the DOM Child number
     * 
     * @param nodeType
     *          the nodeType to be inserted
     * @param siblings
     *          the siblings of the node
     * @param xPathChildNo
     *          operation childNo
     * @return the DOM Child number of the node
     */
    _getDOMChildNo : function(nodeType, siblings, xpathcn) {
      var domcn = 0;

      //Convert xpath childno to DOM childno
      if (nodeType != Node.ATTRIBUTE_NODE) {
          domcn = this._getDOMChildNoFromXPath(siblings, xpathcn);
      }

      return domcn;
    },
    
    /**
     * Get the DOM Child Number equivalent of the XPath childnumber.
     *
     * @param siblings the NodeList we are interested in
     * @param xpathcn  the XPath child number
     * @return the equivalent DOM child number
     */
    _getDOMChildNoFromXPath: function (siblings, xpathcn) {
      var domIndex = 0;
      var xPathIndex = 1;
      while ((xPathIndex < xpathcn) && (domIndex < siblings.length)) {
        if (!((this._prevNodeIsATextNode(siblings, domIndex)) && (siblings.item(domIndex).nodeType == Node.TEXT_NODE))) {
          xPathIndex++;
        }
        domIndex++;
      }
      //Handle appending nodes
      if (xPathIndex < xpathcn) {
        domIndex++;
        xPathIndex++;
      }
      
      return domIndex;
    },

    /**
     * Tests if previous node is a text node.
     * 
     * @param siblings
     *          siblings of current node
     * @param index
     *          index of current node
     * @return true if previous node is a text node, false otherwise
     */
    _prevNodeIsATextNode : function(siblings, index) {
      return index > 0 && siblings.item(index - 1).nodeType == Node.TEXT_NODE;
    },

    /**
     * Inserts a node at the given character position.
     * 
     * @param charpos
     *          the character position to insert at
     * @param siblings
     *          the NodeList to insert the node into
     * @param domcn
     *          the child number to insert the node as
     * @param ins
     *          the node to insert
     * @param parent
     *          the node to become the parent of the inserted node
     */
    _insertAtCharPos : function(charpos, siblings, domcn, ins, parent, doc) {
      // we know text node at domcn -1
      var cp = charpos;
      var textNodeIndex = domcn - 1;
      var append = false;

      while (this._prevNodeIsATextNode(siblings, textNodeIndex)) {
        textNodeIndex--;
      }

      while ((siblings.item(textNodeIndex).nodeType == Node.TEXT_NODE) && (cp > siblings.item(textNodeIndex).length)) {
        cp = cp - siblings.item(textNodeIndex).length;
        textNodeIndex++;

        if (textNodeIndex == siblings.length) {
          if (cp > 1) {
            throw new Error("charpos past end of text");
          }
          append = true;
          parent.appendChild(ins);
          break;
        }
      }
      ;

      var sibNode = siblings.item(textNodeIndex);

      if (!append) {
        if (cp == 1) {
          parent.insertBefore(ins, sibNode);
        } else if (cp > sibNode.length) {
          var nextSib = sibNode.nextSibling;
          if (nextSib != null) {
            parent.insertBefore(ins, nextSib);
          } else {
            parent.appendChild(ins);
          }
        } else {
          var text = sibNode.nodeValue;
          var nextSib = sibNode.nextSibling;
          parent.removeChild(sibNode);
          var text1 = doc.createTextNode(text.substring(0, cp - 1));
          var text2 = doc.createTextNode(text.substring(cp - 1));
          if (nextSib != null) {
            parent.insertBefore(text1, nextSib);
            parent.insertBefore(ins, nextSib);
            parent.insertBefore(text2, nextSib);
          } else {
            parent.appendChild(text1);
            parent.appendChild(ins);
            parent.appendChild(text2);
          }
        }
      }
    },

    /**
     * Insert a node under parent node at given position.
     * 
     * @param siblings
     *          the NodeList to insert the node into
     * @param parent
     *          the parent to insert the node under
     * @param domcn
     *          the child number to insert the node as
     * @param charpos
     *          the character position at which to insert the node
     * @param ins
     *          the node to be inserted
     * @param doc
     *          the document we are inserting into
     */
    _insertNode : function(siblings, parent, domcn, charpos, ins, doc) {
      // siblings(domcn) is the node currently at the position we want to put
      // the node

      if (domcn > siblings.length) {
        throw new Error("Child number past end of nodes");
      }
      if (parent.nodeType != Node.ELEMENT_NODE && parent.nodeType != Node.DOCUMENT_NODE) {
        throw new Error("Parent must be an element");
      }

      if ((siblings.length > 0)) {

        // Check if inserting into text
        if (this._prevNodeIsATextNode(siblings, domcn)) {
          this._insertAtCharPos(charpos, siblings, domcn, ins, parent, doc);
        } else if (domcn < siblings.length) {
          parent.insertBefore(ins, siblings.item(domcn));
        } else {
          parent.appendChild(ins);
        }
      } else {
        parent.appendChild(ins);
      }
    },

    /**
     * Delete the appropriate amount of text from a Node.
     * 
     * Assumes a normalized document, i.e. no adjacent or empty text nodes.
     * 
     * @param delNode the text node to delete text from
     * @param charpos the character position at which to delete
     * @param length the number of characters to delete
     * @param doc the document being deleted from
     * @return the deleted text
     */
    _deleteText : function(delNode, charpos, length, doc) {
      if (delNode.nodeType != Node.TEXT_NODE) {
        throw new Error("Attempt to delete text from non-text node.");
      }

      var text = delNode.nodeValue;
      if (charpos > text.length) {
        throw new Error("charpos past end of text node.");
      }

      if ((length + charpos - 1) > text.length) {
        throw new Error("length past end of text node.");
      }

      var newText = text.substring(0, charpos - 1) + text.substring(charpos - 1 + length);
      if (newText.length > 0) {
        var newTextNode = doc.createTextNode(newText);
        delNode.parentNode.insertBefore(newTextNode, delNode);
      }

      delNode.parentNode.removeChild(delNode);

      return text.substring(charpos - 1, charpos - 1 + length);
    },

    /**
     * Delete the appropriate amount of text from a Node.
     * 
     * @param delNode the text node to delete text from
     * @param charpos the character position at which to delete
     * @param doc the document being deleted from
     * @return the deleted text
     */
    _deleteText2 : function(delNode, charpos, doc) {
      var length = delNode.nodeValue.length - charpos + 1;
      return this._deleteText(delNode, charpos, length, doc);
    }
  }
});