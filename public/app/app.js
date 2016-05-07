import THREE from 'three';
import 'three_examples/controls/OrbitControls';
import 'three_examples/postprocessing/EffectComposer';
import 'three_examples/postprocessing/ShaderPass';
import 'three_examples/postprocessing/TexturePass';
import 'three_examples/postprocessing/MaskPass';
import 'three_examples/shaders/CopyShader';
import vertexShader from 'text-loader!./shaders/process.vert';
import fragmentShader from 'text-loader!./shaders/process.frag';

import gridVertexShader from 'text-loader!./shaders/grid.vert';
import gridFragmentShader from 'text-loader!./shaders/grid.frag';

export class App {
  constructor(opts) {
    this.canvas = opts.canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientWidth, 0.01, 1000);
    this.textureLoader = new THREE.TextureLoader();
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 1;
  }
  
  createScene() {
    return Promise.all([
      // this.createAxisHelper().then(mesh => this.scene.add(mesh)),
      this.createOriginalPlane().then(mesh => {
        // mesh.position.x = -3/5;
        //this.scene.add(mesh)
      }),
      this.createProcessedPlane().then(mesh => {
        // mesh.position.x = 3/5;
        this.scene.add(mesh);
        return this.createGridFromPlane(mesh).then(grid => {
          grid.position.z = 0.001;
          this.scene.add(grid);
        });
      })
    ]);
  }

  createAxisHelper() {
    const helper = new THREE.AxisHelper(1, 1, 1);
    return Promise.resolve(helper);
  }

  createOriginalPlane() {
    return new Promise(resolve => {
      this.textureLoader.load('data/rgb5.png', texture => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture
        });
        resolve(new THREE.Mesh(geometry, material));
      });
    });
  }

  createProcessedPlane() {
    return new Promise(resolve => {
      this.textureLoader.load('data/rgb5.png', texture => {
        const renderTarget = new THREE.WebGLRenderTarget(texture.image.width, texture.image.height, {
          stencilBuffer: false,
          depthBuffer: false
        });
        const composer = new THREE.EffectComposer(this.renderer, renderTarget);

        const texturePass = new THREE.TexturePass(texture);
        composer.addPass(texturePass);

        const shader = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          uniforms: {
            tDiffuse: {type: 't', value: null},
            width: {type: 'i', value: texture.image.width},
            height: {type: 'i', value: texture.image.height}
          }
        });
        const shaderPass = new THREE.ShaderPass(shader);
        composer.addPass(shaderPass);
        
        composer.render();
        
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
          map: renderTarget
        });
        
        resolve(new THREE.Mesh(geometry, material));
      });
    });
  }
  
  createGridFromPlane(mesh) {
    const geometry = new THREE.Geometry();
    const numLines = 400;
    for (let y = 0; y < numLines; y++) {
      for (let x = 0; x < numLines; x++) {
        const vertex = new THREE.Vector3(x / numLines, y / numLines, 0);
        geometry.vertices.push(vertex);
        geometry.vertices.push(vertex.clone().setZ(1));
      }
    }
    const material = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      // linewidth: 5,
      uniforms: {
        tDiffuse: {type: 't', value: mesh.material.map},
        numLines: {type: 'i', value: numLines}
      }
    });
    const grid = new THREE.LineSegments(geometry, material);
    grid.frustumCulled = false;
    return Promise.resolve(grid);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderOnce();
  }

  renderOnce() {
    if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
      this.camera.aspect = this.canvas.clientWidth /  this.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
