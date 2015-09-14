# angular-eha.login-service

[![Build Status][travis-image]][travis-url]

> Login service to handle CouchDB auth and auth renewal

Provides an convenience API for handling authentication with CouchDB in
AngularJS applications.

[travis-image]: https://img.shields.io/travis/eHealthAfrica/angular-eha.login-service.svg
[travis-url]: https://travis-ci.org/eHealthAfrica/angular-eha.login-service

## Installation

Install with npm:

    npm install --save angular-eha.login-service

Or alternatively, Bower:

    bower install --save angular-eha.login-service

## Usage

Pass in a CouchDB database endpoint to authenticate against via
`ehaLoginServiceProvider.config`:

```js
angular.config(function(ehaLoginServiceProvider) {
  ehaLoginServiceProvider.config('https://couchdb.example.com/mydb')
})
```

## API

### `ehaLoginService.config`

Takes a function that **must** return a promise that **must** resolve with an
array containing a username and password (in that order).

This is used to prompt user for their credentials (via [maybeShowLoginUi][]).
It defaults to `window.prompt`, but see [angular-eha.login-dialog][] as an
example Bootstrap-based implementation.

[maybeShowLoginUi]: #ehaLoginServicemaybeShowLoginUi

### `ehaLoginService.getUserName`

Returns the locally stored username, or `null`.

### `ehaLoginService.maybeShowLoginUi`

If the credentials have already been saved locally, return them. Otherwise,
prompt the user for them, save them locally and return them.

### `ehaLoginService.hasLocalCreds`

Returns `true` if both username and password have been saved locally.

### `ehaLoginService.login`

Takes a username and password, logs into CouchDB (via
[pouchdb-authentication][]) and stores the credentials locally.

[pouchdb-authentication]: https://github.com/nolanlawson/pouchdb-authentication

### `ehaLoginService.renew`

If the credentials have already been saved locally, renew the user's CouchDB
session (by calling [ehaLoginService.login][]).

[ehaLoginService.login]: #ehaLoginServicelogin

### `ehaLoginService.logout`

Deletes local credentials.

### `ehaLoginService.storeCredentials`

Takes a username and password and saves them locally.

## See also

* [angular-eha.retriable][]: wrapper logic to attempt to re-establish login
  session before running workflow
* [angular-eha.login-dialog][]: a login dialog box UI for angular-eha.login-service

[angular-eha.retriable]: https://github.com/eHealthAfrica/angular-eha.retriable
[angular-eha.login-dialog]: https://github.com/eHealthAfrica/angular-eha.login-dialog

## Contributors

* © 2015 Remy Sharp <remy@remysharp.com> (https://remysharp.com)
* © 2015 Tom Vincent <tom.vincent@ehealthnigeria.org> (https://tlvince.com)

## License

Released under the [Apache 2.0 License][license].

[license]: http://www.apache.org/licenses/LICENSE-2.0.html
