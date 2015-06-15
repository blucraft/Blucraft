var game = new Game();

game.loadAssets({
	'dungeon' : '_audio/dungeon.mp3',
	'intense' : '_audio/intense.mp3',
	'holy' : '_audio/holy.mp3',

	'xavia' : '_maps/xavia.json',
	'bg' : '_images/bg.jpg',
	'hud' : '_images/hud.png',
	'titleBG' : '_images/titleBG.jpg',
	'title' : '_images/title.png',
	'gameOver' : '_images/gameOver.png',

	'tiles' : '_images/tiles.png',
	'players' : '_images/players.png',
	'items' : '_images/items.png'
}).then(function () {
	/****************** Meta ******************

	Dev: Matt Regehr - matt19234@gmail.com
	Version: 1.0.0 - Dec. 2014

	****************** Primary ******************/

	game.setState({
		update : function (delta) {
			if (blu.keyboard.firstPress(pause)) {
				var actions = {
					play: function () {
						state = 'paused';
					},

					paused: function () {
						state = 'play';
					}
				}

				actions[state]();
			}

			if (state == 'title') {
				save1Button.update(function () {
					save1.load();
				});

				save2Button.update(function () {
					save2.load();
				});

				save3Button.update(function () {
					save3.load();
				});
			}

			if (state == 'play' || state == 'blackout') {
				//clock
				internalClock += clockSpeed * delta;
				internalClock %= 24;

				//entities
				xavier.update(delta);
				theMap.update(delta, xavier);

				//focus
				canvas.x = Math.round(xavier.x - (canvas.width - xavier.w) / 2);
				canvas.y = Math.round(xavier.y - (canvas.height - xavier.h) / 2);

				if (canvas.x <= 0) canvas.x = 0;
				if (canvas.y <= 0) canvas.y = 0;
				if (canvas.x >= theMap.w - canvas.width) canvas.x = theMap.w - canvas.width;
				if (canvas.y >= theMap.h - canvas.height) canvas.y = theMap.h - canvas.height;

				//fps
				cycles ++;
				period += delta;

				if (period >= 0.3) {
					fps = cycles / period;

					cycles = 0;
					period = 0;
				}
			}

			if (state == 'paused') {
				saveButton.update(function () {

				});

				quitButton.update(function () {
					state = 'title';
				});
			}

			if (state == 'gameOver') {
				continueButton.update(function () {
					xavier.reset();
					theMap.reset();
					
					state = 'play';
				});

				giveupButton.update(function () {
					state = 'title';
				});
			}
		},

		draw : function () {
			ctx.font = '18px calibri';
			ctx.textBaseline = 'top';
			ctx.textAlign = 'left';

			if (state == 'title') {
				ctx.drawImage(game.assets.titleBG, 0, 0, canvas.width, canvas.height);

				ctx.drawImage(game.assets.title, (canvas.width - 750) / 2, 125, 750, 100);

				save1Button.draw();
				save2Button.draw();
				save3Button.draw();
			}

			if (state == 'play' || state == 'paused' || state == 'blackout') {
				//draw bg
				var o = 0.25;
				var ox = -(canvas.x + canvas.width / 2) / theMap.w * canvas.width * o;
				var oy = -(canvas.y + canvas.height / 2) / theMap.h * canvas.height * o;

				ctx.drawImage(game.assets.bg, ox, oy, canvas.width * (o + 1), canvas.height * (o + 1));

				// ctx.fillStyle = '#fff';
				// ctx.fillRect(0, 0, canvas.width, canvas.height);

				//entities
				theMap.draw();
				xavier.draw();

				//skins
				for (var i in skins) {
					var c = skins[i];

					ctx.fillStyle = c[0];
					ctx.globalAlpha = c[1];
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}

				ctx.globalAlpha = 1;

				//fps
				ctx.fillStyle = '#000';
				ctx.fillText('FPS: ' + Math.round(fps), 10, canvas.height - 25);
			}

			if (state == 'paused') {
				//draw background
				ctx.globalAlpha = 0.75;
				ctx.fillStyle = '#fff';

				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.globalAlpha = 1;

				saveButton.draw();
				quitButton.draw();

				ctx.fillStyle = '#555';
				ctx.fillRect(50, 100, canvas.width - 100, 50);

				ctx.fillStyle = '#888';
				ctx.fillRect(50, 175, (canvas.width - 100) / 2, 3 * (canvas.width - 100) / 10);

				ctx.fillStyle = '#f77';
				ctx.fillRect(50 + (canvas.width - 100) / 2, 175, (canvas.width - 100) / 2, 3 * (canvas.width - 100) / 10);

				var w = (canvas.width - 100) / 10;

				for (var i in xavier.inventory) {
					var x = 50 + parseInt(i) % 5 * w;
					var y = 175 + Math.floor(parseInt(i) / 5) * w;
				}
			}

			if (state == 'gameOver') {
				ctx.fillStyle = '#111';
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.drawImage(game.assets.gameOver, (canvas.width - 750) / 2, 100, 750, 150);

				continueButton.draw();
				giveupButton.draw();
			}
		}
	});

	/****************** Secondary ******************/

	var player = function (data) {
		//model
		this.x = this.ex = data.x;
		this.y = this.ey = data.y;

		this.w = 50;
		this.h = 50;

		this.cx = this.bx = 0;
		this.cy = this.by = 72;

		this.animation = {
			point: 0,

			start: 0,
			end: 4,

			speed: 20,

			update: function (delta, animate) {
				this.point += this.speed * delta;
				this.point %= this.end - this.start;

				if (!animate) this.point = 0;

				return Math.floor(this.point) + this.start;
			}
		};

		this.cw = 50;
		this.ch = 50;

		//extra
		this.speedMax = this.speed = 250; // px/s^2
		this.buoyMax = this.buoy = 1; // %
		this.vertMax = this.vert = 70; // px
		this.slideMax = this.slide = 1000; // px/s^2

		this.vCap = 600; // px/s
		this.vy = 0;
		this.vx = 0;
		this.dx = 1;
		
		this.gravity = false;
		this.canJump = false;
		this.underWater = false;
		this.underLava = false;
		this.dialogue = false;
		this.dx = 1;

		this.healthMax = data.healthMax;
		this.health = data.health;

		this.breathMax = data.breathMax;
		this.breath = data.breath;

		this.coinMax = data.coinMax;
		this.coins = data.coins;

		this.keyMax = data.keyMax;
		this.keys = data.keys;

		this.bombMax = data.bombMax;
		this.bombs = data.bombs;

		this.arrowMax = data.arrowMax;
		this.arrows = data.arrows;

		this.slots = ['sword', null, null, null, null, null, null, null, null, null, null];

		this.inventory = {
			sword: new items.sword(data.sword),
			shield: new items.shield(data.shield),

			hookShot: new items.hookShot(data.hookShot),
			parachute: new items.parachute(data.parachute),
			flamethrower: new items.flamethrower(data.flamethrower),
			bow: new items.bow(data.bow),
			bombBag: new items.bombBag(data.bombBag),
			hammer: new items.hammer(data.hammer),
			scubaSuit: new items.scubaSuit(data.scubaSuit),
			emberSuit: new items.emberSuit(data.emberSuit),

			shovel: new items.shovel(data.shovel),
			pickaxe: new items.pickaxe(data.pickaxe),
			glasses: new items.glasses(data.glasses),
			jetBoots: new items.jetBoots(data.jetBoots),
			telephone: new items.telephone(data.telephone)
		};

		this.update = function (delta) {
			//movement
			if (this.gravity) this.vy += this.buoy * gravity * delta;
			if (blu.keyboard.pressed(jump) && this.canJump) this.vy = -Math.sqrt(2 * gravity * this.vert);
			if (this.vy > this.vCap) this.vy = this.vCap;
			if (this.vy < -this.vCap) this.vy = -this.vCap;

			this.y += this.vy * delta;

			if (blu.keyboard.pressed(run)) this.speed *= 2;

			if (blu.keyboard.pressed(right) || blu.keyboard.pressed(left)) {
				this.vx += this.speed;

				if (this.vx > this.speed) this.vx = this.speed;
			}

			if (this.vx < 0) this.vx = 0;

			if (blu.keyboard.pressed(right)) this.dx = 1;
			if (blu.keyboard.pressed(left)) this.dx = -1;

			this.x += this.vx * this.dx * delta;

			this.vx -= this.slide * delta;

			//sprite
			this.animation.speed = this.speed / 25;

			this.cx = this.bx + this.animation.update(delta, blu.keyboard.pressed(right) || blu.keyboard.pressed(left)) * 72;
			this.cy = this.by;

			//inventory
			for (var i in this.inventory) {

			}

			//extra
			if (this.underWater) {
				this.breath -= delta;

				if (this.breath <= 0) {
					this.breath = 0;
					this.health -= delta;
				}

				skins.water[1] += delta;
				if (skins.water[1] > 0.4) skins.water[1] = 0.4;
			} else {
				this.breath = this.breathMax;

				skins.water[1] -= 2 * delta;
				if (skins.water[1] < 0) skins.water[1] = 0;
			}

			if (this.underLava) {
				this.health -= delta * 3 / 7;
				
				skins.lava[1] += delta;
				if (skins.lava[1] > 0.4) skins.lava[1] = 0.4;
			} else {
				skins.lava[1] -= 2 * delta;
				if (skins.lava[1] < 0) skins.lava[1] = 0;
			}

			if (this.health <= 0) {
				state = 'gameOver';
			}

			//defaults
			this.speed = this.speedMax;
			this.vert = this.vertMax;
			this.buoy = this.buoyMax;
			this.slide = this.slideMax;

			this.gravity = true;
			this.canJump = false;
			this.underWater = false;
			this.underLava = false;
			this.dialogue = false;

			//confine
			if (this.x < 0) this.x = 0;
			if (this.x > theMap.w - this.w) this.x = theMap.w - this.w;

			if (this.y > theMap.h - this.h) {
				this.y = theMap.h - this.h;

				this.canJump = true;
				this.vy = 0;
			}
		};

		this.draw = function () {
			//draw me
			ctx.drawImage(game.assets.players, this.cx, this.cy, this.cw, this.ch, Math.round(this.x) - canvas.x, Math.round(this.y) - canvas.y, this.w, this.h);

			//hud
			if (this.underWater) {
				ctx.fillStyle = '#444';
				ctx.fillRect(450, 20, 350, 5);

				ctx.fillStyle = '#08d';
				ctx.fillRect(450, 20, this.breath / this.breathMax * 350, 5);
			}

			ctx.fillStyle = '#444';
			ctx.fillRect(50, 20, 350, 5);

			ctx.fillStyle = '#f68';
			ctx.fillRect(50, 20, this.health / this.healthMax * 350, 5);

			for (var i = 1; i <= 3; i ++) {
				if (i <= this.keys) {
					ctx.drawImage(game.assets.hud, 0, 52, 40, 40, canvas.width - i * 40, 10, 25, 25);
				} else {
					ctx.drawImage(game.assets.hud, 52, 52, 40, 40, canvas.width - i * 40, 10, 25, 25);
				}
			}

			ctx.drawImage(game.assets.hud, 0, 0, 50, 50, canvas.width - 120, 45, 25, 25);

			ctx.fillStyle = '#444';
			ctx.fillText(this.coins, canvas.width - 80, 45);

			//dialogue
			if (this.dialogue !== false) {
				ctx.fillStyle = '#fff';
				ctx.globalAlpha = 0.5;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.fillStyle = '#111';
				ctx.fillRect(20, 20, canvas.width - 40, 200);

				ctx.fillStyle = '#fff';
				ctx.globalAlpha = 1;
				ctx.fillText(this.dialogue, 50, 50);
			}
		};

		this.reset = function () {
			this.x = this.ex;
			this.y = this.ey;

			this.vx = 0;
			this.vy = 0;

			this.health = this.healthMax;
		};

		this.collides = function (thing) {
			//not colliding
			if (!(thing.x <= this.x + this.w && this.x <= thing.x + thing.w && thing.y <= this.y + this.h && this.y <= thing.y + thing.h)) return false;
				
			//collision box
			var x = Math.max(this.x, thing.x);
			var y = Math.max(this.y, thing.y);

			var w = Math.min(this.x + this.w, thing.x + thing.w) - x;
			var h = Math.min(this.y + this.h, thing.y + thing.h) - y;

			if (thing.solid) {
				var l = thing.rx - 1 >= 0?(theMap.tiles[thing.rx - 1][thing.ry]):null; l = l === null || !l.solid;
				var r = thing.rx + 1 < theMap.rw?(theMap.tiles[thing.rx + 1][thing.ry]):null; r = r === null || !r.solid;

				var t = thing.ry - 1 >= 0?(theMap.tiles[thing.rx][thing.ry - 1]):null; t = t === null || !t.solid;
				var b = thing.ry + 1 < theMap.rh?(theMap.tiles[thing.rx][thing.ry + 1]):null; b = b === null || !b.solid;
			} else {
				var l = true;
				var r = true;

				var t = true;
				var b = true;
			}

			//return resolve values
			if (h >= w && x == this.x) return r?'l':false;
			if (h >= w && x == thing.x) return l?'r':false;

			if (w >= h && y == this.y) return b?'t':false;
			if (w >= h && y == thing.y) return t?'b':false;
		};

		this.bePushed = function (thing) {
			var c = this.collides(thing);

			if (c == 'r') this.x = thing.x - this.w;
			if (c == 'l') this.x = thing.x + thing.w;

			if (c == 't') {
				this.y = thing.y + thing.h;

				if (this.vy < 0) this.vy = 0;
			}

			if (c == 'b') {
				this.y = thing.y - this.h;

				this.canJump = true;
				if (this.vy > 0) this.vy = 0;
			}

			return c;
		};
	};

	var items = {
		sword: function (type) {
			//display
			this.cw = 70;
			this.ch = 15;

			this.w = 70;
			this.h = 15;

			this.bx = 0;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.x = 0;
			this.y = 0;

			//extra
			var delta = 0;
			this.speed = 100;

			this.type = type;

			this.update = function (delta, player) {
				//movement
				this.y = player.y + (player.h - this.h) / 2;
				this.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2 + player.dx * delta;

				//sprite
				this.cx = this.bx;
				this.cy = this.by + (player.dx + 1) * 17 / 2;
			};
		},

		shield: function (type) {
			//display
			this.cw = 40;
			this.ch = 40;

			this.w = 40;
			this.h = 40;

			this.cx = 288;
			this.cy = 0;

			this.x = 0;
			this.y = 0;

			//extra
			this.type = type;

			this.update = function (delta, player) {
				//movement
				this.y = player.y + (player.h - this.h) / 2;
				this.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2;
			};
		},

		hookShot: function (type) {
			//display
			this.cw = 10;
			this.ch = 10;

			this.w = 20;
			this.h = 20;

			this.bx = 360;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.x = 0;
			this.y = 0;

			//extra
			this.type = type;

			this.update = function (delta, player) {
				//movement
				delta += this.speed * delta;
				delta %= 350;

				this.y = player.y + (player.h - this.h) / 2;
				this.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2 + player.dx * delta;

				//sprites
				this.cx = this.bx + (player.dx + 1) * 17 / 2;
				this.cy = this.by;
			};
		},

		parachute: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		flamethrower: function (type) {
			this.type = type;

			this.update = function (delta, player) {
				
			};
		},

		bow: function (type) {
			//display
			this.cw = 20;
			this.ch = 70;

			this.w = 20;
			this.h = 70;

			this.bx = 72;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.x = 0;
			this.y = 0;

			//extra
			this.type = type;

			var delta = 0;

			this.update = function (delta, player) {
				this.cx = this.bx + (player.dx + 1) * 22 / 2;
				this.cy = this.by;

				delta += delta;

				//if (delta >= 0.1) 

				delta %= 0.1;

				this.y = player.y + (player.h - this.h) / 2;
				this.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2;
			};
		},

		bombBag: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		hammer: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		scubaSuit: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		emberSuit: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		shovel: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		pickaxe: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		glasses: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		jetBoots: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		telephone: function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		}
	};

	var Map = function (map) {
		this.update = function (delta, player) {
			for (var x = Math.max(0, Math.floor((player.x - 1) / this.tileSize)), mx = Math.min(this.rw, Math.ceil((player.x + player.w + 1) / this.tileSize)); x < mx; x ++) {
				for (var y = Math.max(0, Math.floor((player.y - 1) / this.tileSize)), my = Math.min(this.rh, Math.ceil((player.y + player.h + 1) / this.tileSize)); y < my; y ++) {
					if (this.tiles[x][y] !== null) {
						var c = this.tiles[x][y].update(delta, player);

						if (typeof c !== 'undefined') this.tiles[x][y] = c;
					}
				}
			}
		};

		this.draw = function (delta) {
			for (var x = Math.floor(canvas.x / this.tileSize), mx = Math.ceil((canvas.x + canvas.width) / this.tileSize); x < mx; x ++) {
				for (var y = Math.floor(canvas.y / this.tileSize), my = Math.ceil((canvas.y + canvas.height) / this.tileSize); y < my; y ++) {
					if (this.tiles[x][y] !== null) {
						var c = this.tiles[x][y];

						ctx.drawImage(game.assets.tiles, c.cx, c.cy, c.cw, c.ch, c.x - canvas.x, c.y - canvas.y, c.w, c.h);
					}
				}
			}
		};

		this.reset = function () {
			var newTiles = [];

			for (var x in this.raw) {
				newTiles.push([]);

				for (var y in this.raw[x]) {
					var c = this.raw[x][y];

					newTiles[x].push(c !== null?new tiles[c.t](c.m, c.e, this):null);
				}
			}

			this.tiles = newTiles;
		};

		this.name = map.name;
		this.tileSize = map.tileSize;
		this.cellSize = map.cellSize;

		this.rw = map.tiles.length;
		this.rh = map.tiles[0].length;

		this.w = this.rw * map.tileSize;
		this.h = this.rh * map.tileSize;

		this.raw = map.tiles;

		this.reset();
	};

	var tiles = {
		crate: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.collides = function (thing) {
				//not colliding
				if (!(thing.x <= this.x + this.w && this.x <= thing.x + thing.w && thing.y <= this.y + this.h && this.y <= thing.y + thing.h)) return false;
					
				//get info about collision box
				var x = Math.max(this.x, thing.x);
				var y = Math.max(this.y, thing.y);

				var w = Math.min(this.x + this.w, thing.x + thing.w) - x;
				var h = Math.min(this.y + this.h, thing.y + thing.h) - y;

				//return collision data relative to this
				if (h >= w && x == this.x) return 'l';
				if (h >= w && x == thing.x) return 'r';

				if (w >= h && y == this.y) return 't';
				if (w >= h && y == thing.y) return 'b';
			};

			this.bePushed = function (thing) {
				var c = this.collides(thing);

				if (c == 'r') this.x = thing.x - this.w;
				if (c == 'l') this.x = thing.x + thing.w;

				if (c == 't') {
					this.y = thing.y + thing.h;

					if (this.vy < 0) this.vy = 0;
				}

				if (c == 'b') {
					this.y = thing.y - this.h;

					this.canJump = true;
					if (this.vy > 0) this.vy = 0;
				}

				return c;
			};

			this.update = function (delta, player) {
				this.bePushed(player);
			};
		},

		solid: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.slippery = e[0];

			this.solid = true;

			this.update = function (delta, player) {
				player.bePushed(this);

				if (this.slippery) player.slide = player.slideMax / 8;
			};
		},

		hill: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.slant = e[0];

			this.solid = true;

			this.update = function (delta, player) {
				var rx = 0;

				if (this.slant == 'r') rx = player.x + player.w - this.x;
				if (this.slant == 'l') rx = this.x + this.w - player.x;

				if (rx > this.h) rx = this.h;

				if (this.y + this.h - player.y - player.h < rx) {
					player.y = this.y + this.h - rx - player.h;

					player.canJump = true;
					player.vy = 0;
				}
			};
		},

		lava: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (!player.underLava) {
					player.underLava = true;

					player.speed = player.speedMax / 4;
					player.vert = player.vertMax / 2;

					if (player.vy > 1) player.vy = 1;
				}
			};
		},

		water: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (!player.underWater) {
					player.underWater = true;

					player.speed = player.speedMax / 2;
					player.vert = player.vertMax / 2;

					player.buoy = blu.keyboard.pressed(interact)?0.35:-0.3;
				}
			};
		},

		decoration: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				
			};
		},

		openDoor: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.px = e[0];
			this.py = e[1];

			this.h = e[2];

			var d = 2;

			this.update = function (delta, player) {
				if (state == 'blackout' && this.opening) {
					skins.blackout[1] += d * delta;

					if (skins.blackout[1] <= 0) {
						skins.blackout[1] = 0;

						state = 'play';
					}

					if (skins.blackout[1] >= 1) {
						skins.blackout[1] = 1;
						d = -2;

						if (false) {
							h = game.assets[this.h];
							h.ref = this.h;
							h.reset();
						}

						player.ex = this.px;
						player.ey = this.py;

						player.x = player.ex;
						player.y = player.ey;

						player.vx = 0;
						player.vy = 0;
					}
				} else if (blu.keyboard.pressed(interact)) {
					this.opening = true;

					state = 'blackout';
					d = 2;

						player.ex = this.px;
						player.ey = this.py;

						player.x = player.ex;
						player.y = player.ey;

						player.vx = 0;
						player.vy = 0;
				}
			};
		},

		lockedDoor: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.h = e[0];

			this.px = e[1];
			this.py = e[2];

			var d = 2;

			this.update = function (delta, player) {
				if (state == 'blackout' && this.opening) {
					skins.blackout[1] += d * delta;

					if (skins.blackout[1] <= 0) {
						skins.blackout[1] = 0;

						state = 'play';
					}

					if (skins.blackout[1] >= 1) {
						skins.blackout[1] = 1;
						d = -Math.abs(d);

						if (this.h != h) {
							h = game.assets[this.h];
							h.ref = this.h;
							h.reset();
						}

						player.ex = this.px;
						player.ey = this.py;

						player.x = player.ex;
						player.y = player.ey;

						player.vx = 0;
						player.vy = 0;
					}
				} else if (blu.keyboard.pressed(interact) && player.keys > 0 && this.h) {
					this.opening = true;

					state = 'blackout';
					d = 2;

					player.keys --;
				}
			};
		},

		ladder: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (Math.abs((player.x + player.w / 2) - (this.x + this.w / 2)) <= 20) {
					player.canJump = false;
					player.bouy = 0;
					player.vy = 0;

					if (blu.keyboard.pressed(up)) player.vy = -player.speed;
					if (blu.keyboard.pressed(down)) player.vy = player.speed;
				}
			};
		},

		vertRope: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (Math.abs((player.x + player.w / 2) - (this.x + this.w) / 2) <= 10) {
					player.canJump = false;
					player.buoy = 0;
					player.vy = 0;

					if (blu.keyboard.pressed(up)) player.vy = -player.speed * delta;
					if (blu.keyboard.pressed(down)) player.vy = player.speed * delta;
				}
			};
		},

		sign: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.text = 'Hai';

			this.reading = false;

			this.update = function (delta, player) {
				if (blu.keyboard.firstPress(interact)) this.reading = !this.reading;
				player.dialogue = this.reading?this.text:false;
			};
		},

		coinBlock: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.bx = m[4];
			this.by = m[5];

			this.cx = this.bx;
			this.cy = this.by;

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.alive = true;

			this.solid = true;

			this.update = function (delta, player) {
				if (player.bePushed(this) == 't' && this.alive) {
					this.alive = false;

					this.cx = this.bx + h.cellSize;

					player.coins ++;
				}
			};
		},

		boomBlock: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				player.vx = 2000;
				player.dx = player.collides(this) == 'r'?-1:1;

				console.log(player.vx, player.dx);

				return null;
			};
		},

		powerBlock: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				if (player.collides(this) == 't') {
					
				}
			};
		},

		keyBlock: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				var side = player.bePushed(this);

				if ((side == 'r' || side == 'l') && player.keys > 0) {
					player.keys --;

					return null;
				}
			};
		},

		dropBlock: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];

			this.ey = m[1];
			this.y = this.ey;

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			var spaz = 0;
			var d = 100;

			this.lifeMax = 2;
			this.life = this.lifeMax;

			this.update = function (delta, player) {
				if (player.bePushed(this) == 'b') {
					spaz += d * delta;

					if (spaz >= 2 || spaz <= -2) {
						d *= -1;

						spaz = spaz >= 2?2:-2;
					}

					this.y = this.ey + spaz;

					this.life -= delta;
					if (this.life <= 0) return null;
				}
			};
		},

		pushPad: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				
			};
		},

		springPad: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				if (player.bePushed(this) == 'b') player.vy = -Math.sqrt(2 * 3 * gravity * player.vert);
			};
		},

		lever: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra

			this.update = function (delta, player) {
				
			};
		},

		chain: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				
			};
		},

		weight: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.solid = true;

			this.update = function (delta, player) {
				
			};
		},

		checkPoint: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.bx = m[4];
			this.by = m[5];

			this.cx = this.bx;
			this.cy = this.by;

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				this.cx = this.bx + h.cellSize;

				player.ex = this.x;
				player.ey = this.y + this.h - player.h;
			};
		},

		spikes: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (player.collides(this)) {
					state = 'gameOver';
				}
			};
		},

		key: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (player.collides(this)) {
					player.keys ++;

					return null;
				}
			};
		},

		gem: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (player.collides(this)) {
					return null;
				}
			};
		},

		coin: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.worth = e[0];

			this.update = function (delta, player) {
				if (player.collides(this)) {
					player.coins += this.worth;

					return null;
				}
			};
		},

		power: function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.x = m[0];
			this.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			//extra
			this.type = e[0];

			this.update = function (delta, player) {
				
			};
		}
	};

	var save = function (source) {
		//core
		this.save = function () {
			this.saving = true;

			localStorage.setItem(source, JSON.stringify({
				name: this.data.name,
				isNew: false,

				map: theMap.ref,

				x: xavier.ex,
				y: xavier.ey,

				healthMax: xavier.healthMax,
				health: xavier.health,

				breathMax: xavier.breathMax,
				breath: xavier.breath,

				coinMax: xavier.coinMax,
				coins: xavier.coins,

				keyMax: xavier.keyMax,
				keys: xavier.keys,

				bombMax: xavier.bombMax,
				bombs: xavier.bombs,

				arrowMax: xavier.arrowMax,
				arrows: xavier.arrows,

				inventory: {
					sword: xavier.inventory.sword.type,
					shield: xavier.inventory.shield.type,

					hookShot: xavier.inventory.hookShot.type,
					parachute: xavier.inventory.parachute.type,
					flamethrower: xavier.inventory.flamethrower.type,
					emberSuit: xavier.inventory.emberSuit.type,
					scubaSuit: xavier.inventory.scubaSuit.type,
					bow: xavier.inventory.bow.type,
					bombBag: xavier.inventory.bombBag.type,
					hammer: xavier.inventory.hammer.type,

					shovel: xavier.inventory.shovel.type,
					pickaxe: xavier.inventory.pickaxe.type,
					glasses: xavier.inventory.glasses.type,
					jetBoots: xavier.inventory.jetBoots.type,
					telephone: xavier.inventory.telephone.type
				}
			}));

			this.saving = false;
		};

		this.load = function () {
			xavier = new player(this.data);
			theMap = maps[this.data.map];
			theMap.ref = this.data.map;

			if (this.data.isNew) {
				var name = prompt('New File Name:', 'New File');

				if (name === null) return;

				this.data.name = name;

				this.data.isNew = false;
				this.save();
			}

			state = 'play';
		};

		//extra
		var data = localStorage.getItem(source);

		this.data = data !== null?JSON.parse(data):{
			name: 'New File',
			isNew: true,

			healthMax: 3,
			health: 3,

			breathMax: 5,
			breath: 5,

			coinMax: 99,
			coins: 0,

			keyMax: 3,
			keys: 0,

			bombMax: 0,
			bombs: 0,

			arrowMax: 0,
			arrows: 0,

			map: 'xavia',

			x: 0,
			y: 0,

			inventory: {
				sword: 'wood',
				shield: 'wood',

				hookShot: null,
				parachute: null,
				flamethrower: null,
				emberSuit: null,
				scubaSuit: null,
				bow: null,
				bombBag: null,
				hammer: null,

				shovel: null,
				pickaxe: null,
				glasses: null,
				jetBoots: null,
				telephone: null
			}
		};
	};

	/****************** Sugars ******************/

	var def = function () {
		for (var i in arguments) if (typeof arguments[i] !== 'undefined') return arguments[i];
	};

	/****************** Canvas ******************/

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	canvas.x = 0;
	canvas.y = 0;

	/****************** UI ******************/

	var button = function (text, x, y, style) {
		this.text = text;

		this.x = x;
		this.y = y;

		this.bw = style.w || 0;
		this.bh = style.h || 0;

		this.bBackground = style.background || 'transparent';
		this.bBorder = style.border || 'transparent';
		this.bColor = style.color || 'transparent';

		this.bBorderThickness = style.borderThickness || 0;

		this.hover = style.hover;

		this.update = function (action) {
			this.action = action;

			if (blu.mouse.overRect(this.x, this.y, this.w, this.h)) {
				if (blu.mouse.pressed) {
					this.action();
				} else {
					this.hover();
				}
			} else {
				this.w = this.bw;
				this.h = this.bh;

				this.background = this.bBackground;
				this.border = this.bBorder;
				this.color = this.bColor;

				this.borderThickness = this.bBorderThickness;
			}
		};

		this.draw = function () {
			ctx.fillStyle = this.border;
			ctx.fillRect(this.x, this.y, this.w, this.h);

			ctx.fillStyle = this.background;
			ctx.fillRect(this.x + this.borderThickness, this.y + this.borderThickness, this.w - this.borderThickness * 2, this.h - this.borderThickness * 2);

			ctx.font = '20px helvetica';
			ctx.fillStyle = this.color;
			ctx.fillText(this.text, this.x + (this.w - ctx.measureText(this.text).width) / 2, this.y + (this.h - 20) / 2);
		};
	};

	var saveStyle = {
		w: 238,
		h: 75,

		background: '#1abc9c', 
		color: '#fff',

		hover: function () {
			this.background = '#1fd1ae';
		}
	};

	var goStyle = {
		w: 350,
		h: 75,

		background: '#1abc9c', 
		color: '#fff',

		hover: function () {
			this.background = '#1fd1ae';
		}
	};

	var pauseStyle = {
		w: canvas.width / 2,
		h: 75,

		background: '#f1c40f',
		color: '#fff',

		hover: function () {
			this.background = '#f39c12';
		}
	};

	var save1Button = new button('File 1', (canvas.width - 750) / 2 + (238 + 18) * 0, 350, saveStyle);
	var save2Button = new button('File 2', (canvas.width - 750) / 2 + (238 + 18) * 1, 350, saveStyle);
	var save3Button = new button('File 3', (canvas.width - 750) / 2 + (238 + 18) * 2, 350, saveStyle);

	var continueButton = new button('Continue', (canvas.width - 750) / 2 + (350 + 25) * 0, 350, goStyle);
	var giveupButton = new button('Give Up', (canvas.width - 750) / 2 + (350 + 25) * 1, 350, goStyle);

	var saveButton = new button('Save', 0, 0, pauseStyle);
	var quitButton = new button('Quit', canvas.width / 2, 0, pauseStyle);

	/****************** Input ******************/

	var pause = 27;

	var interact = 13;
	var jump = 32;
	var use = 18;
	var run = 16;

	var right = 39;
	var left = 37;
	var up = 38;
	var down = 40;

	var slotKeys = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48];

	blu.mouse.target = canvas;

	/****************** Core ******************/

	var state = 'title';

	var internalClock = 0;
	var clockSpeed = 1;

	var cycles = 0;
	var period = 0;
	var fps = '';

	var sky = [
		['#fff', 0],
		['#fff', 0],
		['#fff', 0],
		['#fff', 0],
		['#ec6', 0.1],
		['#ec6', 0.1],
		['#db6', 0.1],
		['#db6', 0.1],
		['#db6', 0.2],
		['#db6', 0.2],
		['#eb5', 0.25],
		['#eb5', 0.25],
		['#da4', 0.3],
		['#da4', 0.3],
		['#66c', 0.3],
		['#66c', 0.3],
		['#f72', 0.2],
		['#f72', 0.2],
		['#caf', 0.15],
		['#caf', 0.15],
		['#caf', 0.1],
		['#caf', 0.1],
		['#fff', 0],
		['#fff', 0]
	];

	var skins = {
		water: ['#2980b9', 0],
		lava: ['#c0392b', 0],
		sky: [],
		blackout: ['#000', 0]
	};

	var gravity = 2000;

	var maps = {
		xavia : new Map(game.assets.xavia)
	};

	var xavier;
	var theMap;

	var save1 = new save('xavee/1');
	var save2 = new save('xavee/2');
	var save3 = new save('xavee/3');

	/****************** Init ******************/

	//save names
	save1Button.text = save1.data.name;
	save2Button.text = save2.data.name;
	save3Button.text = save3.data.name;

	//skip title
	save1.load();

	//start the loop
	game.start();
});