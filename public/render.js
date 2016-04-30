var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
// var camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.0001, 10000);


var geometry = new THREE.PlaneGeometry(1, 1);
// geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0));
var material = new THREE.ShaderMaterial({
  uniforms: {
    width: { type: 'i', value: 2048 },
    height: { type: 'i', value: 2048 },
    image: { type: 't', value: new THREE.TextureLoader().load("data/LightHue.png", function() {
      render();
    }) }
  },
  vertexShader: document.getElementById('vertex-shader').textContent,
  fragmentShader: document.getElementById('fragment-shader').textContent
});

var mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

camera.position.z = 1;

render();

function render() {
  // requestAnimationFrame(render);

  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth /  canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
