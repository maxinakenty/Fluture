import chai from 'chai';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';
import {
  Future,
  isFuture,
  fork,
  forkCatch,
  value,
  done,
  promise,
  seq,
  Par,
  extractLeft,
  extractRight,
  never,
  isNever,
} from '../index.mjs';

var expect = chai.expect;

describe('Future', function (){

  it('instances are considered members of fluture/Future by sanctuary-type-identifiers', function (){
    expect(type(F.mock)).to.equal(Future['@@type']);
  });

  describe('.never', function (){
    it('is a Future', function (){
      expect(isFuture(never)).to.equal(true);
      expect(type(never)).to.equal(Future['@@type']);
      expect(never).to.be.an.instanceof(Future);
    });
    it('is never', function (){
      expect(isNever(never)).to.equal(true);
    });
  });

  describe('.isFuture()', function (){

    var ms = [F.mock];
    var xs = [NaN, 1, true, undefined, null, [], {}, {fork: function (a, b){ return ({a: a, b: b}) }}];

    it('returns true when given a Future', function (){
      ms.forEach(function (m){ return expect(isFuture(m)).to.equal(true) });
    });

    it('returns false when not given a Future', function (){
      xs.forEach(function (x){ return expect(isFuture(x)).to.equal(false) });
    });

  });

  describe('.fork()', function (){

    it('is a curried ternary function', function (){
      expect(fork).to.be.a('function');
      expect(fork.length).to.equal(3);
      expect(fork(U.noop)).to.be.a('function');
      expect(fork(U.noop, U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', function (){
      var f = function (){ return fork(1) };
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Function as second argument', function (){
      var f = function (){ return fork(U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('throws when not given a Future as third argument', function (){
      var f = function (){ return fork(U.add(1), U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*third/);
    });

    it('dispatches to #_interpret()', function (done){
      var a = function (){};
      var b = function (){};
      var mock = Object.create(F.mock);

      mock._interpret = function (rec, rej, res){
        expect(rec).to.be.a('function');
        expect(rej).to.equal(a);
        expect(res).to.equal(b);
        done();
      };

      fork(a, b, mock);
    });

  });

  describe('.forkCatch()', function (){

    it('is a curried quaternary function', function (){
      expect(forkCatch).to.be.a('function');
      expect(forkCatch.length).to.equal(4);
      expect(forkCatch(U.noop)).to.be.a('function');
      expect(forkCatch(U.noop, U.noop)).to.be.a('function');
      expect(forkCatch(U.noop)(U.noop)).to.be.a('function');
      expect(forkCatch(U.noop)(U.noop, U.noop)).to.be.a('function');
      expect(forkCatch(U.noop, U.noop)(U.noop)).to.be.a('function');
      expect(forkCatch(U.noop)(U.noop)(U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', function (){
      var f = function (){ return forkCatch(1) };
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Function as second argument', function (){
      var f = function (){ return forkCatch(U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('throws when not given a Function as third argument', function (){
      var f = function (){ return forkCatch(U.add(1), U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*third/);
    });

    it('throws when not given a Future as fourth argument', function (){
      var f = function (){ return forkCatch(U.add(1), U.add(1), U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*fourth/);
    });

    it('dispatches to #_interpret()', function (done){
      var a = function (){};
      var b = function (){};
      var c = function (){};
      var mock = Object.create(F.mock);

      mock._interpret = function (rec, rej, res){
        expect(rec).to.be.a('function');
        expect(rej).to.equal(b);
        expect(res).to.equal(c);
        done();
      };

      forkCatch(a, b, c, mock);
    });

    it('ensures the recovery value has a consistent type', function (done){
      var mock = Object.create(F.mock);
      mock._interpret = function (rec){
        rec(42);
      };
      forkCatch(function (x){
        expect(x).to.be.an.instanceof(Error);
        expect(x.name).to.equal('Error');
        expect(x.message).to.equal(
          'Non-Error occurred while running a computation for a Future:\n\n' +
          '  42'
        );
        done();
      }, U.noop, U.noop, mock);
    });

  });

  describe('.value()', function (){

    it('is a curried binary function', function (){
      expect(value).to.be.a('function');
      expect(value.length).to.equal(2);
      expect(value(U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', function (){
      var f = function (){ return value(1) };
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Future as second argument', function (){
      var f = function (){ return value(U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('dispatches to #value()', function (done){
      var a = function (){};
      var mock = Object.create(F.mock);

      mock.value = function (x){
        expect(x).to.equal(a);
        done();
      };

      value(a, mock);
    });

  });

  describe('.done()', function (){

    it('is a curried binary function', function (){
      expect(done).to.be.a('function');
      expect(done.length).to.equal(2);
      expect(done(U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', function (){
      var f = function (){ return done(1) };
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Future as second argument', function (){
      var f = function (){ return done(U.add(1), 1) };
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('dispatches to #done()', function (fin){
      var a = function (){};
      var mock = Object.create(F.mock);

      mock.done = function (x){
        expect(x).to.equal(a);
        fin();
      };

      done(a, mock);
    });

  });

  describe('.promise()', function (){

    it('throws when not given a Future', function (){
      var f = function (){ return promise(1) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #promise', function (done){
      var mock = Object.create(F.mock);
      mock.promise = done;
      promise(mock);
    });

  });

  describe('.seq()', function (){

    it('throws when not given a Parallel', function (){
      var f = function (){ return seq(1) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('returns the Future contained in the Parallel', function (){
      var par = Par(F.mock);
      var x = seq(par);
      expect(x).to.equal(F.mock);
    });

  });

  describe('.extractLeft()', function (){

    it('throws when not given a Future', function (){
      var f = function (){ return extractLeft(1) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #extractLeft', function (done){
      var mock = Object.create(F.mock);
      mock.extractLeft = done;
      extractLeft(mock);
    });

  });

  describe('.extractRight()', function (){

    it('throws when not given a Future', function (){
      var f = function (){ return extractRight(1) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #extractRight', function (done){
      var mock = Object.create(F.mock);
      mock.extractRight = done;
      extractRight(mock);
    });

  });

  describe('#pipe()', function (){

    it('throws when invoked out of context', function (){
      var f = function (){ return F.mock.pipe.call(null, U.noop) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when not given a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.pipe(x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('calls the given function on itself', function (){
      var guard = {};
      var actual = F.mock.pipe(f);
      expect(actual).to.equal(guard);
      function f (m){
        expect(m).to.equal(F.mock);
        return guard;
      }
    });

  });

  describe('#fork()', function (){

    it('throws when invoked out of context', function (){
      var f = function (){ return Future.prototype.fork.call(null, U.noop, U.noop) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when first argument is not a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.fork(x, U.noop) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws TypeError when second argument is not a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.fork(U.noop, x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('does not throw when both arguments are functions', function (){
      var mock = Object.create(F.mock);
      mock._interpret = U.noop;
      var f = function (){ return mock.fork(U.noop, U.noop) };
      expect(f).to.not.throw();
    });

    it('throws when called on a crashed Future', function (){
      var mock = Object.create(F.mock);
      mock._interpret = function (rec){ rec(U.error) };
      var f = function (){ return mock.fork(U.noop, U.noop) };
      expect(f).to.throw(Error, (
        'Error occurred while running a computation for a Future:\n\n' +
        '  Intentional error for unit testing'
      ));
    });

    it('dispatches to #_interpret()', function (done){
      var a = function (){};
      var b = function (){};
      var mock = Object.create(F.mock);

      mock._interpret = function (rec, rej, res){
        expect(rec).to.be.a('function');
        expect(rej).to.equal(a);
        expect(res).to.equal(b);
        done();
      };

      mock.fork(a, b);
    });

  });

  describe('#forkCatch()', function (){

    it('throws when invoked out of context', function (){
      var f = function (){ return Future.prototype.forkCatch.call(null, U.noop, U.noop, U.noop) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when first argument is not a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.forkCatch(x, U.noop) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws TypeError when second argument is not a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.forkCatch(U.noop, x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws TypeError when third argument is not a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.forkCatch(U.noop, U.noop, x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('does not throw when all arguments are functions', function (){
      var mock = Object.create(F.mock);
      mock._interpret = U.noop;
      var f = function (){ return mock.forkCatch(U.noop, U.noop, U.noop) };
      expect(f).to.not.throw();
    });

    it('dispatches to #_interpret()', function (done){
      var a = function (){};
      var b = function (){};
      var c = function (){};
      var mock = Object.create(F.mock);

      mock._interpret = function (rec, rej, res){
        expect(rec).to.be.a('function');
        expect(rej).to.equal(b);
        expect(res).to.equal(c);
        done();
      };

      mock.forkCatch(a, b, c);
    });

    it('ensures the recovery value has a consistent type', function (done){
      var mock = Object.create(F.mock);
      mock._interpret = function (rec){
        rec(42);
      };
      mock.forkCatch(function (x){
        expect(x).to.be.an.instanceof(Error);
        expect(x.name).to.equal('Error');
        expect(x.message).to.equal(
          'Non-Error occurred while running a computation for a Future:\n\n' +
          '  42'
        );
        done();
      }, U.noop, U.noop);
    });

  });

  describe('#value()', function (){

    it('throws when invoked out of context', function (){
      var f = function (){ return F.mock.value.call(null, U.noop) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when not given a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.value(x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('dispatches to #_interpret(), using the input as resolution callback', function (done){
      var res = function (){};
      var mock = Object.create(F.mock);

      mock._interpret = function (rec, l, r){
        expect(r).to.equal(res);
        done();
      };

      mock.value(res);
    });

    it('throws when _interpret calls the rejection callback', function (){
      var mock = Object.create(F.mock);
      mock._interpret = function (rec, rej){rej(1)};
      expect(mock.value.bind(mock, U.noop)).to.throw(Error, (
        'Future#value was called on a rejected Future\n' +
        '  Rejection: 1\n' +
        '  Future: (util.mock)'
      ));
    });

    it('returns the return value of #_interpret()', function (){
      var mock = Object.create(Future.prototype);
      var sentinel = {};
      mock._interpret = function (){ return sentinel };
      expect(mock.value(U.noop)).to.equal(sentinel);
    });

  });

  describe('#done()', function (){

    it('throws when invoked out of context', function (){
      var f = function (){ return F.mock.done.call(null, U.noop) };
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when not given a function', function (){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function (x){ return function (){ return F.mock.done(x) } });
      fs.forEach(function (f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('passes the rejection value as first parameter', function (fin){
      var mock = Object.create(Future.prototype);
      mock._interpret = function (_, l){l(1)};
      mock.done(function (x, y){
        expect(x).to.equal(1);
        expect(y).to.equal(undefined);
        fin();
      });
    });

    it('passes the resolution value as second parameter', function (fin){
      var mock = Object.create(Future.prototype);
      mock._interpret = function (_, l, r){r(1)};
      mock.done(function (x, y){
        expect(x).to.equal(null);
        expect(y).to.equal(1);
        fin();
      });
    });

    it('returns the return done of #_interpret()', function (){
      var mock = Object.create(Future.prototype);
      var sentinel = {};
      mock._interpret = function (){ return sentinel };
      expect(mock.done(U.noop)).to.equal(sentinel);
    });

  });

  describe('#promise()', function (){

    it('returns a Promise', function (){
      var mock = Object.create(Future.prototype);
      mock._interpret = U.noop;
      var actual = mock.promise();
      expect(actual).to.be.an.instanceof(Promise);
    });

    it('resolves if the Future resolves', function (done){
      var mock = Object.create(Future.prototype);
      mock._interpret = function (_, l, r){ return r(1) };
      mock.promise().then(
        function (x){ return (expect(x).to.equal(1), done()) },
        done
      );
    });

    it('rejects if the Future rejects', function (done){
      var mock = Object.create(Future.prototype);
      mock._interpret = function (_, l){ return l(1) };
      mock.promise().then(
        function (){ return done(new Error('It resolved')) },
        function (x){ return (expect(x).to.equal(1), done()) }
      );
    });

  });

  describe('#extractLeft()', function (){

    it('returns empty array', function (){
      expect(F.mock.extractLeft()).to.deep.equal([]);
    });

  });

  describe('#extractRight()', function (){

    it('returns empty array', function (){
      expect(F.mock.extractRight()).to.deep.equal([]);
    });

  });

});
