module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: ['dist/'],
      tmp: ['.tmp/']
    },
    watch: {
      dist: {
        files: [
          'src/**/*'
        ],
        tasks: ['build']
      }
    },
    copy: {
      scripts: {
        expand: true,
        cwd: '.tmp',
        src: [
          'scripts.js',
          'scripts.template.js'
        ],
        dest: 'dist/',
        rename: function (dest, src) {
          return dest + src.replace('scripts', 'login-service')
        }
      }
    },
    concat: {
      scripts: {
        src: [
          'src/**/*.js',
          '!src/**/*.spec.js'
        ],
        dest: '.tmp/scripts.js',
        options: {
          process: function (src, path) {
            // Remove templates dependency from non-templates version if exists
            return src.replace(/,\n {4}'eha.login\.login-service\.template'/, '')
          }
        }
      },
      scriptsWithTemplateDeps: {
        src: [
          'src/**/*.js',
          '!src/**/*.spec.js'
        ],
        dest: '.tmp/scripts.template.deps.js'
      },
      template: {
        src: [
          '.tmp/template.js',
          '.tmp/scripts.template.deps.js'
        ],
        dest: '.tmp/scripts.template.js'
      }
    },
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      tmp: {
        files: [{
          expand: true,
          src: ['.tmp/**/*.js']
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/login-service.template.min.js': ['.tmp/scripts.template.js'],
          'dist/login-service.min.js': ['.tmp/scripts.js']
        }
      }
    },
    html2js: {
      dist: {
        src: ['src/**/*.tpl.html'],
        dest: '.tmp/template.js',
        module: 'eha.login-service.template',
        options: {
          rename: function (moduleName) {
            var parts = moduleName.split('/')
            var index = parts.indexOf('src')
            parts = parts.slice(index + 1, parts.length)
            return 'templates/' + parts.join('/')
          }
        }
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: true,
        autoWatch: false
      },
      watch: {
        singleRun: false,
        autoWatch: true
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json', 'dist/'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        // pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    }
  })

  grunt.registerTask('template', ['html2js'])
  grunt.registerTask('test', ['template', 'karma:unit'])
  grunt.registerTask('test:watch', ['karma:watch'])

  grunt.registerTask('build', function () {
    grunt.task.run([
      'clean',

      'concat:scripts',

      'ngAnnotate',
      'copy:scripts',
      'uglify:dist'
    ])
  })

  grunt.registerTask('release', function (target) {
    grunt.task.run([
      'build',
      'bump:' + target
    ])
  })

  grunt.registerTask('default', ['build'])
}
