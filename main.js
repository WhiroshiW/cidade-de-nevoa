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
  scene: { create, update }
};

new Phaser.Game(config);

let player;
let cursors;
let stepTimer = 0;
let audioCtx = null;
let controlEnabled = false;
let audioStarted = false;

function create() {
  const scene = this;

  // === FUNDO ===
  const bg = scene.add.graphics();
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

  // === PLAYER PIXEL ART ===
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xffffff);
  g.fillRect(2, 0, 4, 4);
  g.fillStyle(0xaaaaaa);
  g.fillRect(1, 4, 6, 6);
  g.generateTexture("player", 8, 10);

  player = scene.physics.add.sprite(160, 140, "player");
  player.setCollideWorldBounds(true);

  // === CÂMERA ===
  scene.cameras.main.startFollow(player);
  scene.cameras.main.setDeadzone(40, 40);

  // === CONTROLES ===
  cursors = scene.input.keyboard.createCursorKeys();
  scene.keys = scene.input.keyboard.addKeys("W,A,S,D");

  // === OVERLAY PRETO ===
  const fade = scene.add.rectangle(160, 90, 320, 180, 0x000000).setDepth(10);

  const title = scene.add.text(160, 80, "CIDADE DE NÉVOA", {
    fontSize: "12px",
    color: "#999",
    fontFamily: "monospace"
  }).setOrigin(0.5).setDepth(11);

  const info = scene.add.text(160, 110,
    "Clique para começar",
    { fontSize: "8px", color: "#777", fontFamily: "monospace" }
  ).setOrigin(0.5).setDepth(11);

  // === CLIQUE INICIAL ===
  scene.input.once("pointerdown", () => {
    // iniciar áudio com interação
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    ambientSound();

    info.destroy();

    scene.tweens.add({
      targets: fade,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        title.destroy();

        scene.tweens.add({
          targets: player,
          y: 90,
          duration: 3000,
          onComplete: () => {
            controlEnabled = true;

            const hint = scene.add.text(160, 10,
              "WASD ou Setas para mover",
              { fontSize: "7px", color: "#666" }
            ).setOrigin(0.5);

            scene.time.delayedCall(3000, () => hint.destroy());
          }
        });
      }
    });
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
  if (!audioCtx) return;

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
