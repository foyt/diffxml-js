(function() {
  
  global.xpath = require('xpath');

  global.Node = {
    ELEMENT_NODE : 1,
    ATTRIBUTE_NODE : 2,
    TEXT_NODE : 3,
    CDATA_SECTION_NODE : 4,
    ENTITY_REFERENCE_NODE : 5,
    ENTITY_NODE : 6,
    PROCESSING_INSTRUCTION_NODE : 7,
    COMMENT_NODE : 8,
    DOCUMENT_NODE : 9,
    DOCUMENT_TYPE_NODE : 10,
    DOCUMENT_FRAGMENT_NODE : 11,
    NOTATION_NODE : 12
  };
  
  global.XPathResult = {
    ANY_TYPE: 0,
    NUMBER_TYPE: 1,
    STRING_TYPE: 2,
    BOOLEAN_TYPE: 3,
    UNORDERED_NODE_ITERATOR_TYPE: 4,
    ORDERED_NODE_ITERATOR_TYPE: 5,
    UNORDERED_NODE_SNAPSHOT_TYPE: 6,
    ORDERED_NODE_SNAPSHOT_TYPE: 7,
    ANY_UNORDERED_NODE_TYPE: 8,
    FIRST_ORDERED_NODE_TYPE: 9     
  };
    
  require('./lib/diffxmlutils.js');
  require('./lib/delta.js');
  require('./lib/internaldelta.js');
  require('./lib/internalpatch.js');
  require('./lib/editscript.js');
  require('./lib/findposition.js');
  require('./lib/fmes.js');
  require('./lib/nodefifo.js');
  require('./lib/nodeops.js');
  require('./lib/nodepairs.js');
  require('./lib/nodedepth.js');
  require('./lib/match.js');
  require('./lib/nodesequence.js');
  require('./lib/childnumber.js');
  require('./lib/dulconstants.js');
  require('./lib/dulparser.js');

  module.exports = {
    DULParser: DULParser,
    InternalPatch: InternalPatch,
    Match: Match,
    EditScript: EditScript
  };
  
}).call(this);