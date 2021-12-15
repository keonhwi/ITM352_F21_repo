
var data = require('./public/product_data.js');// Loads products_data.js
var all_products = data.allProducts; // set variable 'allProducts' to the product_data.js file
var express = require('express'); // Enables express module 
var app = express(); // Sets the express module as the app 
const queryString = require('query-string'); // Loads query-string module
var myParser = require("body-parser"); // Loads body-parser module
var fs = require('fs');// Load fs module to allow server.js to use an template (referenced at bottom)
const user_data = 'user_data.json';// Stores user_data.json as a variable
var products_array = data.products_array;// Defines products_array variable
const nodemailer = require('nodemailer');// Loads nodemailer for email

// Referenced from Lab 15
// Loads cookie parser



// Monitors all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
 });

// Writes the request message
app.post('/get_products_data', function (request, response, next) {
    response.json(JSON.stringify(all_products));
});

// Take the data in the body (allows you to get the POST data) and turns it into an object.
app.use(express.urlencoded({ extended: true })); 

// Processes the products the user wants to purchase
app.post("/display_cart", function (request, response) { // Posts data from the display_cart form, with action named "display_cart"
    if (typeof session.username != "undefined") {
        response.redirect('invoice.html'); // Redirect to invoice if session username is undefined
    } else {
        response.redirect('loginPage.html'); // Otherwise, send to login page

    }
});

// Heavily adapted and modified from app.posts in Assignment 2 and 3
 app.post("/purchase", function (request, response) {
    let POST = request.body;

    if (typeof POST['addProducts${i}'] != 'undefined') { // If the POST request is not undefined
        var validAmount = false; // Assumes that there is a valid amount first
        var amount = false; // Assumes that the amount is false
        // Assume that there are quantities available
        for (i = 0; i < `${(products_array[`pens`][i])}`.length; i++) { // For all products check if the input
            qty = POST[`quantity${i}`];
            if (qty > 0) {
                amount = true; // Is there an amount?
            }

            if (isStringNonNegInt(qty) == false) { // If it is not a nonnegative integer
                validAmount = false; // Show that it is not a valid quantity
            }
        }

        const stringified = queryString.stringify(POST); // Converts the data in POST to a JSON string and stringify

        if (validAmount == true && amount == false) { // If the quantity is over 0 and is valid
        for (i = 0; i < products_array['pens']; i++) {
                products_array[i].quantity_available -= Number(request.body[`quantity${i}`]);
            }
            var contents = fs.readFileSync('./views/login_page.template', 'utf8');
            response.send(eval('`' + contents + '`' + stringified));// Redirect the page to the login page
            return; // Stops function!
        }

        else { response_string = "<script> alert('Error! One or more of your values are invalid! Please go back and put valid qunatities');window.history.go(-1);</script>";
        response.send(response_string);}

    }

});
// Posts data from the display_cart form, with action named "display_cart"
app.post("/update_cart", function (request, response) { 
    console.log(request.body);
    if (!request.session.cart) {
        request.session.cart = {};
    }
  
    if (!request.session.cart[request.body.product_key]) {
      request.session.cart[request.body.product_key] = [];
    }
  
    if(isStringNonNegInt(request.body.quantity)) {
    request.session.cart[request.body.product_key][request.body.product_index]=request.body.quantity; 
    request.session.save();
  
    message = {'message' : 'Added to cart!'};
  } else {
      message = {'message' : 'Quantity error! Not added'};
  }
  console.log(request.session.cart);
  response.json(JSON.stringify(message));
  
  });

  // Posts data from the display_cart form, with action named "display_cart"
  app.post("/get_cart", function (request, response) { 
  
  if (!request.session.cart) {
      request.session.cart = {};
  }
  response.json(request.session.cart);
  
  });

// Function from info_server_Ex5.js
function isStringNonNegInt(q, returnErrors = false) {
    // Checks if a string q is a non-neg integer. If returnErrors is true, the array of errors is returned, otherwise, returns true if q is a non-neg int. 
    errors = []; // Assume no errors at first
    if (q == '') q = 0
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative 
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
        }

    return returnErrors ? errors : (errors.length == 0);
}

// Adapted from Lab14 Ex. 3/4
// Checks if user_data file is found
if (fs.existsSync(user_data)) {

    stats = fs.statSync(user_data);
    console.log(`user_data.json has ${stats['size']} characters`);

    var data = fs.readFileSync(user_data, 'utf-8');
    users_reg_data = JSON.parse(data);


} else {
    console.log(`ERR: ${user_data} does not exist`)
}

app.use(myParser.urlencoded({ extended: true }));

// Display login page from the registration
app.get("/login", function (request, response) {
    // Assumes no login errors
    var incorrect_login = [];
    var incorrect_password = [];
    var incorrect_username = [];
    var contents = fs.readFileSync('./template/login_page.template', 'utf8');
    response.send(eval('`' + contents + '`'));
});

// Process login page through post and redirect to invoice if valid; if not, redirect back to page
app.post("/process_login", function (request, response) {
        var POST = request.body;
    // Assume no errors at first
        var incorrect_login = [];
        var incorrect_password = [];
        var incorrect_username = [];
    // Make the username lowercase
        var lowercase_username = request.body.username.toLowerCase();
    // If the username exists, retrieve the password
        if (typeof users_reg_data[lowercase_username] != 'undefined') {//if user inputted data
            
            console.log(request.body.password)
            console.log(request.body.username)
            
            if (request.body.password == users_reg_data[lowercase_username].password) {
            // If the password and username is correct display invoice

                // Create cookie for username
                response.cookie('username', `${request.body.username}`, { maxAge: 6000 * 1000 })
                var user = users_reg_data[request.body.username];
                console.log(user.email)
                // Create cookie for email
                response.cookie('email', `${user.email}`)
    
                // Redirect to cart
                response.redirect('./cart.html?');

            } else {
            // If the password is not correct, push an error
                incorrect_password.push('No matching password found. Please enter your password again');
            // And alert user that the login could not go through and redirect to login page
                incorrect_login = "alert(`Incorrect login. Please recheck, and if you do not have an account, please register!`);";
                var contents = fs.readFileSync('./template/login_page.template', 'utf8');
                response.send(eval('`' + contents + '`'));
                console.log('Password was incorrect');
        }
    } else {
        // If the username does not exist, push error
            incorrect_username.push('Username does not exist! Please check your username');
        // And alert user that the login did not go through
            incorrect_login = "alert(`Incorrect login. Please recheck, and if you do not have an account, please register!`);";
            var contents = fs.readFileSync('./template/login_page.template', 'utf8');
            response.send(eval('`' + contents + '`'));
            console.log('Username incorrect!');
    }

});

// Gets logout form
app.get("/logout", function (request, response) {
    var username = request.cookies.username;
    response.clearCookie('username');
    response.clearCookie('email');
    response.redirect('./logout.html?');
});

// Display registration page from the login
app.get("/register", function (request, response) {
    // Assume no errors at first
    var fullname_registration_errs = [];
    var username_registration_errs = [];
    var password_registration_errs = [];
    var password_repeat_errs = [];
    var email_registration_errs = [];
    var reg_error = "";
    var contents = fs.readFileSync('./template/registration_page.template', 'utf8');
    response.send(eval('`' + contents + '`'));
});

// Process registration page
app.post("/process_register", function (request, response) {
    // Processes a simple register form
    var fullname_registration_errs = [];
    var username_registration_errs = [];
    var password_registration_errs = [];
    var password_repeat_errs = [];
    var email_registration_errs = [];

    // VALIDATION
    // Function validates the full name
    function validate_fullname(name_input) {
        // Pushes error if the full name was not inputted
        if (name_input == "") {
            fullname_registration_errs.push('Please enter your full name');
        }
        // Pushes an error if the full name is over 30 characters
        if ((name_input.length > 30)) {
            fullname_registration_errs.push('max fullname characters is 30');
        }
        // If the full name was not all letters: https://stackoverflow.com/questions/9289451/regular-expression-for-alphabets-with-spaces
        if (/^[A-Za-z ]+$/.test(name_input) == false) {
            // Pushes an error that the full name needs to all letters
            fullname_registration_errs.push('Full name can only be letters');
        }
    }
    // Checks if valid name was inputted
    validate_fullname(request.body.fullname);

    // Function validates username
    function validate_username(username_input) {
        // If the username already exists, push an error 
        if (typeof users_reg_data[username_input] != 'undefined') {
            username_registration_errs.push('This username is not available. Choose another');
        }
        // If username is not letters or numbers modified from: https://stackoverflow.com/questions/11431154/regular-expression-for-username-start-with-letter-and-end-with-letter-or-number, push an error
        if ((/^[0-9a-zA-Z]+$/).test(username_input) == false) {
            
            username_registration_errs.push('Username must be numbers or letters');
        }
        // If user name is not between 4 and 10 characters, push an error
        if (username_input.length < 4 || username_input.length > 10) {
            username_registration_errs.push('Username must be between 4 or 10 characters long');
        }
    }
    // Checking if a valid username was inputted
    var reg_username = request.body.username.toLowerCase();//make username lowercase
    validate_username(reg_username);

    // Function validates password
    function validate_password(password_input) {
        password_repeat = request.body.repeat_password
        // If password length is less than 6 characters long, push an error
        if ((password_input.length < 6)) {
            password_registration_errs.push('Password must be more than 6 characters long');
        }
        // Check if password entered equals to the repeat password entered, if not, push an error
        if (password_input !== password_repeat) {
            password_repeat_errs.push('Password does not match! Please re-enter');
        }
    }

    // Checking if a valid password was inputted
    validate_password(request.body.password);

    // Email validation function adapted from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
    function validate_email(email_input) {
        // If the email doesn't follow a specific format as stated, push email invalid error
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email_input) == false) {
            email_registration_errs.push('Email is invalid');
        }
    }
    // Check email validation and turn into lowercase
        var registration_email = request.body.email.toLowerCase(); 
        validate_email(registration_email);

    // If all data is valid write to the users_data_filename and send to invoice
    if ((fullname_registration_errs.length == 0) && (username_registration_errs.length == 0) && (password_registration_errs.length == 0) && (password_repeat_errs.length == 0) && (email_registration_errs.length == 0)) {

        // Formats inputted data to user_data.json
        users_reg_data[reg_username] = {};
        users_reg_data[reg_username].fullname = request.body.fullname;
        users_reg_data[reg_username].password = request.body.password;
        users_reg_data[reg_username].email = request.body.email.toLowerCase();

        // Writes updates objects to user_data
        reg_info_str = JSON.stringify(users_reg_data);
        fs.writeFileSync(user_data, reg_info_str);
        console.log(`saved`)
        generate_item_rows(request.body, response);

    } else {
        // If the user data is not valid, alert user and display errors in the console
        console.log(fullname_registration_errs);
        console.log(username_registration_errs);
        console.log(password_registration_errs);
        console.log(password_repeat_errs);
        console.log(email_registration_errs);
        reg_error = "alert(`Unable to register. Please recheck submissions fields for valid inputs!`);";
        var contents = fs.readFileSync('./template/registration_page.template', 'utf8');
        response.send(eval('`' + contents + '`'));
    }

});

// Referenced from Assignment 3 Code Example
app.get("/generateInvoice", function (request, response) {
    //Check if user logged in , if not send to login
     if(!request.cookies.username) {
         response.redirect("./login");
         return;
     } 
 
invoice_str += `
<link rel="stylesheet" href="invoice-style.css" />` // Uses invoice-style.css to format
     // Generate HTML invoice string
     user_email = request.cookies.email;
     var invoice_str = `<h1>Thank you for your order ${request.cookies.username}! <h1><table border><th>Item</th><th>Quantity</th><th>Price</th><th>Extended Price</th>`;
     var cart = request.session.cart;
     subtotal = 0; //subtotal starts off as 0
     for (pk in cart) {
 
         for (i in cart[pk]) {

             qty = cart[pk][i];
             if (qty > 0) { // There has to be at least one quantity entered
                product_price = parseInt(all_products[pk][i].price )
                 extended_price = qty * product_price
                 subtotal += extended_price; 
    console.log(product_price)
    console.log(qty)
    console.log(all_products[pk][i].price)
                 invoice_str+=(`
                 <tr>
                     <td style= "text-align: left" width="40%">${all_products[pk][i].product}</td>
                     <td width="40%">${qty}
                     <td width="40%">\$${all_products[pk][i].price}</td>
                     <td  width="40%">\$${extended_price}</td>
                 </tr>
             `);
             }
         }
     }

 // All equations (tax, shipping, total) below are from Invoice4 WOD but adapted to fit shipping policies of normal pen stores
    // Hawaii tax rate is 4%
    var tax_rate = 0.04;
    var tax = tax_rate*subtotal;
    // Compute shipping
    if(subtotal <= 100) {
    shipping = subtotal*0.1; // To compensate cost of shipping for smaller items, shipping is 10% of the subtotal. 
    }
    else {
    shipping = 0.00; // Complementary shipping of $0 if subtotal is $100 or more
    }
     // Compute total
     var total = subtotal + tax + shipping;
     invoice_str += `<tr>
         <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
         <td width="75%">\$${subtotal.toFixed(2)}</td>
       </tr>`;
     invoice_str += `
       <tr>
         <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @ 5.75%</span></td>
         <td width="75%">\$${tax.toFixed(2)}</td>
       </tr>
       `;
     invoice_str += `
       <tr>
         <td style = "text-align: center;" colspan = "3" width="67"><span style="font-family: arial;">Shipping</span></td>
         <td width="75%">$${shipping.toFixed(2)}</td>
       `;
       invoice_str += `
       <tr>
         <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
         <td width="75%"><strong>$${total.toFixed(2)}</strong></td>
       </tr>
       `;
     invoice_str += '</table>';
     // Set up mail server (only works on UH mail server)
     var transporter = nodemailer.createTransport({
         host: "mail.hawaii.edu",
         port: 25,
         secure: false, // use TLS
         tls: {
             // do not fail on invalid certs
             rejectUnauthorized: false
         }
     });

var mailOptions = {
    from: 'calulotm@hawaii.edu', // My email to test
    to: user_email,
    subject: 'Thank you for shopping at Matts Pen Emporium!',
    html: invoice_str
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        invoice_str += `<br>There was an error and your invoice could not be emailed : to ${user_email}
        
        <br><br> <center><a href="./logout"><img src="images/logout.png" height="200px" width="200px"></a></center>`;
    } else {
        invoice_str += `<br>Your invoice was mailed to ${user_email}
        
        <br><br> <a href="./logout"><img src="images/logout.png" height="200px" width="200px"></a>`;
    }
    response.send(invoice_str);
});

});

// Routes the GET requests to the public directory
    app.use(express.static(__dirname + '/public'));
// Allows the server to run on port 8080
    app.listen(8080, () => console.log(`listening on port 8080`)); 