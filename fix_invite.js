const fs = require('fs');
let file = fs.readFileSync('src/modules/settings/api/endpoints.js', 'utf8');
file = file.replace('if (data.password) {', 'if (data.permissionOverrides) { payload.permissionOverrides = data.permissionOverrides; }\n  if (data.password) {');
fs.writeFileSync('src/modules/settings/api/endpoints.js', file);
console.log('Fixed endpoints.js');
