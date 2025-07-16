const { spawn } = require('child_process');
const python = spawn('py', ['--version']);
python.stdout.on('data', (data) => { console.log('stdout:', data.toString()); });
python.stderr.on('data', (data) => { console.log('stderr:', data.toString()); });
python.on('close', (code) => { console.log('exit code:', code); }); 