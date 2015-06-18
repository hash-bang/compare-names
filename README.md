compare-names
=============
Fuzzily compare two arrays of names.

This module is intended mainly for comparing research paper author lists.

It takes two arrays of authors and simply returns a boolean if the authors *look like* they are the same.


	var compareNames = require('compare-names');
	compareNames(
		['Izbicki, R', 'Weyhing, B. T. I.', 'Backer, L'],
		['Izbicki, R 3rd', 'Weyhing, B. T.', 'Backer, L', 'Caoili, E.', 'M.l Vaitkevicius, V.K.']
	);
	// Returns true

See the [unit tests](test/) for more examples.
