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
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let audioStarted = false;
let audioCtx;

function preload() {
  this.load.image("player", "https://i.imgur.com/2yYayZk.png"); // sprite simples pixel art
}

function create() {
  // fundo
  this.add.rectangle(160, 90, 320, 180, 0x0b0b0b);

  // texto inicial
  const startText = this.add.text(160, 90, "CLIQUE PARA COMEÇAR", {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#aaaaaa"
  }).setOrigin(0.5);

  // jogador
  player = this.physics.add.sprite(160, 90, "player");
  player.setVisible(false);

  cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys("W,A,S,D");

  // clique para liberar áudio
  this.input.once("pointerdown", () => {
    startText.destroy();
    player.setVisible(true);

    startAudio();
    audioStarted = true;
  });
}

function update() {
  if (!audioStarted) return;

  player.setVelocity(0);
  const speed = 70;

  if (cursors.left.isDown || this.keys.A.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown || this.keys.D.isDown) {
    player.setVelocityX(speed);
  }

  if (cursors.up.isDown || this.keys.W.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown || this.keys.S.isDown) {
    player.setVelocityY(speed);
  }
}

// ================== ÁUDIO PSICOLÓGICO ==================

function startAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const master = audioCtx.createGain();
  master.gain.value = 0.04;
  master.connect(audioCtx.destination);

  function play(freq, time, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq + (Math.random() * 3 - 1.5);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 1);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start(time);
    osc.stop(time + duration);
  }

  function loop() {
    const now = audioCtx.currentTime;

    play(54, now, 6);
    play(80, now + 4, 7);
    play(63, now + 9, 8);

    setTimeout(loop, 12000);
  }

  loop();
}
