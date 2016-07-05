# Welcome to the Breeze-Angular2 bridge #

A bridge that configures Breeze to work with Angular 2 out of the box.

# Prerequisites #

- Breeze client npm package 1.5.8 or higher
- Angular 2.0.0 RC4 or higher

# Installation #

1. Install breeze-client

	`npm install breeze-client --save`

2. Install breeze-bridge-angular2

	`npm install breeze-bridge-angular2 --save`

# Usage #

A complete example demonstrating the use of the bridge can be found here: [https://github.com/Breeze/breeze.js.samples/tree/master/no-server/angular2-breeze](https://github.com/Breeze/breeze.js.samples/tree/master/no-server/angular2-breeze "Breeze-Angular2 example")

Running the example:

	npm install
	npm start

To use the bridge in your own application, the following steps are required.

Configure breeze-client and breeze-bridge-angular2 in `systemjs.config.js`.

```
  // map tells the System loader where to look for things
  var map = {
    ...
    'breeze-client':              'node_modules/breeze-client',
    'breeze-bridge-angular2':     'node_modules/breeze-bridge-angular2'
  };

  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    ...
    'breeze-client':              { main: 'breeze.debug.js', defaultExtension: 'js'},
    'breeze-bridge-angular2':     { main: 'index.js', defaultExtension: 'js'}
  };
```

Import `HTTP_PROVIDERS` and `BreezeBridgeAngular2` and add them to the app component's providers list.

```
import { HTTP_PROVIDERS } from '@angular/http';
import { BreezeBridgeAngular2 } from 'breeze-bridge-angular2';
```

```
@Component({
  providers: [
    BreezeBridgeAngular2,
    HTTP_PROVIDERS,
  ]
})
export class AppComponent { }
```

One-time inject `BreezeBridgeAngular2` and start using Breeze. The act of injecting the bridge causes the system to self-configure. The only requirement is that the bridge needs to be injected once before the first call to Breeze.

```
import { Customer } from './entities';
import { BreezeBridgeAngular2 } from 'breeze-bridge-angular2';
import { EntityManager, EntityQuery } from 'breeze-client';

@Component({...
})
export class AppComponent {
  private _em: EntityManager;
  customers: Customer[];

  constructor(bridge: BreezeBridgeAngular2) {

    this._em = new EntityManager();

    let query = EntityQuery.from("Customers").orderBy('companyName');
    this._em.executeQuery(query).then(result => {
        this.customers = <Customer[]>result.results;
    });
  }
}
```

Notice that we are also importing `breeze-client` instead of loading it as a static script as you might have seen in other examples. Make sure you don't have an extra script tag in your `index.html` that attempts to statically load `breeze.debug.js` or similar.

Example `index.html`:
```
<html>
  <head>
    <title>Angular 2 QuickStart</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="styles.css">

    <!-- Polyfill(s) for older browsers -->
    <script src="node_modules/core-js/client/shim.min.js"></script>

    <script src="node_modules/zone.js/dist/zone.js"></script>
    <script src="node_modules/reflect-metadata/Reflect.js"></script>
    <script src="node_modules/systemjs/dist/system.src.js"></script>

    <script src="systemjs.config.js"></script>
    <script>
      System.import('app').catch(function(err){ console.error(err); });
    </script>
  </head>

  <body>
    <my-app>Loading...</my-app>
  </body>
</html>
```