var plan = require('flightplan');
var appName = 'ChatApp';
var username = 'root';
var startFile = 'bin/www';

var tmpDir = appName+'-' + new Date().getTime();
// configuration
plan.target('production', {
  host: '139.59.10.251',
  username: username,
  password : "appleios",
  agent: process.env.SSH_AUTH_SOCK
});

// plan.target('production', [
//   {
//     host: 'www1.example.com',
//     username: 'pstadler',
//     agent: process.env.SSH_AUTH_SOCK
//   },
//   {
//     host: 'www2.example.com',
//     username: 'pstadler',
//     agent: process.env.SSH_AUTH_SOCK
//   }
// ]);

var tmpDir = 'example-com-' + new Date().getTime();

// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on the target's remote hosts
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  remote.exec('forever start ~/'+appName+'/'+startFile);
});

// run more commands on localhost afterwards
plan.local(function(local) { /* ... */ });
// ...or on remote hosts
plan.remote(function(remote) { /* ... */ });
