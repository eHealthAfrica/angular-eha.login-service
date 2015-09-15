;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor-pouchdb.config', [
    'pouchdb'
  ])

  ngModule.config(function (POUCHDB_METHODS) {
    POUCHDB_METHODS.upsert = 'qify'
  })

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()
