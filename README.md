tern-defs
=========

Currently one node application that scrapes [Chai
TDD](http://chaijs.com/api/assert) and [Chai BDD](http://chaijs.com/api/bdd)
library websites for:

* Method names.
* Method signatures.
* Optional parameters.
* Parameter type information.
* Parameter descriptions.
* Method description.
* Method examples.
* Link to documentation.

The information can be used by the [Tern](http://ternjs.net) code analysis
engine when transformed into a file in the tern-def format. The output file is
placed in the `node_modules/tern/defs/` library and be included in a
`.tern-project` file like so:

```json
{
    "libs": [ "chai" ],
    "loadEagerly": [],
    "plugins": {}
}
```

Run it like this:

```sh
node chai/chai-def.js
```
