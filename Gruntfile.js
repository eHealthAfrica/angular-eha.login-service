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
          'scripts.js'
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
        dest: '.tmp/scripts.js'
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
          'dist/login-service.min.js': ['.tmp/scripts.js']
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
    }
  })

  grunt.registerTask('test', ['karma:unit'])
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

  grunt.registerTask('default', ['build'])
}
