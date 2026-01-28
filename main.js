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
let controlEnabled = false;
let cutscene = true;

function preload() {}

function create() {
  // === FUNDO ===
  const bg = this.add.graphics();
  bg.fillStyle(0x0b0b0b);
  bg.fillRect(0, 0, 320, 180);
  for (let i = 0; i < 100; i++) {
    bg.fillStyle(0x1a1a1a);
    bg.fillRect(
      Phaser.Math.Between(0, 320),
      Phaser.Math.Between(0, 180),
      2,
      2
    );
  }

  // === PLAYER PIXEL ART ===
  const g = this.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xffffff);
  g.fillRect(2, 0, 4, 4); 
  g.fillStyle(0xaaaaaa);
  g.fillRect(1, 4, 6, 6); 
  g.generateTexture("player", 8, 10);

  player = this.physics.add.sprite(160, 140, "player");
  player.setCollideWorldBounds(true);

  // === CAMERA ===
  this.cameras.main.startFollow(player);
  this.cameras.main.setDeadzone(40, 40);

  // === CONTROLES ===
  cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys("W,A,S,D");

  // === AUDIO ===
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  ambientSound();

  // === OVERLAY PRETO (FADE) ===
  const fade = this.add.rectangle(160, 90, 320, 180, 0x000000).setDepth(10);

  // === TEXTOS ===
  const title = this.add.text(160, 70, "CIDADE DE NÉVOA", {
    fontSize: "12px",
    color: "#999",
    fontFamily: "monospace"
  }).setOrigin(0.5).setDepth(11);

  const introText = this.add.text(160, 100,
    "Ninguém lembra como chegou aqui.\nA cidade apenas... apareceu.",
    {
      fontSize: "8px",
      color: "#777",
      align: "center",
      fontFamily: "monospace"
    }
  ).setOrigin(0.5).setDepth(11);

  // === CUTSCENE TIMELINE ===
  this.tweens.add({
    targets: fade,
    alpha: 0,
    duration: 3000,
    onComplete: () => {

      this.time.delayedCall(2000, () => {
        title.destroy();
        introText.destroy();

        // movimento automático
        this.tweens.add({
          targets: player,
          y: 90,
          duration: 4000,
          onComplete: () => {
            cutscene = false;
            controlEnabled = true;

            const msg = this.add.text(160, 10,
              "Use WASD ou Setas para se mover",
              { fontSize: "7px", color: "#666" }
            ).setOrigin(0.5);

            this.time.delayedCall(3000, () => msg.destroy());
          }
        });
      });
    }
  });
}

function update(time) {
  if (!controlEnabled) return;

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
  osc.frequency.value = 55;
  gain.gain.value = 0.02;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();

  setInterval(() => {
    osc.frequency.value = 45 + Math.random() * 20;
  }, 3000);
}
