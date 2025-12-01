// Three.js Groot Dancing Model
(function() {
    'use strict';

    let scene, camera, renderer, model, mixer, clock;
    const container = document.getElementById('grootModelContainer');

    if (!container) {
        console.warn('Groot model container not found');
        return;
    }

    function init() {
        // Clock for animations
        clock = new THREE.Clock();

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 1, 3);
        camera.lookAt(0, 0.5, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        renderer.setSize(250, 250);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-5, 5, -5);
        scene.add(backLight);

        // Load the GLB model
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/groot_dancing.glb',
            (gltf) => {
                model = gltf.scene;
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Scale to fit
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                model.scale.setScalar(scale);
                
                // Center the model
                model.position.x = -center.x * scale;
                model.position.y = -center.y * scale + 0.5;
                model.position.z = -center.z * scale;

                scene.add(model);

                // Handle animations
                if (gltf.animations && gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                console.log('Groot model loaded successfully!');
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                console.log(`Loading Groot: ${percent}%`);
            },
            (error) => {
                console.error('Error loading Groot model:', error);
                // Fallback to emoji if model fails
                container.innerHTML = '<div class="welcome-icon-fallback">🌱</div>';
            }
        );

        // Start animation loop
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        // Update animation mixer
        if (mixer) {
            mixer.update(clock.getDelta());
        }

        // Slow rotation
        if (model) {
            model.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    function onResize() {
        if (renderer && camera) {
            renderer.setSize(250, 250);
        }
    }

    window.addEventListener('resize', onResize);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
