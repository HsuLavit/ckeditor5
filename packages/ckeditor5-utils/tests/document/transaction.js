/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

var modules = bender.amd.require(
	'document/transaction',
	'document/deltas/delta' );

describe( 'Transaction', () => {
	var Transaction, Delta;

	before( () => {
		Transaction = modules[ 'document/transaction' ];
		Delta = modules[ 'document/deltas/delta' ];
	} );

	it( 'should have registered basic methods', () => {
		var transaction = new Transaction();

		expect( transaction.setAttr ).to.be.a( 'function' );
		expect( transaction.removeAttr ).to.be.a( 'function' );
	} );

	describe( 'Transaction.register', () => {
		var TestDelta;

		before( () => {
			TestDelta = class extends Delta {
				constructor( transaction ) {
					super( transaction, [] );
				}
			};
		} );

		afterEach( () => {
			delete Transaction.prototype.foo;
		} );

		it( 'should register function which return an delta', () => {
			Transaction.register( 'foo', ( doc, t ) => {
				t.addDelta( new TestDelta() );
			} );

			var transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 1 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should register function which return an multiple deltas', () => {
			Transaction.register( 'foo', ( doc, t ) => {
				t.addDelta( new TestDelta() );
				t.addDelta( new TestDelta() );
			} );

			var transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 2 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
			expect( transaction.deltas[ 1 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should pass arguments properly', () => {
			var doc = 'doc';
			var arg = 'arg';

			var transaction = new Transaction( doc );

			var stub = sinon.stub().returns( new TestDelta( transaction ) );

			Transaction.register( 'foo', stub );

			transaction.foo( arg );

			sinon.assert.calledWith( stub, doc, transaction, arg );
		} );
	} );
} );