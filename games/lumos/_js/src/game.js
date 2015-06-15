get.assets({
	'test' : '_maps/test.json',

	'ambient' : '_audio/ambient.mp3',
	'crunch' : '_audio/crunch.mp3',

	'bg' : '_images/bg.png',
	'tiles': '_images/tiles.png',
	'player': '_images/player.png'
}).then (function (resources) {
	/***************** Helpers ******************/

	// produces a random number in linear range
	var linearRandom = function (min, max) {
		var random = Math.random();

		return random * (max - min) + min;
	};

	// produces a random number in an exponential range
	var expoRandom = function (min, max) {
		var random = Math.pow(Math.random(), 2);
		
		return random * (max - min) + min;
	};

	// snaps a number to a multiple of another number
	var snap = function (number, amount) {
		return Math.round(number / amount) * amount;
	};

	// toggles 2 states
	var toggle = function (state, a, b) {
		return state === a?b:state === b?a:state;
	};

	/***************** Static ******************/

	var WIDTH = document.body.clientWidth;
	var HEIGHT = document.body.clientHeight;

	var PAUSE = 27;

	var USE = 18;
	var RUN = 16;

	var RIGHT = 39;
	var LEFT = 37;
	var UP = 38;
	var DOWN = 40;

	/***************** Components ******************/

	var renderer = new ION.Renderer(document.getElementById('canvas'), WIDTH, HEIGHT);
	var physics = new ION.Physics(2000);

	var keyboard = ION.keyboard;
	var mouse = ION.mouse;

	mouse.target = renderer.canvas;

	/***************** Entities ******************/

	// player constructor
	var Player = function (x, y) {
		// set spawn point
		this.x = x;
		this.y = y;

		this.setSpawn();

		// misc
		this.speed = this.speedMax = 450;
		this.health = this.healthMax = 7;

		this.init();
	};

	Player.prototype = new ION.Entity({
		// main
		image : new ION.Animation(resources.player, 0, 7, 256, 256, 2),

		// shape
		width : 100,
		height : 100,

		// behaviour
		init : function () {
			this.health = this.healthMax;

			this.respawn();
		},

		update : function (delta) {
			// movement
			if (keyboard.pressed(RUN)) this.speed *= 2;

			if (keyboard.pressed(UP)) this.pos.y -= this.speed * delta;
			if (keyboard.pressed(DOWN)) this.pos.y += this.speed * delta;
			if (keyboard.pressed(LEFT)) this.pos.x -= this.speed * delta;
			if (keyboard.pressed(RIGHT)) this.pos.x += this.speed * delta;

			// set animation speed based on current speed
			this.image.animationSpeed = this.speed / 30;

			// animate if moving
			if (keyboard.pressed(UP) || keyboard.pressed(DOWN) || keyboard.pressed(LEFT) || keyboard.pressed(RIGHT)) {
				this.image.animate(delta);
			} else {
				this.image.revertAnimation();
			}

			// extra
			if (this.health <= 0) state = 'gameOver';

			// defaults
			this.speed = this.speedMax;
		}
	});

	// maps consisting of tiles
	var TileMap = function (map) {
		// move data over
		this.name = map.name;

		this.tileSize = map.tileSize;
		this.cellSize = map.cellSize;

		this.cols = map.tiles.length;
		this.rows = map.tiles[0].length;

		this.width = this.cols * this.tileSize;
		this.height = this.rows * this.tileSize;

		// process raw tiles
		var raw = map.tiles;

		this.original = map.tiles.map(function (column) {
			return column.map(function (tile) {
				return tile === null ? null : new Tile(tile);
			});
		});

		// someday syntax
		// this.original = map.tiles.map(col => col.map(tile => tile === null ? null : new Tile(tile)));

		this.init();
	};

	TileMap.prototype = {
		update : function (delta, player) {
			// cull to player
			var startX = Math.max(0, Math.floor((player.x - 1) / this.tileSize));
			var endX = Math.min(this.cols, Math.ceil((player.x + player.width + 1) / this.tileSize));

			var startY = Math.max(0, Math.floor((player.y - 1) / this.tileSize));
			var endY = Math.min(this.rows, Math.ceil((player.y + player.height + 1) / this.tileSize));

			// update culled tiles
			for (var x = startX; x < endX; x ++) {
				for (var y = startY; y < endY; y ++) {
					if (this.tiles[x][y] !== null) var c = this.tiles[x][y].update(delta, player);
				}
			}
		},

		init : function () {
			// make a copy of the original
			this.tiles = this.original.map(function (column) {
				return column.map(function (tile) {
					return tile;
				});
			});
		}
	};

	// individual tiles in a tile-map
	var Tile = function (tileData) {
		var tile = tiles[tileData[0]];

		var newTile = new ION.Entity({
			// image
			image : new ION.Sprite(resources.tiles, tileData[2], tileData[3], tileData[4], tileData[5]),

			// box
			x : tileData[6],
			y : tileData[7],

			width : tileData[8],
			height : tileData[9],

			// main
			init : tile.init,
			update : tile.update
		});

		// run setup on the tile
		tile.setup.call(newTile, tileData[1]);

		// init
		newTile.init();

		return newTile;
	};

	Tile.prototype = {

	};

	// tile types
	var tiles = {
		solid : {
			setup : function (data) {

			},

			init : function () {

			},

			update : function (dt) {
				
			}
		},

		wall : {
			setup : function (data) {

			},

			init : function () {

			},

			update : function (dt) {
				
			}
		},

		decoration : {
			setup : function (data) {
				this.sound = data[0] ? resources[data[0]] : null;
			},

			init : function () {

			},

			update : function (dt) {
				if (this.sound) this.sound.play();
			}
		},

		stairs : {
			setup : function (data) {

			},

			init : function () {

			},

			update : function (dt) {
				
			}
		}
	};

	/***************** Build ******************/

	// main scene
	var cedric = new Player(0, 70);

	var maps = {
		test : new TileMap(resources.test)
	};

	var theMap = maps.test;

	var camera = new ION.Camera(renderer.width, renderer.height, mainScene);
	var mainScene = new ION.Scene(0, 0, new ION.Color('rgba(255, 255, 255, 1)'));

	// ui
	var UI = new ION.Scene(new ION.Color('transparent'), WIDTH, HEIGHT);

	/***************** Logic ******************/

	// music
	resources.ambient.onended = resources.ambient.play;

	// game logic
	var init = function () {
		mainScene.width = theMap.width;
		mainScene.height = theMap.height;

		rebuild();

		resources.ambient.play();

		state = 'play';
	};

	var rebuild = function () {
		mainScene.clear().add(cedric).add(theMap.tiles);
	};

	var state;

	var game = new Loop(function (delta, stats) {
		if (state == 'play') {
			// update entities
			cedric.update(delta);
			theMap.update(delta, cedric);

			// focus camera
			camera.focusOn(cedric);
			camera.containTo(mainScene);

			// draw main scene
			renderer.draw(mainScene, camera);

			// draw fps
			renderer.ctx.fillStyle = '#000';
			renderer.ctx.fillRect(0, renderer.height - 20, 40, 20);

			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.fillText(Math.round(stats.fps) + 'fps', 7, renderer.height - 6);
		}

		if (state == 'gameOver') {

		}
	});

	init();

	game.start();

	/***************** K, All Done ******************/
});