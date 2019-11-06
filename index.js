#!/usr/bin/env node

var
  program = require('commander'),
  actions = require('./actions')
  ;

  process.env.INIT_CWD = process.cwd();
  
program
  .version('0.0.1')
  .description('cli for generating code');

program
  .command('init')
  .alias('i')
  .description('Setup microdb')
  .action(onInit);

  program
  .command('gen')
  .alias('g')
  .description('Generate source code from microdb api')
  .action(OnGenerateSource);
  

function onInit() {
  actions.init().then(function(res){
    console.log(res);
  });
  
}

function OnGenerateSource() {
  actions.generateSource().then(function(res){
    console.log(res);
  });
  
}


if (!process.argv.slice(2).length || !/[ig]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv);
