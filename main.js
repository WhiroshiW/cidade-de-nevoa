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

new Phaser.Game(config);

let player, npc;
let cursors;
let audioCtx;
let canMove = true;
let dialogActive = false;

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://i.imgur.com/2yYayZk.png");
}

// ================= CREATE =================
function create() {
  // fundo
  this.add.rectangle(160, 90, 320, 180, 0x050505);

  // floresta (árvores simples)
  for (let i = 0; i < 12; i++) {
    this.add.rectangle(Phaser.Math.Between(0, 320), Phaser.Math.Between(0, 180), 10, 18, 0x0b2e16);
  }

  // caminho
  this.add.rectangle(160, 120, 320, 40, 0x1a1a1a);

  // cabana
  this.add.rectangle(250, 80, 30, 30, 0x2b1b0f);
  this.add.rectangle(250, 95, 10, 15, 0x000000);

  // jogador
  player = this.physics.add.sprite(40, 120, "player");
  player.setCollideWorldBounds(true);

  // NPC (invisível no início)
  npc = this.add.rectangle(240, 95, 10, 18, 0x555555);
  npc.setVisible(false);

  cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys("W,A,S,D");

  // iniciar áudio após clique
  this.input.once("pointerdown", () => {
    startAmbient();
  });
}

// ================= UPDATE =================
function update() {
  if (!canMove) return;

  player.setVelocity(0);
  const speed = 60;

  if (cursors.left.isDown || this.keys.A.isDown) player.setVelocityX(-speed);
  if (cursors.right.isDown || this.keys.D.isDown) player.setVelocityX(speed);
  if (cursors.up.isDown || this.keys.W.isDown) player.setVelocityY(-speed);
  if (cursors.down.isDown || this.keys.S.isDown) player.setVelocityY(speed);

  // gatilho da cutscene
  if (!dialogActive && player.x > 210 && player.y < 110) {
    startCutscene(this);
  }
}

// ================= CUTSCENE =================
function startCutscene(scene) {
  dialogActive = true;
  canMove = false;
  npc.setVisible(true);

  showDialog(scene, "Morador", [
    "Você não devia ter vindo.",
    "A floresta não esquece rostos.",
    "Ela lembra… do seu também."
  ]);
}

// ================= DIÁLOGO =================
function showDialog(scene, name, lines) {
  let index = 0;

  const box = scene.add.rectangle(160, 155, 320, 50, 0x000000).setAlpha(0.85);
  const nameText = scene.add.text(10, 130, name, {
    fontFamily: "monospace",
    fontSize: "10px",
    color: "#ff5555"
  });

  const dialogText = scene.add.text(10, 145, "", {
    fontFamily: "monospace",
    fontSize: "10px",
    color: "#dddddd",
    wordWrap: { width: 300 }
  });

  function typeLine(text, callback) {
    let i = 0;
    dialogText.text = "";

    const timer = scene.time.addEvent({
      delay: 40,
      repeat: text.length - 1,
      callback: () => {
        dialogText.text += text[i];
        npcVoice();
        i++;
      },
      onComplete: callback
    });
  }

  function nextLine() {
    if (index >= lines.length) {
      box.destroy();
      nameText.destroy();
      dialogText.destroy();
      canMove = true;
      return;
    }

    typeLine(lines[index], () => {
      index++;
      scene.input.once("pointerdown", nextLine);
    });
  }

  nextLine();
}

// ================= ÁUDIO =================
function startAmbient() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const gain = audioCtx.createGain();
  gain.gain.value = 0.03;
  gain.connect(audioCtx.destination);

  function loop() {
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 55 + Math.random() * 5;
    osc.connect(gain);
    osc.start();
    osc.stop(audioCtx.currentTime + 6);
    setTimeout(loop, 7000);
  }

  loop();
}

// voz perturbadora do NPC
function npcVoice() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 200 + Math.random() * 80;

  gain.gain.value = 0.02;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}
