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

function register(fName, lName, dob, email, password, cPassword, exit){
   return new Promise( resolve => {
    var returnMesage = "";
    if (password != "" && cPassword != ""){
      if(password == cPassword){
        if(fName!= "" && lName != "" && dob != "" && email!= ""){
            firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
              var user = userCredential.user.uid; 
              var rootRef = firebase.database().ref(); 
              var usersRef = rootRef.child("users").child(user).child("details");   
              var userData = 
              {
                firstName: fName,
                lastName: lName,
                dateOfBirth: dob,
                email: email,
                availableMoney: 100000
              };
              usersRef.set(userData, function(error){     
                if(error){
                  if (isWebsite()) {
                    window.alert("Message : " + error.message);
                  }
                }
                else{  
                  message = "Success"
                  resolve(message);
                  if (isWebsite()) {
                     window.location.href = "index.html";
                  }else{
                    if(exit == true){
                      setTimeout((function() {  
                        return process.exit(0);
                      }),0);
                    }
                  }
                }
              });
            })
            .catch((error) => { //if there is any error with detail, display error
              var errorMessage = error.message;             
              message = print(errorMessage);
              resolve(message);
            });
        }
        else{ //if fields are missing - display error message
          returnMesage = "Ensure all fields are filled";
          message = print(returnMesage);
          resolve(message);
        }
      }
      else{ // if passwords do not match display a message
        returnMesage = "Passwords do not match. Please try again."
        message = print(returnMesage);
        resolve(message);
      }
    }else{ //if passwords are empty - display a message
      returnMesage = "Enter both passwords";
      message = print(returnMesage);
      resolve(message);
    }
  }); 
}

function login(email,password) {
  return new Promise( resolve => {
    var message;
    firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
      // var user = userCredential.user;
      message = "success" 
      resolve(message);
      if (isWebsite()) {
        window.location.href = "index.html";
     }
    })
    .catch((error) => {
      message = error.message
      print(message)
      if (error==false){
        resolve(message);
      }else{
        resolve(message);
      }
      
      // window.alert(errorMessage)///////////////////////////////////////////////////////////////////////////////
    }); 
  });
}

function logout(){
  return new Promise( resolve => {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      resolve("success")
    }).catch(function(error) {
      print(error.message)
    });
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

function cartToFirebase(prodId){
  return new Promise( resolve => {
    // window.alert(prodId)
    var categoryProduct = getCategoryAndProductId(prodId);
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
        usersRef.set(userData, function(error){
          var alertMessage = "Product has been added to your cart";
          var message = print(alertMessage)
          if (isWebsite()){
            location.reload();
          }
          resolve(message);
        });
    });
  });
}

function removeProduct(userUidAndCartId){ //seperated by #
  return new Promise( resolve => {
    var arr =  userUidAndCartId.split("#");
    var userUid  = arr[0];
    var categoryProductId = arr[1];
    const rootRef = firebase.database().ref();

    var categotyProd = rootRef.child("users").child(userUid).child("cart").child(categoryProductId);
    categotyProd.set(null, function(error){
      if (isWebsite()){
        window.location.href = "cart.html";
      }
      resolve("Success");
    });
  });
}

function updateQuantity(userUidAndCartId, quantity){ //seperated by #
  return new Promise( resolve => {
    var arr =  userUidAndCartId.split("#");
    var userUid  = arr[0];
    var categoryProductId = arr[1];
    var quantityInput;
    if (isWebsite()){
      quantityInput = document.getElementById(categoryProductId).value;
    }else{
      quantityInput = quantity; 
    }
    // window.alert(categoryProductId)
    const rootRef = firebase.database().ref();
    var categotyProd = rootRef.child("users").child(userUid).child("cart").child(categoryProductId).child("quantity");
    categotyProd.set(quantityInput, function(error){
      if (!error){
        resolve("Success")
      }
    });

    if (isWebsite()){
      window.location.href = "cart.html";
    }
});
}

function checkout(){ 
  window.location.href = "checkout.html";
}

//updates prices per category and the total for the cart
function checkoutOpen(){
  return new Promise( resolve => {
    var success = false;

    //update price per category
    firebase.auth().onAuthStateChanged(function(user){
      var userUid = user.uid;
      const dbRef = firebase.database().ref();
      dbRef.on('value', function(datasnapshot){
        dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
          var cartObject = data.val();  //all prodcuts object
          for(var categoryId in cartObject){//////////////////////////////////////////////compare code with Moshe
            if(categoryId != "totalCartPrice" && categoryId != "addressDetails"){
              var category = cartObject[categoryId].category;
              var productId = cartObject[categoryId].productId
              var quantity = cartObject[categoryId].quantity;
              dbRef.child("prodcutCategory").child(category).child(productId).once("value", function(data) {
                var price = data.val().price;
                dbRef.child("users").child(userUid).child("cart").child(categoryId).child("totalPrice").set(price*quantity, function(error){
                  if (!error){
                    success = true; 
                  }else{
                    success = false; 
                  }
                });
              });
            }
          }
        });
      });
    });

    //update the total for the cart
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
          if (categoryId != "totalCartPrice" && categoryId != "addressDetails"){
            totalCartPrice += cartObject[categoryId].totalPrice;
            // count ++;
            // window.alert(totalCartPrice + " " + count);
          }
        }
        // window.alert(totalCartPrice);
        dbRef.child("users").child(userUid).child("cart").child("totalCartPrice").set(totalCartPrice, function(error){
          if (error){
            success = false; 
            resolve(success)
          }else{
            if (success){
              success = true; 
              resolve(success)
            }else{
              success = false; 
              resolve(success)
            }
            
          }
        });
        if (isWebsite()){
          document.getElementById("totalPrice").innerHTML = "R"+totalCartPrice;
        }
      });
    });
  });
}

//called when Confirm Your Order is clicked on
function confirmYourOrder(streetAddress, suburb, city, province, postalCode){
    return new Promise( resolve => {
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
          if(address(streetAddress, suburb, city, province, postalCode)){  //not empty       
            firebase.auth().onAuthStateChanged(function(user){
              dbRef.on('value', function(datasnapshot){
                dbRef.child("users").child(userUid).child("details").child("availableMoney").set(difference);
              });
            });
            resolve(updateOrderHistoryFirebase());
            var message = print("Your Order Is Confirmed!");
            resolve(message);
            if (isWebsite()){
              window.location.href = "index.html";
            }             
          }else{
              resolve("Address details not provided");
          }
        }else { // if user does not have enough funds to complete order
          var message = print("You do not have enough funds to complete this order")
          resolve(message);            
        }
        });
      });
      // resolve("?")
  });
}

//check if address is given. If it is - update database
function address(streetAddressI, suburbI, cityI, provinceI, postalCodeI){
  var streetAddress;
  var suburb;
  var city;
  var province;
  var postalCode;
  if (isWebsite()){
    streetAddress = document.getElementById("streetAddress1").value;
    suburb = document.getElementById("suburb1").value;
    city = document.getElementById("city1").value;
    province = document.getElementById("province1").value;
    postalCode = document.getElementById("postalCode1").value;
  }else{
    streetAddress = streetAddressI;
    suburb = suburbI;
    city = cityI;
    province = provinceI;
    postalCode = postalCodeI; 
  }
 
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

function isEmpty(arr){
 
  for(var s in arr){
    if(arr[s] === ''){
      if (isWebsite()){
        window.alert("Please fill all address fields.")
      }
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

function updateOrderHistoryFirebase(){
  return new Promise( resolve => {
    var status = "Fail";
    firebase.auth().onAuthStateChanged(function(user){
      var cartObject;
      var userUid = user.uid;
      const dbRef = firebase.database().ref();
      dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
        cartObject = data.val();
      });

      var new_date = Date.now();
      var date_id = "id_" + new_date;
      dbRef.child("users").child(userUid).child("orderHistory").child(date_id).set(cartObject);
      dbRef.child("users").child(userUid).child("cart").set(null);

      for(var categoryId in cartObject){
        if (categoryId != "totalCartPrice" && categoryId != "addressDetails"){
          var category = cartObject[categoryId].category;
          var product_id = cartObject[categoryId].productId;
          var quantity = cartObject[categoryId].quantity;
          var productObject;
          dbRef.child("prodcutCategory").child(category).once("value", function(data) {
            productObject = data.val();
          });
          var stock_remaining = productObject[product_id].stockRemaining;
          dbRef.child("prodcutCategory").child(category).child(product_id).child("stockRemaining").set(stock_remaining - quantity, function(error){
            if (!error){
              status = "Success"
            }
            resolve(status);
          });
        }
      }
    });
  });
}

function checkoutDelevery(){ //called when opening the page
  return new Promise( resolve => { 
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
          resolve(options);
          print(options)
          //auto populate
          if(isWebsite()){
            document.getElementById(addressDetailsArr[j]).innerHTML = options;
          }
        }
      });
    });
  });
}

// function updateAddressUser(userUid, addressData){
//   const dbRef = firebase.database().ref();
//   dbRef.child("users").child(userUid).child("last2Addresses").once("value", function(data) {
//     var address = data.val();

//     if(address == null){ //new
//       //update 1st address in database
//       dbRef.child("users").child(userUid).child("last2Addresses").child("id0").set(addressData);
//     }
//     else{
//       id0 = address["id0"];  //1st in (oldest)
//       if(!(JSON.stringify(id0) === JSON.stringify(addressData))){
//         id1 = address["id1"];
//         if(id1 == null){
//           //update 2nd address in database
//           dbRef.child("users").child(userUid).child("last2Addresses").child("id1").set(addressData);
//         }
//         else{
//           if(!(JSON.stringify(id1) === JSON.stringify(addressData))){
//             dbRef.child("users").child(userUid).child("last2Addresses").child("id1").set(addressData);
//             dbRef.child("users").child(userUid).child("last2Addresses").child("id0").set(id1);
//           }
//         }
//       }
//     }
//   });
// }

function goToOrderHistory(){
  window.location.href = "orderHistory.html";
}

function init(){
  return new Promise( resolve => {
    var status = "fail";
    firebase.auth().onAuthStateChanged(function(user){
      const dbRef = firebase.database().ref();
      //welcome
      dbRef.child("users").child(user.uid).child("details").child("firstName").once("value", function(data) {
        var name = data.val(); 
        if (isWebsite()) {
          document.getElementById("fName").innerHTML ="Hi " + name;
        }
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
            resolve("Products in cart")
            if (isWebsite()){
              document.getElementById("cart").innerHTML ="CART (" + productsSize+")";
            }
          }
          else{
            if (isWebsite()){
              document.getElementById("cart").innerHTML ="CART";
            }
            resolve("Products not in cart")
          }
        } 
        else{
          resolve("No Cart?")
          if (isWebsite()){
            document.getElementById("cart").innerHTML = "CART";
          }
        } 
      });
    });
  });
}



function print(message){
  if (typeof window !== 'undefined') {
    window.alert(message)
  }
  return message;
}

//function for testing purposes - generate random new valid email
function genrateRandomEmail(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
    charactersLength));
 }
 return result+ "@gmail.com";
}

function isWebsite(){
  return typeof window !== 'undefined'
}
if (typeof module !== 'undefined' && module.exports) {
     module.exports = 
     {
       register,
       login,
       logout,
       genrateRandomEmail,
       getCategoryAndProductId,
       cartToFirebase,
       removeProduct,
       updateQuantity,
       checkoutOpen,
       confirmYourOrder,
       isEmpty,
       init,
       checkoutDelevery,
     };
  }
  
  