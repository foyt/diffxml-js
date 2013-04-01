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
 * @class Class to hold pairs of nodes.
 */
NodeSequence = /** @lends NodeSequence */ {
  
  /**
   * Gets the nodes in set1 which have matches in set2.
   *
   * @param set1      the first set of nodes
   * @param set2      the set of nodes to match against
   * @param matchings the set of matching nodes
   *
   * @return the nodes in set1 which have matches in set2
   */
  getSequence: function (set1, set2, matchings) {
    var seq = null;
    if (set1 != null && set2 != null) {
      var resultSet = new Array();
      var set2list = new Array();
      for (var i = 0, l = set2.length; i < l; i++) {
        set2list.push(set2.item(i));
      }
      
      for (var i = 0, l = set1.length; i < l; i++) {
        if (set2list.indexOf(matchings.getPartner(set1.item(i))) != -1) {
          resultSet.push(set1.item(i));
        }   
      }
      
      seq = resultSet;
    }
    
    return seq; 
  },

  /**
   * Gets the Longest Common Subsequence for the given Node arrays.
   * 
   * "Matched" Nodes are considered equal.
   * The returned nodes are from s1.
   * 
   * TODO: Check for better algorithms
   * 
   * @param s1 First Node sequence 
   * @param s2 Second Node sequence
   * @param matchings Set of matching Nodes
   * @return A list of Nodes representing the Longest Common Subsequence 
   */
  getLCS: function (s1, s2, matchings) {
    var num = new Array();
    for (var i = 0, l = s1.length + 1; i < l; i++) {
      var subArray = new Array();
      for (var j = 0, jl = s2.length + 1; j < jl; j++) {
        subArray.push(0);
      }
      
      num.push(subArray);
    }
    
    for (var i = 1; i <= s1.length; i++) {
      for (var j = 1; j <= s2.length; j++) {
        var n1 = matchings.getPartner(s1[i - 1]);
        var n2 = s2[j - 1];
        if (NodeOps.checkIfSameNode(n1, n2)) {
          num[i][j] = 1 + num[i - 1][j - 1];
        } else {
          num[i][j] = Math.max(num[i - 1][j], num[i][j - 1]);
        }
      }
    }
    
    //Length of LCS is num[s1.length][s2.length]);

    var s1position = s1.length; 
    var s2position = s2.length;
    
    var result = new Array();

    while (s1position != 0 && s2position != 0) {
      if (NodeOps.checkIfSameNode(matchings.getPartner(s1[s1position - 1]), s2[s2position - 1])) {
        result.unshift(s1[s1position - 1]);
        s1position--;
        s2position--;
      } else if (num[s1position][s2position - 1] >= num[s1position - 1][s2position]) {
        s2position--;
      } else {
        s1position--;
      }
    }

    return result;
  }   
};