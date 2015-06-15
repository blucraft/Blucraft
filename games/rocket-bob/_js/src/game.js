var game = new Game()
	.loadAssets({
		'ambient' : '_audio/ambient.mp3',
		'boom' : '_audio/boom.mp3',

		'bg' : '_images/bg.jpg',

		'byAsteroid' : '_images/byAsteroid.png',
		'noFuel' : '_images/noFuel.png',

		'hud' : '_images/ui/hud.png',
		'pause' : '_images/ui/pause.png',
		
		'player' : '_images/entities/player.png',
		'explosion' : '_images/entities/explosion.png',
		'objects' : '_images/entities/objects.png'
	})
	.then(function () {
		/****************** Meta ******************

		Dev: Matt Regehr - matt19234@gmail.com
		Version: 1.0.0 - Dec. 2014

		****************** Primary ******************/

		game.changeScene({
			update : function (dt) {
				if (blu.keyboard.firstPress(32)) {
					if (state == 'play') {
						state = 'pause';
					} else if (state == 'pause') {
						state = 'play';
					} else if (state == 'dead') {
						// reset entities
						explosions = [];
						objects = [];

						bob.reset();

						// interval for events
						interval = 0;

						state = 'play';
					}
				}

				if (state == 'play') {
					// bob
					bob.update(dt);

					// objects & explosions
					interval += dt;

					if (interval >= max) {
						interval = 0;

						var sTypes = scramble(types);
						var sSpots = scramble(spots);

						for (var i = 0; i < 3; i ++) {
							var type = sTypes[i];

							if (bob.power) type = type == 'asteroid' ? 'banana' : type == 'nyan' ? 'banana' : type;

							objects.push(new object(type, sSpots[i]));
						}
					}

					for (var i = objects.length - 1; i >= 0; i --) {
						if (objects[i].update(dt)) objects.splice(i, 1);
					}

					for (var i = explosions.length - 1; i >= 0; i --) {
						if (explosions[i].update(dt)) explosions.splice(i, 1);
					}
				}
			},

			draw : function () {
				ctx.textBaseline = 'top';
				ctx.textAlign = 'left';

				if (state == 'play') {
					// background
					ctx.drawImage(game.assets.bg, 0, bob.distance * 3 % bgHeight, bgWidth, bgHeight);
					ctx.drawImage(game.assets.bg, 0, bob.distance * 3 % bgHeight - bgHeight, bgWidth, bgHeight);

					// objects & explosions
					for (var i = 0, l = objects.length; i < l; i ++) {
						objects[i].draw();
					}

					for (var i = 0, l = explosions.length; i < l; i ++) {
						explosions[i].draw();
					}

					// bob
					bob.draw();
				}

				if (state == 'pause') {
					// display icon and message
					ctx.drawImage(game.assets.pause, (canvas.width - 64) / 2, (canvas.height - 64) / 2, 64, 64);
				}

				if (state == 'dead') {
					// game over stuff
					ctx.fillStyle = '#ff1245';
					ctx.fillRect(0, 0, canvas.width, canvas.height);

					ctx.drawImage(deathReason == 'asteroid' ? game.assets.byAsteroid : game.assets.noFuel, (canvas.width - 750) / 2, 50, 750, 150);

					// score
					var distance = km(bob.distance) + 'km';
					
					if (bob.distance > oldScore) {
						ctx.drawImage(game.assets.hud, 192, 0, 64, 64, (canvas.width - ctx.measureText(distance).width) / 2 - 120, 400, 64, 64);

						ctx.font = '46px calibri';
						ctx.fillStyle = '#f1c40f';
						ctx.fillText(distance, (canvas.width - ctx.measureText(distance).width) / 2, 400);
					}

					ctx.font = '18px calibri';

					ctx.drawImage(game.assets.hud, 128, 0, 64, 64, 20, canvas.height - 50, 32, 32);

					ctx.fillStyle = '#fff';
					ctx.fillText(distance, 60, canvas.height - 45);

					ctx.drawImage(game.assets.hud, 192, 0, 64, 64, 192, canvas.height - 50, 32, 32);

					ctx.fillStyle = '#f1c40f';
					ctx.fillText(highscore + 'km', 240, canvas.height - 45);
				}
			}
		});

		/****************** Secondary ******************/

		var player = function () {
			// physical
			this.cw = 50;
			this.ch = 108;

			this.w = 64;
			this.h = 128;

			this.cx = this.bx = 0;
			this.cy = 0;

			this.x = this.ex = (canvas.width - this.w) / 2;
			this.y = 0;

			// extra
			this.hearts = this.heartMax = 3;
			this.bananas = this.bananaMax = 6;

			this.xCushion = 10;
			this.yCushion = 10;

			this.powerTime = 0;
			this.power = false;

			this.speedX = 600;
			this.speedY = 500;

			this.distance = 0;

			this.update = function (dt) {
				// animate
				this.bx += this.cw * 20 * dt;
				this.bx %= game.assets.player.width;
				this.cx = Math.floor(this.bx / this.cw) * this.cw;
				this.cy = ((this.power ? 6 : 3) - this.hearts) * this.ch;

				// move & accelerate
				this.speedY += dt * 3;

				this.y -= this.speedY * dt;

				if (blu.keyboard.pressed(left)) this.x -= this.speedX * dt;
				if (blu.keyboard.pressed(right)) this.x += this.speedX * dt;

				this.distance += this.speedY / 25 * dt;

				// power
				if (this.power) this.powerTime -= 1000 * dt;
				if (this.power && this.powerTime <= 0) this.power = false;

				// contain
				if (this.x < -this.w / 2) this.x = canvas.width - this.w / 2;
				if (this.x > canvas.width - this.w / 2) this.x = - this.w / 2;

				// hearts & banana fuel
				this.bananas -= dt;

				if (this.hearts > this.heartMax) this.hearts = this.heartMax;
				if (this.bananas > this.bananaMax) this.bananas = this.bananaMax;

				// game over
				if (this.hearts <= 0 || this.bananas <= 0) {
					deathReason = (this.hearts <= 0) ? 'asteroid' : 'fuel';
					state = 'dead';

					this.distance = Math.floor(this.distance);

					oldScore = highscore;

					if (this.distance > highscore) {
						highscore = this.distance;

						localStorage.setItem('xcnn8/highscore', highscore);
					}
				}

				// focus
				canvas.y = this.y + this.h + 50 - canvas.height;
			};

			this.draw = function () {
				// rocket
				ctx.drawImage(game.assets.player, this.cx, this.cy, this.cw, this.ch, this.x, this.y - canvas.y, this.w, this.h);

				// hud
				if (this.power) {
					ctx.globalAlpha = 0.85;
					ctx.fillStyle = '#2ecc71';
					ctx.fillRect(0, 0, canvas.width * this.powerTime / 5000, 40);
					ctx.globalAlpha = 1;
				}

				for (var i = 0; i < this.hearts; i ++) ctx.drawImage(game.assets.hud, 0, 0, 64, 64, i * 40 + 10, 5, 32, 32);
				for (var i = 0; i < this.bananas; i ++) ctx.drawImage(game.assets.hud, 64, 0, 64, 64, i * 40 + 10, 40, 32, 32);

				ctx.font = '18px calibri';

				ctx.drawImage(game.assets.hud, 128, 0, 64, 64, 20, canvas.height - 50, 32, 32);

				ctx.fillStyle = '#fff';
				ctx.fillText(km(this.distance) + 'km', 60, canvas.height - 45);

				ctx.drawImage(game.assets.hud, 192, 0, 64, 64, 192, canvas.height - 50, 32, 32);

				ctx.fillStyle = '#f1c40f';
				ctx.fillText(highscore + 'km', 240, canvas.height - 45);
			};

			this.reset = function () {
				this.x = this.ex;

				this.speedY = 500;

				this.distance = 0;

				this.hearts = this.heartMax;
				this.bananas = this.bananaMax;

				this.powerTime = 0;
				this.power = false;
			};
		};

		var object = function (type, spot) {
			// physical
			this.cw = 64;
			this.ch = 64;

			this.w = 96;
			this.h = 96;

			this.x = spot;
			this.y = canvas.y - this.h;

			this.cx = 0;
			this.cy = 0;

			// extra
			this.behaviour = function () {

			};

			if (type == 'nyan') {
				this.cx = 0;

				this.behaviour = function () {
					bob.powerTime = 5000;
					bob.power = true;
				};
			}

			if (type == 'heart') {
				this.cx = 1;

				this.behaviour = function () {
					bob.hearts ++;
				};
			}

			if (type == 'banana') {
				this.cx = 2;

				this.behaviour = function () {
					bob.bananas ++;
				};
			}

			if (type == 'asteroid') {
				this.cx = 3;

				this.behaviour = function () {
					explosions.push(new explosion(this.x, this.y));
					bob.hearts --;

					game.assets.boom.play();
				};
			}

			this.cx *= this.cw;

			this.update = function (dt) {
				if (this.y >= canvas.y + canvas.height) return true;

				var bobLeft = bob.x + bob.xCushion;
				var bobRight = bob.x + bob.w - bob.xCushion;
				var bobTop = bob.y + bob.yCushion;
				var bobBottom = bob.y + bob.h - bob.yCushion;

				var thisLeft = this.x;
				var thisRight = this.x + this.w;
				var thisTop = this.y;
				var thisBottom = this.y + this.h;

				if (bobLeft < thisRight && bobRight > thisLeft && bobTop < thisBottom && bobBottom > thisTop) {
					this.behaviour();

					return true;
				}
			};

			this.draw = function () {
				ctx.drawImage(game.assets.objects, this.cx, this.cy, this.cw, this.ch, this.x, this.y - canvas.y, this.w, this.h);
			};
		};

		var explosion = function (x, y) {
			// physical
			this.cw = 64;
			this.ch = 64;

			this.w = 96;
			this.h = 96;

			this.bx = 0;
			this.cx = 0;
			this.cy = 0;

			this.x = x;
			this.y = y;

			this.update = function (dt) {
				this.bx += dt * this.cw * 20;
				this.cx = Math.floor(this.bx / this.cw) * this.cw;
				if (this.cx >= game.assets.explosion.width) return true;
			};

			this.draw = function () {
				ctx.drawImage(game.assets.explosion, this.cx, this.cy, this.cw, this.ch, this.x, this.y - canvas.y, this.w, this.h);
			};
		};

		var scramble = function (array) {
			var i = array.length, temporaryValue, randomIndex ;

			while (0 !== i) {
				randomIndex = Math.floor(Math.random() * i);
				i -= 1;

				temporaryValue = array[i];
				array[i] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		};

		var reset = function () {
			// entities
			explosions = [];
			objects = [];

			// extra
			interval = 0;
		};

		/****************** Sugars ******************/

		var km = function (number) {
			return Math.floor(number).toString().replace(/(\d)( ? =(\d{3})+$)/g, '$1,');
		};

		var def = function () {
			for (var i in arguments) if (typeof arguments[i] !== 'undefined') return arguments[i];
		};

		/****************** Canvas ******************/

		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');

		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;

		canvas.y = 0;

		/****************** UI ******************/

		// buttons

		/****************** Input ******************/

		var left = 37;
		var right = 39;

		/****************** Core ******************/

		var state = 'play';

		var scaling = Math.max(canvas.width / game.assets.bg.width, canvas.height / game.assets.bg.height);

		var bgWidth = game.assets.bg.width * scaling;
		var bgHeight = game.assets.bg.height * scaling;

		var bob = new player();

		var types = [
			'nyan',
			'heart',
			'banana',
			'banana',
			'banana',
			'banana',
			'asteroid',
			'asteroid',
			'asteroid',
			'asteroid'
		];

		var spots = (function () {
			var cols = 8;

			var output = [];

			for (var i = 0; i < cols; i ++) {
				output.push(canvas.width / cols * i);
			}

			return output;
		})();

		var objects = [];
		var explosions = [];

		var deathReason = '';

		var interval = 0;
		var max = 0.5;

		var oldScore;
		var highscore = localStorage.getItem('xcnn8/highscore');
		highscore = highscore !== null ? parseInt(highscore) : '';

		reset();

		/****************** Init ******************/

		// ambient
		game.assets.ambient.play();

		// start the loop
		game.start();
	});