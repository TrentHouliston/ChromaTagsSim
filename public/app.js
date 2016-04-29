var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.0001, 10000);

var composer = new THREE.EffectComposer( renderer );
composer.addPass( new THREE.RenderPass( scene, camera ) );

// Effect that checks if our huse and ligtness are orthogonal
// Get the hue value for pixels around the current one
// Get the lightness value for pixels around the centre
// Make a gradient for each
// Quality is how close the dot product of the two vectors is to 1

HueNormalFinder = {

  uniforms: {
    "tDiffuse": { type: "t", value: null }
  },

  vertexShader: document.getElementById('vertex-shader').textContent,

  fragmentShader: document.getElementById('validity-shader').textContent

};

DirectionPointerShader = {

  vertexShader: document.getElementById('vertex-shader').textContent,

  fragmentShader: document.getElementById('direction-shader').textContent

};


var effect = new THREE.ShaderPass( HueNormalFinder );
effect.renderToScreen = true;
effect.uniforms['width'] = { type: 'i', value: canvas.width };
effect.uniforms['height'] = { type: 'i', value: canvas.width };
composer.addPass( effect );


// Skybox
var skyGeo = new THREE.SphereGeometry(1000, 25, 25);
var texture = THREE.ImageUtils.loadTexture( "skysphere3.jpg" );
var material = new THREE.MeshBasicMaterial({
  map: texture,
});
var sky = new THREE.Mesh(skyGeo, material);
sky.material.side = THREE.BackSide;
scene.add(sky);

// Axis
var axisHelper = new THREE.AxisHelper(3);
scene.add(axisHelper);

// Light
var light1 = new THREE.PointLight('#fff', 1, 0);
light1.position.set(0, 0, 5);
scene.add(light1);

// var lightHelper = new THREE.PointLightHelper(light1, 1);
// scene.add(lightHelper);

// Light
var light2 = new THREE.PointLight('#fff', 1, 0);
light2.position.set(0, 0, -5);
scene.add(light2);

// var lightHelper = new THREE.PointLightHelper(light2, 1);
// scene.add(lightHelper);


function vertexToColor(v) {
  // v.x and v.y go from -1 to 1
  // need to map to hue
  var angle = Math.atan2(v.y, v.x) / (Math.PI * 2);
  var distance = Math.sqrt(v.y * v.y + v.x * v.x);
  return new THREE.Color().setHSL(angle, Math.sqrt(distance), 1.0 - Math.sqrt(distance));
}

var geometry = new THREE.SphereGeometry(1, 100, 100);
var faces = ['a', 'b', 'c'];
for (var i = 0; i < geometry.faces.length; i++) {
  var face = geometry.faces[i];
  for (var j = 0; j < 3; j++) {
    var v = geometry.vertices[face[faces[j]]];
    face.vertexColors[j] = vertexToColor(v);
  }
}
var material = new THREE.MeshPhongMaterial({
  shininess: 0,
  shading: THREE.SmoothShading,
  vertexColors: THREE.VertexColors
});
var mesh = new THREE.Mesh(geometry, material);
mesh.wireframe = true;
mesh.scale.z = 0.01;

scene.add(mesh);

camera.position.z = 7;
camera.position.y = 3;
camera.position.x = -5;
camera.lookAt(scene.position);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var hue = 0;
var period = 2;
var clock = new THREE.Clock();

requestAnimationFrame(render);

function render(time) {
  requestAnimationFrame(render);
  var t = clock.getDelta();

  hue = hue + (t / period) % 1;

  light1.color.setHSL(hue, 0.5, 0.8);
  light2.color.setHSL(hue, 0.5, 0.8);

  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // lightHelper.update();
  controls.update();
  composer.render(scene, camera);
}
