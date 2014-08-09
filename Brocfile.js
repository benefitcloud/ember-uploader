var es6        = require('broccoli-es6-module-transpiler');
var concat     = require('broccoli-concat');
var uglify     = require('broccoli-uglify-js');
var env        = process.env.EMBER_ENV;
var pickFiles  = require('broccoli-static-compiler');
var merge      = require('broccoli-merge-trees');
var moveFile   = require('broccoli-file-mover');
var removeFile = require('broccoli-file-remover');
var wrap       = require('broccoli-wrap');
var jshint     = require('broccoli-jshint');

function moveFromLibAndMainJs(packageName, vendored){
  var root = vendored ? 'bower_components/' + packageName + "/packages/" + packageName + '/lib':
    'packages/' + packageName + '/lib';
  var tree = pickFiles(root, {
    srcDir: '/',
    files: [ '**/*.js' ],
    destDir: '/' + packageName
  });
  tree = moveFile(tree, {
    srcFile: packageName + '/main.js',
    destFile: '/' + packageName + '.js'
  });
  tree = es6(tree, {moduleName: true});

  return tree;
}

function minify(tree, name){
  var uglified = moveFile(uglify(tree, {mangle: true}),{
    srcFile: name + '.js',
    destFile: '/' + name + '.min.js'
  });
  return merge([uglified, tree]);
}

function testTree(libTree, packageName){
  var test = pickFiles('packages/' + packageName + '/tests', {
    srcDir: '/',
    files: [ '**/*.js' ],
    destDir: '/'
  });
  var jshinted = jshint(libTree);
  jshinted = wrap(jshinted, {
    wrapper: [ "if (!QUnit.urlParams.nojshint) {\n", "\n}"]
  });
  return merge([jshinted, test]);
}

var libFiles = moveFromLibAndMainJs('ember-uploader', false);

var loaderJS = pickFiles('bower_components/loader.js', {
  srcDir: '/',
  files: [ 'loader.js' ],
  destDir: '/'
});

var namedAMDBuild = concat(libFiles, {
  inputFiles: ['**/*.js'],
  separator: '\n',
  outputFile: '/ember-uploader.named-amd.js'
});

var globalBuild = concat(merge([libFiles, loaderJS]), {
  inputFiles: ['loader.js', '**/*.js'],
  separator: '\n',
  outputFile: '/ember-uploader.js'
});

globalBuild = wrap(globalBuild, {
  wrapper: [ "(function(global){\n", "\n global.EmberUploader = requireModule('ember-uploader')['default'];\n })(this);"]
});

if (env !== 'production') {
  var testFiles = testTree(libFiles, 'ember-uploader');

  testFiles = concat(testFiles, {
    inputFiles: ['**/*.js'],
    separator: '\n',
    wrapInEval: true,
    wrapInFunction: true,
    outputFile: '/tests/tests.js'
  });

  var testRunner = pickFiles('tests', {
    srcDir: '/',
    inputFiles: [ '**/*' ],
    destDir: '/tests'
  });

  var bower = pickFiles('bower_components', {
    srcDir: '/',
    inputFiles: [ '**/*' ],
    destDir: '/tests/bower_components'
  });

  var trees = merge([
    testFiles,
    globalBuild,
    namedAMDBuild,
    testRunner,
    bower
  ]);
} else {
  var minifiedAMD = minify(namedAMDBuild, 'ember-uploader.named-amd');
  var minifiedGlobals = minify(globalBuild, 'ember-uploader');
  var trees = merge([
    minifiedAMD,
    minifiedGlobals
  ]);
}

module.exports = trees;
