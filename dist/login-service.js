;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service', [
    'eha.login-service-adaptor.service',
    'eha.login-service.service'
  ])

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()

;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor-pouchdb.config', [
    'pouchdb'
  ])

  ngModule.config(['POUCHDB_METHODS', function (POUCHDB_METHODS) {
    POUCHDB_METHODS.upsert = 'qify'
  }])

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()

;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor-pouchdb.service', [
    'pouchdb',
    'eha.login-service-adaptor-pouchdb.config'
  ])

  ngModule.service('ehaLoginServiceAdaptorPouchDB', ['pouchDB', function (pouchDB) {
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
  }])

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()

;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service-adaptor.service', [
    'eha.login-service-adaptor-pouchdb.service'
  ])

  ngModule.service('ehaLoginServiceAdaptor', ['ehaLoginServiceAdaptorPouchDB', function (
    ehaLoginServiceAdaptorPouchDB
  ) {
    this.setItem = ehaLoginServiceAdaptorPouchDB.setItem
    this.getItem = ehaLoginServiceAdaptorPouchDB.getItem
    this.removeItem = ehaLoginServiceAdaptorPouchDB.removeItem
  }])

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()

;(function () {
  'use strict'

  var ngModule = angular.module('eha.login-service.service', [
    'pouchdb',
    'eha.login-service-adaptor.service'
  ])
    .provider('ehaLoginService', function () {
      var DB_NAME = null
      this.config = function (database) {
        DB_NAME = database
      }

      this.$get = ['$q', '$window', 'pouchDB', 'ehaLoginServiceAdaptor', function (
        $q,
        $window,
        pouchDB,
        ehaLoginServiceAdaptor
      ) {
        var loginService = this

        // notificationService is a promise that must resolve with an array
        // containing the username & password.
        var notificationService = function () {
          var username = $window.prompt('Username?')
          var password = $window.prompt('Password?')
          return $q.when([username, password])
        }

        loginService.config = function (notifier) {
          if (typeof notifier !== 'function') {
            throw new Error('notification service must be a function that ' +
              'returns a promise')
          }
          notificationService = notifier
        }

        var _db // cached db connection
        var db = function () {
          if (!DB_NAME) {
            var lines = [
              'loginService must be configured with:\n',
              '.config(function (ehaLoginServiceProvider) {',
              '  // Full URL to a CouchDB, including an existing DB',
              '  var url = "https://couchdb.example.com/db"',
              '  ehaLoginServiceProvider.config(url)',
              '})'
            ].join('\n')
            throw new Error(lines)
          }

          _db = _db || pouchDB(DB_NAME)
          return _db
        }

        var setItem = ehaLoginServiceAdaptor.setItem
        var getItem = ehaLoginServiceAdaptor.getItem
        var removeItem = ehaLoginServiceAdaptor.removeItem

        var storeCredentials = function (username, password) {
          var promises = [
            setItem('username', username),
            setItem('password', password)
          ]

          return $q.all(promises)
        }

        var getUserPass = function () {
          return $q.all([
            getItem('username'),
            getItem('password')
          ])
        }

        var hasDatabaseCredentials = function () {
          return getUserPass().then(function (creds) {
            // Couch requires both username and password
            // Otherwise it'll return a 400 Bad Request
            return !!(creds[0] && creds[1])
          })
        }

        loginService.getUserName = getItem.bind(null, 'username')

        loginService.maybeShowLoginUi = function () {
          return hasDatabaseCredentials().then(function (has) {
            if (has) {
              return getUserPass()
            } else {
              return notificationService().then(function (creds) {
                // $q promise can only take one value
                return storeCredentials.apply(null, creds)
              })
                .then(getUserPass)
            }
          })
        }

        loginService.hasLocalCreds = function () {
          return hasDatabaseCredentials()
        }

        loginService.login = function (username, password) {
          var store = storeCredentials.bind(null, username, password)
          return db().login(username, password).then(store)
        }

        loginService.renew = function () {
          return hasDatabaseCredentials().then(function (has) {
            if (has) {
              return getUserPass().then(function (res) {
                return loginService.login(res[0], res[1])
              })
            }

            // Check the retriable service if changing this
            return $q.reject({status: 401, message: 'credentials not found'})
          })
        }

        // FIXME this could mess things up https://github.com/eHealthAfrica/BiometricRegistration/blob/f1492732380322aca7415defd7dcb222034750f2/app/scripts/services/logout.js#L5
        loginService.logout = function () {
          return $q.all([
            removeItem('username'),
            removeItem('password')
          ])
        }

        loginService.storeCredentials = function (username, password) {
          return storeCredentials(username, password)
        }

        return loginService
      }]
    })

  // Check for and export to commonjs environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule
  }
})()
