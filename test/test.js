var ca = require('..');
var expect = require('chai').expect;

describe('compare-authors', function() {
	it('should accept initalisms', function() {
		expect(ca(
			['Light, Richard W.'],
			['Light, R. W.']
		)).to.be.true;
	});

	it('should accept string inputs', function() {
		expect(ca(
			'Light, Richard W.',
			'Light, R. W.'
		)).to.be.true;
	});

	it('should accept numeric decendents', function() {
		expect(ca(
			['Izbicki, R', 'Weyhing, B. T. I.', 'Backer, L'],
			['Izbicki, R 3rd', 'Weyhing, B. T.', 'Backer, L', 'Caoili, E.', 'M.l Vaitkevicius, V.K.']
		)).to.be.true;
	});

	it('should accept shortened names', function() {
		expect(ca(
			['Masciom Christopher E.', 'Austin, Erle H.'],
			['Masciom, C.E.', 'Austin, E. H.']
		)).to.be.true;
	});

	it('should accept shortened names #2', function() {
		expect(ca(
			['Masciom Christopher E.', 'Austin, Erle H.'], 
			['Mascom, C.E.', 'Austin, E. H.']
		)).to.be.ok;
	});

	it('should ignore case', function() {
		expect(ca(
			['Masciom Christopher E.', 'Austin, Erle H.'],
			['masciom christopher e.', 'austin, erle h.']
		)).to.be.true;
	});

	it('should ignore case #2', function() {
		expect(ca(
			['Masciom Christopher E.', 'Austin, Erle H.'],
			['MASCIOM CHRISTOPHER E.', 'AUSTIN, ERLE H.']
		)).to.be.true;
	});

	it('should ignore case #3', function() {
		expect(ca(
			['masciom christopher e.', 'austin, erle h.'],
			['MASCIOM CHRISTOPHER E.', 'AUSTIN, ERLE H.']
		)).to.be.true;
	});

	it('should discard punctuation', function() {
		expect(ca(
			'Toomes, H',
			'Toomes, H.'
		)).to.be.true;
	});

	it('should discard non-ascii characters', function() {
		expect(ca(
			'Brynitz, S; Friis-Moller, A.',
			'Brynitz, S; Friis-MØller, A.'
		)).to.be.true;
	});

	it('should match abbreviated initalisms', function() {
		expect(ca(
			'Hulzebos, E. H. J; Helders, P. J.; Favie, N. J.',
			'Hulzebos, E. H.; Helders, Paul J.; Favie, N. J.'
		)).to.be.true;
	});

	it('should not accept outright wrong names', function() {
		expect(ca(
			'Foobarson, Robert A.',
			'Smith, Baringson'
		)).to.be.false;
	});

	it('should not accept misordered names', function() {
		expect(ca(
			['Hulzebos, E. H. J',  'Helders, P. J.', 'Favie, N. J.'],
			['Favie, N. J.', 'Helders, Paul J.', 'Hulzebos, E. H.']
		)).to.be.false;
	});
});
