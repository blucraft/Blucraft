/*
	Pancake Panda v0.0.0
	By Matt Regehr
*/

'use strict';

(function () {
	// ::::::::::::::::::::::::: Helpers ::::::::::::::::::::::::: //

	var random = function (min, max) {
		return Math.random() * (max - min) + min;
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

	var GRAVITY = 2000;

	// ::::::::::::::::::::::::: Canvas ::::::::::::::::::::::::: //

	var canvas = document.getElementById('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	var ctx = canvas.getContext('2d');
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	// ::::::::::::::::::::::::: Drown ::::::::::::::::::::::::: //

	var Bubble = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = this.size.y = expoRandom(3, 120);

		this.pos.x = random(0, WIDTH) - this.size.x / 2;
		this.pos.y = random(0, HEIGHT) + HEIGHT / 2 - this.size.y / 2;

		this.sprite = game.assets.bubble;

		this.speed = Math.sqrt(this.size.x / 2) * 120;
	};

	Bubble.prototype = combine(Entity.prototype, {});

	var DrownBG = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		this.color = 'rgba(243, 156, 18, 0.75)';
	};

	Bubble.prototype = combine(Entity.prototype, {});

	var DrownAnimation = function () {
		// super
		State.call(this);

		// misc
		game.assets.bubbleSound.play();

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		// entities
		this.drownBG = new DrownBG();

		this.bubbles = [];

		this._bubbleTimer = 0;
		this._bubbleInterval = 0.05;

		this._gameOverTimer = 0;
		this._gameOverTimeout = 3;
	};

	DrownAnimation.prototype = combine(State.prototype, {
		update : function (delta) {
			this._bubbleTimer += delta;

			if (this._bubbleTimer >= this._bubbleInterval) {
				this._bubbleTimer %= this._bubbleInterval;

				this.bubbles.push(new Bubble());
			}

			this._gameOverTimer += delta;

			if (this._gameOverTimer >= this._gameOverInterval) {
				game.setState(new GameOver());
			}

			for (var i = 0, l = this.bubbles.length; i < l; i ++) {
				this.bubbles[i].update(delta);
			}
		},

		draw : function () {
			this.drownBG.draw(ctx);

			for (var i = 0, l = this.bubbles.length; i < l; i ++) {
				this.bubbles[i].draw(ctx);
			}
		}
	});

	// ::::::::::::::::::::::::: Squish ::::::::::::::::::::::::: //

	var BloodSpatter = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = 950;
		this.size.y = 600;

		this.pos.x = (WIDTH - this.size.x) / 2;
		this.pos.y = (HEIGHT - this.size.y) / 2;

		this.sprite = game.assets.blood;
	};

	BloodSpatter.prototype = combine(Entity.prototype, {});

	var SquishAnimation = function () {
		// super
		State.call(this);

		// misc
		game.assets.squirtSound.play();

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		// entities
		this.blood = new BloodSpatter();

		this._gameOverTimer = 0;
		this._gameOverTimeout = 2;
	};

	SquishAnimation.prototype = combine(State.prototype, {
		update : function (delta) {
			this._gameOverTimer += delta;

			if (this._gameOverTimer >= this._gameOverInterval) {
				game.setState(new GameOver());
			}
		},

		draw : function () {
			this.blood.draw(ctx);
		}
	});

	// ::::::::::::::::::::::::: Game Over ::::::::::::::::::::::::: //

	var GameOverBG = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		this.color = '#000';
	};

	GameOverBG.prototype = combine(Entity.prototype, {});

	var GameOverText = function () {
		// super
		Entity.call(this);

		this.size.x = 750;
		this.size.y = 150;

		this.pos.x = (WIDTH - this.size.x) / 2;
		this.pos.y = 50;

		this.sprite = game.assets.gameOver;
	};

	GameOverText.prototype = combine(Entity.prototype, {});

	var RestartText = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = 250;
		this.size.y = 30;

		this.pos.x = (WIDTH - this.size.x) / 2;
		this.pos.y = HEIGHT - this.size.y - 100;

		this.sprite = game.assets.restart;
	};

	RestartText.prototype = combine(Entity.prototype, {});

	var GameOver = function () {
		// super
		State.call(this);

		// misc
		game.assets.ambient.pause();
		
		game.assets.sad.currentTime = 0;
		game.assets.sad.play();

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		// entities
		this.gameOverBG = new GameOverBG();
		this.gameOverText = new GameOverText();
		this.restartText = new RestartText();
	};

	GameOver.prototype = combine(State.prototype, {
		update : function (delta) {
			if (blu.keyboard.pressed(13)) game.setState(new World());
		},

		draw : function () {
			this.gameOverBG.draw(ctx);
			this.gameOverText.draw(ctx);
			this.restartText.draw(ctx);
		}
	});

	// ::::::::::::::::::::::::: World ::::::::::::::::::::::::: //

	var Stack = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = 160;
		this.size.y = 140;

		this.pos.x = round(random(0, WIDTH - this.size.x, 40), this.size.x / 4);
		this.pos.y = game.state.pos.y - this.size.y;

		this.sprite = game.assets.stack;

		this.gravity = true;

		this.speed = 350;
	};

	Stack.prototype = combine(Entity.prototype, {
		update : function (delta) {
			if (!this.gravity) {
				for (var i = game.state.stacks.indexOf(this) + 1, l = game.state.stacks.length, stack; i < l; i ++) {
					stack = game.state.stacks[i];

					if (collisions.resolve(stack, this)) this.gravity = stack.gravity = false;
				}
			}

			if (this.gravity) this.pos.y += this.speed * delta;

			if (collisions.resolve(this, game.state.stage)) this.gravity = false;

			collisions.resolve(game.state.panda, this);
		}
	});

	var Stage = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = 150;

		this.pos.y = HEIGHT - this.size.y;

		this.color = 'rgba(0, 0, 0, 0.85)';
	};

	Stage.prototype = combine(Entity.prototype, {});

	var Syrup = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = 0;

		this.pos.y = HEIGHT;

		this.color = 'rgba(243, 156, 18, 0.7)';

		this.speed = 35;
	};

	Syrup.prototype = combine(Entity.prototype, {
		update : function (delta) {
			// rise up
			this.size.y += this.speed * delta;

			this.pos.y = HEIGHT - this.size.y;

			// drown the pandy
			if (this.pos.y < game.state.panda.pos.y) game.setState(new GameOver());
		}
	});

	var Panda = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = 70;
		this.size.y = 60;

		this.pos.x = (WIDTH - this.size.x) / 2;
		this.pos.y = HEIGHT - this.size.y - 150;

		this.animation = game.assets.panda;
		this.animSize.x = 70;
		this.animSize.y = 60;

		this.controls = {
			speed : 400,
			left : 37,
			right : 39,

			jumpHeight : 200,
			jump : 32
		};

		// behaviour
		this.score = 0;
		this.highscore = localStorage.getItem('pnkpd/highscore');

		// squishing
		this._squishTimer = 0;
		this._squishTimeout = 0.5;
	};

	Panda.prototype = combine(Entity.prototype, {
		update : function (delta) {
			// collisions
			collisions.resolve(this, game.state.stage);

			var left = this.touching.left;
			var top = this.touching.top;
			var right = this.touching.right;
			var bottom = this.touching.bottom;

			// squish
			this.size.y = top && bottom ? bottom.pos.y - (top.pos.y + top.size.y) : 60;

			if (this.size.y <= 0) game.setState(new GameOver());

			// input
			if (blu.keyboard.pressed(this.controls.left)) this.pos.x -= this.controls.speed * delta;
			if (blu.keyboard.pressed(this.controls.right)) this.pos.x += this.controls.speed * delta;

			if (blu.keyboard.pressed(this.controls.jump) && !top && (left || right || bottom)) this.vel.y = -Math.sqrt(2 * GRAVITY * this.controls.jumpHeight);

			// integrate
			this.pos.x += this.vel.x * delta;
			this.pos.y += this.vel.y * delta;
			
			this.vel.y += GRAVITY * delta;

			// focusing
			game.state.contain(this);
			game.state.camera.focusOn(this);

			// height counter
			this.score = Math.max(this.score, HEIGHT - (this.pos.y + this.size.y));

			// highscore
			if (this.score > this.highscore) this.highscore = this.score;

			// revert collision flags
			this.uncollide();
		}
	});

	var WorldBG = function () {
		// super
		Entity.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		this.sprite = game.assets.bg;
	};

	WorldBG.prototype = combine(Entity.prototype, {});

	var World = function () {
		// super
		State.call(this);

		// properties
		this.size.x = WIDTH;
		this.size.y = HEIGHT;

		// misc
		game.assets.sad.pause();

		game.assets.ambient.currentTime = 0;
		game.assets.ambient.play();

		// camera
		this.camera = new Camera(WIDTH, HEIGHT);

		// entities
		this.worldBG = new WorldBG();
		this.panda = new Panda();
		this.syrup = new Syrup();
		this.stage = new Stage();

		this.stacks = [];

		this._stackTimer = 0;
		this._stackInterval = 1;
	};

	World.prototype = combine(State.prototype, {
		update : function (delta) {
			this._stackTimer += delta;

			if (this._stackTimer >= this._stackInterval) {
				this._stackTimer %= this._stackInterval;

				this.stacks.push(new Stack());
			}

			this.panda.update(delta);
			this.syrup.update(delta);

			for (var i = this.stacks.length - 1; i >= 0; i --) {
				this.stacks[i].update(delta);
			}

			if (this.camera.pos.y < this.pos.y) {
				this.pos.y = this.camera.pos.y;
				this.size.y = HEIGHT - this.pos.y;
			}

			this.contain(this.camera);
		},

		draw : function () {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			this.worldBG.draw(ctx);

			this.panda.draw(ctx, this.camera);

			for (var i = 0, l = this.stacks.length; i < l; i ++) {
				this.stacks[i].draw(ctx, this.camera);
			}

			this.syrup.draw(ctx, this.camera);
			this.stage.draw(ctx, this.camera);
		}
	});

	// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

	var game = new Game()
		.loadAssets({
			// squish animation
			squirtSound : '_audio/squirt.mp3',
			blood : '_images/blood.png',

			// drown animation
			bubbleSound : '_audio/bubble.mp3',
			bubble : '_images/bubble.png',

			// game over
			sad : '_audio/sad.mp3',
			gameOver : '_images/gameOver.png',
			restart : '_images/restart.png',

			// ui
			pause : '_images/ui/pause.png',

			// world
			ambient : '_audio/ambient.mp3',
			bg : '_images/bg.png',
			panda : '_images/panda.png',
			stack : '_images/stack.png'
		})
		.then(function () {
			game.setState(new World()).start();
		});

	// ::::::::::::::::::::::::: K, All Done ::::::::::::::::::::::::: //

	// **For testing purposes only
	// window.game = game;
}());