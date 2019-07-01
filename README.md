# Explorer

## Getting the source

```sh
$ git clone git@github.com:enonic/app-explorer.git && cd app-explorer
```

or

```sh
$ git clone https://github.com/enonic/app-explorer.git && cd app-explorer
```

## Buildling

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
