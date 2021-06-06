if (typeof module !== 'undefined' && module.exports) { // check we're server-side
  var QUnit = require('qunitjs'); // require QUnit node.js module
  // alias the QUnit.test method so we don't have to change all our tests
  var test = QUnit.test; // stores a copy of QUnit.test
  require('qunit-tap')(QUnit, console.log); // use console.log for test output
  // var passwordsEqual = require('./public/index.js'); // load our passwordsEqual method   
  var register = require('./public/index.js'); // load our register method   
}

test('register("","1","1","1","1","1") should return "Please ensure all fields are filled"', function(assert){
  var result = register("","1","1","1","1","1"); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","","1","1","1","1")  should return "Please ensure all fields are filled"', function(assert){
  var result = register("1","","1","1","1","1"); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","1","","1","1","1")  should return "Please ensure all fields are filled"', function(assert){
  var result = register("1","1","","1","1","1"); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","1","1","","1","1") should return "Please ensure all fields are filled"', function(assert){
  var result = register("1","1","1","","1","1"); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","1","1","1","","1")  should return "Please ensure all fields are filled"', function(assert){
  var result = register("1","1","1","1","","1"); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","1","1","1","1","")  should return "Please ensure all fields are filled"', function(assert){
  var result = register("1","1","1","1","1",""); 
  var expected = "Please ensure all fields are filled";
  assert.deepEqual(result, expected); 
});

test('register("1","1","1","1","1","1")  should return "testing for correctness"', function(assert){
  var result = register("1","1","1","1","1","1"); 
  var expected = true;
  assert.deepEqual(result, expected); 
});



//passwords matching
//  test('passwordsEqual(12, 12) should return true', function(assert) {
//   var result = passwordsEqual(12, 12);
//   var expected = true;
//   assert.deepEqual(result, expected);
// });

// test('passwordsEqual(12, 4) should return false', function(assert) {
//   var result = passwordsEqual(12, 4);
//   var expected = false;
//   assert.deepEqual(result, expected);
// });

// test('isFieldEmpty()', function(assert){
//   var result = isAnyFieldEmpty("","","","","","");
//   var expected = "Some fields are empty";
//   assert.deepEqual(result, expected); 
// });


if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run the tests
