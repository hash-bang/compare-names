var _ = require('lodash');
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
* @return boolean True if a ≈ b
*/
function fuzzyStringCompare(a, b) {
	if (a == b) return true;

	var as = stripNoise(a);
	if (as.length > 255) as = as.substr(0, 255);

	var bs = stripNoise(b);
	if (bs.length > 255) bs = bs.substr(0, 255);

	if (levenshtein(as, bs) < 10) return true;
}


/**
* Returns true if the string 'looks' numeric
* e.g. '1st', '23rd'
* @param string string The string to examine
* @return boolean True if the string appears to be numeric
*/
function isDecendentNumeric(a) {
	return /^[0-9]+(st|nd|rd|th)$/.test(a);
}


/**
* Splits an author string into its component parts
* @param string author The raw author string to split
* @param boolean firstLast Whether to allow firstname-lastname hyman style names (e.g. 'John Smith'). If false all names are treated as if they are specified in last-first order
* @return array An array composed of lastname, initial/name
*/
function splitAuthor(author, firstLast) {
	var out = [];

	var re = new RegExp('/^(.*?)' + (firstLast ? ',' : ',?') + '\s*(.*)\s*$/');
	var matches = re.exec(author);
	if (matches) {
		if (matches[1]) out.push(matches[1]);
		matches[2].split(/\s*(\.| )\s*/).forEach(function(rawInitial) {
			var initial = rawInitial
				.replace(/^\s+/, '')
				.replace(/\s+$/, '');
			if (initial) out.push(initial);
		});
	} else if (firstLast && (matches = /^(.*)\s+(.*)/.exec(author))) {
		out.push(matches[2]);
		matches[1].split(/\s*(\.| )\s*/).forEach(function(rawInitial) {
			var initial = rawInitial
				.replace(/^\s+/, '')
				.replace(/\s+$/, '');
		});
	} else { // No idea - return the whole string as an entry
		out.push(author);
	}
	return out;
}

/**
* Compare an array of authors against a second array
* @param array a The first array of authors
* @param array b The second array of authors
* @return bolean True if a ≈ b
*/
function compareNames(a, b) {
	var authorLimit = Math.min(a.length, b.length);

	if (!_.isArray(a)) a = [a];
	if (!_.isArray(b)) b = [b];

	var aPos = 0, bPos = 0;
	var failed = false;
	while (aPos < authorLimit && bPos < authorLimit) {
		if (isDecendentNumeric(a[aPos])) {
			aPos++;
		} else if (isDecendentNumeric(b[bPos])) {
			bPos++;
		} else if (a[aPos] == b[bPos] || fuzzyStringCompare(a[aPos], b[bPos])) {
			aPos++;
			bPos++;
		} else {
			var aAuth = splitAuthor(a[aPos]);
			var bAuth = splitAuthor(b[aPos]);
			var nameLimit = Math.min(aAuth.length, bAuth.length);
			var nameMatches = 1;
			for (var n = 0; n < nameLimit; n++) {
				if (
					aAuth[n] == bAuth[n] || // Direct match
					aAuth[n].length == 1 && bAuth[n].substr(0, 1) || // A is initial and B is full name
					bAuth[n].length == 1 && aAuth[n].substr(0, 1) ||
					fuzzyStringCompare(aAuth[n], bAuth[n])
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
		aPos++;
	}
	return !failed;
}

module.exports = compareNames;
