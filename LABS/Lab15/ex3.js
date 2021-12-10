const fs = require('fs');
var express = require('express');
var app = express();

//var cookieParser = require('cookie-parser'); cookie-parser no longer needed since already installed with express-session
//app.use(cookieParser());   ----- When a session is established, a session ID will created on server be sent to browser via a cookie 

var session = require('express-session');
const { type } = require('os');

app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));



app.get('/set_cookie', function (request, response) {
// this will send a cookie to the requester
    response.cookie('name', 'saaya', {maxAge: 15*1000}); //maxAge in miliseconds
    response.send(`The 'name' cookie has been sent`);
});

app.get('/use_cookie', function (request, response) {
    // this will get the 'name' cookie from the requester
    // and respond with message
        console.log(request.cookies);
        response.send(`Welcome to the Use Cookie page ${request.cookies['name']}`);
});



    
    app.get('/use_session', function (request, response) {
        // this will get the 'name' cookie from the requester
        // and respond with message
            console.log(request.cookies);
            response.send(`Welcome, your session ID is ${request.session.id}`);
    });



var filename = './user_data.json';

// will return boolean of the existence of the file 
if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    console.log(`${filename} has ${stats.size} characters `);
    //have reg data file so read data and parse into user_reg_info object
    var user_reg_info = require(filename);
    old_user_reg_info = JSON.stringify(user_reg_info);



    /* username = 'newuser';
    reg_data = {};
    reg_data[username] = {};
    reg_data[username].password = 'newpass';
    reg_data[username].email = 'newuser@user.com';
    new_data = JSON.stringify(reg_data);
    fs.writeFileSync('./user_data.json', new_data);
    console.log(JSON.stringify(filename));
    console.log(user_reg_info); */
}
else {
    console.log(`${filename} does not exist`);
}




app.use(express.urlencoded({ extended: true }));



app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/register", function (request, response) {

    new_username = request.body['username'];
    new_password = request.body['password'];
    repeat_new_password = request.body['repeat_password'];
    new_email = request.body['email']

    if (user_reg_info[new_username] != 'undefined' && new_password == repeat_new_password) {

        //reg_data = {};
        //adding to the preexisting user_reg_info object 
        //then we stringigy the entire object
        //then we write to the object again with the added items
        user_reg_info[new_username] = {};
        user_reg_info[new_username].password = new_password;
        user_reg_info[new_username].email = new_email;

        new_data = JSON.stringify(user_reg_info);
        fs.writeFileSync('./user_data.json', new_data);
        response.redirect('/login');
    }

    else {
        //then we write to the object again with the added items
        response.redirect('/register');
    }







});




app.get("/login", function (request, response) {
    var welcome_str = 'Welcome! You need to log in.'
    if (typeof request.cookies['username'] != 'undefined'){
        welcome_str = `Welcome ${request.cookies.username}! You logged in last on ${request.session['last login']}`;
    }
    // Give a simple login form
    str = `
<body>
${welcome_str}
<br>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'];
    let login_password = request.body['password'];
    //check if usernane exists, then check if password entered matches password stored
    if (typeof user_reg_info[login_username] != 'undefined') {
        if (user_reg_info[login_username]['password'] == login_password) {
           
            if (typeof request.session['last login'] != 'undefined'){
                var last_login = request.session['last login']
            } else {
                
                var last_login = request.session['last login'] = 'first time logging in '  
            }
            request.session['last login'] = new Date().toISOString() //put login date into session
            response.cookie('username', login_username);
            response.send(`You last logged in ${last_login}`)
        }
        else {
            response.send(`Incorrect password!`)
        }
    } else {
        response.send(`User, ${login_username}, does not exist!`);
    }


});

app.listen(8080, () => console.log(`listening on port 8080`));