/*
	Xavier's Adventure v0.0.0
	By Matt Regehr
*/

'use strict';

(function () {
	// ::::::::::::::::::::::::: Helpers ::::::::::::::::::::::::: //

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

	var Button = function (text, x, y, width, height style) {
		Entity.call(this);

		this.text = text;

		this.pos.x = x;
		this.pos.y = y;

		this.bw = style.w || 0;
		this.bh = style.h || 0;

		this.bBackground = style.background || 'transparent';
		this.bBorder = style.border || 'transparent';
		this.bColor = style.color || 'transparent';

		this.bBorderThickness = style.borderThickness || 0;

		this.hover = style.hover;
	};

	Button.prototype = combine(Entity.prototype, {
		update : function (action) {
			this.action = action;

			if (blu.mouse.overRect(this.pos.x, this.pos.y, this.w, this.h)) {
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
		},

		draw : function () {
			ctx.fillStyle = this.border;
			ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);

			ctx.fillStyle = this.background;
			ctx.fillRect(this.pos.x + this.borderThickness, this.pos.y + this.borderThickness, this.w - this.borderThickness * 2, this.h - this.borderThickness * 2);

			ctx.font = '20px helvetica';
			ctx.fillStyle = this.color;
			ctx.fillText(this.text, this.pos.x + (this.w - ctx.measureText(this.text).width) / 2, this.pos.y + (this.h - 20) / 2);
		}
	});

	var Save = function (data) {
		this.data = data || {
			name : 'New File',
			isNew : true,

			healthMax : 3,
			health : 3,

			breathMax : 5,
			breath : 5,

			coinMax : 99,
			coins : 0,

			keyMax : 3,
			keys : 0,

			bombMax : 0,
			bombs : 0,

			arrowMax : 0,
			arrows : 0,

			map : 'xavia',

			x : 0,
			y : 0,

			inventory : {
				sword : 'wood',
				shield : 'wood',

				hookShot : null,
				parachute : null,
				flamethrower : null,
				emberSuit : null,
				scubaSuit : null,
				bow : null,
				bombBag : null,
				hammer : null,

				shovel : null,
				pickaxe : null,
				glasses : null,
				jetBoots : null,
				telephone : null
			}
		};
	};

	Save.prototype = {
		save : function () {
			this.saving = true;

			localStorage.setItem(source, JSON.stringify({
				name : this.data.name,
				isNew : false,

				map : theMap.ref,

				x : xavier.ex,
				y : xavier.ey,

				healthMax : xavier.healthMax,
				health : xavier.health,

				breathMax : xavier.breathMax,
				breath : xavier.breath,

				coinMax : xavier.coinMax,
				coins : xavier.coins,

				keyMax : xavier.keyMax,
				keys : xavier.keys,

				bombMax : xavier.bombMax,
				bombs : xavier.bombs,

				arrowMax : xavier.arrowMax,
				arrows : xavier.arrows,

				inventory : {
					sword : xavier.inventory.sword.type,
					shield : xavier.inventory.shield.type,

					hookShot : xavier.inventory.hookShot.type,
					parachute : xavier.inventory.parachute.type,
					flamethrower : xavier.inventory.flamethrower.type,
					emberSuit : xavier.inventory.emberSuit.type,
					scubaSuit : xavier.inventory.scubaSuit.type,
					bow : xavier.inventory.bow.type,
					bombBag : xavier.inventory.bombBag.type,
					hammer : xavier.inventory.hammer.type,

					shovel : xavier.inventory.shovel.type,
					pickaxe : xavier.inventory.pickaxe.type,
					glasses : xavier.inventory.glasses.type,
					jetBoots : xavier.inventory.jetBoots.type,
					telephone : xavier.inventory.telephone.type
				}
			}));

			this.saving = false;
		},

		load : function () {
			xavier = new Player(this.data);
			theMap = maps[this.data.map];
			theMap.ref = this.data.map;

			if (this.data.isNew) {
				var name = prompt('New File Name :', 'New File');

				if (name === null) return;

				this.data.name = name;

				this.data.isNew = false;
				this.save();
			}

			state = 'play';
		}
	};

	// ::::::::::::::::::::::::: Static ::::::::::::::::::::::::: //

	var WIDTH = document.body.clientWidth;
	var HEIGHT = document.body.clientHeight;

	var GRAVITY = 2000;

	var PAUSE = 27;

	// ::::::::::::::::::::::::: Canvas ::::::::::::::::::::::::: //

	var canvas = document.getElementById('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	blu.mouse.target = canvas;

	var ctx = canvas.getContext('2d');
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	// ::::::::::::::::::::::::: Title ::::::::::::::::::::::::: //

	var Title = function () {
		State.call(this);

		var saveStyle = {
			background : '#1abc9c', 
			color : '#fff',

			hover : function () {
				this.background = '#1fd1ae';
			}
		};

		this.file1 = new Button(s
			ave1.data.name, (canvas.width - 750) / 2 + (238 + 18) * 0, 350, 238, 75, saveStyle);
		this.file2 = new Button(save2.data.name, (canvas.width - 750) / 2 + (238 + 18) * 1, 350, 238, 75, saveStyle);
		this.file3 = new Button(save3.data.name, (canvas.width - 750) / 2 + (238 + 18) * 2, 350, 238, 75, saveStyle);

		save1.load();
	};

	Title.prototype = combine(State.prototype, {
		update : function (delta) {
			save1Button.update(function () {
				save1.load();
			});

			save2Button.update(function () {
				save2.load();
			});

			save3Button.update(function () {
				save3.load();
			});
		},

		draw : function () {
			ctx.drawImage(game.assets.titleBG, 0, 0, canvas.width, canvas.height);

			ctx.drawImage(game.assets.title, (canvas.width - 750) / 2, 125, 750, 100);

			save1Button.draw();
			save2Button.draw();
			save3Button.draw();
		}
	});

	// ::::::::::::::::::::::::: Play ::::::::::::::::::::::::: //

	// 2D, orthoganal grid map
	var Map = function (map) {
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

	Map.tiles = {
		crate : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.collides = function (thing) {
				//not colliding
				if (!(thing.x <= this.pos.x + this.w && this.pos.x <= thing.x + thing.w && thing.y <= this.pos.y + this.h && this.pos.y <= thing.y + thing.h)) return false;
					
				//get info about collision box
				var x = Math.max(this.pos.x, thing.x);
				var y = Math.max(this.pos.y, thing.y);

				var w = Math.min(this.pos.x + this.w, thing.x + thing.w) - x;
				var h = Math.min(this.pos.y + this.h, thing.y + thing.h) - y;

				//return collision data relative to this
				if (h >= w && x == this.pos.x) return 'l';
				if (h >= w && x == thing.x) return 'r';

				if (w >= h && y == this.pos.y) return 't';
				if (w >= h && y == thing.y) return 'b';
			};

			this.bePushed = function (thing) {
				var c = this.collides(thing);

				if (c == 'r') this.pos.x = thing.x - this.w;
				if (c == 'l') this.pos.x = thing.x + thing.w;

				if (c == 't') {
					this.pos.y = thing.y + thing.h;

					if (this.vy < 0) this.vy = 0;
				}

				if (c == 'b') {
					this.pos.y = thing.y - this.h;

					this.canJump = true;
					if (this.vy > 0) this.vy = 0;
				}

				return c;
			};

			this.update = function (delta, player) {
				this.bePushed(player);
			};
		},

		solid : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		hill : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

				if (this.slant == 'r') rx = player.x + player.w - this.pos.x;
				if (this.slant == 'l') rx = this.pos.x + this.w - player.x;

				if (rx > this.h) rx = this.h;

				if (this.pos.y + this.h - player.y - player.h < rx) {
					player.y = this.pos.y + this.h - rx - player.h;

					player.canJump = true;
					player.vy = 0;
				}
			};
		},

		lava : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		water : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

					player.buoy = blu.keyboard.pressed(interact) ? 0.35 : -0.3;
				}
			};
		},

		decoration : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				
			};
		},

		openDoor : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		lockedDoor : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		ladder : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (Math.abs((player.x + player.w / 2) - (this.pos.x + this.w / 2)) <= 20) {
					player.canJump = false;
					player.bouy = 0;
					player.vy = 0;

					if (blu.keyboard.pressed(up)) player.vy = -player.speed;
					if (blu.keyboard.pressed(down)) player.vy = player.speed;
				}
			};
		},

		vertRope : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

			this.w = m[2];
			this.h = m[3];

			this.cx = m[4];
			this.cy = m[5];

			this.cw = m[6];
			this.ch = m[7];

			this.update = function (delta, player) {
				if (Math.abs((player.x + player.w / 2) - (this.pos.x + this.w) / 2) <= 10) {
					player.canJump = false;
					player.buoy = 0;
					player.vy = 0;

					if (blu.keyboard.pressed(up)) player.vy = -player.speed * delta;
					if (blu.keyboard.pressed(down)) player.vy = player.speed * delta;
				}
			};
		},

		sign : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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
				player.dialogue = this.reading ? this.text : false;
			};
		},

		coinBlock : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		boomBlock : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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
				player.dx = player.collides(this) == 'r' ? -1 : 1;

				console.log(player.vx, player.dx);

				return null;
			};
		},

		powerBlock : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		keyBlock : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		dropBlock : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];

			this.ey = m[1];
			this.pos.y = this.ey;

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

						spaz = spaz >= 2 ? 2 : -2;
					}

					this.pos.y = this.ey + spaz;

					this.life -= delta;
					if (this.life <= 0) return null;
				}
			};
		},

		pushPad : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		springPad : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		lever : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		chain : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		weight : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		checkPoint : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

				player.ex = this.pos.x;
				player.ey = this.pos.y + this.h - player.h;
			};
		},

		spikes : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		key : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		gem : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		coin : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

		power : function (m, e, h) {
			//model
			this.rx = Math.floor(m[0] / h.tileSize);
			this.ry = Math.floor(m[1] / h.tileSize);

			this.pos.x = m[0];
			this.pos.y = m[1];

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

	Map.prototype = {
		update : function (delta, player) {
			for (var x = Math.max(0, Math.floor((player.x - 1) / this.tileSize)), mx = Math.min(this.rw, Math.ceil((player.x + player.w + 1) / this.tileSize)); x < mx; x ++) {
				for (var y = Math.max(0, Math.floor((player.y - 1) / this.tileSize)), my = Math.min(this.rh, Math.ceil((player.y + player.h + 1) / this.tileSize)); y < my; y ++) {
					if (this.tiles[x][y] !== null) {
						var c = this.tiles[x][y].update(delta, player);

						if (typeof c !== 'undefined') this.tiles[x][y] = c;
					}
				}
			}
		},

		draw : function (delta) {
			for (var x = Math.floor(canvas.x / this.tileSize), mx = Math.ceil((canvas.x + canvas.width) / this.tileSize); x < mx; x ++) {
				for (var y = Math.floor(canvas.y / this.tileSize), my = Math.ceil((canvas.y + canvas.height) / this.tileSize); y < my; y ++) {
					if (this.tiles[x][y] !== null) {
						var c = this.tiles[x][y];

						ctx.drawImage(game.assets.tiles, c.cx, c.cy, c.cw, c.ch, c.x - canvas.x, c.y - canvas.y, c.w, c.h);
					}
				}
			}
		},

		reset : function () {
			var newTiles = [];

			for (var x in this.raw) {
				newTiles.push([]);

				for (var y in this.raw[x]) {
					var c = this.raw[x][y];

					newTiles[x].push(c !== null ? new tiles[c.t](c.m, c.e, this) : null);
				}
			}

			this.tiles = newTiles;
		}
	};

	// Controllable player character
	var Player = function (data) {
		Player.call(this);

		//model
		this.pos.x = this.ex = data.x;
		this.pos.y = this.ey = data.y;

		this.w = 50;
		this.h = 50;

		this.cx = this.bx = 0;
		this.cy = this.by = 72;

		this.animation = {
			point : 0,

			start : 0,
			end : 4,

			speed : 20,

			update : function (delta, animate) {
				this.point += this.speed * delta;
				this.point %= this.end - this.start;

				if (!animate) this.point = 0;

				return Math.floor(this.point) + this.start;
			}
		};

		this.controls = {
			interact : 13,
			jump : 32,
			use : 18,
			run : 16,

			right : 39,
			left : 37,
			up : 38,
			down : 40,

			slotKeys : [49, 50, 51, 52, 53, 54, 55, 56, 57, 48]
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
			sword : new items.sword(data.sword),
			shield : new items.shield(data.shield),

			hookShot : new items.hookShot(data.hookShot),
			parachute : new items.parachute(data.parachute),
			flamethrower : new items.flamethrower(data.flamethrower),
			bow : new items.bow(data.bow),
			bombBag : new items.bombBag(data.bombBag),
			hammer : new items.hammer(data.hammer),
			scubaSuit : new items.scubaSuit(data.scubaSuit),
			emberSuit : new items.emberSuit(data.emberSuit),

			shovel : new items.shovel(data.shovel),
			pickaxe : new items.pickaxe(data.pickaxe),
			glasses : new items.glasses(data.glasses),
			jetBoots : new items.jetBoots(data.jetBoots),
			telephone : new items.telephone(data.telephone)
		};
	};

	Player.items = {
		sword : function (type) {
			//display
			this.cw = 70;
			this.ch = 15;

			this.w = 70;
			this.h = 15;

			this.bx = 0;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.pos.x = 0;
			this.pos.y = 0;

			//extra
			var delta = 0;
			this.speed = 100;

			this.type = type;

			this.update = function (delta, player) {
				//movement
				this.pos.y = player.y + (player.h - this.h) / 2;
				this.pos.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2 + player.dx * delta;

				//sprite
				this.cx = this.bx;
				this.cy = this.by + (player.dx + 1) * 17 / 2;
			};
		},

		shield : function (type) {
			//display
			this.cw = 40;
			this.ch = 40;

			this.w = 40;
			this.h = 40;

			this.cx = 288;
			this.cy = 0;

			this.pos.x = 0;
			this.pos.y = 0;

			//extra
			this.type = type;

			this.update = function (delta, player) {
				//movement
				this.pos.y = player.y + (player.h - this.h) / 2;
				this.pos.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2;
			};
		},

		hookShot : function (type) {
			//display
			this.cw = 10;
			this.ch = 10;

			this.w = 20;
			this.h = 20;

			this.bx = 360;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.pos.x = 0;
			this.pos.y = 0;

			//extra
			this.type = type;

			this.update = function (delta, player) {
				//movement
				delta += this.speed * delta;
				delta %= 350;

				this.pos.y = player.y + (player.h - this.h) / 2;
				this.pos.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2 + player.dx * delta;

				//sprites
				this.cx = this.bx + (player.dx + 1) * 17 / 2;
				this.cy = this.by;
			};
		},

		parachute : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		flamethrower : function (type) {
			this.type = type;

			this.update = function (delta, player) {
				
			};
		},

		bow : function (type) {
			//display
			this.cw = 20;
			this.ch = 70;

			this.w = 20;
			this.h = 70;

			this.bx = 72;
			this.by = 0;

			this.cx = this.bx;
			this.cy = this.by;

			this.pos.x = 0;
			this.pos.y = 0;

			//extra
			this.type = type;

			var delta = 0;

			this.update = function (delta, player) {
				this.cx = this.bx + (player.dx + 1) * 22 / 2;
				this.cy = this.by;

				delta += delta;

				//if (delta >= 0.1) 

				delta %= 0.1;

				this.pos.y = player.y + (player.h - this.h) / 2;
				this.pos.x = player.x - this.w / 2 + player.w * (player.dx + 1) / 2;
			};
		},

		bombBag : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		hammer : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		scubaSuit : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		emberSuit : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		shovel : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		pickaxe : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		glasses : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		jetBoots : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		},

		telephone : function (type) {
			this.type = type;

			this.update = function (delta, player) {

			};
		}
	};

	Player.prototype = combine(Entity.prototype, {
		update : function (delta) {
			//movement
			if (this.gravity) this.vy += this.buoy * gravity * delta;
			if (blu.keyboard.pressed(jump) && this.canJump) this.vy = -Math.sqrt(2 * gravity * this.vert);
			if (this.vy > this.vCap) this.vy = this.vCap;
			if (this.vy < -this.vCap) this.vy = -this.vCap;

			this.pos.y += this.vy * delta;

			if (blu.keyboard.pressed(run)) this.speed *= 2;

			if (blu.keyboard.pressed(right) || blu.keyboard.pressed(left)) {
				this.vx += this.speed;

				if (this.vx > this.speed) this.vx = this.speed;
			}

			if (this.vx < 0) this.vx = 0;

			if (blu.keyboard.pressed(right)) this.dx = 1;
			if (blu.keyboard.pressed(left)) this.dx = -1;

			this.pos.x += this.vx * this.dx * delta;

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
			if (this.pos.x < 0) this.pos.x = 0;
			if (this.pos.x > theMap.w - this.w) this.pos.x = theMap.w - this.w;

			if (this.pos.y > theMap.h - this.h) {
				this.pos.y = theMap.h - this.h;

				this.canJump = true;
				this.vy = 0;
			}
		},

		draw : function () {
			//draw me
			ctx.drawImage(game.assets.players, this.cx, this.cy, this.cw, this.ch, math.round(this.pos.x) - canvas.x, math.round(this.pos.y) - canvas.y, this.w, this.h);

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
		},

		reset : function () {
			this.pos.x = this.ex;
			this.pos.y = this.ey;

			this.vx = 0;
			this.vy = 0;

			this.health = this.healthMax;
		},

		collides : function (thing) {
			//not colliding
			if (!(thing.x <= this.pos.x + this.w && this.pos.x <= thing.x + thing.w && thing.y <= this.pos.y + this.h && this.pos.y <= thing.y + thing.h)) return false;
				
			//collision box
			var x = Math.max(this.pos.x, thing.x);
			var y = Math.max(this.pos.y, thing.y);

			var w = Math.min(this.pos.x + this.w, thing.x + thing.w) - x;
			var h = Math.min(this.pos.y + this.h, thing.y + thing.h) - y;

			if (thing.solid) {
				var l = thing.rx - 1 >= 0 ? (theMap.tiles[thing.rx - 1][thing.ry]) : null; l = l === null || !l.solid;
				var r = thing.rx + 1 < theMap.rw ? (theMap.tiles[thing.rx + 1][thing.ry]) : null; r = r === null || !r.solid;

				var t = thing.ry - 1 >= 0 ? (theMap.tiles[thing.rx][thing.ry - 1]) : null; t = t === null || !t.solid;
				var b = thing.ry + 1 < theMap.rh ? (theMap.tiles[thing.rx][thing.ry + 1]) : null; b = b === null || !b.solid;
			} else {
				var l = true;
				var r = true;

				var t = true;
				var b = true;
			}

			//return resolve values
			if (h >= w && x == this.pos.x) return r?'l' : false;
			if (h >= w && x == thing.x) return l?'r' : false;

			if (w >= h && y == this.pos.y) return b?'t' : false;
			if (w >= h && y == thing.y) return t?'b' : false;
		},

		bePushed : function (thing) {
			var c = this.collides(thing);

			if (c == 'r') this.pos.x = thing.x - this.w;
			if (c == 'l') this.pos.x = thing.x + thing.w;

			if (c == 't') {
				this.pos.y = thing.y + thing.h;

				if (this.vy < 0) this.vy = 0;
			}

			if (c == 'b') {
				this.pos.y = thing.y - this.h;

				this.canJump = true;
				if (this.vy > 0) this.vy = 0;
			}

			return c;
		}
	});

	// Main, playable state
	var Play = function () {
		State.call(this);

		this.paused = false;

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
			water : ['#2980b9', 0],
			lava : ['#c0392b', 0],
			sky : [],
			blackout : ['#000', 0]
		};

		var maps = {
			xavia : new Map(game.assets.xavia)
		};

		var xavier;
		var theMap;

		var save1 = new Save(JSON.parse(localStorage.getItem('xavee/1')));
		var save2 = new Save(JSON.parse(localStorage.getItem('xavee/2')));
		var save3 = new Save(JSON.parse(localStorage.getItem('xavee/3')));

		var pauseStyle = {
			background : '#f1c40f',
			color : '#fff',

			hover : function () {
				this.background = '#f39c12';
			}
		};

		var saveButton = new Button('Save', 0, 0, canvas.width / 2, 75, pauseStyle);
		var quitButton = new Button('Quit', canvas.width / 2, 0, canvas.width / 2, 75, pauseStyle);
	};

	Play.prototype = combine(State.prototype, {
		update : function (delta) {
			if (this.paused) {
				saveButton.update(function () {

				});

				quitButton.update(function () {
					state = 'title';
				});
			}

			if (blu.keyboard.firstPress(pause)) {
				state = state === 'play' ? 'pause' ? state === 'pause' : 'play';
			}

			//clock
			internalClock += clockSpeed * delta;
			internalClock %= 24;

			//entities
			xavier.update(delta);
			theMap.update(delta, xavier);

			//focus
			canvas.x = math.round(xavier.x - (canvas.width - xavier.w) / 2);
			canvas.y = math.round(xavier.y - (canvas.height - xavier.h) / 2);

			if (canvas.x <= 0) canvas.x = 0;
			if (canvas.y <= 0) canvas.y = 0;
			if (canvas.x >= theMap.w - canvas.width) canvas.x = theMap.w - canvas.width;
			if (canvas.y >= theMap.h - canvas.height) canvas.y = theMap.h - canvas.height;
		},

		draw : function () {
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
			ctx.font = '18px calibri';
			ctx.fillStyle = '#000';
			ctx.fillText('FPS : ' + math.round(game.fps), 10, canvas.height - 25);

			if (this.paused) {
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
		}
	});

	// ::::::::::::::::::::::::: GameOver ::::::::::::::::::::::::: //

	var GameOver = function () {
		State.call(this);

		var goStyle = {
			background : '#1abc9c', 
			color : '#fff',

			hover : function () {
				this.background = '#1fd1ae';
			}
		};

		var continueButton = new Button('Continue', (canvas.width - 750) / 2 + (350 + 25) * 0, 350, 350, 75, goStyle);
		var giveupButton = new Button('Give Up', (canvas.width - 750) / 2 + (350 + 25) * 1, 350, 350, 75, goStyle);
	};

	GameOver.prototype = combine(State.prototype, {
		update : function (delta) {
			continueButton.update(function () {
				xavier.reset();
				theMap.reset();
				
				state = 'play';
			});

			giveupButton.update(function () {
				state = 'title';
			});
		},

		draw : function () {
			ctx.fillStyle = '#111';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.drawImage(game.assets.gameOver, (canvas.width - 750) / 2, 100, 750, 150);

			continueButton.draw();
			giveupButton.draw();
		}
	});

	// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

	var game = new Game()
		.loadAssets({
			titleBG : '_images/titleBG.jpg',
			dungeon : '_audio/dungeon.mp3',
			intense : '_audio/intense.mp3',
			holy : '_audio/holy.mp3',

			xavia : '_maps/xavia.json',
			bg : '_images/bg.jpg',
			hud : '_images/hud.png',
			title : '_images/title.png',
			gameOver : '_images/gameOver.png',

			tiles : '_images/tiles.png',
			players : '_images/players.png',
			items : '_images/items.png'
		})
		.then(function () {
			game.setState(new Title()).start();
		});

	// ::::::::::::::::::::::::: K, All Done ::::::::::::::::::::::::: //

	// **For testing purposes only
	// window.game = game;
}());