var firebase = require('firebase');
var firebaseConfig = {
  apiKey: "AIzaSyBmJqjAXztETX4Dh4vEetlB4QzN9uqReYA",
  authDomain: "witsmarketproject.firebaseapp.com",
  databaseURL: "https://witsmarketproject-default-rtdb.firebaseio.com",
  projectId: "witsmarketproject",
  storageBucket: "witsmarketproject.appspot.com",
  messagingSenderId: "650642470600",
  appId: "1:650642470600:web:49fe3a262e6ca122b597fd",
  measurementId: "G-EHXK572PE1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.auth.Auth.Persistence.LOCAL;


function login(){
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    //window.alert(user.uid);
    window.location.href = "index.html";
  })
  .catch((error) => {
    var errorMessage = error.message;
    window.alert(errorMessage)
  });
}

function register(fName, lName, dob, email, password, cPassword){
  var returnMesage = "";
  if(password == cPassword){
    if(fName!= "" && lName != "" && dob != ""){
      returnMesage = "success";
      // console.log("succ1")
      firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
        // returnMesage = "success";
        
        // Signed in 
        var user = userCredential.user.uid;
        var rootRef = firebase.database().ref();
        var usersRef = rootRef.child("users").child(user).child("details");
        var userData = 
        {
          firstName: fName,
          lastName: lName,
          dateOfBirth: dob,
          email: email,
          availableMoney: 10000
        };
        usersRef.set(userData, function(error){
          if(error){
            var errorCode = error.code;
            var errorMessage = error.message;
            
            // window.alert("Message : " + errorMessage);
          }
          else{
            window.location.href = "index.html";
          }
        });
        // returnMesage =  "success";
      })
      .catch((error) => {
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // // window.alert(errorMessage)
        // // ..
      });
    }
    else{
      returnMesage = "Please ensure all fields are filled";
      // window.alert("Passwords do not match.");
    }
  }
  else{
    // window.alert("Passwords do not match.");
  }
  return returnMesage;
}

function logout(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}

function getCategoryAndProductId(productId){
  arr = [1, 2, 3, 4, 5];
  categoryArray = ["Clothes", "Food", "Games", "Sports", "Technology"];
  for(var i=0; i<categoryArray.length; i++){
    if(productId.toString().charAt(0) == arr[i]){
      if(productId.toString().length == 4){
        return [categoryArray[i], (productId-(i+1)*1000)];
      }
      else if(productId.toString().length == 5){
        return [categoryArray[i], (productId-(i+1)*10000)];
      }
    }
  }
}

function cartToFirebase(productId){
  var categoryProduct = getCategoryAndProductId(productId);
  var category = categoryProduct[0];
  var productId = "id"+categoryProduct[1];
  var categoryProductId = category +"_"+ productId;
  firebase.auth().onAuthStateChanged(function(user){
    const rootRef = firebase.database().ref();
    var usersRef = rootRef.child("users").child(user.uid).child("cart").child(categoryProductId);
      var userData = 
      {
        category: category,
        productId: productId,
        quantity: 1
      };
      usersRef.set(userData);
      window.alert("Product has been added to your cart");
      location.reload();
  });
}

function removeProduct(userUidAndCartId){ //seperated by #
  var arr =  userUidAndCartId.split("#");
  var userUid  = arr[0];
  var categoryProductId = arr[1];
  const rootRef = firebase.database().ref();

  var categotyProd = rootRef.child("users").child(userUid).child("cart").child(categoryProductId);
  categotyProd.set(null);

  window.location.href = "cart.html";
}

function updateQuantity(userUidAndCartId){ //seperated by #
  var arr =  userUidAndCartId.split("#");
  var userUid  = arr[0];
  var categoryProductId = arr[1];
  var quantityInput = document.getElementById(categoryProductId).value;

  const rootRef = firebase.database().ref();
  var categotyProd = rootRef.child("users").child(userUid).child("cart").child(categoryProductId).child("quantity");
  categotyProd.set(quantityInput);

  window.location.href = "cart.html";

}

function checkout(){ 
  window.location.href = "checkout.html";
}

function checkoutOpen(){
  //update price
  firebase.auth().onAuthStateChanged(function(user){
    var userUid = user.uid;
    const dbRef = firebase.database().ref();
    dbRef.on('value', function(datasnapshot){
      dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
        var cartObject = data.val();  //all prodcuts object

        for(var categoryId in cartObject){
          var category = cartObject[categoryId].category;
          var productId = cartObject[categoryId].productId
          var quantity = cartObject[categoryId].quantity;
          
          dbRef.child("prodcutCategory").child(category).child(productId).once("value", function(data) {
            var price = data.val().price;
            dbRef.child("users").child(userUid).child("cart").child(categoryId).child("totalPrice").set(price*quantity);
          });
        }
      });
    });
  });

  firebase.auth().onAuthStateChanged(function(user){
    var userUid = user.uid; 
    const dbRef = firebase.database().ref();
    dbRef.on('value', function(datasnapshot){
      var cartObject;
      dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
        cartObject = data.val();  //all prodcuts object
      });
      var totalCartPrice = 0;
      // var count = 0;
      for(var categoryId in cartObject){
        if (categoryId != "totalCartPrice"){
          totalCartPrice += cartObject[categoryId].totalPrice;
          // count ++;
          // window.alert(totalCartPrice + " " + count);
        }
      }
      // window.alert(totalCartPrice);
      dbRef.child("users").child(userUid).child("cart").child("totalCartPrice").set(totalCartPrice);
      document.getElementById("totalPrice").innerHTML = "R"+totalCartPrice;
    });
  });
}

//called when Confirm Your Order is clicked on
function confirmYourOrder(){
  firebase.auth().onAuthStateChanged(function(user){
    var difference;
    var userUid = user.uid;
    const dbRef = firebase.database().ref();
    dbRef.child("users").child(userUid).once("value", function(data) {
      var userObject = data.val();  //all prodcuts object
      var available_money = userObject["details"].availableMoney;
      var total_cart_price = userObject["cart"].totalCartPrice;
      difference = available_money - total_cart_price;
      if (difference >= 0){
        updateInFirebase(difference);
        if(address()){  //not empty
          window.alert("Your Order Is Confirmed!");
          window.location.href = "index.html";
        }
      }
      else { // if user does not have enough funds to complete order
        window.alert("You do not have enough funds to complete this order");
      }
    });
  });
}

function updateInFirebase(difference){
  firebase.auth().onAuthStateChanged(function(user){
    var userUid = user.uid;
    const dbRef = firebase.database().ref();
    dbRef.on('value', function(datasnapshot){
      dbRef.child("users").child(userUid).child("details").child("availableMoney").set(difference);
    });
  });
}

function isEmpty(arr){
  for(var s in arr){
    if(arr[s] === ''){
      window.alert("Please fill all address fields.")
      return true;
    }
  }
  return false;
}

function updateAddressUser(userUid, addressData){
  const dbRef = firebase.database().ref();
  dbRef.child("users").child(userUid).child("last2Addresses").once("value", function(data) {
    var address = data.val();

    if(address == null){ //new
      //update 1st address in database
      dbRef.child("users").child(userUid).child("last2Addresses").child("id0").set(addressData);
    }
    else{
      id0 = address["id0"];  //1st in (oldest)
      if(!(JSON.stringify(id0) === JSON.stringify(addressData))){
        id1 = address["id1"];
        if(id1 == null){
          //update 2nd address in database
          dbRef.child("users").child(userUid).child("last2Addresses").child("id1").set(addressData);
        }
        else{
          if(!(JSON.stringify(id1) === JSON.stringify(addressData))){
            dbRef.child("users").child(userUid).child("last2Addresses").child("id1").set(addressData);
            dbRef.child("users").child(userUid).child("last2Addresses").child("id0").set(id1);
          }
        }
      }
    }
  });
}

function address(){
  var streetAddress = document.getElementById("streetAddress1").value;
  var suburb = document.getElementById("suburb1").value;
  var city = document.getElementById("city1").value;
  var province = document.getElementById("province1").value;
  var postalCode = document.getElementById("postalCode1").value;
  var addressData = 
    {
      streetAddress: streetAddress,
      suburb: suburb,
      city: city,
      province: province,
      postalCode: postalCode
    };
  if(!isEmpty(addressData)){
    firebase.auth().onAuthStateChanged(function(user){
      var userUid = user.uid;
      const dbRef = firebase.database().ref();

      //update both addresses in Firebase
      updateAddressUser(userUid, addressData);

      //address for this cart
      dbRef.child("users").child(userUid).child("cart").child("addressDetails").set(addressData);
    });
    return true;
  }
  else{
    return false;
  }
}

function checkoutDelevery(){  //called when opening the page
  var addressDetails = [];  //2d matrix containg address info
  firebase.auth().onAuthStateChanged(function(user){
    var userUid = user.uid;
    const dbRef = firebase.database().ref();
    dbRef.child("users").child(userUid).child("last2Addresses").once("value", function(data) {
      var address = data.val();
      for(var addressId in address){
        var currArray = [];
        for(var addressDetail in address[addressId]){
          currArray.push(address[addressId][addressDetail]);
        }
        addressDetails.push(currArray);
      }

      var addressDetailsArr = ["city", "postalCode", "province", "streetAddress", "suburb"]
      for(var j=0; j<addressDetails[0].length; j++){
        var addressDetailsSpecific = new Array();
        for(var i=0; i<addressDetails.length; i++){
          addressDetailsSpecific[i] = addressDetails[i][j];
        }
        var options = '';

        for (var i = 0; i < addressDetailsSpecific.length; i++) {
          options += '<option value="' + addressDetailsSpecific[i] + '" />';
        }
        //auto populate
        document.getElementById(addressDetailsArr[j]).innerHTML = options;
      }
    });
  });
} 

function init(){
  firebase.auth().onAuthStateChanged(function(user){
    const dbRef = firebase.database().ref();

    //welcome
    dbRef.child("users").child(user.uid).child("details").child("firstName").once("value", function(data) {
      var name = data.val();  
      document.getElementById("fName").innerHTML ="Hi " + name;
    });

    //cart
    dbRef.child("users").child(user.uid).child("cart").once("value", function(data) {
      var products = data.val();
      if(products != null){
        var productsSize = Object.keys(products).length;
        if("totalCartPrice" in products){
          productsSize--;
        }
        if("addressDetails" in products){
          productsSize--;
        }
        if(productsSize != 0){
          document.getElementById("cart").innerHTML ="CART (" + productsSize+")";
        }
        else{
          document.getElementById("cart").innerHTML ="CART";
        }
      } 
      else{
        document.getElementById("cart").innerHTML = "CART";
      } 
    });
  });
}

function passwordsEqual (password1, password2) {
  return password1 == password2;
};

/* The code block below ONLY Applies to Node.js - This Demonstrates
   re-useability of JS code in both Back-end and Front-end! #isomorphic */
/* istanbul ignore next */
// if (typeof module !== 'undefined' && module.exports) {
//    module.exports = passwordsEqual;  // allows CommonJS/Node.js require()
// }
if (typeof module !== 'undefined' && module.exports) {
     module.exports = register;  // allows CommonJS/Node.js require()
  }
  