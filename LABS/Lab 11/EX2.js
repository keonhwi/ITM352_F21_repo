var attributes = "Kenny;23;23.5;-22.5";

var parts = attributes.split(';');

for(part of parts) {
    console.log(part, typeof part);

}