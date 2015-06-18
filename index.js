var isArray = require('lodash.isarray');
var levenshtein = require('levenshtein-dist');

/**
* Remove reference 'noise' from a string
* @param string a The string to remove the noise from
* @return string The input string with all noise removed
*/
function stripNoise(a) {
	return a
		.replace(/[^a-z0-9]+/i, ' ')
		.replace(/ (the|a) /, ' ');
}

/**
* Fuzzily compare strings a and b
* @param string a The first string to compare
* @param string b The second string to compare
* @param number tolerence The tolerence when comparing using levenshtein, defaults to 10
* @return boolean True if a ≈ b
*/
function fuzzyStringCompare(a, b, tolerence) {
	if (a == b) return true;

	var as = stripNoise(a);
	if (as.length > 255) as = as.substr(0, 255);

	var bs = stripNoise(b);
	if (bs.length > 255) bs = bs.substr(0, 255);

	if (tolerence == undefined && levenshtein(as, bs) < 10) return true;
	if (tolerence && levenshtein(as, bs) <= tolerence) return true;
}


/**
* Splits an author string into its component parts
* @param string author The raw author string to split
* @return array An array composed of lastname, initial/name
*/
function splitAuthor(author) {
	return author
		.split(/\s*[,\.\s]\s*/)
		.filter(function(i) { return !!i }) // Strip out blanks
		.filter(function(i) { return !/^[0-9]+(st|nd|rd|th)$/.test(i) }); // Strip out decendent numerics (e.g. '1st', '23rd')
}


/**
* Splits a single string of multiple authors into an array
* @param string str The string to split
* @return array The array of extracted authors
*/
function splitAuthorString(str) {
	return str.split(/\s*;\s*/);
}


/**
* Compare an array of authors against a second array
* @param array a The first array of authors
* @param array b The second array of authors
* @return bolean True if a ≈ b
*/
function compareNames(a, b) {
	if (!isArray(a)) a = splitAuthorString(a);
	if (!isArray(b)) b = splitAuthorString(b);

	var aPos = 0, bPos = 0;
	var authorLimit = Math.min(a.length, b.length);
	var failed = false;

	while (aPos < authorLimit && bPos < authorLimit) {
		if (fuzzyStringCompare(a[aPos], b[bPos])) { // Direct or fuzzy matching of entire strings
			aPos++;
			bPos++;
		} else {
			var aAuth = splitAuthor(a[aPos]);
			var bAuth = splitAuthor(b[bPos]);
			var nameLimit = Math.min(aAuth.length, bAuth.length);
			var nameMatches = 0;
			for (var n = 0; n < nameLimit; n++) {
				if (
					aAuth[n] == bAuth[n] || // Direct match
					aAuth[n].length == 1 && bAuth[n].substr(0, 1) || // A is initial and B is full name
					bAuth[n].length == 1 && aAuth[n].substr(0, 1) ||
					(aAuth[n].length > 1 && bAuth[n].length > 1 && fuzzyStringCompare(aAuth[n], bAuth[n], 3))
				) {
					nameMatches++;
				}
			}

			if (nameMatches >= nameLimit) {
				aPos++;
				bPos++;
			} else {
				failed = true;
			}
			break;
		}
	}
	return !failed;
}

module.exports = compareNames;
