/*
	10 Ghosts v0.0.0
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

	var CAP = 10;

	// ::::::::::::::::::::::::: Canvas ::::::::::::::::::::::::: //

	var canvas = document.getElementById('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	var ctx = canvas.getContext('2d');
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	// ::::::::::::::::::::::::: Game Over ::::::::::::::::::::::::: //

	var GameOver = function (winner) {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		ctx.font = '20px calibri';
		ctx.fillStyle = '#fff';
		ctx.fillText(winner + ' won! Press space to restart.', (WIDTH - 250) / 2, (HEIGHT - 18) / 2);
	};

	GameOver.prototype = combine(State.prototype, {
		update : function (delta) {
			if (blu.keyboard.pressed(32)) game.setState(new Play());
		}
	});

	// ::::::::::::::::::::::::: Play ::::::::::::::::::::::::: //

	var Thing = function (x, y, name, color, controls) {
		Entity.call(this);

		this.size.x = 60;
		this.size.y = 60;

		this.pos.x = x;
		this.pos.y = y;

		this.name = name;
		this.color = color;
		this.controls = controls;

		this.auto = false;
		this.score = 0;

		this.speed = 700;
	};

	Thing.prototype = combine(Entity.prototype, {
		update : function (delta) {
			// Movement
			if (blu.keyboard.pressed(this.controls.left)) this.pos.x -= this.speed * delta;
			if (blu.keyboard.pressed(this.controls.right)) this.pos.x += this.speed * delta;
			if (blu.keyboard.pressed(this.controls.up)) this.pos.y -= this.speed * delta;
			if (blu.keyboard.pressed(this.controls.down)) this.pos.y += this.speed * delta;

			if (this.pos.x < 0) this.pos.x = 0;
			if (this.pos.y < 0) this.pos.y = 0;
			if (this.pos.x > WIDTH - this.size.x) this.pos.x = WIDTH - this.size.x;
			if (this.pos.y > HEIGHT - this.size.y) this.pos.y = HEIGHT - this.size.y;

			if (blu.keyboard.firstPress(this.controls.cheat)) this.auto = !this.auto;

			if (this.auto) {
				if (this.pos.x < game.state.ghost.pos.x) {
					this.pos.x += this.speed * delta;

					if (this.pos.x > game.state.ghost.pos.x) this.pos.x = game.state.ghost.pos.x;
				} else if (this.pos.x > game.state.ghost.pos.x) {
					this.pos.x -= this.speed * delta;

					if (this.pos.x < game.state.ghost.pos.x) this.pos.x = game.state.ghost.pos.x;
				}

				if (this.pos.y < game.state.ghost.pos.y) {
					this.pos.y += this.speed * delta;

					if (this.pos.y > game.state.ghost.pos.y) this.pos.y = game.state.ghost.pos.y;
				} else if (this.pos.y > game.state.ghost.pos.y) {
					this.pos.y -= this.speed * delta;

					if (this.pos.y < game.state.ghost.pos.y) this.pos.y = game.state.ghost.pos.y;
				}
			}

			// Extra
			if (collisions.get(this, game.state.ghost)) {
				this.score ++;

				game.state.ghost.respawn();
			}

			if (this.score >= CAP) {
				game.setState(new GameOver(this.name));
			}
		},

		draw : function () {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

			ctx.font = '18px calibri';
			ctx.fillStyle = '#fff';
			ctx.fillText(this.score, this.pos.x + (this.size.x - 5) / 2, this.pos.y + (this.size.y - 18) / 2);
		}
	});

	var Ghost = function () {
		Entity.call(this);

		this.size.x = 60;
		this.size.y = 60;

		this.respawn();

		this.target = new math.Vector();
		this.setTarget();

		this.speed = 250;

		this.color = '#ccc';
	};

	Ghost.prototype = combine(Entity.prototype, {
		respawn : function () {
			this.pos.x = Math.random() * (WIDTH - this.size.x);
			this.pos.y = Math.random() * (HEIGHT - this.size.y);

			// Prevent spawning inside red or green
			// var block = true;

			// while (block) {
			// 	this.pos.x = Math.random() * (WIDTH - this.size.x);
			// 	this.pos.y = Math.random() * (HEIGHT - this.size.y);

			// 	block = red.collides(this) || green.collides(this);
			// }
		},

		setTarget : function () {
			this.target.x = Math.random() * (WIDTH - this.size.x);
			this.target.y = Math.random() * (HEIGHT - this.size.y);

			// Chain
			return this;
		},

		update : function (delta) {
			// AI
			if (this.pos.x === this.target.x && this.pos.y === this.target.y) {
				this.setTarget();
			} else {
				if (this.pos.x < this.target.x) {
					this.pos.x += this.speed * delta;

					if (this.pos.x > this.target.x) this.pos.x = this.target.x;
				} else if (this.pos.x > this.target.x) {
					this.pos.x -= this.speed * delta;

					if (this.pos.x < this.target.x) this.pos.x = this.target.x;
				}

				if (this.pos.y < this.target.y) {
					this.pos.y += this.speed * delta;

					if (this.pos.y > this.target.y) this.pos.y = this.target.y;
				} else if (this.pos.y > this.target.y) {
					this.pos.y -= this.speed * delta;

					if (this.pos.y < this.target.y) this.pos.y = this.target.y;
				}
			}
		}
	});

	var Play = function () {
		this.ghost = new Ghost();

		this.red = new Thing(0, 0, 'Red', '#e74c3c', {
			left : 65,
			right : 68,
			down : 83,
			up : 87,
			cheat : 16
		});

		this.green = new Thing(WIDTH, 0, 'Green', '#1abc9c', {
			left : 37,
			right : 39,
			down : 40,
			up : 38,
			cheat : 13
		});

		this.decelerate = 188;
		this.accelerate = 190;
		this.nos = 1;
	};

	Play.prototype = combine(State.prototype, {
		update : function (delta) {
			if (blu.keyboard.pressed(this.decelerate)) this.nos -= delta / 2;
			if (blu.keyboard.pressed(this.accelerate)) this.nos += delta / 2;

			this.nos = math.clamp(this.nos, 0, 3);

			this.ghost.update(delta * this.nos);
			this.red.update(delta * this.nos);
			this.green.update(delta * this.nos);
		},

		draw : function () {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			this.ghost.draw(ctx);
			this.red.draw(ctx);
			this.green.draw(ctx);

			// FPS counter
			ctx.fillStyle = '#000';
			ctx.fillRect(0, HEIGHT - 20, 40, 20);

			ctx.font = '12px calibri';
			ctx.fillStyle = '#fff';
			ctx.fillText(Math.round(game.fps) + 'fps', 7, HEIGHT - 15);
		}
	});

	// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

	var game = new Game();
	game.setState(new Play()).start();

	// ::::::::::::::::::::::::: K, All Done ::::::::::::::::::::::::: //

	// **For testing purposes only
	// window.game = game;
}());