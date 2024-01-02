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
$ enonic project gradle clean build deploy --refresh-dependencies
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
- https://github.com/enonic/lib-util


##### Webpack development mode

Then you will have to change to development mode in ```.webpack.constants.js```:

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
