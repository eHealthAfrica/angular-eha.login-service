;(function (env) {
  /* global expect it describe beforeEach afterEach spyOn */
  'use strict'

  afterEach(function (done) {
    var $injector = angular.injector([
      'ng',
      'eha.login-service.service'
    ])
    var adaptor = $injector.get('ehaLoginServiceAdaptor')
    adaptor.removeItem('username')
      .then(adaptor.removeItem.bind(null, 'password'))
      .catch(env.fail.bind())
      .finally(done)
  })

  describe('storeCredentials', function () {
    var adaptor
    var loginService

    beforeEach(function () {
      angular.module('mock', [])
        .service('ehaLoginServiceAdaptor', function () {
          this.setItem = angular.noop
          this.getItem = angular.noop
          this.removeItem = angular.noop
          spyOn(this, 'setItem')
        })
      var $injector = angular.injector([
        'ng',
        'eha.login-service.service',
        'mock'
      ])
      loginService = $injector.get('ehaLoginService')
      adaptor = $injector.get('ehaLoginServiceAdaptor')
    })

    it('should store credentials', function (done) {
      loginService.storeCredentials('karl', 'pineapple')
        .then(function () {
          expect(adaptor.setItem).toHaveBeenCalledWith('username', 'karl')
          expect(adaptor.setItem).toHaveBeenCalledWith('password', 'pineapple')
        })
        .catch(env.fail.bind())
        .finally(done)
    })
  })

  describe('hasLocalCreds', function () {
    var adaptor
    var loginService

    beforeEach(function () {
      var $injector = angular.injector([
        'ng',
        'eha.login-service.service'
      ])
      loginService = $injector.get('ehaLoginService')
      adaptor = $injector.get('ehaLoginServiceAdaptor')
    })

    it('should default to false', function (done) {
      loginService.hasLocalCreds()
        .then(function (hasCreds) {
          expect(hasCreds).toBe(false)
        })
        .catch(env.fail.bind())
        .finally(done)
    })

    it('should be false if only the username is set', function (done) {
      adaptor.setItem('username', 'myuser')
        .then(loginService.hasLocalCreds)
        .then(function (hasCreds) {
          expect(hasCreds).toBe(false)
        })
        .catch(env.fail.bind())
        .finally(done)
    })

    it('should be true if username and password are set', function (done) {
      adaptor.setItem('username', 'myuser')
        .then(adaptor.setItem.bind(null, 'password', 'mypass'))
        .then(loginService.hasLocalCreds)
        .then(function (hasCreds) {
          expect(hasCreds).toBe(true)
        })
        .catch(env.fail.bind())
        .finally(done)
    })
  })

  describe('logout', function () {
    var $q
    var store = {}
    var adaptor
    var loginService

    beforeEach(function () {
      angular.module('eha.login-service-adaptor.mock', [])
        .service('ehaLoginServiceAdaptor', function () {
          this.setItem = function (key, value) {
            store[key] = value
          }
          this.removeItem = function (key) {
            delete store[key]
          }
          this.getItem = angular.noop
        })

      var $injector = angular.injector([
        'ng',
        'eha.login-service.service',
        'eha.login-service-adaptor.mock'
      ])
      $q = $injector.get('$q')
      loginService = $injector.get('ehaLoginService')
      adaptor = $injector.get('ehaLoginServiceAdaptor')
    })

    it('should delete all creds', function (done) {
      $q.all([
        adaptor.setItem('username', 'nicklas'),
        adaptor.setItem('password', 'backstrom')
      ])
      .then(loginService.logout.bind())
      .then(function () {
        expect(store.username).toBeUndefined()
        expect(store.password).toBeUndefined()
      })
      .catch(env.fail.bind())
      .finally(done)
    })
  })

  describe('renew', function () {
    var $q
    var adaptor
    var loginService
    var store
    var pouchDB

    beforeEach(function () {
      angular.module('eha.login-service-adaptor.mock', [])
        .service('ehaLoginServiceAdaptor', function () {
          store = {}
          this.setItem = function (key, value) {
            store[key] = value
          }
          this.removeItem = function (key) {
            delete store[key]
          }
          this.getItem = function (key) {
            return store[key]
          }
        })

      angular.module('pouchdb.mock', [])
        .service('loginMock', function ($q) {
          this.login = function (user, pass) {
            if (user && pass) {
              return $q.when({
                ok: true,
                name: user,
                roles: []
              })
            }
            return $q.reject({
              status: 401,
              message: 'Name or password invalid'
            })
          }
          spyOn(this, 'login').and.callThrough()
        })
        .factory('pouchDB', function (loginMock) {
          return function () {
            return loginMock
          }
        })

      angular.module('testApp', [])
        .config(function (ehaLoginServiceProvider) {
          ehaLoginServiceProvider.config('https://mydb')
        })

      var $injector = angular.injector([
        'ng',
        'eha.login-service.service',
        'eha.login-service-adaptor.mock',
        'pouchdb.mock',
        'testApp'
      ])
      loginService = $injector.get('ehaLoginService')
      adaptor = $injector.get('ehaLoginServiceAdaptor')
      $q = $injector.get('$q')
      pouchDB = $injector.get('loginMock').login
    })

    it('should renew the session if it has creds', function (done) {
      $q.all([
        adaptor.setItem('username', 'santa'),
        adaptor.setItem('password', 'claus')
      ])
      .then(loginService.renew.bind())
      .then(function () {
        expect(pouchDB, 'login').toHaveBeenCalledWith('santa', 'claus')
        expect(store.username).toBe('santa')
        expect(store.password).toBe('claus')
      })
      .catch(env.fail.bind())
      .finally(done)
    })

    it('should not renew if it doesnt have creds', function (done) {
      store.username = 'santa'
      store.password = undefined // bam bam bAAAAAAM
      loginService.renew()
        .then(env.fail.bind())
        .catch(function (err) {
          expect(pouchDB, 'this').not.toHaveBeenCalled()
          expect(err.status).toBe(401)
        })
        .finally(done)
    })
  })

  describe('maybeShowLoginUi', function () {
    var loginService

    beforeEach(function () {
      angular.module('testApp', [])
        .run(function (ehaLoginService, $q) {
          ehaLoginService.config(function () {
            return $q.when(['remy', 'password'])
          })
        })

      var $injector = angular.injector([
        'ng',
        'eha.login-service.service',
        'testApp'
      ])

      loginService = $injector.get('ehaLoginService')
    })

    it('should prompt for creds if it doesnt have any', function (done) {
      loginService.maybeShowLoginUi()
        .then(function (creds) {
          expect(creds).toEqual(['remy', 'password'])
        })
        .catch(env.fail.bind())
        .finally(done)
    })
  })

  describe('getUserName', function () {
    var adaptor
    var loginService

    beforeEach(function () {
      var $injector = angular.injector([
        'ng',
        'eha.login-service.service'
      ])
      loginService = $injector.get('ehaLoginService')
      adaptor = $injector.get('ehaLoginServiceAdaptor')
    })

    it('should return falsy if username unset', function (done) {
      loginService.getUserName()
        .then(function (userName) {
          expect(userName).toBeFalsy
        })
        .catch(env.fail.bind())
        .finally(done)
    })

    it('should return the username if set', function (done) {
      adaptor.setItem('username', 'rick')
        .then(loginService.getUserName.bind())
        .then(function (userName) {
          expect(userName).toBe('rick')
        })
        .catch(env.fail.bind())
        .finally(done)
    })
  })
})(this)
