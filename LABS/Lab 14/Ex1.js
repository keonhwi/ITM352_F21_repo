var fs = required('fs')

var filename = 'registration_data.dat';

if(fs.existsSync(filename)) {
 var stats = fs.statSync(filename);
 console.log (filename + ' has' + stats["size"] + 'characters');}
 else{
     console.log (filename + 'does not exist!');
 }