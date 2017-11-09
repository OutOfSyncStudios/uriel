// app/lib/lodashExt.js

const __ = require('lodash');

const isUnset = (obj) => {
  let test;
  try {
    test = __.isNull(obj) || __.isUndefined(obj);
  } catch (err) {
    test = true;
  }
  return test;
};

const hasValue = (obj) => {
  return !__.isUnset(obj);
};

const implies = (va, vb) => {
  return !va || vb;
};

__.mixin({ isUnset: isUnset });
__.mixin({ hasValue: hasValue });
__.mixin({ implies: implies });

module.exports = __;
