;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor.service', [
    'eha.login-service-adaptor-pouchdb.service'
  ])

  ngModule.service('ehaLoginServiceAdaptor', function (
    ehaLoginServiceAdaptorPouchDB
  ) {
    this.setItem = ehaLoginServiceAdaptorPouchDB.setItem
    this.getItem = ehaLoginServiceAdaptorPouchDB.getItem
    this.removeItem = ehaLoginServiceAdaptorPouchDB.removeItem
  })

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()
