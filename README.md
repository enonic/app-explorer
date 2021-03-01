# Explorer application
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting the source](#getting-the-source)
- [Development](#development)
  - [Production build](#production-build)
  - [Development watch](#development-watch)
    - [Node](#node)
      - [NVM (Node Version Manager)](#nvm-node-version-manager)
      - [AVN (Automatic Version Switching for Node)](#avn-automatic-version-switching-for-node)
    - [Webpack](#webpack)
      - [Webpack dependencies](#webpack-dependencies)
      - [Webpack development mode](#webpack-development-mode)
    - [Enonic XP development mode](#enonic-xp-development-mode)
    - [Watching (using Gradle or Node)](#watching-using-gradle-or-node)
    - [Browser sync](#browser-sync)
- [Admin tool](#admin-tool)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting the source

```sh
$ git clone git@github.com:enonic/app-explorer.git && cd app-explorer
```

or

```sh
$ git clone https://github.com/enonic/app-explorer.git && cd app-explorer
```

## Development

There are two main ways of developing:

### Production build

This will use java libraries listed under dependencies in build.gradle to build an application jar file. Depending upon you hardware this may take a minute.

```sh
$ enonic project gradle clean build deploy
```

If you are using SNAPSHOT versions of java libraries you can refresh dependencies like this:

```sh
$ enonic project gradle -- clean build deploy --refresh-dependencies
```

### Development watch

In order to save time one can watch for changes (in src and javascript dependencies) to rebuild as few files as possible. Depending upon you hardware this may take less than a second. In order to do this you will first have to install a production build of the application and do some changes to the development environment:


#### Node

In order to build you need to have the correct version of Node installed. You can see the selected version in the ```gradle.properties``` and ```.node-version``` files. A good way to install multiple versions of Node is to use NVM:

##### NVM (Node Version Manager)

You can install or update nvm like this:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

or wget
```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Ref: https://github.com/nvm-sh/nvm

Then you can install the version of Node you want like this:

```sh
$ nvm install 10.16.0
```

##### AVN (Automatic Version Switching for Node)

Different projects often use different versions of Node. Remembering to switch is pain, so I would suggest using AVN. It will read the ```.node-version``` file when you cd into a folder and automatically switch to the correct Node version.

You can install avn like this:

```sh
npm install -g avn avn-nvm avn-n
avn setup
```

Ref: https://github.com/wbyoung/avn

Then you can simply cd into a project folder an AVN will active the correct version

```sh
$ cd app-explorer
avn activated v10.16.0 (avn-nvm v10.16.0)
```

#### Webpack

##### Webpack dependencies

You will also have to get the source for these into the parent folder of app-explorer:

- https://github.com/enonic/lib-explorer
- https://github.com/enonic/lib-explorer-client
- https://github.com/enonic/lib-explorer-collector
- https://github.com/enonic/lib-util


##### Webpack development mode

Then you will have to change to development mode in ```webpack.config.babel.js```:

```javascript
const MODE = 'development';
//const MODE = 'production';
```

#### Enonic XP development mode

You will have to run Enonic XP in development mode:

```sh
$ enonic sandbox start sandbox-name -dev
```

#### Watching (using Gradle or Node)

```sh
$ enonic project gradle clean watch
```

#### Browser sync

There are two webpack configs beeing built. One for Enonic XP server-side controllers, and one for client-side Ecmascript modules.
When running watch in development mode browser-sync will proxy http://localhost:8080/ twice.
- http://localhost:3000/ for server-side updates
- http://localhost:3002/ for client-side updates

## Admin tool

On a development laptop the Explorer admin to is usually available here:
- http://localhost:8080/admin/tool/com.enonic.app.explorer/explorer

## Dependencies

This list is abridged.

```
app-explorer
  ├ gradle 5.6.4
  │   ├ lib-cron 1.1.1
  │   │   └ com.cronutils:cron-utils 8.1.1
  │   ├ lib-explorer 3.0.6
  │   │   ├ jar
  │   │   │   ├ lib-http-client 2.0.0
  │   │   │   └ lib-license 3.0.0
  │   │   └ npm
  │   │       └ highlight-search-result 1.0.4
  │   └ lib-galimatias 1.0.0-B1
  │       └ io.mola.galimatias:galimatias 0.2.0
  └ node 14.10.1
      ├ @enonic/semantic-ui-react-form 1.1.1
	  ├ @enonic/webpack-esm-assets 0.7.0
	  ├ @enonic/webpack-server-side-js 0.2.0
	  ├ @enonic/webpack-style-assets 0.10.0
	  ├ fast-deep-equal 3.1.3
	  ├ get-value 3.0.1
      ├ moment 2.27.0
      ├ pretty-ms 7.0.0
      ├ react 6.12
	  ├ react-dom 6.12
	  ├ semantic-ui-css 2.4.1
	  ├ semantic-ui-react 1.2.1
	  ├ serialize-javascript 5.0.1
	  ├ set-value 3.0.2
	  └ traverse 0.6.6
```

## Compatibility

| App version | XP version |
| ----------- | ---------- |
| 1.5.0-SNAPSHOT | 7.5.0 |
| 1.4.0 | 7.4.1 |
| 1.[23].0 | 7.3.2 |
| 1.1.0 | 7.3.1 |
| 1.0.0 | 7.3.0 |

## Changelog

### 1.5.0-SNAPSHOT

* Require Enonic XP 7.5.0
* lib-util-3.0.0
* Upgrade to lib-explorer-3.10.2
  * Add componentPath to register function
* webpapp/api/1/documents
* Scheduling should not be visible before one has selected collector
* Make it possible to select language per collection
* Build system upgrades
  * Node 14.16.0
  * Babel modules 7.13.8
  * Core-js 3.9.1
  * Webpack 5.24.2
  * All node modules up to date (except react)

### 1.4.0

* Make it possible to link a thesaurus to none, any or specific language(s)
* Upgrade to lib-explorer-3.8.0
  * getSynonyms will now filter on languages
  * thesaurus/query({thesauri}) make it possible to filter on thesaurus name(s)
* Upgrade to lib-explorer-3.7.0
  * Added languages field to thesaurus
  * getFields({fields}) make it possible to only get some fields
  * getFieldValues({field}) field can now be an array of fields
  * hasValue(field, values) now applies forceArray to its second parameter
* Upgrade to lib-explorer-3.6.0
  * Generate href for hit tags
  * Require Enonic XP 7.4.1

### 1.3.0

* Interface data in POST body rather than params.json
* Make sure fragmentSize and numberOfFragments are integers
* Make it possible to select highlight fragmenter, numberOfFragments, order, postTag and preTag
* Upgrade to lib-explorer-3.5.1
  * Log stacktraces when catching
* Upgrade to lib-explorer-3.5.0
  * Work around nashorn issue with trunc and toInt
  * Improve debugging with explain and logQueryResults parameters
  * Use highlight fragmenter, numberOfFragments, order, postTag and preTag when searching

### 1.2.0

* Upgrade to lib-explorer-3.1.0
* Use highlighter provided by Enonic API
* Require Enonic XP 7.3.2

### 1.1.0

* Require Enonic XP 7.3.1
* Upgrade to lib-explorer-3.0.7
* Upgrade to react 6.12
* Upgrade to semantic-ui-react 1.2.1
* Expose fields to Collector React Component
* BUGFIX Too strict GraphQL Schema lead to missing field values
* Webcrawler collector: Add https:// if no :// in url
* Make initialization a task and show progress in admin app rather than an error
* BUGFIX A collector application can't check the license of app-explorer

### 1.0.0

* Initial release
