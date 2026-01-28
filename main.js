const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  zoom: 3,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);

let player;
let cursors;
let stepTimer = 0;
let audioCtx;

function preload() {}

function create() {
  // === FUNDO PIXEL ART ===
  const bg = this.add.graphics();
  bg.fillStyle(0x0b0b0b);
  bg.fillRect(0, 0, 320, 180);

  for (let i = 0; i < 80; i++) {
    bg.fillStyle(0x1a1a1a);
    bg.fillRect(
      Phaser.Math.Between(0, 320),
      Phaser.Math.Between(0, 180),
      2,
      2
    );
  }

  // === TEXTURA DO PLAYER (PIXEL ART GERADO) ===
  const g = this.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xffffff);
  g.fillRect(2, 0, 4, 4); // cabeça
  g.fillStyle(0xaaaaaa);
  g.fillRect(1, 4, 6, 6); // corpo
  g.generateTexture("player", 8, 10);

  // === PLAYER ===
  player = this.physics.add.sprite(160, 90, "player");
  player.setCollideWorldBounds(true);

  // === CONTROLES ===
  cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys("W,A,S,D");

  // === CÂMERA ===
  this.cameras.main.startFollow(player);
  this.cameras.main.setDeadzone(40, 40);

  // === AUDIO CONTEXT ===
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // === MUSICA AMBIENTE (GERADA) ===
  ambientSound();

  // === TEXTO DE INTRO ===
  const text = this.add.text(160, 10,
    "Cidade de Névoa",
    { fontSize: "8px", color: "#888" }
  ).setOrigin(0.5);

  this.time.delayedCall(3000, () => text.destroy());
}

function update(time) {
  const speed = 60;
  let moving = false;
  player.setVelocity(0);

  if (cursors.left.isDown || this.keys.A.isDown) {
    player.setVelocityX(-speed);
    moving = true;
  } else if (cursors.right.isDown || this.keys.D.isDown) {
    player.setVelocityX(speed);
    moving = true;
  }

  if (cursors.up.isDown || this.keys.W.isDown) {
    player.setVelocityY(-speed);
    moving = true;
  } else if (cursors.down.isDown || this.keys.S.isDown) {
    player.setVelocityY(speed);
    moving = true;
  }

  // === SOM DE PASSOS ===
  if (moving && time > stepTimer) {
    playStep();
    stepTimer = time + 300;
  }
}

// === SOM DE PASSO ===
function playStep() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 180;

  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

// === MUSICA AMBIENTE ===
function ambientSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 60;
  gain.gain.value = 0.02;

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();

  // variação lenta
  setInterval(() => {
    osc.frequency.value = 50 + Math.random() * 20;
  }, 2000);
}
