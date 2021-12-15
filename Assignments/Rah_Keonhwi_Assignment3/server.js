//Keonhwi Rah Professor Port Fall2021
//Most of the codes are from assignment 2, labs and wods and big thanks to Xinfei for help and codes
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var nodemailer = require('nodemailer');
const e = require('express');
const shift = 4;
var data = require('./Public/product_data');
var allProducts = data.allProducts;
// loads starts up fs system actions
var fs = require('fs');
//set filename equal to user data.json
var filename = './user_data.json';
// used to store quantity data from products disiplay page
var session = require('express-session');
var temp_qty_data = {};
//From Lab 15 intializes sessions
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

// Monitors all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to' + request.path);
    next();
});

//-------To set up shopping cart-----//
app.get("/add_to_cart", function (request, response) {
  var product_key = request.query['prod_key']; // get the product key sent from the form post
  var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
  request.session.cart[product_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
  response.redirect('./cart.html');
});

//------------Set up get cart-------//
//microservice return the shopping cart data from current session
app.post("/get_cart", function (req, res) {
  if (typeof req.session.cart == 'undefined') {
    req.session.cart = {};
  }
  res.json(req.session.cart);
});


// Use GET to (get)convert my products.js file
app.get('/product_data.js', function (request, response, next) {
  response.type('.js');
  var products_str = `var allProducts = ${JSON.stringify(allProducts)};`;
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
if (fs.existsSync(filename)) {
  var data = fs.readFileSync(filename, 'utf-8');
  var user_data = JSON.parse(data);
  //if the file does not exists, the console willl show the nme of the file, and tell the file is not exist.
} else {
  console.log(`${filename} does not exist!`);
}

//From lab 13 
//to access inputted data from product_data.js
app.use(express.urlencoded ({extended: true }));
if (fs.existsSync(filename)) {
  var data = fs.readFileSync(filename, 'utf-8');
  var user_data = JSON.parse(data);
  //if the file does not exists, the console willl show the nme of the file, and tell the file is not exist.
} else {
  console.log(`${filename} does not exist!`);
}
  
  // -------------- Login -------------------- //
  // save reffering page, unless it's login.html
app.get('/login.html', function (req, res, next) {
  if (!req.header('Referrer').includes('login.html')) {
    req.session.login_refferer = req.header('Referrer');
  }
  next();
});

//-------------Password Encryption(Extra Credit)------------//
////Borrowed and modified code from Stack overflow, Chloe Cheng and Caixin Zhang
function encrypt(password) {
  var encrypted = [];
  var encrypted_result = "";

  //encrypt the password Referece: Stack overflow 
  //save the new password as encrypted
  for (var i = 0; i < password.length; i++) {
    encrypted.push(password.charCodeAt(i) + shift);
    encrypted_result += String.fromCharCode(encrypted[i]);
  }
  return encrypted_result;
}
//this process the login form refernce: My assignment2, lab15, lab14, and Chole Cheng and Caixin Zheng
app.post("/process_login", function (req, res) {
  // Process login form POST and redirect to logged in page if ok, back to login page if not
  var the_username = req.body.username.toLowerCase(); //username in lowercase
  var the_password = req.body.password;
  let encrypted_password_input = encrypt(the_password);
  if (typeof user_data[the_username] != 'undefined') { //matching username
    if (user_data[the_username].password == encrypted_password_input) { //if all the info is correct, then redirect to the referrer page
      // send the user a login cookies, and expire after 30 mins
      res.cookie('login', the_username, { maxAge: 30 * 60 * 1000 });
      res.redirect(req.session.login_refferer);//if good to go, send to invoice page with the username and email to the string
      return;

    } else { //if the password has error, push an error
      req.query.username = the_username;
      req.query.LoginError = 'Invalid Password';
    }
  } else { //if the username has error, push an error 
    req.query.LoginError = 'Invalid Username';

  }
  params = new URLSearchParams(req.query);
  res.redirect('./login.html?' + params.toString());//redirect to login page if there is a error
});
  
//----------------Logout--------------//
//this process the logout form Reference: lab 15 from Professor Port 
app.get("/logout", function (req, res, next) {
  res.clearCookie("login");// to clear the cookie
  res.redirect(req.session.login_refferer);//take the user back to the referrer page
});
  
  // -------------- Register --------------------//
  //to make sure the user put in valid information
  app.post("/process_register", function (req, res) {
    console.log(req.body);
    // assume no register errors from the start, so set no register errors 
    var reg_errors = {};
  
    var reg_username = req.body.username.toLowerCase(); //register username in lowercase
  
    // -------------- Full name validation -------------- //
    if (/^[A-Za-z, ]+$/.test(req.body.fullname)) { //check if the fullname is correct
    }
    else {
      reg_errors['fullname'] = 'Only Letters allowed for Full Name (Ex. Alex Smith)';// if there is a error, show this
    }
  
    if (req.body.fullname.length > 30 && req.body.fullname.length < 1) { //check if the length is less than 1 or greater than 30
      reg_errors['fullname'] = 'Fullname must contain Maximum 30 Characters';// if enter invalid length, put wrong
    }
  
    // -------------- Username validation -------------- //
    if (req.body.username.length > 10 || req.body.username.length < 4) { //check if the length of username is less than 4 or greater than 10
      reg_errors['username'] = 'Minimum of 4 characters and maximum of 10 characters';// if enter invalid length, put wrong
    }
  
    if (typeof user_data[reg_username] != 'undefined') { //check if the username is taken or not
      reg_errors['username'] = 'This username is already registered!';//if the username is taken, show this
    }
  
  
    if (typeof user_data[reg_username] == '') { //check if the username is empty or not
      reg_errors['username'] = 'You need a username!'; // if invalid, show this
    }
  
    if (/^[0-9a-zA-Z]+$/.test(req.body.username)) {//username only letter and number
    }
    else {
      reg_errors['username'] = 'Username is Letters and Numbers Only (Ex. Abc123)';//if the user enter a wrong username, show this
    }
  
    // -------------- Email validation -------------- //
    // Setup email limitations (from w3resource https://www.w3resource.com/javascript/form/email-validation.php)
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)) {// Email only allows certain character for x@y.z
    }
    else {
      reg_errors['email'] = 'Must enter a valid email (Ex. username@mailserver.domain).';//otherwise, show this to the user
    }
  
    // -------------- Password validation -------------- //
    if (req.body.password.length < 6) {//password length need to be 6 characters or more
      reg_errors['password'] = 'Minimum: 6 Characters';// otherwise, show this
    }
  
    // -------------- Repeat Password validation -------------- //
    if (req.body.password !== req.body.repeat_password) {  // check if the repeat password is matching password
      reg_errors['repeat_password'] = 'Repeat password not the same as password!';// if not, show this
    }
  
    // If no errors then save new user and redirect to invoice, otherwise back to registration form and note errors
    if (Object.keys(reg_errors).length == 0) {
      //If user enterd valid information, then save and store in JSON file 
      console.log('no errors')
      var username = req.body['username'].toLowerCase();
      user_data[username] = {};
      user_data[username]["name"] = req.body['fullname'];
      user_data[username]["password"] = req.body['password'];
      user_data[username]["email"] = req.body['email'];
  
      fs.writeFileSync(filename, JSON.stringify(user_data), "utf-8");
      // Put the stored quanitiy data into the temp_qty_data
      //get the username and email from the register information
      let params = new URLSearchParams(temp_qty_data);
      params.append('username', username); // add the username to the query
      params.append('email', user_data[username].email); // add email to the query
      res.redirect('/invoice.html?' + params.toString());// if good to go, send the user to invoice page with query string
    }
  
    //if error occurs, redirect to register page
    else {
      req.body['reg_errors'] = JSON.stringify(reg_errors);
      let params = new URLSearchParams(req.body);
      res.redirect('register.html?' + params.toString());
    }
  });


// -------------- Add Quantity to Cart ----------------- //
// process purchase request (validate quantities, check quantity available)
app.post("/process_form", function (req, res, next) {
  // check the quantity, if it is not valid, send it to the products display page in order to repurchase

  let POST = req.body;

  var product_key = POST["prods_key"];

  var errors = {};
  // assume no quantities from the start, so set no quantities error 
  
  //if user enter empty quantities, show this text
  errors['no_quantities'] = 'Please enter some quantities';
  products = allProducts[product_key];
  for (i = 0; i < products.length; i++) {
    qua = POST['quantity' + i];
    if (isNonNegInt(qua) == false) { //if the quantity is false, send a alert tht show the error
      errors['quantity' + i] = `Please enter valid quantities for ${products[i].name}`; //it will pop out a alert to warn the user 
    }
    // if we have quantities, unset the error, and remove from inventory
    if (qua > 0) {
      delete errors['no_quantities'];
      // check if quanty wanbted is available in inventory 
      if (qua > products[i].inventory) {
        errors['inventory' + i] = `${qua} of ${products[i].name} not available. Only ${products[i].inventory} available.`;
      }
    }
  }


  if (JSON.stringify(errors) === '{}') {
    // keep the quanity data in the sesssion 
    if (typeof req.session.cart == 'undefined') {
      req.session.cart = {};
    }
    req.session.cart[product_key] = req.body;
    console.log(req.session.cart);
    res.redirect(`./cart.html?`); // if it is valid, send to cart page
  } else {
    //otherwise add the errors and prod_key in to the string
    let params = new URLSearchParams(POST);
    params.append('errors', JSON.stringify(errors));
    params.append('prod_key', product_key);
    res.redirect("./products_display.html?" + params.toString()); // if it is incorrect, send to products display html
  }
});

//------------------ Complete Purchase -----------------//
app.post("/confirm", function (req, res) {
  let username = req.cookies["login"];//get username from cookies
  console.log(req.cookies);// to check username/login
  // if user not logged in, send them to login
  if (typeof req.cookies["login"] == 'undefined') {
    res.redirect(`./login.html`);
    return;
  }

 //check errors
 var errors = {};
 if (JSON.stringify(errors) === '{}') {
   // send to invoice.html 
   //put their username and email in the URL/string
   let params = new URLSearchParams();
   params.append('username', username);
   params.append('email', user_data[username].email);
   res.redirect(`./invoice.html?${params.toString()}`);
 } else {
   res.redirect(`./cart.html`);
 }
});

//-------------- Complete Purchase/ Email Invoice --------------//
// Borrowed and modified from Assignment 3 Example Codes and Labs, Wods
//email invoice to user

app.post('/complete_purchase', function (req, res) {
  let username = req.cookies["login"];//get username
  let user_email = user_data[username].email;//get user email
  var shopping_cart = req.session.cart;//get the cart

  // Modified and borrowed template from W3schools  
  //Borrowed and modified from my invoice 
  //invoice table
  invoice_str = `<table class="w3-table-all w3-card-4">
    <tbody style="border-color:navy">
  
    <tr>
      <th style="text-align: center; background-color: rgb(161, 219, 253);" width="11%">Item</th>
      <th style="text-align: center; background-color: rgb(251, 208, 123);" width="43%">Quantity</th>
      <th style="text-align: center; background-color: rgb(240, 240, 156);" width="13%">Price</th>
      <th style="text-align: center; background-color: rgb(168, 240, 168);" width="54%">Extended Price</th>
    </tr>
    `;



  subtotal = 0;//make the total quantities is 0 at frist
  total_qua = 0; //make the total quantities is 0 at frist
  for (let prod_key in shopping_cart) {
    let products = allProducts[prod_key]; //define products 
    for (i = 0; i < products.length; i++) {
      let q = Number(shopping_cart[prod_key][`quantity${i}`]);
      if (q > 0) {
        // product row
        total_qua += Number(q); //convert string to number, in order to display number
        extended_price = q * products[i].price;
        subtotal += extended_price;

        invoice_str += `<tr>
   <td width="43%"><em>${products[i].name}</em></td>
   <td align="center" width="11%"><em>${q}</em></td>
   <td width="13%"><em>\$${products[i].price}</em></td>
   <td width="54%"><em>\$${extended_price}</em></td>
 </tr>
  `;
      }
    }
  }
  //compute tax

  var tax_rate = 0.04;
  var tax = tax_rate * subtotal;

  //compute shipping
  if (total_qua <= 49) { //if the total quantites is under 50, then free shipping
    shipping = 0;
  }
  else if (total_qua <= 200) { //if the total quantites 50-200, then we will charge $15 for shipping
    shipping = 15;
  }
  else {
    shipping = 0.05 * subtotal; // 5% of subtotal
  }
  //compute grant total
  var total = subtotal + tax + shipping;


  invoice_str += `
<p style="color:#54a8ec; font-size: 20px;"> Mahalo ${username}! Thank you for purchase &#128144;<br>
 All orders are processed within 3-6 business days &#x1F4EC; </p>
<tr>
<td style="text-align: center;" colspan="4"></td>
</tr>
<tr>
<td style="text-align: center;font-family: Garamond;" colspan="3" width="67%">Total Quantities</td>
<td width="54%">
   ${total_qua}
</td>
</tr>
<tr>
<td style="text-align: center;font-family: Garamond;" colspan="3" width="67%">Sub-total</td>
<td width="54%">$
    ${subtotal.toFixed(2)}
</td>
</tr>
<tr>
<td style="text-align: center;font-family: Garamond;" colspan="3" width="67%"><span
        style="font-family: Lucida Bright;">Tax @
        ${100 * tax_rate}
    </span></td>
<td width="54%">$
${tax.toFixed(2)}
</td>
</tr>
<td style="text-align: center; font-family: Garamond;" colspan="3" width="67%">Shipping</span></td>
<td width="54%">$
${shipping.toFixed(2)}
</td>
</tr>
<tr>
<td style="text-align: center;font-family: Garamond;" colspan="3" width="67%"><strong>Total</strong>
</td>
<td width="54%"><strong>$
${total.toFixed(2)}
    </strong></td>
</tr>
</tbody>
</table>
`;
  //Modified and borrowed code from Assignment 3 example codes
  // Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  //get the username and email from user data

  var mailOptions = {
    from: 'Keonhwi@hawaii.edu',
    to: user_email,
    subject: 'Thank you for your purchase! Here is your receipt', //send a thank you message and invoice to user's email
    html: invoice_str,//get the invoice 
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);// print out the error 
      invoice_str += '<br>There was an error and your invoice could not be emailed :('; //if invoice unable to send, display this
    } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;//if invoice sent, display this
    }
    res.send(invoice_str);
  });
});





//route all other GEt requests to files in the public folder. 
app.use(express.static('./Public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback