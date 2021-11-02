var attributes = "Kenny;23;23.5;-22.5";

var parts = attributes.split(';');
/*
for(part of parts){
    console.log(`${part} isNonNegInt: ${isNonNegInt(part)}`);
}
*/
parts.forEach(checkIt)
function isNonNegInt (q,returnErrors) {
    // Checks if string q is a non negative integer. Returns true if q is a non neg integer
errors = []; // assume no errors at first
if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
return returnErrors ? Errors : (errors.length == 0)
}

function checkIt(item, index) {
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}
attributes = "Kenny;23;23.5;-22.5";
pieces = attributes.split(';');

pieces.forEach(checkIt)
