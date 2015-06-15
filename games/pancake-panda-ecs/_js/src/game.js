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

// ::::::::::::::::::::::::: Main ::::::::::::::::::::::::: //

var game = new blu.Node(['Game', 'Audio', 'CanvasGraphics', 'Debug'])
	.setStage(document.getElementById('canvas'))
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

		// world
		ambient : '_audio/ambient.mp3',
		bg : '_images/bg.png',
		stack : '_images/stack.png'
	});

// ::::::::::::::::::::::::: Drown ::::::::::::::::::::::::: //

blu.define('Bubble', {
	init : function () {
		// requirements
		this.require(['Geometry', 'Sprite']);

		// properties
		this.setSize(expoRandom(3, 120))
			.setSpine(random(this.parent.left(), this.parent.right()))
			.setWaist(random(this.parent.top(), this.parent.bottom()) + this.parent.waist())
			.setSprite(game.assets.bubble);

		this.speed = Math.sqrt(this.size.x / 2) * 120;

		// behaviour
		this.on('update', function (delta) {
			// move up
			this.pos.y -= this.speed * delta;
		});
	}
});

blu.define('DrownBG', {
	init : function () {
		// requirements
		this.require(['Color']);

		// properties
		this.cover(this.parent)
			.setColor('rgba(243, 156, 18, 0.75)');
	}
});

blu.define('DrownAnimation', {
	init : function () {
		// requirements
		this.require(['Scene']);

		// misc
		game.playSFX(game.assets.bubbleSound);

		// properties
		this.cover(this.parent);

		// entities
		this.parent.clear();

		this.make(['DrownBG']);

		this.every(0.05, function () {
			this.make(['Bubble']);
		});

		this.wait(3, function () {
			game.make(['GameOver']);
		});
	}
});

// ::::::::::::::::::::::::: Squish ::::::::::::::::::::::::: //

blu.define('BloodSpatter', {
	init : function () {
		// requirements
		this.require(['Sprite']);

		// properties
		this.setWidth(950)
			.setHeight(600)
			.setCenterX(this.parent.spine())
			.setCenterY(this.parent.waist())
			.setSprite(game.assets.blood);
	}
});

blu.define('SquishAnimation', {
	init : function () {
		// requirements
		this.require(['Scene']);

		// misc
		game.playSFX(game.assets.squirtSound);

		// properties
		this.cover(this.parent);

		// entities
		this.parent.clear();

		this.make(['Blood']);

		this.wait(2, function () {
			game.make(['GameOver']);
		});
	}
});

// ::::::::::::::::::::::::: Game Over ::::::::::::::::::::::::: //

blu.define('GameOverText', {
	init : function () {
		// requirements
		this.require(['Sprite']);

		// properties
		this.setWidth(750)
			.setHeight(150)
			.setSpine(this.parent.spine())
			.setTop(50)
			.setSprite(game.assets.gameOver);
	}
});

blu.define('RestartText', {
	init : function () {
		// requirements
		this.require(['Sprite']);

		// properties
		this.setWidth(250)
			.setHeight(30)
			.setSpine(this.parent.spine())
			.setBottom(this.parent.bottom() - 100)
			.setSprite(game.assets.restart);
	}
});

blu.define('GameOverBG', {
	init : function () {
		// requirements
		this.require(['Color']);

		// properties
		this.setColor('#222')
			.cover(this.parent);
	}
});

blu.define('GameOver', {
	init : function () {
		// requirements
		this.require(['Scene']);

		// misc
		game.changeMusic(game.assets.sad, 0.5);

		// properties
		this.cover(this.parent);

		// entities
		this.parent.clear();

		this.make(['GameOverBG']);
		this.make(['GameOverText']);
		this.make(['RestartText']);

		// behaviour
		this.on('update', function (delta) {
			if (blu.input.keyboard.pressed(13)) game.make(['World']);
		});
	}
});

// ::::::::::::::::::::::::: World ::::::::::::::::::::::::: //

blu.define('Stack', {
	init : function () {
		// requirements
		this.require(['Sprite', 'Physical']);

		// properties
		this.setWidth(160)
			.setHeight(140)
			.setLeft(round(random(this.parent.left(), this.parent.right() - this.size.x, 40), this.size.x / 4))
			.setBottom(this.parent.top())
			.setSprite(game.assets.stack)
			.setPhysical({
				mass : 20,
				drag : 1,
				bounce : 0
			});

		// behaviour
		this.on('update', function (delta) {
			// this.pos.y += 250 * delta;
		});

		this.on('collision', function (collision) {
			this.pos.subtract(collision);
		});
	}
});

blu.define('Stage', {
	init : function () {
		// requirements
		this.require(['Color', 'Physical']);

		// properties
		this.setWidth(this.parent.size.x)
			.setHeight(150)
			.setBottom(this.parent.bottom())
			.setColor('rgba(0, 0, 0, 0.85)')
			.setPhysical({
				drag : 0.02,
				dynamic : false
			});
	}
});

blu.define('Syrup', {
	init : function () {
		// requirements
		this.require(['Color']);

		// properties
		this.setWidth(this.parent.size.x)
			.setBottom(this.parent.bottom())
			.setColor('rgba(243, 156, 18, 0.7)');

		// behaviour
		this.on('update', function (delta) {
			// rise up
			this.setHeightBottom(this.size.y + 35 * delta);
		});
	}
});

blu.define('Panda', {
	init : function () {
		window.panda = this;

		// requirements
		this.require(['Controls', 'Physical', 'Color']);

		// properties
		this.setWidth(70)
			.setHeight(60)
			.setTop(this.parent.top())
			.setSpine(this.parent.spine())
			.setColor('#fff')
			.setPhysical({
				mass : 10,
				drag : 0.02
			})
			.setControls({
				left : 37,
				right : 39,

				jump : 32
			});

		// behaviour
		this.highscore = localStorage.getItem('pnkpd/highscore');

		this.on('collision', function (collision) {
			this.pos.subtract(collision);
		});
	}
});

blu.define('WorldBG', {
	init : function () {
		// requirements
		this.require(['Sprite']);

		// properties
		this.setSprite(game.assets.bg)
			.cover(this.parent);
	}
});

blu.define('World', {
	init : function () {
		// requirements
		this.require(['Scene', 'Physics']);

		// properties
		this.cover(this.parent)
			.setPhysics({
				gravity : 300,

				airDensity : 0.01
			});

		// misc
		game.changeMusic(game.assets.ambient, 1);

		// entities
		this.parent.clear();

		this.make(['WorldBG']);
		this.make(['Panda']);
		this.make(['Syrup']);
		this.make(['Stage']);

		this.every(1, function (delta) {
			this.make(['Stack']);
		});
	}
});

// ::::::::::::::::::::::::: Build ::::::::::::::::::::::::: //

game.on('load', function () {
	this.make(['World']);

	this.start();
});

// ::::::::::::::::::::::::: K, All Done ::::::::::::::::::::::::: //