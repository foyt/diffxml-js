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
 * Fmes finds the differences between two DOM documents.
 *
 * Uses the Fast Match Edit Script algorithm (fmes).
 */
Fmes = DiffXmlUtils.createClass(null, { 
  init: function () {
  },
  proto : /** @lends Fmes.prototype */ {
    /**
     * Differences two DOM documents and returns the delta.
     *
     * @param document1    The original document
     * @param document2    The new document
     * @param delta        (optional) Delta object to be used
     *
     * @return A delta of changes
     */
    diff: function (document1, document2, delta) {
      var matchings = Match.easyMatch(document1, document2);
      return (new EditScript(document1, document2, matchings)).create(delta);
    } 
  }
});