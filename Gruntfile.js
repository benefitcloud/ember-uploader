module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '// ==========================================================================\n' +
      '// Project:   <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
      '// Homepage:  <%= pkg.homepage ? pkg.homepage + "\\n" : "\\n" %>' +
      '// Copyright: ©<%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      '// Licensed:  <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
      '// ==========================================================================\n\n',

    clean: {
      files: ['dist', 'tmp']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true,
        separator: ';'
      },
      dist: {
        src: ['packages/ember-uploader/lib/<%= pkg.name %>.js', 'packages/ember-uploader/lib/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      tests: {
        src: ['packages/ember-uploader/tests/<%= pkg.name %>.js', 'packages/ember-uploader/tests/**/*.js'],
        dest: 'dist/<%= pkg.name %>-tests.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        compress: false
      },
      dist: {
        src: 'tmp/dist.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
    },
    qunit: {
      all: {
        options: {
          urls: ['http://localhost:8000/tests/runner.html']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['packages/ember-uploader/lib/**/*.js']
      },
      tests: {
        src: ['packages/ember-uploader/tests/**/*.js']
      },
    },
    watch: {
      options: {
        nospawn: true,
      },
      code: {
        files: ['packages/ember-uploader/lib/**/*.js'],
        tasks: ['jshint', 'concat', 'qunit:development'],
      },
      test: {
        files: ['packages/ember-uploader/tests/**/*.js'],
        tasks: ['jshint', 'concat', 'qunit:development'],
      }
    },
    strip: {
      lib: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'tmp/dist.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // custom tasks
  grunt.registerTask('server', 'Start the test web server.', function() {
    grunt.log.writeln('Starting web server on port 8000.');
    require('./tests/server.js').listen(8000);
  });
  grunt.registerTask('test', ['clean', 'jshint', 'concat', 'server', 'qunit']);
  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'strip', 'uglify']);
  grunt.registerTask('develop', ['clean', 'jshint', 'concat', 'server', 'watch']);
  grunt.registerTask('default', ['build']);

  grunt.registerMultiTask('strip', "Strip all Ember debug statements", function() {
    // make this configurable or better: create own Grunt.js task for this
    var debugStatements = [
      "Ember.assert",
      "Ember.debug",
      "Ember.warn",
      "Ember.deprecate",
      "Ember.Logger.log",
      "Ember.Logger.warn",
      "Ember.Logger.error",
      "Ember.Logger.info",
      "Ember.Logger.debug",
      "console.log"
    ];

    var stripped = function(src) {
      var falafel = require('falafel');

      var isExpression = function(node) { return node.type === 'ExpressionStatement'; };
      var isCallExpression = function(node) { return node.type === 'CallExpression'; };
      var getCalleeExpression = function(node) {
        if (node.type === 'MemberExpression') { return getCalleeExpression(node.object) + '.' + node.property.name; }
        else if (node.type === 'Identifier') { return node.name; }
      };
      var isEmberDebugStatement = function(node) {
        var callee = getCalleeExpression(node);
        return debugStatements.indexOf(callee) !== -1;
      };

      return falafel(src, function (node) {
        if (isExpression(node) && isCallExpression(node.expression) && isEmberDebugStatement(node.expression.callee)) {
          node.update("");
        }
      });
    };

    // TODO refactor this!!
    var output = stripped(grunt.file.read(this.data.src));
    grunt.file.write(this.data.dest, output);
  });
};
