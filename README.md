WebGLStage
==========

A simple stage for viewing 3d models in WebGL


Demo
----
#[WebGLStage](http://robincwillis.github.io/WebGLStage/)

How To Use
----

open js/stage.js
and go to line 6
```javascript
model   	:   "models/Clip.3dm.json",
```
replace the path with the model that you want to load

Notes
----
Accepts any format three.js accepts, .json, .json.bin, .obj, .dae, .stl etc.
Uses an ajax request to load the models, so if you are running this locally you will need to open it from a web server or your likely to have a security issue
