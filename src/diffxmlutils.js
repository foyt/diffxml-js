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
 * @class Utility class for DiffXmlJs
 */
DiffXmlUtils = /** @lends DiffXmlUtils */ {
  /**
   * Creates new class
   * 
   * @param superClass super class
   * @param definition class definition. Constructor is defined in "init" members in "proto". 
   * @returns class
   */
  createClass: function (superClass, definition) {
    if ((typeof definition.init) != 'function') {
      throw new Error("Class missing constructor");
    }

    if ((typeof definition.proto) != 'object') {
      throw new Error("Class missing proto");  
    }
    
    var properties = {};
    
    properties.constructor = {
      value: definition.init,
      enumerable: false
    };
    
    for (var funcName in definition.proto) {
      properties[funcName] = {
        value: definition.proto[funcName]
      };
    }
    
    var result = definition.init;
    result.prototype = Object.create(superClass, properties);
    
    return result;
  } 
};