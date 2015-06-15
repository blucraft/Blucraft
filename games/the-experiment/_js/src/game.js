/*
	The Experiment v0.0.0
	By Matt Regehr
*/

'use strict';

(function () {
	// ::::::::::::::::::::::::: Helpers ::::::::::::::::::::::::: //

	var random = function (min, max) {
		return Math.random() * (max - min) + min;
	};

	var chooseFrom = function (array) {
		return array[Math.floor(Math.random() * array.length)];
	};

	var expoRandom = function (min, max) {
		var distr = Math.random() * (max - min) + min;

		return distr * distr;
	};

	var round = function (n, snap) {
		return Math.round(n / snap) * snap;
	};

	var combine = function () {
		var target = {};

		// Iterate through all args
		for (var i = 0, l = arguments.length; i < l; i ++) {
			// Iterate through all the properties
			for (var k in arguments[i]) {
				// Prototype safe
				if (!arguments[i].hasOwnProperty(k)) continue;

				// Add the property
				target[k] = arguments[i][k];
			}
		}

		return target;
	};

	// ::::::::::::::::::::::::: Static ::::::::::::::::::::::::: //

	var WIDTH = document.body.clientWidth;
	var HEIGHT = document.body.clientHeight;

	var COLORS = [
		0x1abc9c,
		0xf1c40f,
		0xe74c3c,
		0x3498db,
		0xbdc3c7,
		0x16a085,
		0xf39c12,
		0x2ecc71,
		0x9b59b6,
		0x34495e
	];

	// ::::::::::::::::::::::::: Canvas ::::::::::::::::::::::::: //

	var canvas = document.getElementById('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	var renderer = new THREE.WebGLRenderer({canvas : canvas});
	renderer.setClearColor(0x000000, 0);
	renderer.shadowMapEnabled = true;

	// ::::::::::::::::::::::::: Space ::::::::::::::::::::::::: //

	var Star = function (x, y, z, size, color) {
		var star = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({
			color : color || 0x000000
		}));

		star.receiveShadow = true;

		star.position.x = x;
		star.position.y = y;
		star.position.z = z;

		star.update = function (delta) {
			this.rotation.x += 20 * delta;
			this.rotation.z += 20 * delta;
		};

		return star;
	};

	var Player = function (x, y, z) {
		this.position = {
			x: x,
			y: y,
			z: z
		};

		this.rotation = {
			x: 0,
			y: 0,
			z: 0
		};

		this.controls = {
			left : 65,
			right : 68,
			down : 83,
			up : 87,

			turnLeft : 37,
			turnRight : 39,
			turnDown : 40,
			turnUp : 38
		};

		this.speed = 1500;

		this.update = function (delta) {
			if (blu.keyboard.pressed(this.controls.turnLeft)) this.rotation.y += delta;
			if (blu.keyboard.pressed(this.controls.turnRight)) this.rotation.y -= delta;
			if (blu.keyboard.pressed(this.controls.turnUp)) this.rotation.x += delta;
			if (blu.keyboard.pressed(this.controls.turnDown)) this.rotation.x -= delta;

			if (blu.keyboard.pressed(this.controls.left)) this.position.x -= this.speed * delta;
			if (blu.keyboard.pressed(this.controls.right)) this.position.x += this.speed * delta;
			if (blu.keyboard.pressed(this.controls.up)) this.position.z -= this.speed * delta;
			if (blu.keyboard.pressed(this.controls.down)) this.position.z += this.speed * delta;

			game.state.camera.position.x = this.position.x;
			game.state.camera.position.y = this.position.y;
			game.state.camera.position.z = this.position.z;

			game.state.camera.rotation.x = this.rotation.x;
			game.state.camera.rotation.y = this.rotation.y;
			game.state.camera.rotation.z = -this.rotation.z;
		};
	};

	var Space = function () {
		this.camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 5000);
		this.scene = new THREE.Scene();

		this.player = new Player(0, 0, 20);

		var universeSize = 10000;
		var starCount = 8000;
		var starSize = 20;

		this.stars = [];

		for (var i = 0, star; i < starCount; i ++) {
			star = new Star(
				random(-universeSize, universeSize),
				random(-universeSize, universeSize),
				random(-universeSize, universeSize),
				random(0, starSize),
				chooseFrom(COLORS)
			);

			this.stars.push(star);
			this.scene.add(star);
		}
	};

	Space.prototype = combine(State.prototype, {
		update : function (delta) {
			for (var i = 0, l = this.stars.length; i < l; i ++) {
				this.stars[i].update(delta);
			}

			this.player.update(delta);
		},

		draw : function () {
			renderer.render(this.scene, this.camera);
		}
	});

	// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

	var game = new Game();
	game.setState(new Space()).start();

	// ::::::::::::::::::::::::: K, All Done ::::::::::::::::::::::::: //

	// **For testing purposes only
	// window.game = game;
}());