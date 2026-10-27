# app-explorer

Enonic Explorer, the admin application: an XP admin tool with a React UI, an admin GraphQL service, the public search (GraphQL) and ingest (REST) APIs, the built-in web crawler collector, and the data migrations. All domain logic lives in the sibling library `../lib-explorer` (read its `AGENTS.md` first); this repo imports it at runtime as `/lib/explorer/*` from the jar that Gradle `include`s.

`gradle.properties`: `appName=com.enonic.app.explorer`, `version=5.0.0-SNAPSHOT`, `xpVersion=8.1.1`, `nodeVersion=24.18.0`. `gradle/libs.versions.toml` pins `lib-explorer = "5.0.0-SNAPSHOT"` (resolved from `mavenLocal()` during development; publish lib-explorer with `./gradlew clean build pTML` there first) plus lib-cache 3.0.0, lib-graphql 3.0.0, lib-http-client 4.0.1, lib-license 4.0.0, lib-router 4.0.0, lib-static 3.0.0. The 5.x line targets XP 8; `4.x` is the XP 7 release branch.

User documentation is `../doc-explorer/docs` (AsciiDoc, published by `enonic/release-tools/generate-docs`): admin UI, collections, collectors, document types, documents, interfaces, API keys, GraphQL API, Ingest API, Collector API, upgrading.

## Repository layout

```
src/main/resources/          server side (186 .ts files, built by tsdown.config.mts)
  main.ts                    startup: submits the `init` task on the cluster master
  enonic.yaml                XP 8 application descriptor
  app.pub                    RSA public key (not referenced by any source; presumably read by lib-license)
  collectors.json            declares the bundled "Web crawler" collector
  documentTypes.json         managed document type `webpage` (version 2)
  constants.ts               manifest paths for the webapp static getter
  admin/tools/explorer/      the admin tool (descriptor, router, HTML shell)
  services/*                 18 HTTP services (see Services)
  tasks/*                    init, migrate (+ model/9..19), concisePermissions, import_csv_to_thesaurus,
                             migrate_thesaurus_synonyms_v1_to_v2, reindexCollection
  webapp/                    public APIs: /api/graphql and /api/v2/documents (see Public APIs)
  lib/                       licensing.ts, locales.ts, setTimeout.ts, nashorn/ (polyfills), app/explorer/ (resource helpers),
                             fnv.ts and esbuild/ (unused, see Legacy)
  static/react/              two React pages bundled by tsdown/static.mts (GraphiQL page, Documents API docs)
  types/                     ApiKey.d.ts, index.d.ts
src/main/java/               AppHelper, etag/{EtagService,Hasher,ProcessorFactory}, com/enonic/explorer/{FNV,Locales}
src/explorer/                the React admin UI (212 .ts/.tsx), entry App.tsx, bundled by src/explorer/tsdown.config.mts
src/webcrawler/task/         the web crawler task (webcrawl.ts + robots/, uri/, exceptions/, publicDir/webcrawl.yaml)
src/webcrawler/form/         the crawler's collector form (React, built as UMD by vite.config.ts)
src/task-test-admin-graphql/ an XP 7 style task that exercises the admin GraphQL schema; not built or run by anything
src/test/                    JUnit + JS test of the deleteCollection mutation on Nashorn and GraalJS
test/                        jest setup, XP library mocks (test/mocks/libXp*.ts, libHttpClient, libGalimatias), HTML fixtures
symlinks/lib-explorer -> ../../lib-explorer   gives tsc and jest access to lib-explorer sources and types
tsdown.config.mts, tsdown/*.mts, src/explorer/tsdown.config.mts, src/webcrawler/task/tsdown.config.mts, src/webcrawler/form/vite.config.ts
jest.config.mjs, eslint.config.mjs, tsconfig*.json, build.gradle
```

## Build

`npm run build` runs five independent bundles in parallel through `concurrently` (`npm:build:*`), all writing into `build/resources/main`, which is why every config sets `clean: false`:

| Script | Config | Output |
|---|---|---|
| `build:tsdown` | `tsdown.config.mts` | every `src/main/resources/**/*.ts` (minus assets, `*.d.ts`, tests) as CommonJS ES5, same tree under `build/resources/main`, shared code in `_chunks/` |
| `build:webcrawlertask` | `src/webcrawler/task/tsdown.config.mts` | `tasks/webcrawl/webcrawl.js` (single self-contained file) plus `webcrawl.yaml` copied from `publicDir/` |
| `build:explorer` | `src/explorer/tsdown.config.mts` | `services/explorerAssets/files/`: `Explorer-<hash>.mjs`, `styles-<hash>.css` (compiled from `style/main.sass`), `favicon-<hash>.ico`, `manifest.json`, plus hashed copies of node_modules files and `node_modules_manifest.json` |
| `build:static` | `tsdown/static.mts` | `static/react/*-<hash>.mjs` (one self-contained ESM bundle per file under `src/main/resources/static`), `manifest.esm.json`, hashed node_modules copies and `node_modules-manifest.json` |
| `build:webcrawlerform` | `src/webcrawler/form/vite.config.ts` | `assets/react/WebCrawler.umd.js` (vite 6 library build, UMD, global `WebCrawler`) |

`postbuild:explorer` and `postbuild:static` run `precompress` (br/gz/zst variants). Gradle `processResources` excludes every `.ts/.tsx/.js/.css/.sass` source, so only bundler output ships.

Server bundles (`tsdown.config.mts`, webcrawl config) follow the same recipe as lib-explorer: `platform: 'neutral'` forced through `inputOptions`, `mainFields ['main','module']`, cjs with `cjsDefault: false`, `esModule: true`, `fixedExtension: false`, `generatedCode.symbols: false`, an `intro` of `const globalThis = (1, eval)('this');`, and an `@swc/core` `renderChunk` plugin lowering to ES5 for Nashorn. `deps.neverBundle` lists the XP libraries shipped by `build.gradle`; `deps.alwaysBundle` bundles the `dependencies` entries that server code needs (`@enonic/js-utils`, `cheerio`, `core-js`, `fast-deep-equal`, `human-object-diff`, `object.getownpropertydescriptors`, `robots-txt-guard`, `uri-js`, `gql-query-builder`). The root config also injects `core-js/stable/array/includes` into every entry (Nashorn lacks `Array.prototype.includes`). Both alias `util` to `@jspm/core/nodelibs/browser/util.js` (`@jspm/core` pinned to `2.0.1`; see lib-explorer's AGENTS.md for why). The crawler imports `cheerio/slim` (htmlparser2 parser), and the webcrawl config aliases it to `node_modules/cheerio/dist/browser/slim.js`: cheerio 1.x's default entry imports `undici` and Node streams for `fromURL`, which cannot be bundled for Nashorn, and the parse5-based build (`dist/browser/index.js`) bundles but silently yields no links and empty text on Nashorn; the slim build extracts both correctly. `tsconfig.tsdown.json` supplies the `paths` that turn `@enonic/nashorn-polyfills` into `src/main/resources/lib/nashorn/index.ts` and `/lib/licensing` into `src/main/resources/lib/licensing.ts`; both are therefore bundled, not external.

Browser bundles (`tsdown/static.mts`, `src/explorer/tsdown.config.mts`) use the plugins in `tsdown/plugins.mts`:

- `globals({react: 'React', 'react-dom': 'ReactDOM'})` replaces `react` and `react-dom` with virtual modules that re-export `globalThis.React` / `globalThis.ReactDOM`. The pages load React 18 UMD files first (`react/umd/react.development.js`, `react-dom/umd/react-dom.development.js`, hashed through the node_modules manifest). This is a hard architectural constraint: collector forms from other applications are UMD bundles that expect the same `window.React`, so React must stay a page global, and every bundle must use the global rather than its own copy. React 19 ships no UMD builds and semantic-ui-react 2.1.5 relies on `defaultProps` on function components (removed in React 19), so React 19 is blocked until the UI leaves semantic-ui-react.
- `manifest()` writes `manifest.json` / `manifest.esm.json` mapping stable names (`Explorer.mjs`, `styles.css`, `react/GraphiQLApp.mjs`) to hashed file names. Server code reads these with `jsonParseResource` at request time (`htmlResponse.ts`, `webapp/getImmuteableUrl.ts`, `services/graphQL/graphQL.ts`, `webapp/documents/documentation.ts`).
- `copyWithHash()` copies node_modules files (React UMD, semantic-ui-css, semantic-ui-react dist, graphiql CSS, nice-react-gantt CSS, datepicker CSS) with content hashes and writes the node_modules manifest.
- `emitAssets()` compiles `style/main.sass` with `sass` and emits it and `favicon.ico` as hashed assets.
- `define: { global: 'globalThis' }` is required: `traverse` 0.6.11 pulls in es-abstract packages that read the Node-only `global` at load time.

Minification and sourcemaps are on unless `NODE_ENV=development` (Gradle passes `-Pdev` as `NODE_ENV=development`). The static build runs one rolldown build per entry so each `.mjs` is self-contained; rolldown's `codeSplitting: false` rejects multiple entries. Configs are `.mts` because the package is `"type": "commonjs"`; tsdown resolves `outDir` and `entry` relative to the config file, hence the absolute paths. The Explorer bundle uses `inlineDynamicImports: true` because the page has no import map for chunks.

The webcrawler form stays on vite 6 deliberately: `.github/dependabot.yml` blocks major bumps of `vite` and `@vitejs/plugin-react` because vite 8 (rolldown) leaves bare `require('react')` calls in the UMD build (#1053). The `globals` plugin in `tsdown/plugins.mts` is the known fix if that build is moved to tsdown.

### Gradle and verification

`./gradlew build` = `npmInstall` (with `--legacy-peer-deps`, needed for the React 18 peer ranges) → `npmBuild` → `jar` → `compileTestJava` → `test` (Nashorn) and `testGraalJS`. `./gradlew deploy` copies the jar to `$XP_HOME/deploy`. Note what Gradle does not run: `npmCheck` (`verify:types`) and `npmTest` are defined but commented out of `check`/`test` ("Too many errors" and "lib-explorer not available on GitHub"). So:

| Command | What it proves |
|---|---|
| `npm run verify:types` | `tsc --noEmit` for the client (`tsconfig.assets.json`) and server (`tsconfig.xp.nashorn.json`). Clean since October 2026; keep it clean. Not wired into Gradle because the release CI does not check lib-explorer out into `symlinks/`, which the server config needs. |
| `npm test` | jest with `@swc/jest` (TypeScript 7 has no JS API, so ts-jest is out). 12 suites / 44 tests. |
| `npm run eslint` | not part of CI or Gradle |
| `./gradlew clean build` | the bundles, the jar, the Java script-engine test |
| manual | deploy, open the admin tool, run the web crawler on a collection, open `/api` (GraphiQL) and the documents API docs page |

The jest `testMatch` covers `src/main/resources/**`, `src/webcrawler/**` and `test/**`; `src/explorer/document/getHighlightedHtml.test.ts` is still not matched. `jest.config.mjs` maps `/lib/explorer/(.*)` and the `@enonic-types/lib-explorer` alias to `symlinks/lib-explorer`, and `@enonic/js-utils/(.*)` to that package's `dist/cjs` build. `test/setupFile.ts` mocks `Java.type` for `java.util.Locale` and `java.lang.System`. CI (`.github/workflows/coverage.yml`) checks lib-explorer out into `symlinks/lib-explorer` and runs `npm run cov` with `continue-on-error`, so a red test suite does not fail CI. `enonic-gradle.yml` builds and releases via `enonic/release-tools` on pushes to `master` and `4.x`.

`src/test/java/.../AddMutationCollectionDeleteTest.java` runs `src/test/resources/graphql/addMutationCollectionDelete.test.js` against the built `services/graphQL` bundle on both engines, with JS mocks under `src/test/resources/lib`. This is the only automated check that exercises the bundled output on Nashorn, so keep it green.

TypeScript is 7.x (native). There is no `tsserver`; editors use their own TypeScript. `tsconfig.xp.nashorn.json` (server: `lib: ["ES5", "ES2015.Core", "ES2016.Array.Include", "ES2019.Array", "ES2022.Error"]`, `moduleResolution: bundler`, `strict: false`, tests excluded; `@types/node` is excluded, so `src/main/resources/types/module.d.ts` declares the `module` global that `module.exports` assignments need, and the ES20xx lib entries cover the `startsWith`/`includes`/`flat`/`setPrototypeOf` usages that were previously typed only through a node-types leak from cheerio) and `tsconfig.assets.json` (client: `jsx: react-jsx`, `strict: false` to keep the pre-TypeScript-7 defaults) are typecheck-only; the bundlers use `tsconfig.tsdown.json` (server) and `tsconfig.assets.json` (Explorer) for `paths` and JSX. Both typecheck configs map `@enonic-types/*`, `@enonic/js-utils` and `@enonic/js-utils/types` to this repo's node_modules so that lib-explorer sources reached through `symlinks/` share one copy of the XP types (otherwise the `RepoConnection.modify` augmentation does not apply). The server config type-checks lib-explorer's sources under its own options, so a change in lib-explorer can break `verify:types` here; `noUnusedParameters` and `noPropertyAccessFromIndexSignature` are off for that reason. `services/graphQL/Glue.ts` keeps its own loose GraphQL field/arg types (`GraphQLField`, `GraphQLFields`, `GraphQLArgs`), because `/lib/graphql` ships no typings. Client code must not import server runtime modules; shared types go in a `.d.ts` (see `services/journals/types.d.ts`), or the client typecheck hits `rootDir` errors through the lib-explorer paths.

## Runtime

### Startup and migrations

`main.ts` logs the version and, on the cluster master, submits the `init` task. `tasks/init/init.ts` runs as su: creates the roles, users and repositories from `/lib/explorer/model/2` (`ROLES`, `USERS`, `REPOSITORIES`), then either submits `migrate` if the stored model is below 19 (`isModelLessThan`), or installs managed document types and registers the application listener. `tasks/migrate/migrate.ts` runs `model/9.ts` … `model/19.ts` in order, each guarded by `isModelLessThan` and ending with `setModel`; `model/19.ts` also runs `concisePermissions`. On completion both paths call `applicationListener()` (which runs `createFromDocumentTypesJson` for every started app and listens for `application` STARTED events to do the same for newly started apps) and send the event `com.enonic.app.explorer.init.complete`. While `init` is running, the admin tool serves a self-refreshing progress page instead of the app.

### Admin tool

`admin/tools/explorer/explorer.yaml` (`kind: AdminTool`, roles `com.enonic.app.explorer.admin` and `system.admin`, `apis: ["admin:extension", "admin:events"]`; the XP menu loader needs `admin:events` mounted or it logs an error on every page). `explorer.ts` routes everything to `htmlResponse`, except `POST /api/v1/interface`, which serves the public interface schema for the in-tool GraphiQL using the `explorer-interface-name` header. `htmlResponse.ts` renders the shell: React UMD globals, CSS from both manifests, the XP menu via `extensionUrl(... 'menu-loader')`, and a module script that imports `{App}` from the hashed `Explorer.mjs` and renders it. It sets the response header `explorer-tool-url` (must be computed per request because of vhosts, #873); `App.tsx` re-fetches its own URL to read that header, uses it as the router basename and derives `servicesBaseUrl = <toolUrl>/_/service/com.enonic.app.explorer`.

### React admin UI (`src/explorer`)

Routes in `components/Explorer.tsx`: `/`, `/collections`, `/collections/create`, `/collections/status`, `/collections/journal`, `/collections/notifications`, `/collections/schedule`, `/documents`, `/documentTypes`, `/stopWords`, `/synonyms`, `/interfaces`, `/interfaces/create`, `/api` (GraphiQL), `/api/keys`, `/about`, `/user`. Data access is almost entirely the admin GraphQL service, through `graphql-hooks` (`GraphQLContextProvider.tsx`) and direct `fetch` calls to `${servicesBaseUrl}/graphQL`; the queries and mutations are assembled with `gql-query-builder-ts` in `queries/`, `mutations/` and `fetchers/`. REST services the UI calls: `collectionCollect`, `collectorStop`, `interfaceCopy`, `interfaceExists`, `journals`, `notifications`, `thesaurusExport`, `uploadLicense`. `interfaces/search/Search.tsx` fetches a service named `interfaceList` that does not exist (pre-existing bug). `cron-parser` is 5.x: use `CronExpressionParser.parse(expr, {currentDate, endDate})`, `.fields.<unit>.values` and `.next().toDate()`; the 4.x `parseExpression`/`iterator` API is gone. `cheerio` is 1.x: no default export (`import { load } from 'cheerio'`), wrap elements with a `load('')` instance instead of calling `cheerio(el)`, and htmlparser2 options such as `lowerCaseTags` no longer exist on `CheerioOptions`.

Collector forms: `useCollectionsState.ts` builds an import map entry per collector (`collectorAssets/<appName>/<formAssetPath>`), loads it with `dynamic-importmap`'s `importWithMap`, then reads the component from `window` at `componentPath` (lib-explorer defaults it to `window.<formLibraryName>.CollectorForm`). The form contract (props `collectorConfig`, `setCollectorConfig`, `setCollectorConfigErrorCount`, `explorer`; imperative handle `afterReset`, `validate`) is typed in lib-explorer `types/Collector.d.ts` and documented in `doc-explorer/docs/upgrade-collector.adoc`. The bundled web crawler form is such a plugin too: `src/webcrawler/form/WebCrawler.tsx` exports `CollectorForm` and is served from `assets/react/WebCrawler.umd.js` through `collectorAssets`.

UI libraries: semantic-ui-react 2.1.5 everywhere, `@enonic/semantic-ui-react-form` for a few forms, react-router-dom 7, react-dnd for draggable table columns, nice-react-gantt + cron-parser for the schedule view, react-json-view, react-html-parser for highlighted hits, graphiql 2 with `@graphiql/plugin-explorer` for the `/api` page. The WebSocket client code in `useExplorerState.ts` is commented out; the `ws` and `longPolling` services are unused by the UI.

License: `lib/licensing.ts` wraps `/lib/license` with `appKey: 'enonic.platform.subscription'` (`isLicenseValid`, `getIssuedTo`, `installLicense`); the `getLicense` query and `uploadLicense` service use it. The UI gates creating more than three collections and thesaurus editing on `licenseValid`. `uninstallLicense` calls `/lib/license` with `appKey: app.name`, a different key.

### Admin GraphQL (`services/graphQL`)

`graphQL.ts` builds the schema with lib-graphql via `Glue` (`services/graphQL/Glue.ts`), caches it for an hour with `/lib/cache`, and handles GET (renders the standalone GraphiQL page from `static/react/GraphiQLApp.mjs`) and POST (`execute`). It also serves `/static/{path}` for that page. One file per field under `services/graphQL/<area>/add{Query,Mutation}*.ts` or `generate*Field.ts`. Queries: `getApp`, `listApps`, `listSchemas`, `listProjects`, `listRepos`, `getContentTypes`, `getSites`, `queryContents`, `queryCollections`, `queryCollectors`, `getManagedDocumentTypes`, `queryDocuments`, `getDocumentType`, `queryDocumentTypes`, `getField`, `queryFields`, `hasField`, `getInterface`, `queryInterfaces`, `getExplorerRepoNodes`, `getUser`, `getMembers`, `getMemberships`, `getProfile`, `getThesaurus`, `queryThesauri`, `getSynonym`, `querySynonyms`, `getTask`, `queryTasks`, `listScheduledJobs`, `queryJournals`, `queryStopWords`, `queryApiKeys`, `getLicense`, `getLocales`, `referencedBy`. Mutations: create/update/delete for `ApiKey`, `Collection` (+ `copyCollection`, `reindexCollections`), `DocumentType`, `Field`, `Interface`, `StopWords`, `Thesaurus` (+ `importThesaurus`, `migrateThesaurusSynonyms_v1_to_v2`), `Synonym`, and `modifyProfile`. This schema is admin-only and distinct from the public interface schema that lib-explorer generates.

### Public APIs (`webapp/`)

Router in `webapp.ts` (`/lib/router`), mounted at `/webapp/com.enonic.app.explorer`:

- `POST /api/graphql`: the public search API; `webapp/interface/post.ts` executes lib-explorer's `getCachedSchema()` with context `{allowedInterfaces, interfaceName, log* flags}`. Authentication: `Authorization: Explorer-Api-Key <key>`; the key is hashed (`/lib/explorer/string/hash`) and looked up among API key nodes, whose `interfaces` list becomes `allowedInterfaces`. Debug headers `explorer-log-*: 1` enable query logging.
- `/api/v2/documents/{collection}` (GET `getMany`, POST `createOrUpdateMany`, DELETE `deleteMany`), `/api/v2/documents/{collection}/query` (POST), `/api/v2/documents/{collection}/{documentId}` (GET `getOne`, POST `patch`, DELETE `deleteOne`): the Ingest API. `documents/authorize.ts` accepts system admin / explorer admin / explorer write roles directly, otherwise requires an API key whose `collections` include the target collection; work then runs under `runWithExplorerRead`/`runWithExplorerWrite`. `documents/put.ts` exists but has no route.
- `GET /api/v2/documents/`: the interactive documentation page (`documents/documentation.ts`), rendering `static/react/DocumentsApiDoc.mjs` with React UMD globals and semantic-ui CSS; it injects the caller's API key as `window.__EXPLORER_API_KEY__`.
- `/api/v2/documents/static/{path}`: serves the hashed static files via `/lib/enonic/static` (`etagGetter` for manifest hits, `immutableGetter` otherwise).
- `GET /`: an HTML index for users with an Explorer role.

Ten of the twelve jest suites cover `webapp/documents/*`; they are the best-specified part of the server.

### Services

All under `src/main/resources/services/<name>/<name>.{ts,yaml}` (`kind: Service`). Admin-role only: `attachment` (streams a content attachment), `collectorAssets` (serves `<app>:/assets/<path>` with ETag support through the Java `EtagService`/`AppHelper` beans; this is how collector forms from any app reach the browser), `explorerAssets` (serves the Explorer bundle directory through `/lib/enonic/static`, resolving unhashed names via the node_modules manifest), `icon`. Others: `collectionCollect` (submits the collector task `<app>:<taskName>` with `{collectionId, collectorId, configJson, language}`; refuses if already running), `collectorStop` (sets `should: 'STOP'` on the collection repo root), `collectionDuplicate`, `graphQL`, `interfaceCopy`, `interfaceExists`, `journals`, `listCollectors` (unused), `longPolling` (unused, 30 s sleep), `notifications` (GET/POST the `/notifications` emails node), `thesaurusExport` (CSV), `uploadLicense`, `uninstallLicense`, `ws` (WebSocket answering `ping`; the real event wiring is commented out).

### Web crawler collector (`src/webcrawler`)

`task/webcrawl.ts` is the reference implementation of a collector: `new Collector<WebCrawlConfig>({collectionId, collectorId, configJson, language})`, `start()`, a breadth-first crawl from `baseUri` honouring `robots.txt` (`robots-txt-guard`), `X-Robots-Tag`, `meta[name=robots]`, `excludes` regexps, `userAgent`, `httpRequestHeaders`, `maxPages` (default 1000), `keepHtml` and `resume`; pages are fetched with `/lib/http-client` (or through Browserless when `app.config.browserlessUrl` is set), parsed with `cheerio`, persisted with `persistDocument(..., {documentTypeName: 'webpage'})`, and documents not seen in the run are deleted at the end. Journal entries go through `addSuccess/addWarning/addError/addInformation`, and `shouldStop()` is polled for the stop button. `task/publicDir/webcrawl.yaml` is the task descriptor copied next to the bundle. Its tests (`task/*.test.ts`, `robots/`, `uri/`) run on `@enonic/mock-xp` with `test/mocks/libHttpClient.ts` and the HTML fixtures, but see the jest coverage gap above.

### Java

`com.enonic.app.explorer.AppHelper` and `etag.*` back the `collectorAssets` service. `com.enonic.explorer.Locales` backs `lib/locales.ts` (`getLocales` query). `com.enonic.explorer.FNV` backs `lib/fnv.ts`, which nothing imports; API key hashing uses lib-explorer's `string/hash` (`@enonic/fnv-plus`) instead.

## Dependencies

Where each declared package is actually used. "Server" means bundled into server JS, "client" into the browser bundles, "webcrawl" into the task bundle.

Runtime, bundled: `@enonic/js-utils` (server, client, webcrawl, everywhere), `@enonic/explorer-utils` (server, client, webcrawl; a devDependency that is runtime code), `core-js` (server `webapp/interface/post.ts`, `lib/nashorn/global.ts`, webcrawl, and injected by the root config), `fast-deep-equal` (server migrations, client), `cheerio` 1.2 + `domhandler` + `domelementtype` + `uri-js` + `robots-txt-guard` + `object.getownpropertydescriptors` (webcrawl; `domhandler` supplies the `AnyNode` type that cheerio 1.x no longer re-exports, also used in `migrate/model/17.ts`). `gql-query-builder` is listed in `alwaysBundle` but the code imports `gql-query-builder-ts`.

Client only: `react`, `react-dom` (as page globals), `semantic-ui-react`, `semantic-ui-css` (copied CSS), `@semantic-ui-react/component-ref`, `@enonic/semantic-ui-react-form`, `react-router-dom`, `graphql-hooks`, `gql-query-builder-ts`, `graphql` (never imported directly; a peer dependency of graphiql, `@graphiql/plugin-explorer` and graphql-hooks), `graphiql`, `@graphiql/plugin-explorer`, `@graphiql/toolkit` (transitive, undeclared), `@monaco-editor/react`, `tiny-jsonc`, `react-json-view`, `react-html-parser`, `react-dnd`, `react-dnd-html5-backend`, `react-semantic-ui-datepickers`, `react-semantic-ui-range`, `nice-react-gantt`, `cron-parser`, `moment`, `lodash`, `ms`, `object-hash`, `jsuri`, `classnames`, `clsx` (transitive, undeclared), `use-debounce`, `dynamic-importmap`, `traverse` (client `useDocumentsState.ts` and a comment).

Types: `@enonic-types/core`, `@enonic-types/global`, `@enonic-types/lib-{auth,common,content,context,event,io,mail,node,repo,scheduler,task,value}` (source or `test/mocks`), `@types/{fnv-plus,jsuri,lodash,node,object.getownpropertydescriptors,react,react-html-parser,traverse}` (picked up implicitly or via tsconfig `types`). `@enonic-types/lib-{admin,app,portal,project,schema,static,vhost}` have no direct references; `/lib/xp/*` and `/lib/enonic/static` imports resolve through the `paths` entries of `tsconfig.xp.nashorn.json`, so a missing one only shows up in `verify:types`.

Build and test tooling referenced: `tsdown`, `@swc/core`, `glob`, `sass`, `@jspm/core`, `concurrently`, `del-cli`, `precompress`, `vite`, `rollup-plugin-external-globals`, `jest`, `@swc/jest`, `@jest/globals`, `@enonic/mock-xp`, `fnv-plus` (tests), `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `globals`.

Every declared package is now referenced. The October 2026 clean-up removed `@swc/cli`, `buffer`, `esbuild`, `esbuild-loader`, `sass-loader`, `graphql-ws`, `q-i`, `vite-plugin-static-copy`, `is-generator-function`, `rollup-plugin-visualizer`, `@vitejs/plugin-react`, `@enonic-types/lib-asset`, `@types/jquery`, `deep-object-diff`, `human-object-diff`, `regenerator-runtime`, `@seamusleahy/values-changes-hooks` (replaced by the local `utils/useUpdateEffect.ts`) and `@seamusleahy/init-hooks` (its `useWhenInit`/`useWhenInitAsync` calls became `useEffect(..., [])`), together with the dead `src/explorer/index.tsx` and `assets/js/tablesort.ts`. `tsconfig.esbuild.json` and `.sass-lint.yml` are still orphaned files.

`package.json` `resolutions` (`string-width`, `wrap-ansi`) are a yarn field; npm ignores them. `optionalDependencies["@rollup/rollup-linux-x64-gnu"]` is a CI workaround for rollup's platform binaries.

When removing or upgrading packages, the safe loop is: `npm run build` → check `build/resources/main` for leaked `require("<package>")`, bare `process`/`global`/`navigator` identifiers in server output, and `import ... from "react"` in browser output → `npm test` → `./gradlew clean build` → deploy and click through the admin tool, a crawl, `/api` and the documents docs page. Several real failures (`/lib/guillotine` leftover, `traverse` pulling in `util` and `global`, `@jspm/core` 2.1.0) passed every automated gate and only surfaced at runtime.

## Legacy and known debt

- Jest never runs the `src/explorer` test (`testMatch`), and Gradle never runs jest or `verify:types`.
- `src/task-test-admin-graphql/` uses an XP 7 `test.xml` descriptor and is not built.
- `lib/fnv.ts` + `FNV.java`, `lib/esbuild/getOwnPropertyDescriptors.js`, `services/listCollectors`, `services/longPolling`, the WebSocket code and `services/ws` are unused.
- `tsconfig.esbuild.json` and `.sass-lint.yml` are orphaned configs.
- `services/explorerAssets` and `collectorAssets` keep a `module.exports = controller` next to `export default` for XP 7 Nashorn; the comment says XP 7, which 5.x no longer targets.
- jest `globals.app.version` is `4.4.4`; `src/explorer/constants.ts` lists third-party licenses for the About page and must be edited when UI dependencies change.
- Stale `/lib/vanilla`, `/lib/thymeleaf`, `/lib/galimatias`, `/lib/text-encoding`, `/lib/enonic/asset` entries remain in the externals list even though `build.gradle` does not ship them.
- React 19 and GraphiQL 5 are known blocked upgrades: React by semantic-ui-react and the UMD/global pattern; GraphiQL 5 by its Monaco worker requirement (three worker bundles plus `MonacoEnvironment.getWorker` wiring in `htmlResponse.ts` and `documentation.ts`) and API changes (`initialQuery`, `explorerPlugin()`, `graphiql/style.css`).
