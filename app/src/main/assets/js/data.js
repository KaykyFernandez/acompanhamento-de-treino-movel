"use strict";
/* Static content: muscle groups, exercise library, food table and program templates. */

const MUSCLES = {
  peito: ["Peito", "#e0b83e"],
  costas: ["Costas", "#5aa9e6"],
  ombros: ["Ombros", "#b48cf2"],
  biceps: ["Bíceps", "#f2865e"],
  triceps: ["Tríceps", "#ef6f8e"],
  antebraco: ["Antebraço", "#c9a27e"],
  quadriceps: ["Quadríceps", "#5fd48a"],
  posterior: ["Posterior", "#3fbfae"],
  gluteos: ["Glúteos", "#e88bd0"],
  panturrilha: ["Panturrilha", "#8fd14f"],
  abdomen: ["Abdômen", "#f2c94c"],
  cardio: ["Cardio", "#ff7a7a"],
  outro: ["Outro", "#9a98a3"]
};

const EQUIP = ["Barra", "Halter", "Máquina", "Polia", "Peso corporal", "Smith", "Kettlebell", "Elástico", "Outro"];

/* kind: w = carga x reps, t = segundos, m = minutos */
const KINDS = { w: "Carga e repetições", t: "Tempo (segundos)", m: "Duração (minutos)" };

/* [id, nome, músculo, equipamento, tipo] */
const LIBRARY = [
  ["supino-reto-barra", "Supino reto com barra", "peito", "Barra"],
  ["supino-reto-halter", "Supino reto com halteres", "peito", "Halter"],
  ["supino-inclinado-barra", "Supino inclinado com barra", "peito", "Barra"],
  ["supino-inclinado-halter", "Supino inclinado com halteres", "peito", "Halter"],
  ["supino-declinado", "Supino declinado", "peito", "Barra"],
  ["supino-maquina", "Supino na máquina", "peito", "Máquina"],
  ["supino-smith", "Supino inclinado no Smith", "peito", "Smith"],
  ["crucifixo-halter", "Crucifixo com halteres", "peito", "Halter"],
  ["crucifixo-inclinado", "Crucifixo inclinado", "peito", "Halter"],
  ["peck-deck", "Crucifixo no peck deck", "peito", "Máquina"],
  ["crossover", "Crossover na polia", "peito", "Polia"],
  ["crossover-baixo", "Crossover polia baixa", "peito", "Polia"],
  ["flexao", "Flexão de braço", "peito", "Peso corporal"],
  ["paralelas-peito", "Paralelas (foco em peito)", "peito", "Peso corporal"],
  ["pullover", "Pullover com halter", "peito", "Halter"],

  ["barra-fixa", "Barra fixa", "costas", "Peso corporal"],
  ["puxada-frente", "Puxada frente", "costas", "Polia"],
  ["puxada-triangulo", "Puxada com triângulo", "costas", "Polia"],
  ["puxada-supinada", "Puxada supinada", "costas", "Polia"],
  ["remada-curvada", "Remada curvada com barra", "costas", "Barra"],
  ["remada-unilateral", "Remada unilateral com halter", "costas", "Halter"],
  ["remada-baixa", "Remada baixa (triângulo)", "costas", "Polia"],
  ["remada-maquina", "Remada articulada na máquina", "costas", "Máquina"],
  ["remada-cavalinho", "Remada cavalinho (T-bar)", "costas", "Barra"],
  ["pulldown", "Pulldown com braço estendido", "costas", "Polia"],
  ["levantamento-terra", "Levantamento terra", "costas", "Barra"],
  ["hiperextensao", "Hiperextensão lombar", "costas", "Peso corporal"],
  ["encolhimento", "Encolhimento com halteres", "costas", "Halter"],

  ["desenvolvimento-halter", "Desenvolvimento com halteres", "ombros", "Halter"],
  ["desenvolvimento-barra", "Desenvolvimento militar com barra", "ombros", "Barra"],
  ["desenvolvimento-maquina", "Desenvolvimento na máquina", "ombros", "Máquina"],
  ["arnold", "Desenvolvimento Arnold", "ombros", "Halter"],
  ["elevacao-lateral", "Elevação lateral", "ombros", "Halter"],
  ["elevacao-lateral-polia", "Elevação lateral na polia", "ombros", "Polia"],
  ["elevacao-frontal", "Elevação frontal", "ombros", "Halter"],
  ["crucifixo-inverso", "Crucifixo inverso (ombro posterior)", "ombros", "Halter"],
  ["peck-deck-inverso", "Peck deck inverso", "ombros", "Máquina"],
  ["face-pull", "Face pull", "ombros", "Polia"],
  ["remada-alta", "Remada alta", "ombros", "Barra"],

  ["rosca-direta", "Rosca direta com barra", "biceps", "Barra"],
  ["rosca-w", "Rosca com barra W", "biceps", "Barra"],
  ["rosca-alternada", "Rosca alternada com halteres", "biceps", "Halter"],
  ["rosca-martelo", "Rosca martelo", "biceps", "Halter"],
  ["rosca-concentrada", "Rosca concentrada", "biceps", "Halter"],
  ["rosca-scott", "Rosca Scott", "biceps", "Máquina"],
  ["rosca-polia", "Rosca na polia", "biceps", "Polia"],
  ["rosca-inclinada", "Rosca inclinada com halteres", "biceps", "Halter"],

  ["triceps-testa", "Tríceps testa", "triceps", "Barra"],
  ["triceps-corda", "Tríceps corda na polia", "triceps", "Polia"],
  ["triceps-pulley", "Tríceps pulley com barra", "triceps", "Polia"],
  ["triceps-frances", "Tríceps francês com halter", "triceps", "Halter"],
  ["triceps-coice", "Tríceps coice", "triceps", "Halter"],
  ["mergulho-banco", "Mergulho no banco", "triceps", "Peso corporal"],
  ["paralelas", "Paralelas (foco em tríceps)", "triceps", "Peso corporal"],
  ["supino-fechado", "Supino fechado", "triceps", "Barra"],

  ["rosca-punho", "Rosca de punho", "antebraco", "Barra"],
  ["rosca-inversa", "Rosca inversa", "antebraco", "Barra"],

  ["agachamento", "Agachamento livre", "quadriceps", "Barra"],
  ["agachamento-frontal", "Agachamento frontal", "quadriceps", "Barra"],
  ["agachamento-smith", "Agachamento no Smith", "quadriceps", "Smith"],
  ["hack", "Agachamento hack", "quadriceps", "Máquina"],
  ["leg-press", "Leg press 45°", "quadriceps", "Máquina"],
  ["extensora", "Cadeira extensora", "quadriceps", "Máquina"],
  ["afundo", "Afundo com halteres", "quadriceps", "Halter"],
  ["bulgaro", "Agachamento búlgaro", "quadriceps", "Halter"],
  ["goblet", "Agachamento goblet", "quadriceps", "Kettlebell"],
  ["passada", "Passada (avanço)", "quadriceps", "Halter"],

  ["stiff", "Stiff", "posterior", "Barra"],
  ["terra-romeno", "Levantamento terra romeno", "posterior", "Barra"],
  ["mesa-flexora", "Mesa flexora", "posterior", "Máquina"],
  ["cadeira-flexora", "Cadeira flexora", "posterior", "Máquina"],
  ["flexora-pe", "Flexora em pé", "posterior", "Máquina"],
  ["good-morning", "Bom dia (good morning)", "posterior", "Barra"],

  ["elevacao-pelvica", "Elevação pélvica (hip thrust)", "gluteos", "Barra"],
  ["gluteo-polia", "Glúteo na polia (coice)", "gluteos", "Polia"],
  ["abdutora", "Cadeira abdutora", "gluteos", "Máquina"],
  ["adutora", "Cadeira adutora", "gluteos", "Máquina"],
  ["ponte", "Ponte de glúteo", "gluteos", "Peso corporal"],
  ["sumo", "Agachamento sumô", "gluteos", "Halter"],

  ["panturrilha-pe", "Panturrilha em pé", "panturrilha", "Máquina"],
  ["panturrilha-sentado", "Panturrilha sentado", "panturrilha", "Máquina"],
  ["panturrilha-legpress", "Panturrilha no leg press", "panturrilha", "Máquina"],

  ["abdominal-infra", "Abdominal infra", "abdomen", "Peso corporal"],
  ["abdominal-supra", "Abdominal supra (crunch)", "abdomen", "Peso corporal"],
  ["abdominal-polia", "Abdominal na polia", "abdomen", "Polia"],
  ["elevacao-pernas", "Elevação de pernas na barra", "abdomen", "Peso corporal"],
  ["giro-russo", "Giro russo", "abdomen", "Peso corporal"],
  ["roda", "Roda abdominal", "abdomen", "Outro"],
  ["prancha", "Prancha", "abdomen", "Peso corporal", "t"],
  ["prancha-lateral", "Prancha lateral", "abdomen", "Peso corporal", "t"],

  ["esteira", "Esteira", "cardio", "Máquina", "m"],
  ["bike", "Bicicleta ergométrica", "cardio", "Máquina", "m"],
  ["eliptico", "Elíptico", "cardio", "Máquina", "m"],
  ["escada", "Escada (stairmaster)", "cardio", "Máquina", "m"],
  ["corda", "Pular corda", "cardio", "Outro", "m"],
  ["hiit", "HIIT", "cardio", "Peso corporal", "m"],
  ["caminhada", "Caminhada", "cardio", "Peso corporal", "m"]
].map(([id, n, m, eq, k]) => ({ id, n, m, eq, k: k || "w" }));

/* Names used by the first version of the app, mapped to library ids. */
const OLD_NAMES = {
  "Supino reto com barra": "supino-reto-barra",
  "Supino inclinado com halteres": "supino-inclinado-halter",
  "Crucifixo no peck deck ou polia": "peck-deck",
  "Crossover na polia": "crossover",
  "Tríceps testa": "triceps-testa",
  "Tríceps corda na polia": "triceps-corda",
  "Tríceps francês com halter": "triceps-frances",
  "Abdominal infra": "abdominal-infra",
  "Barra fixa ou puxada frente": "puxada-frente",
  "Remada curvada com barra": "remada-curvada",
  "Remada baixa (triângulo)": "remada-baixa",
  "Pulldown com braço estendido": "pulldown",
  "Rosca direta com barra": "rosca-direta",
  "Rosca martelo": "rosca-martelo",
  "Rosca concentrada ou Scott": "rosca-concentrada",
  "Prancha (segundos)": "prancha",
  "Agachamento livre": "agachamento",
  "Leg press 45°": "leg-press",
  "Stiff": "stiff",
  "Cadeira extensora": "extensora",
  "Mesa flexora": "mesa-flexora",
  "Panturrilha em pé": "panturrilha-pe",
  "Desenvolvimento com halteres": "desenvolvimento-halter",
  "Elevação lateral": "elevacao-lateral",
  "Crucifixo inverso (ombro posterior)": "crucifixo-inverso"
};

/* Alimentos por 100 g: [nome, kcal, proteína, carboidrato, gordura, porção, gramas da porção]
   Valores aproximados com base em tabelas brasileiras de composição de alimentos. */
const FOODS = [
  ["Arroz branco cozido", 128, 2.5, 28.1, 0.2, "1 escumadeira", 90],
  ["Arroz integral cozido", 124, 2.6, 25.8, 1, "1 escumadeira", 90],
  ["Feijão carioca cozido", 76, 4.8, 13.6, 0.5, "1 concha", 140],
  ["Feijão preto cozido", 77, 4.5, 14, 0.5, "1 concha", 140],
  ["Lentilha cozida", 93, 6.3, 16.3, 0.5, "1 concha", 140],
  ["Grão-de-bico cozido", 164, 8.9, 27.4, 2.6, "1 concha", 140],
  ["Macarrão cozido", 122, 4, 25, 0.6, "1 prato", 200],
  ["Batata-doce cozida", 77, 0.6, 18.4, 0.1, "1 média", 150],
  ["Batata inglesa cozida", 52, 1.2, 11.9, 0, "1 média", 140],
  ["Mandioca cozida", 125, 0.6, 30.1, 0.3, "1 pedaço", 100],
  ["Cuscuz de milho", 113, 2.2, 25.3, 0.7, "1 fatia", 135],
  ["Tapioca (goma)", 240, 0, 60, 0, "1 tapioca", 50],
  ["Pão francês", 300, 8, 58.6, 3.1, "1 unidade", 50],
  ["Pão integral", 253, 9.4, 49.9, 3.7, "1 fatia", 25],
  ["Pão de forma", 262, 7.5, 49, 3.6, "1 fatia", 25],
  ["Aveia em flocos", 394, 13.9, 66.6, 8.5, "2 colheres de sopa", 30],
  ["Granola", 421, 10, 66, 13, "3 colheres de sopa", 40],
  ["Tapioca recheada com queijo", 245, 8, 38, 7, "1 unidade", 120],
  ["Peito de frango grelhado", 159, 32, 0, 2.5, "1 filé", 120],
  ["Coxa de frango assada", 215, 26, 0, 12, "1 coxa", 100],
  ["Patinho grelhado", 219, 35.9, 0, 7.3, "1 bife", 120],
  ["Carne moída refogada", 212, 26.7, 0, 10.9, "3 colheres de sopa", 90],
  ["Alcatra grelhada", 241, 31.9, 0, 11.6, "1 bife", 120],
  ["Contrafilé grelhado", 278, 32.4, 0, 15.5, "1 bife", 120],
  ["Carne de porco (lombo) assada", 210, 35.7, 0, 6.4, "1 fatia", 100],
  ["Tilápia grelhada", 128, 26, 0, 2.7, "1 filé", 120],
  ["Salmão grelhado", 208, 22, 0, 13, "1 posta", 120],
  ["Atum em lata (água)", 116, 26, 0, 1, "1 lata", 120],
  ["Sardinha em lata", 208, 24.6, 0, 11.5, "1 lata", 84],
  ["Ovo cozido", 146, 13.3, 0.6, 9.5, "1 unidade", 50],
  ["Ovo mexido", 182, 12, 1.5, 14, "2 ovos", 100],
  ["Clara de ovo", 52, 10.9, 0.7, 0.2, "1 clara", 33],
  ["Peito de peru", 98, 18, 2, 2, "3 fatias", 45],
  ["Presunto", 94, 14.3, 1.4, 2.7, "2 fatias", 30],
  ["Queijo muçarela", 330, 22.6, 3, 25.2, "2 fatias", 30],
  ["Queijo minas frescal", 264, 17.4, 3.2, 20.2, "1 fatia", 30],
  ["Queijo cottage", 98, 11, 3.4, 4.3, "2 colheres de sopa", 50],
  ["Requeijão light", 180, 10, 4, 14, "1 colher de sopa", 30],
  ["Leite integral", 61, 3.2, 4.7, 3.3, "1 copo", 200],
  ["Leite desnatado", 35, 3.4, 4.9, 0.2, "1 copo", 200],
  ["Iogurte natural", 61, 3.5, 4.7, 3.3, "1 pote", 170],
  ["Iogurte grego", 90, 8, 5, 4, "1 pote", 100],
  ["Whey protein", 400, 80, 10, 5, "1 dose", 30],
  ["Albumina", 370, 82, 4, 0, "1 dose", 30],
  ["Banana", 89, 1.1, 23, 0.3, "1 média", 100],
  ["Maçã", 56, 0.3, 15.2, 0, "1 média", 130],
  ["Mamão papaia", 40, 0.5, 10.4, 0.1, "1 fatia", 150],
  ["Laranja", 37, 1, 8.9, 0.1, "1 média", 150],
  ["Morango", 30, 0.9, 6.8, 0.3, "1 xícara", 150],
  ["Manga", 64, 0.4, 16.7, 0.3, "1 fatia", 150],
  ["Abacate", 96, 1.2, 6, 8.4, "2 colheres de sopa", 50],
  ["Uva", 53, 0.7, 13.6, 0.2, "1 cacho pequeno", 100],
  ["Melancia", 33, 0.9, 8.1, 0, "1 fatia", 200],
  ["Açaí (polpa sem açúcar)", 58, 0.8, 6.2, 3.9, "1 pacote", 100],
  ["Brócolis cozido", 25, 2.1, 4.4, 0.5, "1 xícara", 90],
  ["Alface", 11, 1.3, 1.7, 0.2, "1 prato", 50],
  ["Tomate", 15, 1.1, 3.1, 0.2, "1 médio", 100],
  ["Cenoura crua", 34, 1.3, 7.7, 0.2, "1 média", 80],
  ["Abobrinha refogada", 30, 1.1, 5, 0.8, "3 colheres de sopa", 80],
  ["Salada mista", 20, 1.2, 3.5, 0.2, "1 prato", 100],
  ["Pasta de amendoim", 588, 25, 20, 50, "1 colher de sopa", 15],
  ["Amendoim torrado", 606, 22.5, 18.7, 54, "1 punhado", 30],
  ["Castanha-do-pará", 643, 14.5, 15.1, 63.5, "3 unidades", 12],
  ["Castanha de caju", 570, 18.5, 29.1, 46.3, "1 punhado", 30],
  ["Azeite de oliva", 884, 0, 0, 100, "1 colher de sopa", 10],
  ["Manteiga", 726, 0.4, 0, 82.4, "1 colher de chá", 10],
  ["Mel", 309, 0, 84, 0, "1 colher de sopa", 20],
  ["Chocolate amargo 70%", 580, 7.8, 46, 41, "2 quadrados", 20],
  ["Barra de proteína", 360, 33, 30, 12, "1 barra", 45],
  ["Pizza (muçarela)", 270, 11, 30, 11.5, "1 fatia", 110],
  ["Hambúrguer (lanche)", 260, 13, 27, 11, "1 lanche", 200],
  ["Feijoada", 117, 8.7, 11.6, 6.5, "1 concha", 200],
  ["Farofa", 406, 2.1, 80.3, 9.1, "2 colheres de sopa", 30],
  ["Pão de queijo", 363, 5.1, 34.2, 24.6, "1 unidade", 40],
  ["Suco de laranja natural", 45, 0.7, 10.4, 0.2, "1 copo", 250],
  ["Café com açúcar", 37, 0.3, 9, 0, "1 xícara", 100],
  ["Refrigerante", 40, 0, 10.4, 0, "1 lata", 350],
  ["Cerveja", 41, 0.3, 3.3, 0, "1 lata", 350]
].map(([n, k, p, c, f, pl, pg]) => ({ n, k, p, c, f, pl, pg }));

const MEALS = [
  ["cafe", "Café da manhã"],
  ["almoco", "Almoço"],
  ["lanche", "Lanche"],
  ["jantar", "Jantar"],
  ["ceia", "Ceia"]
];

/* Modelos de programa: rotinas com [exercício, séries, reps, descanso em s] */
const TEMPLATES = [
  {
    id: "abc", n: "ABC · Hipertrofia", d: "3 a 6 dias por semana, um grupo muscular grande por treino. O treino original do app.",
    r: [
      ["Treino A · Peito e Tríceps", [["supino-reto-barra", 4, "6-10", 120], ["supino-inclinado-halter", 4, "8-12", 90], ["peck-deck", 3, "12-15", 60], ["crossover", 3, "12-15", 60], ["triceps-testa", 3, "10-12", 60], ["triceps-corda", 3, "12-15", 45], ["triceps-frances", 3, "10-12", 60], ["abdominal-infra", 3, "15-20", 45]]],
      ["Treino B · Costas e Bíceps", [["puxada-frente", 4, "8-12", 90], ["remada-curvada", 4, "8-10", 90], ["remada-baixa", 3, "10-12", 75], ["pulldown", 3, "12-15", 60], ["rosca-direta", 3, "8-12", 60], ["rosca-martelo", 3, "10-12", 60], ["rosca-concentrada", 3, "12", 45], ["prancha", 3, "40-60", 45]]],
      ["Treino C · Pernas e Ombros", [["agachamento", 4, "8-10", 120], ["leg-press", 4, "10-12", 90], ["stiff", 3, "10-12", 90], ["extensora", 3, "12-15", 60], ["mesa-flexora", 3, "12-15", 60], ["panturrilha-pe", 4, "12-15", 45], ["desenvolvimento-halter", 4, "8-12", 90], ["elevacao-lateral", 4, "12-15", 45], ["crucifixo-inverso", 3, "12-15", 45]]]
    ]
  },
  {
    id: "ppl", n: "Push · Pull · Legs", d: "Empurrar, puxar e pernas. Ideal para 3 ou 6 dias por semana.",
    r: [
      ["Push · Empurrar", [["supino-reto-barra", 4, "6-8", 150], ["desenvolvimento-halter", 3, "8-10", 120], ["supino-inclinado-halter", 3, "8-12", 90], ["elevacao-lateral", 4, "12-15", 45], ["triceps-corda", 3, "10-12", 60], ["triceps-frances", 3, "10-12", 60]]],
      ["Pull · Puxar", [["barra-fixa", 4, "6-10", 120], ["remada-curvada", 4, "8-10", 120], ["remada-baixa", 3, "10-12", 75], ["face-pull", 3, "12-15", 60], ["rosca-direta", 3, "8-12", 60], ["rosca-martelo", 3, "10-12", 60]]],
      ["Legs · Pernas", [["agachamento", 4, "6-8", 180], ["terra-romeno", 3, "8-10", 120], ["leg-press", 3, "10-12", 90], ["cadeira-flexora", 3, "10-12", 60], ["extensora", 3, "12-15", 60], ["panturrilha-pe", 4, "10-15", 45]]]
    ]
  },
  {
    id: "ul", n: "Superior / Inferior", d: "Quatro treinos por semana alternando parte de cima e de baixo.",
    r: [
      ["Superior A", [["supino-reto-barra", 4, "6-8", 150], ["remada-curvada", 4, "6-8", 150], ["desenvolvimento-halter", 3, "8-10", 90], ["puxada-frente", 3, "8-10", 90], ["rosca-alternada", 3, "10-12", 60], ["triceps-pulley", 3, "10-12", 60]]],
      ["Inferior A", [["agachamento", 4, "6-8", 180], ["terra-romeno", 3, "8-10", 120], ["leg-press", 3, "10-12", 90], ["mesa-flexora", 3, "10-12", 60], ["panturrilha-pe", 4, "10-15", 45], ["abdominal-polia", 3, "12-15", 45]]],
      ["Superior B", [["supino-inclinado-halter", 4, "8-10", 120], ["remada-unilateral", 4, "8-10", 90], ["arnold", 3, "10-12", 90], ["puxada-triangulo", 3, "10-12", 90], ["elevacao-lateral", 3, "12-15", 45], ["rosca-martelo", 3, "10-12", 60]]],
      ["Inferior B", [["levantamento-terra", 3, "5", 180], ["bulgaro", 3, "8-10", 90], ["hack", 3, "10-12", 90], ["cadeira-flexora", 3, "12-15", 60], ["elevacao-pelvica", 3, "10-12", 90], ["prancha", 3, "45", 45]]]
    ]
  },
  {
    id: "fb", n: "Full body · Iniciante", d: "Corpo inteiro em cada treino, 2 ou 3 vezes por semana. Ótimo para começar.",
    r: [
      ["Full body A", [["agachamento-smith", 3, "10-12", 90], ["supino-maquina", 3, "10-12", 90], ["puxada-frente", 3, "10-12", 90], ["desenvolvimento-maquina", 3, "10-12", 60], ["mesa-flexora", 3, "12", 60], ["prancha", 3, "30", 45]]],
      ["Full body B", [["leg-press", 3, "10-12", 90], ["supino-inclinado-halter", 3, "10-12", 90], ["remada-maquina", 3, "10-12", 90], ["elevacao-lateral", 3, "12-15", 45], ["rosca-alternada", 2, "12", 45], ["triceps-corda", 2, "12", 45]]]
    ]
  }
];

const GOALS = {
  hipertrofia: ["Ganhar massa", "Superávit leve para construir músculo", 1.1, 2.0, 1.0],
  definicao: ["Definir", "Déficit para perder gordura mantendo músculo", 0.8, 2.2, 0.8],
  recomposicao: ["Recomposição", "Manter o peso trocando gordura por músculo", 1.0, 2.0, 0.9],
  forca: ["Ganhar força", "Foco em cargas altas e progressão", 1.05, 1.8, 1.0]
};

const ACTIVITY = [
  [1.375, "Leve", "Trabalho sentado, treina 2 a 3 vezes"],
  [1.55, "Moderado", "Treina 3 a 5 vezes por semana"],
  [1.725, "Alto", "Treina pesado 6 vezes ou trabalho físico"],
  [1.9, "Muito alto", "Atleta ou duas sessões por dia"]
];
