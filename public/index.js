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
              // console.log(rootRef)
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
                  console.log("error mes "+error.message)
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
      console.log("quantity is "+quantity)
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

function checkoutOpen(){
  return new Promise( resolve => {
    //update price
    firebase.auth().onAuthStateChanged(function(user){
      var userUid = user.uid;
      const dbRef = firebase.database().ref();
      dbRef.on('value', function(datasnapshot){
        dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
          var cartObject = data.val();  //all prodcuts object
          console.log("Cart obj"+ cartObject)
          for(var categoryId in cartObject){//////////////////////////////////////////////compare code with Moshe
            if(categoryId != "totalCartPrice"){
              window.alert("Category id: "+ categoryId)
              var category = cartObject[categoryId].category;
              var productId = cartObject[categoryId].productId
              var quantity = cartObject[categoryId].quantity;
              // window.alert(categoryId)
              // window.alert(category)
              console.log("testing: " + category +" "+
              productId +" "+ quantity)

              dbRef.child("prodcutCategory").child(category).child(productId).once("value", function(data) {
                var price = data.val().price;
                dbRef.child("users").child(userUid).child("cart").child(categoryId).child("totalPrice").set(price*quantity);
              });
            }
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
          if (categoryId != "totalCartPrice" && categoryId != "addressDetails"){
            totalCartPrice += cartObject[categoryId].totalPrice;
            // count ++;
            // window.alert(totalCartPrice + " " + count);
          }
        }
        // window.alert(totalCartPrice);
        dbRef.child("users").child(userUid).child("cart").child("totalCartPrice").set(totalCartPrice);
        if (isWebsite()){
          document.getElementById("totalPrice").innerHTML = "R"+totalCartPrice;
        }
      });
    });
    resolve("?")
  });
}

//called when Confirm Your Order is clicked on
function confirmYourOrder(){
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
            if(address()){  //not empty
              updateInFirebase(difference);
              updateOrderHistoryFirebase();
              if (isWebsite()){
                window.alert("Your Order Is Confirmed!");
                window.location.href = "index.html";
              }
            
            }
          }
          else { // if user does not have enough funds to complete order
            if (isWebsite()){
              window.alert("You do not have enough funds to complete this order");
            }
          }
        });
      });
      resolve("?")
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

function updateOrderHistoryFirebase(){
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
        dbRef.child("prodcutCategory").child(category).child(product_id).child("stockRemaining").set(stock_remaining - quantity);
        // window.alert(stock_remaining);
      }
    }
    // dbRef.child("users").child(userUid).child("cart").child("totalCartPrice").set(totalCartPrice);
  });
}

function goToOrderHistory(){
  window.location.href = "orderHistory.html";
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

function indexOnOpen(){
  const dbRef = firebase.database().ref();
  dbRef.child("prodcutCategory").once("value", function(data) {
    var category = data.val();  //all prodcuts object
    var i = 0;
    for(var categoryName in category){
      var categoryValue = categoryName;

      //create html rows and columns dynamically
      let row = document.createElement("div");
      row.className = "row";

      const container = document.getElementById("container");
    
      let prodcutCategoryH = document.createElement("div");
      prodcutCategoryH.className = "heading_container heading_center";

      let prodcutCategory = document.createElement("h2");
      prodcutCategory.textContent = categoryValue;
      prodcutCategoryH.append(prodcutCategory);

      container.append(prodcutCategoryH);

      var j = 0;
      for(var prodcutId in category[categoryName]){
        if(j>=3){
          break;
        }

        //data from firebase
        var nameValue = category[categoryName][prodcutId].name;
        var priceValue = category[categoryName][prodcutId].price;
        var descriptionValue = category[categoryName][prodcutId].description;
        var stockRemainingValue = category[categoryName][prodcutId].stockRemaining;
        var imageUrlValue = category[categoryName][prodcutId].imageUrl;

        let divCol = document.createElement("div");
        divCol.className = "col-sm-6 col-lg-4";
        
        let divBox = document.createElement("div");
        divBox.className = "box";

        let divImgBox = document.createElement("div");
        divImgBox.className = "img-box";

        let img = document.createElement("img");
        var storageRef = firebase.storage().ref(); 
        storageRef.child('productCategory/'+categoryValue+ "/" + prodcutId + "/image0" + '.jpg').getDownloadURL().then(function(url) {
          img.src = url;
          img.alt = "";
        });

        categoryArray = ["Clothes", "Food", "Games", "Sports", "Technology"];
        var categoryId;
        for(var i=1; i<categoryArray.length+1; i++){
          if(categoryValue == categoryArray[i-1]){
            categoryId = i*100;
            break;
          }
        }
    
        let aAdd = document.createElement("button");
        aAdd.className = "add_cart_btn";
        aAdd.textContent = "Add To Cart";
        aAdd.setAttribute("onclick", "cartToFirebase("+categoryId+prodcutId.substring(2)+")");

        // aAdd.append(spanAddCart)
        divImgBox.append(img);
        divImgBox.append(aAdd);

        //modal
        let divModalF = document.createElement("div");
        divModalF.className = "modal fade";
        divModalF.id = "myModal"+ i+""+ j;

        let divModalD = document.createElement("div");
        divModalD.className = "modal-dialog";

        let divModalC = document.createElement("div");
        divModalC.className = "modal-content";

        let divModalH = document.createElement("div");
        divModalH.className = "modal-header";

        let btnModal = document.createElement("button");
        btnModal.type = "button";
        btnModal.className = "close";
        btnModal.setAttribute('data-dismiss', "modal");
        btnModal.innerHTML = "&times;";

        let h4M = document.createElement("h4");
        h4M.className = "modal-title";
        h4M.textContent = nameValue;

        divModalH.append(h4M);
        divModalH.append(btnModal);

        let divModalB = document.createElement("div");
        divModalB.className = "modal-body";
      
        //get Picture icons for modal
        let image = document.createElement("img"); 
        storageRef.child('productCategory/'+categoryValue + "/" + prodcutId + "/image0" + '.jpg').getDownloadURL().then(function(url) {
          image.src = url;
          image.alt = "";
        });
        image.alt="Trulli";
        image.width = "300";
        image.height="300";

        let pPrice = document.createElement("p");
        pPrice.textContent = "Price: "+ "R" + priceValue;

        let pDescription = document.createElement("p");
        pDescription.textContent = "Descriptiom: "+descriptionValue;

        let pStock = document.createElement("p");
        pStock.textContent = "Stock remaining: "+stockRemainingValue;

        let btnModalAdd = document.createElement("button");
        btnModalAdd.setAttribute('data-dismiss', "modal");
        btnModalAdd.innerHTML = "Add To Cart";

        categoryArray = ["Clothes", "Food", "Games", "Sports", "Technology"];

        var categoryId;
        for(var i=1; i<categoryArray.length+1; i++){
          if(categoryValue == categoryArray[i-1]){
            categoryId = i*100;
            break;
          }
        }

        btnModalAdd.setAttribute("onclick", "cartToFirebase("+categoryId+prodcutId.substring(2)+")");

        divModalB.append(image);
        divModalB.append(pPrice);
        divModalB.append(pDescription);
        divModalB.append(pStock);
        divModalB.append(btnModalAdd);

        let divModalFooter = document.createElement("div");
        divModalFooter.className = "modal-footer";

        let btnDefault = document.createElement("button");
        btnDefault.type = "button";
        btnDefault.className = "btn btn-default";
        btnDefault.setAttribute('data-dismiss', "modal");
        btnDefault.textContent = "Close";

        divModalFooter.append(btnDefault);

        divModalC.append(divModalH);
        divModalC.append(divModalB);
        divModalC.append(divModalFooter);
        divModalD.append(divModalC);
        divModalF.append(divModalD);

        let divDetailed = document.createElement("a");
        divDetailed.className = "detail-box";
        divDetailed.href = "";
        
        var s = "#myModal"+i+""+j;
        //for modal
        divDetailed.setAttribute('data-toggle', "modal");
        divDetailed.setAttribute('data-target', s);

        let h5Name = document.createElement("h5");
        h5Name.textContent = nameValue;

        divDetailed.append(h5Name);

        let divInfo = document.createElement("div");
        divInfo.className = "product-info";

        let h5Span = document.createElement("h5");
        
        let spanAmount = document.createElement("span");
        spanAmount.textContent = "R" + priceValue;

        h5Span.append(spanAmount);

        let divStar = document.createElement("div");
        divStar.className = "star_container";

        divInfo.append(h5Span);
        divDetailed.append(divInfo);

        divBox.append(divImgBox);
        divBox.append(divDetailed)

        divCol.append(divBox);
        divCol.append(divModalF);  //modal
        row.append(divCol);
        j++;
      }
      //html
      container.append(row);

      let divBtn = document.createElement("div");
      divBtn.className = "btn_box";

      let aView = document.createElement("a");
      var nextPage = "viewAll.html";
      var str = "?category=" + categoryValue;
      aView.href = nextPage + str;
      aView.className = "view_more-link";
      aView.textContent = "View All";
      divBtn.append(aView);

      container.append(divBtn);

      i++;
    }
  });
}

function viewAllOnOpen(){
  //firebase database ref
  const dbRef = firebase.database().ref();
  dbRef.child("prodcutCategory").once("value", function(data) {
    var category = data.val();  //all prodcuts object

    var categoryN = new URL(location.href).searchParams.get("category");
    var categoryName = categoryN;
    var categoryValue = categoryName;

    //create html columns dynamically
    let row = document.createElement("div");
    row.className = "row";

    const container = document.getElementById("container");

    let prodcutCategoryH = document.createElement("div");
    prodcutCategoryH.className = "heading_container heading_center";

    let prodcutCategory = document.createElement("h2");
    prodcutCategory.textContent = categoryValue;
    prodcutCategoryH.append(prodcutCategory);

    container.append(prodcutCategoryH);

    var j = 0;
    for(var prodcutId in category[categoryName]){
        //data from firebase
        var nameValue = category[categoryName][prodcutId].name;
        var priceValue = category[categoryName][prodcutId].price;
        var descriptionValue = category[categoryName][prodcutId].description;
        var stockRemainingValue = category[categoryName][prodcutId].stockRemaining;
        var imageUrlValue = category[categoryName][prodcutId].imageUrl;

        let divCol = document.createElement("div");
        divCol.className = "col-sm-6 col-lg-4";
        
        let divBox = document.createElement("div");
        divBox.className = "box";

        let divImgBox = document.createElement("div");
        divImgBox.className = "img-box";

        //get Picture icons
        let img = document.createElement("img");
        var storageRef = firebase.storage().ref(); 

        storageRef.child('productCategory/'+categoryValue+ "/" + prodcutId + "/image0" + '.jpg').getDownloadURL().then(function(url) {
            img.src = url;
            img.alt = "";
        });

        categoryArray = ["Clothes", "Food", "Games", "Sports", "Technology"];

        var categoryId;
        for(var i=1; i<categoryArray.length+1; i++){
          if(categoryValue == categoryArray[i-1]){
            categoryId = i*100;
            break;
          }
        }

        let aAdd = document.createElement("button");
        aAdd.className = "add_cart_btn";
        aAdd.textContent = "Add To Cart";
        aAdd.setAttribute("onclick", "cartToFirebase("+categoryId+prodcutId.substring(2)+")");

        
        divImgBox.append(img);
        divImgBox.append(aAdd);

        //modal
        let divModalF = document.createElement("div");
        divModalF.className = "modal fade";
        divModalF.id = "myModal"+ j;

        let divModalD = document.createElement("div");
        divModalD.className = "modal-dialog";

        let divModalC = document.createElement("div");
        divModalC.className = "modal-content";

        let divModalH = document.createElement("div");
        divModalH.className = "modal-header";

        let btnModal = document.createElement("button");
        btnModal.type = "button";
        btnModal.className = "close";
        btnModal.setAttribute('data-dismiss', "modal");
        btnModal.innerHTML = "&times;";

        let h4M = document.createElement("h4");
        h4M.className = "modal-title";
        h4M.textContent = nameValue;

        divModalH.append(h4M);
        divModalH.append(btnModal);

        let divModalB = document.createElement("div");
        divModalB.className = "modal-body";
        
        //get Picture icons for modal
        let image = document.createElement("img"); 
        storageRef.child('productCategory/'+categoryValue+ "/" + prodcutId + "/image0" + '.jpg').getDownloadURL().then(function(url) { 
            image.src = url;
            image.alt = "";
        });
        image.alt="Trulli";
        image.width = "300";
        image.height="300";

        let pPrice = document.createElement("p");
        pPrice.textContent = "Price: " + "R" +priceValue;

        let pDescription = document.createElement("p");
        pDescription.textContent = "Descriptiom: "+descriptionValue;

        let pStock = document.createElement("p");
        pStock.textContent = "Stock remaining: "+stockRemainingValue;

        let btnModalAdd = document.createElement("button");
        btnModalAdd.setAttribute('data-dismiss', "modal");
        btnModalAdd.innerHTML = "Add To Cart";
        
        categoryArray = ["Clothes", "Food", "Games", "Sports", "Technology"];

        var categoryId;
        for(var i=1; i<categoryArray.length+1; i++){
          if(categoryValue == categoryArray[i-1]){
            categoryId = i*100;
            break;
          }
        }

        btnModalAdd.setAttribute("onclick", "cartToFirebase("+categoryId+prodcutId.substring(2)+")");

        divModalB.append(image);
        divModalB.append(pPrice);
        divModalB.append(pDescription);
        divModalB.append(pStock);
        divModalB.append(btnModalAdd);

        let divModalFooter = document.createElement("div");
        divModalFooter.className = "modal-footer";

        let btnDefault = document.createElement("button");
        btnDefault.type = "button";
        btnDefault.className = "btn btn-default";
        btnDefault.setAttribute('data-dismiss', "modal");
        btnDefault.textContent = "Close";

        divModalFooter.append(btnDefault);

        divModalC.append(divModalH);
        divModalC.append(divModalB);
        divModalC.append(divModalFooter);
        divModalD.append(divModalC);
        divModalF.append(divModalD);

        let divDetailed = document.createElement("a");
        divDetailed.className = "detail-box";
        divDetailed.href = "";
        
        var s = "#myModal"+j;
        //for modal
        divDetailed.setAttribute('data-toggle', "modal");
        divDetailed.setAttribute('data-target', s);

        let h5Name = document.createElement("h5");
        h5Name.textContent = nameValue;

        divDetailed.append(h5Name);

        let divInfo = document.createElement("div");
        divInfo.className = "product-info";

        let h5Span = document.createElement("h5");
        
        let spanAmount = document.createElement("span");
        spanAmount.textContent = "R" + priceValue;

        h5Span.append(spanAmount);

        let divStar = document.createElement("div");
        divStar.className = "star_container";

        divInfo.append(h5Span);
        divDetailed.append(divInfo);

        divBox.append(divImgBox);
        divBox.append(divDetailed)

        divCol.append(divBox);
        divCol.append(divModalF);  //modal
        row.append(divCol);
        j++;
    }
    //html
    container.append(row);
  });
}

function cartOnOpen(){
  //firebase database ref
  var storageRef = firebase.storage().ref(); 
  firebase.auth().onAuthStateChanged(function(user){
    var userUid = user.uid;

    const dbRef = firebase.database().ref();
    dbRef.on('value', function(datasnapshot){
      dbRef.child("users").child(userUid).child("cart").once("value", function(data) {
        var cartObject = data.val();  //all prodcuts object
        const shopping_cart = document.getElementById("shopping_cart");
        for(var cartId in cartObject){
          if(cartId == "addressDetails" || cartId == "totalCartPrice"){
            continue;
          }
          var category = cartObject[cartId].category;
          var productId = cartObject[cartId].productId;
          var quantity = cartObject[cartId].quantity;

          //get product Details
          dbRef.child("prodcutCategory").child(category).child(productId).once("value", function(data) {
            var productObject = data.val();  //all prodcuts object
            var description = productObject.description;
            var imageUrl = productObject.imageUrl;
            var name = productObject.name;
            var price = productObject.price;
            
            let divProduct = document.createElement("div");
            divProduct.className = "product";

            let divProduct_image = document.createElement("div");
            divProduct_image.className = "product-image";

            let img = document.createElement("img");
            storageRef.child('productCategory/'+category+"/"+productId+ "/image0" + '.jpg').getDownloadURL().then(function(url) {
              img.src = url;
            });

            divProduct_image.append(img);
            divProduct.append(divProduct_image);

            let divProductDetails = document.createElement("div");
            divProductDetails.className = "product-details";

            let divProductTitle = document.createElement("div");
            divProductTitle.className = "product-title";
            divProductTitle.textContent = name;

            let pProductDescription = document.createElement("p");
            pProductDescription.className = "product-description";
            pProductDescription.textContent = description;

            divProductDetails.append(divProductTitle);
            divProductDetails.append(pProductDescription);
            divProduct.append(divProductDetails);

            let divProductPrice = document.createElement("div");
            divProductPrice.className = "product-price";
            divProductPrice.textContent = price;

            let divProductQuantity = document.createElement("div");
            divProductQuantity.className = "product-quantity";

            var cartId = category+"_" + productId;

            let inputNumber = document.createElement("input");
            inputNumber.type = "number"
            inputNumber.value = quantity;
            inputNumber.min = 1;
            inputNumber.id = cartId;

            inputNumber.setAttribute('onchange', 'updateQuantity("'+userUid+'#'+cartId+'")');  //amazing!!!!!!!!!

            divProductQuantity.append(inputNumber);
            divProduct.append(divProductPrice);
            divProduct.append(divProductQuantity);

            let divProductRemoval = document.createElement("div");
            divProductRemoval.className = "product-removal";

            var cartId = category+"_" + productId;

            let btnRemoveProduct = document.createElement("button");
            btnRemoveProduct.className = "remove-product";
            btnRemoveProduct.textContent = "Remove";
            btnRemoveProduct.setAttribute('onclick', 'removeProduct("'+userUid+'#'+cartId+'")');  //amazing!!!!!!!!!

            divProductRemoval.append(btnRemoveProduct);
            divProduct.append(divProductRemoval);
            shopping_cart.append(divProduct);
          });
        }
      });
    });
  });
  let btnCheckout = document.createElement("button");
  btnCheckout.className = "checkout";
  btnCheckout.textContent = "Checkout";
  btnCheckout.setAttribute('onclick', 'checkout()');  //amazing!!!!!!!!!
  shopping_cart.append(btnCheckout);
}

function orderHistoryOnOpen(){
   //firebase database ref
   var storageRef = firebase.storage().ref(); 
  
   firebase.auth().onAuthStateChanged(function(user){
       var userUid = user.uid;
       const dbRef = firebase.database().ref();
       dbRef.on('value', function(datasnapshot){
           var orderHistoryObject;
           dbRef.child("users").child(userUid).child("orderHistory").once("value", function(data) {
               orderHistoryObject = data.val(); 
           });
           var productCategoryObject;
           dbRef.child("prodcutCategory").once("value", function(data) {
               productCategoryObject = data.val(); 
           });
           const shopping_cart = document.getElementById("shopping_cart");
           var cart_no = 0;
           for(var orderHistoryId in orderHistoryObject){
               cart_no ++;
               let divCartTitle = document.createElement("h2");
               divCartTitle.textContent = "Order " + cart_no;
               shopping_cart.append(divCartTitle);
               for (var categoryId in orderHistoryObject[orderHistoryId]){
                   if (categoryId == "totalCartPrice"){
                       var total_cart_price = orderHistoryObject[orderHistoryId][categoryId];
                   }
                   else if (categoryId == "addressDetails"){
                     var city = orderHistoryObject[orderHistoryId][categoryId].city;
                     var postal_code = orderHistoryObject[orderHistoryId][categoryId].postalCode;
                     var province = orderHistoryObject[orderHistoryId][categoryId].province;
                     var street_address = orderHistoryObject[orderHistoryId][categoryId].streetAddress;
                     var suburb = orderHistoryObject[orderHistoryId][categoryId].suburb;
                   }
                   else if (categoryId != "totalCartPrice" && categoryId != "addressDetails" ){
                       var category = orderHistoryObject[orderHistoryId][categoryId].category;
                       var product_id = orderHistoryObject[orderHistoryId][categoryId].productId;
                       var quantity = orderHistoryObject[orderHistoryId][categoryId].quantity;
                       var total_products_price = orderHistoryObject[orderHistoryId][categoryId].totalPrice;
                       var image_url = productCategoryObject[category][product_id].imageUrl;
                       var name = productCategoryObject[category][product_id].name;
                       var price = productCategoryObject[category][product_id].price;
                       var description = productCategoryObject[category][product_id].description;

                       let divProduct = document.createElement("div");
                       divProduct.className = "product";

                       let divProduct_image = document.createElement("div");
                       divProduct_image.className = "product-image";

                       let img = document.createElement("img");
                       storageRef.child('productCategory/'+category+"/"+product_id+ "/image0" + '.jpg').getDownloadURL().then(function(url) {
                           img.src = url;
                       });

                       divProduct_image.append(img);
                       divProduct.append(divProduct_image);

                       let divProductDetails = document.createElement("div");
                       divProductDetails.className = "product-details";

                       let divProductTitle = document.createElement("div");
                       divProductTitle.className = "product-title";
                       divProductTitle.textContent = name;

                       divProductDetails.append(divProductTitle);
                       divProduct.append(divProductDetails);

                       let divProductPrice = document.createElement("div");
                       divProductPrice.className = "product-price";
                       divProductPrice.textContent = price;

                       let divProductQuantity = document.createElement("div");
                       divProductQuantity.className = "product-quantity";
                       divProductQuantity.textContent = quantity;

                       let divTotalProductPrice = document.createElement("div");
                       divTotalProductPrice.className = "product-total";
                       divTotalProductPrice.textContent = "R" + total_products_price;

                       divProduct.append(divProductPrice);
                       divProduct.append(divProductQuantity);
                       divProduct.append(divTotalProductPrice);

                       shopping_cart.append(divProduct);
                   }
               }
               let divCartSummary = document.createElement("h2");
               divCartSummary.textContent = "Order " + cart_no + " Summary";
               shopping_cart.append(divCartSummary);

               let divNewLine = document.createElement("br");
               let divDashes = document.createElement("hr");

               let divTotalCartPrice = document.createElement("h5");
               divTotalCartPrice.textContent = "Total price paid for this order:";
               shopping_cart.append(divTotalCartPrice);

               let divTotalCartPriceValue = document.createElement("h4");
               divTotalCartPriceValue.textContent = "R" + total_cart_price;
               shopping_cart.append(divTotalCartPriceValue);

               shopping_cart.append(divNewLine);

               let divAddress = document.createElement("h5");
               divAddress.textContent = "These items were delivered to:";
               shopping_cart.append(divAddress);

               let divAddressValue = document.createElement("h4");
               divAddressValue.textContent = street_address +", "+ suburb +", "+ city +", "+ province +", "+ postal_code;
               shopping_cart.append(divAddressValue);

               shopping_cart.append(divDashes);

               for (var c=0; c<5; c++){
                   let divSpace = document.createElement("br");
                   shopping_cart.append(divSpace);
               }
           }
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
     };
  }
  
  