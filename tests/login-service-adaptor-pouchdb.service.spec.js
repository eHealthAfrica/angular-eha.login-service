;(function (env) {
  /* global expect it describe beforeEach */
  'use strict'

  describe('setItem', function () {
    var pouchDBAdaptor

    beforeEach(function () {
      var injector = angular.injector([
        'ng',
        'eha.login-service-adaptor-pouchdb.service'
      ])

      pouchDBAdaptor = injector.get('ehaLoginServiceAdaptorPouchDB')
    })

    it('should return the value', function (done) {
      pouchDBAdaptor.setItem('username', 'tlvince')
        .then(function (res) {
          expect(res).toBe('tlvince')
        })
        .catch(env.fail.bind())
        .finally(done)
    })
  })
})(this)
