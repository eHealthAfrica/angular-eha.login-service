;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor-pouchdb.service', [
    'pouchdb',
    'eha.login-service-adaptor-pouchdb.config'
  ])

  ngModule.service('ehaLoginServiceAdaptorPouchDB', function (pouchDB) {
    var db = pouchDB('eha-login-service')
    var id = '_local/eha-login-service'

    this.setItem = function (key, value) {
      function diffFun (doc) {
        doc[key] = value
        return doc
      }
      return db.upsert(id, diffFun)
        .then(function (res) {
          return value
        })
    }

    this.getItem = function (key) {
      function pluckKey (doc) {
        return doc[key]
      }

      function handleError (err) {
        if (err && err.status !== 404) {
          throw err
        }
        return false
      }

      return db.get(id)
        .then(pluckKey)
        .catch(handleError)
    }

    this.removeItem = function (key) {
      function diffFun (doc) {
        if (!doc._id) {
          return false
        }
        delete doc[key]
        return doc
      }
      return db.upsert(id, diffFun)
    }
  })

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()
