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
let fogLayers = [];

function create() {
  const scene = this;

  // ===== FUNDO =====
  const bg = scene.add.graphics();
  bg.fillStyle(0x0a0a0a);
  bg.fillRect(0, 0, 320, 180);
  for (let i = 0; i < 120; i++) {
    bg.fillStyle(0x161616);
    bg.fillRect(
      Phaser.Math.Between(0, 320),
      Phaser.Math.Between(0, 180),
      2,
      2
    );
  }

  // ===== PLAYER PIXEL ART =====
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xffffff);
  g.fillRect(2, 0, 4, 4);
  g.fillStyle(0xaaaaaa);
  g.fillRect(1, 4, 6, 6);
  g.generateTexture("player", 8, 10);

  player = scene.physics.add.sprite(160, 140, "player");
  player.setCollideWorldBounds(true);

  // ===== CAMERA =====
  scene.cameras.main.startFollow(player);
  scene.cameras.main.setDeadzone(40, 40);

  // ===== CONTROLES =====
  cursors = scene.input.keyboard.createCursorKeys();
  scene.keys = scene.input.keyboard.addKeys("W,A,S,D");

  // ===== NÉVOA =====
  for (let i = 0; i < 3; i++) {
    const fog = scene.add.rectangle(
      160,
      90,
      340,
      200,
      0xffffff,
      0.03
    ).setDepth(5);

    fog.speed = 0.05 + Math.random() * 0.05;
    fog.offset = Math.random() * 100;
    fogLayers.push(fog);
  }

  // ===== OVERLAY =====
  const fade = scene.add.rectangle(160, 90, 320, 180, 0x000000).setDepth(10);

  const title = scene.add.text(160, 80, "CIDADE DE NÉVOA", {
    fontSize: "12px",
    color: "#888",
    fontFamily: "monospace"
  }).setOrigin(0.5).setDepth(11);

  const info = scene.add.text(
    160,
    110,
    "Clique para começar",
    { fontSize: "8px", color: "#666", fontFamily: "monospace" }
  ).setOrigin(0.5).setDepth(11);

  // ===== CLIQUE INICIAL =====
  scene.input.once("pointerdown", async () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();

    startPsychologicalMusic();

    info.destroy();

    scene.tweens.add({
      targets: fade,
      alpha: 0,
      duration: 2500,
      onComplete: () => {
        title.destroy();

        scene.tweens.add({
          targets: player,
          y: 90,
          duration: 3500,
          onComplete: () => {
            controlEnabled = true;

            const hint = scene.add.text(
              160,
              10,
              "WASD ou Setas para mover",
              { fontSize: "7px", color: "#555" }
            ).setOrigin(0.5);

            scene.time.delayedCall(3000, () => hint.destroy());
          }
        });
      }
    });
  });
}

function update(time) {
  // ===== NÉVOA VIVA =====
  fogLayers.forEach((fog, i) => {
    fog.x = 160 + Math.sin(time * 0.0003 + fog.offset) * 10;
    fog.y = 90 + Math.cos(time * 0.0002 + fog.offset) * 6;
  });

  // ===== CAMERA INSTÁVEL (PSICOLÓGICO) =====
  this.cameras.main.scrollX += Math.sin(time * 0.0005) * 0.05;
  this.cameras.main.scrollY += Math.cos(time * 0.0004) * 0.05;

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
    stepTimer = time + 320;
  }
}

// ===== PASSOS =====
function playStep() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 160 + Math.random() * 20;
  gain.gain.value = 0.04;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
}

// ===== MÚSICA PSICOLÓGICA =====
function startPsychologicalMusic() {
  const master = audioCtx.createGain();
  master.gain.value = 0.05;
  master.connect(audioCtx.destination);

  function drone(freq, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq + (Math.random() * 3 - 1.5);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function loop() {
    const t = audioCtx.currentTime;

    drone(45, 8);
    setTimeout(() => drone(62, 7), 4000);
    setTimeout(() => drone(52, 9), 9000);

    setTimeout(loop, 12000);
  }

  loop();
}
