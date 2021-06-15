if (typeof module !== 'undefined' && module.exports) { // check we're server-side
  var QUnit = require('qunitjs'); // require QUnit node.js module
  var test = QUnit.test; // stores a copy of QUnit.test
  require('qunit-tap')(QUnit, console.log); // use console.log for test output
  var methods = require('./public/index.js');
  var register = methods.register;
  var login = methods.login;
  var genrateRandomEmail = methods.genrateRandomEmail;
  var logout = methods.logout;
  var getCategoryAndProductId = methods.getCategoryAndProductId;
  var cartToFirebase = methods.cartToFirebase;
  var removeProduct = methods.removeProduct;
  var updateQuantity = methods.updateQuantity;
  var confirmYourOrder = methods.confirmYourOrder;
  var checkoutOpen = methods.checkoutOpen;
  var isEmpty = methods.isEmpty;
  var indexOnOpen = methods.indexOnOpen;
}

var existingEmail = "shlomo@gmail.com";
//sprint 1 
//Registration acceptance criteria

//first password is not given but all other inputs are valid
QUnit.test( 'register("first name","last name","17-22-2000","shlomo@brill.com","","123456") should return "Enter both password"', assert => {
  return register("abc","xyz","17-22-2000",existingEmail,"","123456").then( result => {
    assert.equal( result, "Enter both passwords");
  });
});

//second password is not given but all other inputs are valid
QUnit.test( 'register("first name","last name","17-22-2000","shlomo@brill.com","123456","") should return "Enter both password"', assert => {
  return register("abc","xyz","17-22-2000",existingEmail,"123456","").then( result => {
    assert.equal( result, "Enter both passwords");
  });
});

//all valid details are given but passwords do not match
QUnit.test( 'register("first name","last name","17-22-2000","shlomo@brill.com","123456","123455") should return "Passwords do not match. Please try again."', assert => {
  return register("first name","last name","17-22-2000",existingEmail,"123456","123455").then( result => {
    assert.equal( result, "Passwords do not match. Please try again.");
  });
});

//first name is not given but all other inputs are valid
QUnit.test( 'register("","last name","17-22-2000","shlomo@brill.com","123456","123456") should return "Ensure all fields are filled"', assert => {
  return register("","last name","17-22-2000",existingEmail,"123456","123456").then( result => {
    assert.equal( result, "Ensure all fields are filled");
  });
});

//last name is not given but all other inputs are valid
QUnit.test( 'register("first name","","17-22-2000","shlomo@brill.com","123456","123456") should return "Ensure all fields are filled"', assert => {
  return register("first name","","17-22-2000",existingEmail,"123456","123456").then( result => {
    assert.equal( result, "Ensure all fields are filled");
  });
});

//date is not given but all other inputs are valid
QUnit.test( 'register("first name","last name","","shlomo@brill.com","123456","123456") should return "Ensure all fields are filled"', assert => {
  return register("first name","last name","",existingEmail,"123456","123456").then( result => {
    assert.equal( result, "Ensure all fields are filled");
  });
});

//email is not given but all other inputs are valid
QUnit.test( 'register("first name","last name","17-22-2000","","123456","123456") should return "Ensure all fields are filled"', assert => {
  return register("first name","last name","17-22-2000","","123456","123456").then( result => {
    assert.equal( result, "Ensure all fields are filled");
  });
});

//password length is less than 6 but all other inputs are valid
QUnit.test( 'register("first name","last name","17-22-2000","shlomo@brill.com","12345","12345") should return "Password should be at least 6 characters"', assert => {
  return register("first name","last name","17-22-2000",existingEmail,"12345","12345").then( result => {
    assert.equal( result, "Password should be at least 6 characters");
  });
});

//invalid email but all other inputs are valid
QUnit.test( 'register("first name","last name","17-22-2000","shlomogmail.co.za","123456","123456") should return "The email address is badly formatted."', assert => {
  return register("first name","last name","17-22-2000","jngmail.com","123456","123456").then( result => {
    assert.equal( result, "The email address is badly formatted.");
  });
});

//Registration - all correct details done at the botom of the pgae


//Login acceptance criteria 

// login - valid password given and email not given 
QUnit.test( 'login("", "123456") should return The email address is badly formatted.', assert => {
  return login("", "123456").then( result => {
    assert.equal( result, "The email address is badly formatted.");
  });
});

// login - valid email given and password not given 
QUnit.test( 'login("shlomo@brill.com", "") should return "The password is invalid or the user does not have a password."', assert => {
  return login(existingEmail, "").then( result => {
    assert.equal( result, "The password is invalid or the user does not have a password.");
  });
});

// login - email and password given but password not valid
QUnit.test( 'login("shlomo@brill.com", "123") should return "The password is invalid or the user does not have a password."', assert => {
  return login(existingEmail, "123").then( result => {
    assert.equal( result, "The password is invalid or the user does not have a password.");
  });
});

// login - password valid but email invalid
QUnit.test( 'login("shlomhjgo@brill.com", "123456") should return "There is no user record corresponding to this identifier. The user may have been deleted."', assert => {
  return login("shlomhjgo@brill.com", "123456").then( result => {
    assert.equal( result, "There is no user record corresponding to this identifier. The user may have been deleted.");
  });
});

// login - email given but without @ 
QUnit.test( 'login("shlomhjgobrill.com", "123456") should return "The email address is badly formatted."', assert => {
  return login("shlomhjgobrill.com", "123456").then( result => {
    assert.equal( result, "The email address is badly formatted.");
  });
});

// login - successful login
QUnit.test( 'login("shlomo@brill.com", "123") should return "The password is invalid or the user does not have a password."', assert => {
  return login(existingEmail, "123456").then( result => {
    assert.equal( result, "success");
  });
});

// ------------------------------------------------------
// logout - testing if successful
QUnit.test( 'logout() should return "success"', assert => {
  return logout().then( result => {
    assert.equal( result, "success");
  });
});

//testing getCategoryAndProductId
//used for checking out. Length = 4
test('getCategoryAndProductId(1000) should return ["Clothes",0]', function(assert){
  var result = getCategoryAndProductId(1000);
  var expected = ["Clothes",0];
  assert.deepEqual(result, expected);
});

//used for checking out. Length = 5
test('getCategoryAndProductId(20010) should return ["Food",10]', function(assert){
  var result = getCategoryAndProductId(20010);
  var expected = ["Food",10];
  assert.deepEqual(result, expected);
});

var firebase = require('firebase');
var email = existingEmail;
var password = "123456";

//teting cartToFirebase 
QUnit.test( 'cartToFirebase() should return "Product has been added to your cart"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        assert.equal( result, "Product has been added to your cart");
      });
  })
});

//teting removeProduct function
QUnit.test( 'removeProduct() should return "Success"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {
          assert.equal( result, "Success");
        });
      });
  })
});

//testing updateQuantity function
QUnit.test( 'updateQuantity() should return "Success"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return updateQuantity("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1",10).then( result => {
          assert.equal( result, "Success");
          return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {
          });
        });
      });
  })
});

// teting checkoutOpen function 
QUnit.test( 'checkoutOpen() should return "?"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return updateQuantity("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1",50).then( result => {
          return checkoutOpen().then( result => {
            assert.equal( result, true);
            return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {
            });
          });        
        });
      });
  })
});

// teting confirmYourOrder function for not enough funds but valid address
QUnit.test( 'confirmYourOrder("street","suburb","city","province","2125") should return "You do not have enough funds to complete this order"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return updateQuantity("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1",5000).then( result => {
          return checkoutOpen().then( result => {
            return confirmYourOrder("street","suburb","city","province","2125").then(result => {
              assert.equal( result, "You do not have enough funds to complete this order");
              return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {
              });
            })
          });
        });
      });
  })
});

// teting confirmYourOrder function for address not given but enough funds
QUnit.test( 'confirmYourOrder("","","","","") should return "Address details not provided"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return updateQuantity("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1",20).then( result => {
          return checkoutOpen().then( result => {
            return confirmYourOrder("","","","","").then(result => {
              assert.equal( result, "Address details not provided");
              return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {
              });
            })
          });
        });
      });
  })
});

// teting confirmYourOrder function for enough funds and address given
QUnit.test( 'confirmYourOrder("street","suburb","city","province","2125") should return "Success"', assert => {
  return firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      return cartToFirebase("1001").then( result => {
        return updateQuantity("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1",3).then( result => {
          return checkoutOpen().then( result => {
            return confirmYourOrder("street1","suburb1","city1","province1","21251").then(result => {
              assert.equal( result, "Success");
              // return removeProduct("UBD2CEnogEM5sLGkYeTd0ycWd1Y2#Clothes_id1").then( result => {});
            })
          });
        });
      });
  })
});

// // testing isEmpty function when array is not empty 
// QUnit.test( 'isEmpty([1,2,3]) testing, should return false', assert => {
//   result = isEmpty([1,2,3]);
//   assert.equal( result, false);
// });

// // testing isEmpty function when array is not empty 
// QUnit.test( 'isEmpty([]) testing should return true', assert => {
//   result = isEmpty([]);
//   assert.equal( result, true);
// });

// testing randomEmailGenerator function 
QUnit.test( 'generateRandomEmail(5) testing ', assert => {
    result = genrateRandomEmail(5).length;
    assert.equal( result, 15);
});

randEmail = genrateRandomEmail(5);
// All Registration details are valid with random email created
QUnit.test( 'register("first name","last name","17-22-2000","'+randEmail+'","123456","123456", true) should return "Success"', assert => {
  return register("first name","last name","17-22-2000",randEmail,"123456","123456", true).then( result => {
    assert.equal( result, "Success");
  });
});

if (typeof module !== 'undefined' && module.exports) { QUnit.load(); } // run the tests
