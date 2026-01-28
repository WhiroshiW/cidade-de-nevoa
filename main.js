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

let sceneState = "menu"; // menu | options | game
let player;
let cursors;
let audioCtx;
let masterVolume = 0.4;
let ambientGain;
let menuObjects = [];
let optionsObjects = [];
let loopPlayer;

// ================= PRELOAD =================
function preload() {
  this.load.image("player", "https://i.imgur.com/2yYayZk.png");
}

// ================= CREATE =================
function create() {
  cursors = this.input.keyboard.createCursorKeys();
  this.keys = this.input.keyboard.addKeys("W,A,S,D");

  createMenu(this);
}

// ================= UPDATE =================
function update() {
  if (sceneState === "menu") {
    loopPlayer.x += 0.3;
    if (loopPlayer.x > 340) loopPlayer.x = -20;
  }

  if (sceneState === "game") {
    updateGame(this);
  }
}

// ================= MENU =================
function createMenu(scene) {
  sceneState = "menu";
  menuObjects.forEach(o => o.destroy());
  menuObjects = [];

  // fundo floresta
  for (let i = 0; i < 14; i++) {
    menuObjects.push(
      scene.add.rectangle(
        Phaser.Math.Between(0, 320),
        Phaser.Math.Between(0, 180),
        12,
        20,
        0x0a2a14
      )
    );
  }

  scene.add.rectangle(160, 125, 320, 40, 0x1a1a1a);

  // personagem em loop
  loopPlayer = scene.add.sprite(-20, 125, "player");

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
  createButton(scene, 160, 95, "CARREGAR", () => alert("Save system em breve"));
  createButton(scene, 160, 120, "OPÇÕES", () => createOptions(scene));

  if (!audioCtx) {
    scene.input.once("pointerdown", () => startAmbient());
  }
}

// ================= BOTÃO =================
function createButton(scene, x, y, text, action) {
  const btn = scene.add.text(x, y, text, {
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
  sceneState = "options";
  menuObjects.forEach(o => o.destroy());
  menuObjects = [];

  optionsObjects.forEach(o => o.destroy());
  optionsObjects = [];

  optionsObjects.push(
    scene.add.text(160, 20, "OPÇÕES", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5)
  );

  optionsObjects.push(
    scene.add.text(20, 50,
`MOVIMENTO: WASD ou SETAS
INTERAGIR: CLIQUE
INVENTÁRIO: EM BREVE

VOLUME`, {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#cccccc"
    })
  );

  // volume
  createButton(scene, 80, 120, "-", () => setVolume(-0.1));
  createButton(scene, 160, 120, "VOLUME", () => {});
  createButton(scene, 240, 120, "+", () => setVolume(0.1));

  createButton(scene, 160, 150, "VOLTAR", () => createMenu(scene));
}

// ================= VOLUME =================
function setVolume(amount) {
  masterVolume = Phaser.Math.Clamp(masterVolume + amount, 0, 1);
  if (ambientGain) ambientGain.gain.value = masterVolume * 0.05;
}

// ================= JOGO =================
function startGame(scene) {
  sceneState = "game";
  menuObjects.forEach(o => o.destroy());
  optionsObjects.forEach(o => o.destroy());

  // cenário
  scene.add.rectangle(160, 90, 320, 180, 0x050505);

  player = scene.physics.add.sprite(40, 125, "player");
  player.setCollideWorldBounds(true);
}

// ================= UPDATE GAME =================
function updateGame(scene) {
  player.setVelocity(0);
  const speed = 60;

  if (cursors.left.isDown || scene.keys.A.isDown) player.setVelocityX(-speed);
  if (cursors.right.isDown || scene.keys.D.isDown) player.setVelocityX(speed);
  if (cursors.up.isDown || scene.keys.W.isDown) player.setVelocityY(-speed);
  if (cursors.down.isDown || scene.keys.S.isDown) player.setVelocityY(speed);
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
    osc.frequency.value = 50 + Math.random() * 6;
    osc.connect(ambientGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 6);
    setTimeout(loop, 8000);
  }

  loop();
}
