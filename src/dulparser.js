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
 * Parser for DUL Patch format
 */
DULParser = /** @lends DULParser */ {
  
  /**
   * Parses DUL format patch and converts it into internal format
   * 
   * @param dulPatch DUL patch
   * @returns InternalDelta
   */
  parseDULPatch: function (dulPatch) {
    var deltaElement = dulPatch.documentElement;
    if (deltaElement.nodeName != DULConstants.DELTA) {
      throw new Error("All deltas must begin with a " + DULConstants.DELTA + " element.");
    }

    var processed = new Array();
    
    // TODO: 
    // var siblingContext = deltaElement.attributes[DULConstants.SIBLING_CONTEXT];
    // var parentContext = deltaElement.attributes[DULConstants.PARENT_CONTEXT];
    // var parentSiblingContext = deltaElement.attributes[DULConstants.PARENT_SIBLING_CONTEXT];
    // var parentSiblingContext = deltaElement.attributes[DULConstants.REVERSE_PATCH];
    // var resolveEntities = deltaElement.attributes[DULConstants.RESOLVE_ENTITIES];
    
    for (var i = 0, l = deltaElement.childNodes.length; i < l; i++) {
      var operationNode = deltaElement.childNodes[i];
      switch (operationNode.nodeName) {
        case DULConstants.INSERT:
          processed.push(this._parseInsert(operationNode));
        break;
        case DULConstants.DELETE:
          processed.push(this._parseDelete(operationNode));
        break;
        case DULConstants.MOVE:
          processed.push(this._parseMove(operationNode));
        break;
        case DULConstants.UPDATE:
          processed.push(this._parseUpdate(operationNode));
        break;
      }
    }
    
    var delta = new InternalDelta(processed);
    return delta;
  },
  
  _parseInsert: function (operation) {
    var parent = operation.getAttribute(DULConstants.PARENT);
    var nodeType = parseInt(operation.getAttribute(DULConstants.NODETYPE));

    var internalOperation = {
      type: 'insert',
      parent: parent,
      nodeType: nodeType
    };
    
    if (nodeType != Node.ATTRIBUTE_NODE) {
      internalOperation['childNo'] = operation.getAttribute(DULConstants.CHILDNO);
    }
    
    if ((nodeType == Node.ATTRIBUTE_NODE) || (nodeType == Node.ELEMENT_NODE) || (nodeType == Node.PROCESSING_INSTRUCTION_NODE)) {
      internalOperation['nodeName'] = operation.getAttribute(DULConstants.NAME);
    }
    
    var charPosAttr = operation.attributes.getNamedItem(DULConstants.CHARPOS);
    if (charPosAttr) {
      internalOperation['charpos'] = charPosAttr.value;
    }
    
    var valueNode = operation.firstChild;
    if (valueNode) {
      internalOperation['value'] = valueNode.nodeValue;
    };

    return internalOperation;
  },
  
  _parseDelete: function (operation) {
    var internalOperation = {
      type: 'delete',
      node: operation.getAttribute(DULConstants.NODE)
    };
    
    var charpos = operation.getAttribute(DULConstants.CHARPOS);
    var length = operation.getAttribute(DULConstants.LENGTH);

    if (charpos !== null) {
      internalOperation['charpos'] = parseInt(charpos);
    }
    
    if (length !== null) {
      internalOperation['length'] = parseInt(length);
    }
    
    return internalOperation;
  },
  
  _parseMove: function (operation) {
    var internalOperation = {
      type: 'move',
      node: operation.getAttribute(DULConstants.NODE),
      ocharpos: parseInt(operation.getAttribute(DULConstants.OLD_CHARPOS)),
      ncharpos: parseInt(operation.getAttribute(DULConstants.NEW_CHARPOS)),
      parent: operation.getAttribute(DULConstants.PARENT),
      childNo: parseInt(operation.getAttribute(DULConstants.CHILDNO))
    };
    
    var lengthAttribute = operation.getAttribute(DULConstants.LENGTH);
    if (lengthAttribute !== null) {
      internalOperation['length'] = parseInt(lengthAttribute);
    };
    
    return internalOperation;
  },
  
  _parseUpdate: function (operation) {
    var internalOperation = {
      type: 'update',
      node: operation.getAttribute(DULConstants.NODE)
    };
    
    // We do not know is the node element or something else so we add operation node content to 
    // both nodeName and nodeValue fields
    // this should be changed in future.
    
    internalOperation['nodeName'] = internalOperation['nodeValue'] = operation.firstChild.nodeValue;
      
    return internalOperation;
  }
  
};