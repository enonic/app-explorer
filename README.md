# Explorer

## Getting the source

```sh
$ git clone git@github.com:enonic/app-explorer.git && cd app-explorer
```

or

```sh
$ git clone https://github.com/enonic/app-explorer.git && cd app-explorer
```

## Development

In order to build you need to have the correct version of Node installed. You can see the selected version in the ```gradle.properties``` and ```.node-version``` files. A good way to install multiple versions of Node is to use NVM:

### NVM (Node Version Manager)

You can install or update nvm like this:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

or wget
```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Ref: https://github.com/nvm-sh/nvm

### AVN (Automatic Version Switching for Node)

Different projects often use different versions of Node. Remembering to switch is pain, so I would suggest using AVN. It will read the .node-version file when you cd into a folder and automatically switch to the correct Node version.

You can install avn like this:

```sh
npm install -g avn avn-nvm avn-n
avn setup
```

Ref: https://github.com/wbyoung/avn

### Buildling

```sh
$ ./gradlew clean build deploy
```


### Dependencies (included in build.gradle)
- https://github.com/enonic/lib-explorer
- https://github.com/enonic/lib-explorer-client
- https://github.com/enonic/lib-explorer-collector

## Admin tool

On a development laptop the Explorer admin to is usually available here:
- http://localhost:8080/admin/tool/com.enonic.app.explorer/explorer
