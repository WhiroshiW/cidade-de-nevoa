const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  zoom: 3,
  backgroundColor: "#050505",
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

// ================= ESTADO =================
let state = "menu"; // menu | options | game
let player, loopPlayer;
let cursors, keys;
let audioCtx, ambientGain;
let masterVolume = 0.4;

// grupos de objetos
let menuObjects = [];
let optionObjects = [];
let gameObjects = [];

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://i.imgur.com/2yYayZk.png");
}

// ================= CREATE =================
function create() {
  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys("W,A,S,D");

  createMenu(this);

  // iniciar áudio após gesto
  this.input.once("pointerdown", () => {
    if (!audioCtx) startAmbient();
  });
}

// ================= UPDATE =================
function update() {
  if (state === "menu") {
    loopPlayer.x += 0.25;
    if (loopPlayer.x > 350) loopPlayer.x = -30;
  }

  if (state === "game") {
    updateGame();
  }
}

// ================= MENU =================
function createMenu(scene) {
  clearAll();

  state = "menu";

  // floresta
  for (let i = 0; i < 14; i++) {
    menuObjects.push(
      scene.add.rectangle(
        Phaser.Math.Between(0, 320),
        Phaser.Math.Between(0, 180),
        12,
        20,
        0x0a2a14
      ).setDepth(-5)
    );
  }

  // caminho
  menuObjects.push(
    scene.add.rectangle(160, 130, 320, 40, 0x1a1a1a).setDepth(-4)
  );

  // névoa psicológica (CORRIGIDA)
  const fog = scene.add.rectangle(160, 90, 360, 220, 0x999999)
    .setAlpha(0.12)
    .setDepth(-3);

  scene.tweens.add({
    targets: fog,
    alpha: { from: 0.08, to: 0.18 },
    duration: 6000,
    yoyo: true,
    repeat: -1
  });

  menuObjects.push(fog);

  // personagem andando em loop
  loopPlayer = scene.add.sprite(-30, 130, "player").setDepth(-2);
  menuObjects.push(loopPlayer);

  // título
  menuObjects.push(
    scene.add.text(160, 30, "CIDADE DE NÉVOA", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#dddddd"
    }).setOrigin(0.5)
  );

  // botões
  createButton(scene, 160, 70, "INICIAR", () => startGame(scene));
  createButton(scene, 160, 95, "CARREGAR", () => alert("Sistema de save em breve"));
  createButton(scene, 160, 120, "OPÇÕES", () => createOptions(scene));
}

// ================= BOTÃO =================
function createButton(scene, x, y, label, action) {
  const btn = scene.add.text(x, y, label, {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#aaaaaa",
    backgroundColor: "#000000",
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5).setInteractive();

  btn.on("pointerover", () => btn.setColor("#ffffff"));
  btn.on("pointerout", () => btn.setColor("#aaaaaa"));
  btn.on("pointerdown", action);

  menuObjects.push(btn);
}

// ================= OPÇÕES =================
function createOptions(scene) {
  clearAll();
  state = "options";

  optionObjects.push(
    scene.add.text(160, 20, "OPÇÕES", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5)
  );

  optionObjects.push(
    scene.add.text(20, 50,
`MOVIMENTO: WASD / SETAS
INTERAGIR: CLIQUE
INVENTÁRIO: EM BREVE

VOLUME`, {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#cccccc"
    })
  );

  createOptionButton(scene, 90, 120, "-", () => setVolume(-0.1));
  createOptionButton(scene, 160, 120, "VOLUME", () => {});
  createOptionButton(scene, 230, 120, "+", () => setVolume(0.1));

  createOptionButton(scene, 160, 150, "VOLTAR", () => createMenu(scene));
}

function createOptionButton(scene, x, y, label, action) {
  const btn = scene.add.text(x, y, label, {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#aaaaaa",
    backgroundColor: "#000000",
    padding: { x: 5, y: 2 }
  }).setOrigin(0.5).setInteractive();

  btn.on("pointerover", () => btn.setColor("#ffffff"));
  btn.on("pointerout", () => btn.setColor("#aaaaaa"));
  btn.on("pointerdown", action);

  optionObjects.push(btn);
}

// ================= JOGO =================
function startGame(scene) {
  clearAll();
  state = "game";

  gameObjects.push(
    scene.add.rectangle(160, 90, 320, 180, 0x050505)
  );

  player = scene.physics.add.sprite(40, 130, "player");
  player.setCollideWorldBounds(true);
  gameObjects.push(player);
}

function updateGame() {
  player.setVelocity(0);
  const speed = 60;

  if (cursors.left.isDown || keys.A.isDown) player.setVelocityX(-speed);
  if (cursors.right.isDown || keys.D.isDown) player.setVelocityX(speed);
  if (cursors.up.isDown || keys.W.isDown) player.setVelocityY(-speed);
  if (cursors.down.isDown || keys.S.isDown) player.setVelocityY(speed);
}

// ================= ÁUDIO =================
function startAmbient() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = masterVolume * 0.05;
  ambientGain.connect(audioCtx.destination);

  function loop() {
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 48 + Math.random() * 6;
    osc.connect(ambientGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 6);
    setTimeout(loop, 8000);
  }

  loop();
}

function setVolume(amount) {
  masterVolume = Phaser.Math.Clamp(masterVolume + amount, 0, 1);
  if (ambientGain) ambientGain.gain.value = masterVolume * 0.05;
}

// ================= UTIL =================
function clearAll() {
  menuObjects.forEach(o => o.destroy());
  optionObjects.forEach(o => o.destroy());
  gameObjects.forEach(o => o.destroy());

  menuObjects = [];
  optionObjects = [];
  gameObjects = [];
}
