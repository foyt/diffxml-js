(function() {
  var diffXmlJs = require('../diffxml');
  var Match = diffXmlJs.Match;
  var EditScript = diffXmlJs.EditScript;
  var xmldom = require('xmldom');
  var assert = require('assert');
  
  var DOMParser = xmldom.DOMParser;

  function parseXmlDocument(text) {
    var parser=new DOMParser();
    return parser.parseFromString(text,"text/xml");
  };

  describe('EditScriptSuite', function(){
  
    describe('Test handling documents with different document elements', function(){
      it('nonMatchingDocumentElements', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><c><b/></c>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(6, matchings.size());
        assert.equal(null, matchings.getPartner(doc2.firstChild.firstChild.nextSibling));
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
        assert.equal(1, delta.getUpdated().length);
        assert.equal("/node()[1]", delta.getUpdated()[0].node);
        assert.equal("c", delta.getUpdated()[0].nodeName);
      });
    });
  
    describe('Test handling differences in prolog', function(){
      it('differentProlog', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><!-- prolog1 --><a><b/></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><!-- prolog2 --><a><b/></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(6, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
    
        assert.equal(1, delta.getInserted().length);
        assert.equal("/", delta.getInserted()[0].parent);
        assert.equal(1, delta.getInserted()[0].childNo);
        assert.equal(Node.COMMENT_NODE, delta.getInserted()[0].nodeType);
        assert.equal(" prolog2 ", delta.getInserted()[0].value);
    
        assert.equal(1, delta.getDeleted().length);
        assert.equal("/node()[2]", delta.getDeleted()[0].node);
      });
    });
  
    describe('Test the simple addition of an element', function(){
      it('simpleInsert', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/><c/></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(6, matchings.size());
        assert.equal(null,matchings.getPartner(doc2.firstChild.firstChild.nextSibling));
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
    
        assert.equal(1, delta.getInserted().length);
        assert.equal(2, delta.getInserted()[0].childNo);
        assert.equal("c", delta.getInserted()[0].nodeName);
        assert.equal("/node()[1]", delta.getInserted()[0].parent);
        assert.equal(Node.ELEMENT_NODE, delta.getInserted()[0].nodeType);
      });
    });
  
    describe('Test the simple deletion of an element', function(){
      it('simpleDeletion', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b/><c/></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(6, matchings.size());
        assert.equal(null,matchings.getPartner(doc1.firstChild.firstChild.nextSibling));
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
        assert.equal(1, delta.getDeleted().length);
        assert.equal('/node()[1]/node()[2]', delta.getDeleted()[0].node);
      });
    });
  
    describe('Test the simple move of an element', function(){
      it('simpleMove', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a><b><c/></b><d/></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b/><d><c/></d></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(10, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
        assert.equal(1, delta.getMoved().length);
        assert.equal("/node()[1]/node()[1]/node()[1]", delta.getMoved()[0].node);
        assert.equal(1, delta.getMoved()[0].childNo);
        assert.equal("/node()[1]/node()[2]", delta.getMoved()[0].parent);
      });
    });
  
    describe('Test insert after text', function(){
      it('insertAfterText', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a>text</a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a>text<b/></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(6, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
        assert.equal(1, delta.getInserted().length);
        assert.equal(2, delta.getInserted()[0].childNo);
        assert.equal(5, delta.getInserted()[0].charpos);
        assert.equal(Node.ELEMENT_NODE, delta.getInserted()[0].nodeType);
        assert.equal("/node()[1]", delta.getInserted()[0].parent);
      });
    });
  
    describe('Test mis-aligned nodes', function(){
      it('misalignedNodes', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a>b<c/>b</a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a>z<c/>b</a>');
        var matchings = new NodePairs();
        var docEl1 = doc1.documentElement;
        var docEl2 = doc2.documentElement;
    
        matchings.add(doc1, doc2);
        matchings.add(docEl1, docEl2);
        matchings.add(docEl1.firstChild, docEl2.firstChild.nextSibling.nextSibling);
        matchings.add(docEl1.firstChild.nextSibling, docEl2.firstChild.nextSibling);
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
    
        assert.equal(1, delta.getMoved().length);
        assert.equal(2, delta.getMoved()[0].childNo);
        assert.equal("/node()[1]", delta.getMoved()[0].parent);
        assert.equal("/node()[1]/node()[1]", delta.getMoved()[0].node);
        assert.equal(1, delta.getMoved()[0].ncharpos);
        assert.equal(1, delta.getMoved()[0].ocharpos);
    
        assert.equal(1, delta.getInserted().length);
        assert.equal(1, delta.getInserted()[0].childNo);
        assert.equal("/node()[1]", delta.getInserted()[0].parent);
        assert.equal(Node.TEXT_NODE, delta.getInserted()[0].nodeType);
        assert.equal("z", delta.getInserted()[0].value);
    
        assert.equal(1, delta.getDeleted().length);
        assert.equal("/node()[1]/node()[3]", delta.getDeleted()[0].node);
        assert.equal(1, delta.getDeleted()[0].length);
        assert.equal(2, delta.getDeleted()[0].charpos);
      });
    });
  
    describe('Test inserting and moving where marked order of nodes is important', function(){
      it('ordering', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a><c>6</c><b>7</b></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a><b>6</b><b>7</b></a>');
    
        var matchings = Match.easyMatch(doc1, doc2);
    
        assert.equal(10, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
    
        assert.equal(4, delta.getChanges().length);
    
        assert.equal("insert", delta.getChanges()[0].type);
        assert.equal(Node.ELEMENT_NODE, delta.getChanges()[0].nodeType);
        assert.equal(3, delta.getChanges()[0].childNo);
        assert.equal('b', delta.getChanges()[0].nodeName);
        assert.equal("/node()[1]", delta.getChanges()[0].parent);
    
        assert.equal("move", delta.getChanges()[1].type);
        assert.equal(1, delta.getChanges()[1].childNo);
        assert.equal("/node()[1]/node()[2]", delta.getChanges()[1].parent);
        assert.equal("/node()[1]/node()[1]/node()[1]", delta.getChanges()[1].node);
        assert.equal(1, delta.getChanges()[1].ncharpos);
        assert.equal(1, delta.getChanges()[1].ocharpos);
    
        assert.equal("move", delta.getChanges()[2].type);
        assert.equal(1, delta.getChanges()[2].childNo);
        assert.equal("/node()[1]/node()[3]", delta.getChanges()[2].parent);
        assert.equal("/node()[1]/node()[2]/node()[1]", delta.getChanges()[2].node);
        assert.equal(1, delta.getChanges()[2].ncharpos);
        assert.equal(2, delta.getChanges()[2].ocharpos);
    
        assert.equal("delete", delta.getChanges()[3].type);
        assert.equal("/node()[1]/node()[1]", delta.getChanges()[3].node);
      });
    });
  
    describe('Test for irritating bug where unmatched node breaks text', function(){
      it('numberingBug', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><a>x<b/>y</a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a>x<p/>y<b/></a>');
    
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(10, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
    
        assert.equal(2, delta.getChanges().length);
    
        assert.equal("move", delta.getChanges()[0].type);
        assert.equal(2, delta.getChanges()[0].childNo);
        assert.equal("/node()[1]", delta.getChanges()[0].parent);
        assert.equal("/node()[1]/node()[2]", delta.getChanges()[0].node);
        assert.equal(3, delta.getChanges()[0].ncharpos);
        assert.equal(2, delta.getChanges()[0].ocharpos);
      });
    });
  
    describe('Test for DocumentType node handling. Note DocumentType nodes can\'t be differenced, as can\'t be referenced by XPath', function(){
      it('documentType', function() {
        var doc1 = parseXmlDocument('<?xml version="1.0"?><!DOCTYPE a [ ]><a></a>');
        var doc2 = parseXmlDocument('<?xml version="1.0"?><a></a>');
        var matchings = Match.easyMatch(doc1, doc2);
        assert.equal(4, matchings.size());
        var es = new EditScript(doc1, doc2, matchings);
        var delta = es.create();
        assert.equal(0, delta.getChanges().length);
      });
    });
  });
  
}).call(this);