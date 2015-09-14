;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service', [
    'eha.login-service.service'
  ])

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()
