//This is server for the store app, based on lab13 and screencast 
//borrow this from Xinfei
var express = require('express');
var app = express();

var data = require('./Public/product_data.js');
var products = data.products;

const qs = require('querystring');

// Monitors all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to' + request.path);
    next();
});

//Get request for products data
app.get('/products.js', function (request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

//code from lab 12
//helps to check validate data
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (q == '') q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value. 
    else {
        if(q>10) errors.push('Not enough in stock. '); //checks quanitity
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative

        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    }
    return returnErrors ? errors : (errors.length == 0);
}
//From lab 13 
//to access inputted data from products.js
app.use(express.urlencoded ({extended: true }));

// Get the quanitity data from the order form, then check it and if all good send it to the invoice, if not send the user back to purchase page
app.post("/process_form", function (request, response) {
    
    let POST = request.body;

    // check to make user inputs some value

   // check is quantities are valid (nonnegint and have inventory)
   var errors = {};//this will create object with nothing in it ro store errors if we find any

    //loop through all the quantitiy and see if there is any error
    for(i in request.body.quantity) {
        //this will recognize if there are any isnonnegint
        if(isNonNegInt(request.body.quantity[i]) == false) { //
            console.log(`${request.body.quantity[i]} is not a valid quantity for ${products[i].brand}`);
            errors['quantity'+i] = `${request.body.quantity[i]} is not a valid quantity for ${products[i].brand}`;
        
        }
        // this check if we have enough inventory
        if(request.body.quantity[i]>products[i].inventory){
            errors['inventory'+i] = `We do not have ${request.body.quantity[i]} products in stock for ${products[i].brand} sorry for inconvenience ` ;
          
    }
    //did they select any value
    if(request.body.quantity[i]>0){
        var has_quantities = true;
    }
}
    // If has_quanties is undfined, no quantities were selected
    if(typeof has_quantities == 'undefined') {
        errors['no_quantities'] = `You need to make selection`;
    }
    
    // create query string of all the quantities
   let qty_obj = {"quantity": JSON.stringify(request.body.quantity)};

    //If data is valid, create invoice
   if(Object.keys(errors).length === 0) {
      
    response.redirect('./invoice.html?' + qs.stringify(qty_obj));
   } else {
    qty_obj.errors = JSON.stringify(errors);
    response.redirect('./Products_display.html?' + qs.stringify(qty_obj) + '&err_obj='+qty_obj.errors);
   }
});
//route all other GEt requests to files in the public folder. 
app.use(express.static('./Public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback