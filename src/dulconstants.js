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
 * Constants used in DUL Deltas.
 */
DULConstants = /** @lends DULConstants */ {

    /** If the delta was created as a "reverse patch". **/
  REVERSE_PATCH: "reverse_patch",
  
  /** The amount of parent sibling context. **/
  PARENT_SIBLING_CONTEXT: "par_sib_context",
  
  /** The amount of parent context. **/
  PARENT_CONTEXT: "par_context",
  
  /** The amount of sibling context. **/
  SIBLING_CONTEXT: "sib_context",
  
  /** Document element of a DUL EditScript. **/
  DELTA: "delta",
  
  /** Character position of the "new" node. **/
  NEW_CHARPOS: "new_charpos",
  
  /** Character position of the "old" node. **/
  OLD_CHARPOS: "old_charpos",
  
  /** Move operation element. **/
  MOVE: "move",
  
  /** Number of characters to extract from a text node. **/
  LENGTH: "length",
  
  /** The node for the operation. **/
  NODE: "node",
  
  /** Delete operation element. **/
  DELETE: "delete",
  
  /** Character position in text of the node. **/
  CHARPOS: "charpos",
  
  /** Name of the node. **/
  NAME: "name",
  
  /** Child number of parent node. **/
  CHILDNO: "childno",
  
  /** DOM type of the node. **/
  NODETYPE: "nodetype",
  
  /** Parent of the node. **/
  PARENT: "parent",
  
  /** Insert operation element. **/ 
  INSERT: "insert",
  
  /** Update operation element. **/ 
  UPDATE: "update",
  
  /** If entities were resolved when creating the delta. **/
  RESOLVE_ENTITIES: "resolve_entities",
  
  /** False constant. **/
  FALSE: "false",
  
  /** True constant. **/
  TRUE: "true"

};