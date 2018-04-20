# But... There's nothing there ??!!
Hey there's nothing here because we're building all the stuff in the ``docs`` folder.
So if you wish to use the ``public`` folder just:

1. copy the all the files form the ``docs`` folder to the ``public`` folder
2. update  ``webpack.config.js file`` like this in order to allow the building of ``bundle.js`` into the public folder:

change 

```json
var outputFolder = "./docs";
```

to 

```json
var outputFolder = "./public";
```