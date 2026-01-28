const scenes = {
  intro: {
    scene: "🌫️ Uma cidade coberta por névoa",
    text: "Você acorda no meio da rua. Não há pessoas, apenas silêncio.",
    choices: [
      { text: "Explorar a rua", next: "rua" }
    ]
  },

  rua: {
    scene: "🏙️ Rua Principal",
    text: "Há uma placa com símbolos estranhos e uma porta trancada.",
    choices: [
      { text: "Examinar a placa", next: "puzzle" },
      { text: "Voltar", next: "intro" }
    ]
  },

  puzzle: {
    scene: "🧩 Placa Misteriosa",
    text: "Os símbolos dizem: 2 + 2 x 2 = ?",
    puzzle: true
  },

  sucesso: {
    scene: "🚪 Porta Aberta",
    text: "A porta se abre lentamente. Você sente que algo observa você...",
    choices: [
      { text: "Continuar", next: "fim" }
    ]
  },

  fim: {
    scene: "👁️ Final",
    text: "Fim do capítulo 1. A cidade ainda guarda segredos."
  }
};

const sceneDiv = document.getElementById("scene");
const dialogDiv = document.getElementById("dialog");
const choicesDiv = document.getElementById("choices");

function loadScene(name) {
  const data = scenes[name];
  sceneDiv.innerText = data.scene;
  dialogDiv.innerText = data.text;
  choicesDiv.innerHTML = "";

  if (data.puzzle) {
    const input = document.createElement("input");
    input.placeholder = "Resposta...";
    const btn = document.createElement("button");
    btn.innerText = "Confirmar";
    btn.onclick = () => {
      if (input.value == 6) loadScene("sucesso");
      else alert("Resposta errada...");
    };
    choicesDiv.append(input, btn);
    return;
  }

  if (data.choices) {
    data.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.innerText = choice.text;
      btn.onclick = () => loadScene(choice.next);
      choicesDiv.appendChild(btn);
    });
  }
}

loadScene("intro");
