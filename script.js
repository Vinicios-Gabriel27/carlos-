// === MATRIZ DE ADJACÊNCIA (direções do SEU DESENHO - t6.jpeg + correções) ===
let direcoes = [
    { de: "Avenida", para: "Praça" },
    { de: "Praça", para: "Parque" },
    { de: "Parque", para: "Praça" },
    { de: "Parque", para: "Shopping" },
    { de: "Shopping", para: "Centro" },
    { de: "Centro", para: "Avenida" },
    { de: "Shopping", para: "Avenida" } // <-- Rota alternativa do Shopping
    // Terminal está isolado
];

const estacoes = ["Avenida", "Centro", "Praça", "Parque", "Shopping", "Terminal"];
const pos = [
    { x: 120, y: 270 }, { x: 300, y: 150 }, { x: 450, y: 270 },
    { x: 600, y: 200 }, { x: 750, y: 370 }, { x: 750, y: 100 } // Posição do Terminal
];
const canvas = document.getElementById("metroCanvas");
const ctx = canvas.getContext("2d");

// === Funções gráficas ===
function desenharSeta(p1, p2) {
    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const offset = 20;
    const fromX = p1.x + Math.cos(ang) * offset;
    const fromY = p1.y + Math.sin(ang) * offset;
    const toX = p2.x - Math.cos(ang) * offset;
    const toY = p2.y - Math.sin(ang) * offset;

    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const size = 8;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(ang - Math.PI / 6),
        toY - size * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(toX - size * Math.cos(ang + Math.PI / 6),
        toY - size * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = "#0ff";
    ctx.fill();
}

function desenharRede() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // desenhar conexões
    for (const { de, para }
        of direcoes) {
        const p1 = pos[estacoes.indexOf(de)];
        const p2 = pos[estacoes.indexOf(para)];
        desenharSeta(p1, p2);
    }

    // desenhar estações
    for (let i = 0; i < pos.length; i++) {
        ctx.beginPath();
        ctx.arc(pos[i].x, pos[i].y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "#0ff";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "bold 13px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(estacoes[i][0], pos[i].x, pos[i].y + 5);

        ctx.fillStyle = "#fff";
        ctx.font = "10px Segoe UI";
        ctx.fillText(estacoes[i], pos[i].x, pos[i].y + 35);
    }
}

// === TREM (LÓGICA ALEATÓRIA) ===
// Não usamos mais uma 'rota' fixa. O trem decide seu caminho.
let trem = {
    atual: "Avenida",    // Estação onde o trem está
    proximo: "Praça",    // Para onde o trem está indo
    progress: 0,         // Progresso da viagem (0 a 1)
    ativo: true
};

function animarTrem() {
    if (!trem.ativo) return;
    desenharRede();

    let p1 = pos[estacoes.indexOf(trem.atual)];
    let p2 = pos[estacoes.indexOf(trem.proximo)];
    let x = p1.x + (p2.x - p1.x) * trem.progress;
    let y = p1.y + (p2.y - p1.y) * trem.progress;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff4444";
    ctx.fill();

    trem.progress += 0.01;

    // Chegou à estação 'proximo'
    if (trem.progress >= 1) {
        trem.progress = 0;
        trem.atual = trem.proximo; // A estação de destino é agora a estação atual

        // --- LÓGICA DE DECISÃO ALEATÓRIA ---
        // 1. Encontrar todas as saídas possíveis da estação atual
        const possiveisDestinos = direcoes.filter(d => d.de === trem.atual);

        // 2. Verificar se há saídas
        if (possiveisDestinos.length === 0) {
            // Fim da linha (ex: Terminal, se chegasse lá)
            trem.ativo = false; 
            return; // Parar animação
        }

        // 3. Sortear aleatoriamente um dos destinos
        const indiceSorteado = Math.floor(Math.random() * possiveisDestinos.length);
        trem.proximo = possiveisDestinos[indiceSorteado].para;
    }

    requestAnimationFrame(animarTrem);
}

// --- Funções de Controle ---

function reiniciarTrem() {
    trem.atual = "Avenida";
    trem.proximo = "Praça";
    trem.progress = 0;
    trem.ativo = true;
    animarTrem();
}

// === CONTROLES DO TREM ===
document.getElementById("iniciar").onclick = () => {
    if (trem.ativo) return; // Já está rodando
    trem.ativo = true;
    
    // Verifica se parou num fim de linha
    const possiveisDestinos = direcoes.filter(d => d.de === trem.atual);
    if (possiveisDestinos.length === 0) {
        reiniciarTrem(); // Se parou, reinicia do zero
    } else {
        animarTrem(); // Se foi pausado, continua
    }
};
document.getElementById("pausar").onclick = () => { trem.ativo = false; };
document.getElementById("reiniciar").onclick = reiniciarTrem; // Chama a nova função

// === PAINEL DE DIREÇÕES ===
function atualizarTabela() {
    const tbody = document.querySelector("#controle-direcoes tbody");
    tbody.innerHTML = "";
    direcoes.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${d.de} → ${d.para}</td>`;
        tbody.appendChild(tr);
    });

    // Adiciona linha para o Terminal Isolado
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Terminal → (Isolado)</td>`;
    tbody.appendChild(tr);
}

// === Inicialização ===
desenharRede();
atualizarTabela();
animarTrem();