// Banco de cartas da Trilha do RH.
// Cartas 1 a 30: cartas oficiais do jogo impresso (adaptadas para múltipla escolha).
// Cartas 31 a 150: cartas extras criadas sobre os mesmos temas.
//
// IMPORTANTE: em cada carta a PRIMEIRA alternativa é a correta.
// O jogo embaralha a ordem das alternativas a cada partida.
// Perguntas de Sim/Não e Verdadeiro/Falso têm apenas 2 alternativas.

export type Category = 'azul' | 'laranja' | 'verde' | 'roxo' | 'amarelo';

/** 1 = fácil (1 ponto), 2 = médio (2 pontos), 3 = difícil (3 pontos) */
export type Difficulty = 1 | 2 | 3;

export const DIFFICULTY_INFO: Record<Difficulty, { name: string; color: string }> = {
  1: { name: 'Fácil', color: '#2E7D32' },
  2: { name: 'Médio', color: '#E67E22' },
  3: { name: 'Difícil', color: '#C62828' },
};

// Grau de dificuldade de cada carta (as que não estão nas listas são "Médio").
// Para mudar a dificuldade de uma carta, mova o número dela de lista.
const FACIL = [
  1, 3, 4, 5, 37, 38, 46, 48, 53, // azul
  7, 9, 10, 11, 59, 63, 69, 70, 72, 76, 77, // laranja
  13, 14, 17, 79, 81, 84, 89, 90, 96, 100, 102, // verde
  19, 22, 104, 105, 111, 113, // roxo
  26, 28, 30, 127, 128, 130, 134, 138, 140, 142, 143, 145, 146, 147, 148, 150, // amarelo
];
const DIFICIL = [
  2, 6, 32, 34, 35, 36, 45, 47, 51, 52, 54, // azul
  8, 55, 60, 61, 71, 74, 75, // laranja
  83, 87, 93, 94, // verde
  20, 23, 24, 108, 110, 114, 116, 118, 121, 124, 125, 126, // roxo
  27, 131, 135, 137, 144, 149, // amarelo
];
const difficultyOf = (id: number): Difficulty => (FACIL.includes(id) ? 1 : DIFICIL.includes(id) ? 3 : 2);

export interface Card {
  id: number;
  category: Category;
  question: string;
  /** options[0] é sempre a resposta correta */
  options: string[];
  explanation: string;
  official: boolean;
  difficulty: Difficulty;
}

export const CATEGORY_INFO: Record<Category, { name: string; color: string; text: string }> = {
  azul: { name: 'Conhecendo a NR-1', color: '#1565C0', text: '#FFFFFF' },
  laranja: { name: 'Saúde Mental', color: '#E67E22', text: '#FFFFFF' },
  verde: { name: 'Responsabilidades', color: '#2E7D32', text: '#FFFFFF' },
  roxo: { name: 'Situações-Problema', color: '#7B1FA2', text: '#FFFFFF' },
  amarelo: { name: 'Desafios Rápidos', color: '#F1C40F', text: '#0F2942' },
};

const SIM_NAO = (sim: boolean) => (sim ? ['Sim', 'Não'] : ['Não', 'Sim']);
const VF = (v: boolean) => (v ? ['Verdadeiro', 'Falso'] : ['Falso', 'Verdadeiro']);

const list: Card[] = [];
function c(id: number, category: Category, question: string, options: string[], explanation: string) {
  list.push({ id, category, question, options, explanation, official: id <= 30, difficulty: difficultyOf(id) });
}

/* ───────────────────────── AZUL — Conhecendo a NR-1 ───────────────────────── */
c(1, 'azul', 'O que significa NR-1?', [
  'Norma Regulamentadora nº 1, com disposições gerais e diretrizes de segurança e saúde no trabalho',
  'Norma de Remuneração nº 1, que define pisos salariais',
  'Nota de Rescisão nº 1, usada no desligamento de funcionários',
  'Norma de Recrutamento nº 1, sobre seleção de pessoal',
], 'A NR-1 é a Norma Regulamentadora nº 1. Ela estabelece as disposições gerais e as diretrizes relacionadas à segurança e à saúde no trabalho.');
c(2, 'azul', 'Qual é o principal objetivo da NR-1?', [
  'Estabelecer disposições gerais e requisitos para o gerenciamento de riscos ocupacionais e a prevenção',
  'Definir o valor do vale-transporte dos trabalhadores',
  'Regulamentar apenas o uso de uniformes nas empresas',
  'Tratar exclusivamente das férias e do 13º salário',
], 'O objetivo da NR-1 é estabelecer disposições gerais e requisitos relacionados ao gerenciamento de riscos ocupacionais e às medidas de prevenção.');
c(3, 'azul', 'O que significa GRO?', [
  'Gerenciamento de Riscos Ocupacionais',
  'Gestão de Recursos Operacionais',
  'Guia de Rotinas Obrigatórias',
  'Grupo de Revisão Organizacional',
], 'GRO significa Gerenciamento de Riscos Ocupacionais: o processo contínuo de identificar, avaliar e controlar os riscos do trabalho.');
c(4, 'azul', 'O que significa PGR?', [
  'Programa de Gerenciamento de Riscos',
  'Plano Geral de Remuneração',
  'Protocolo de Gestão de Recursos',
  'Processo Geral de Recrutamento',
], 'PGR significa Programa de Gerenciamento de Riscos. É o documento que materializa o GRO na organização.');
c(5, 'azul', 'Qual destes é um exemplo de PERIGO no ambiente de trabalho?', [
  'Um fio elétrico desencapado',
  'Uma reunião de equipe bem organizada',
  'Uma sala com boa iluminação e ventilação',
  'Um extintor dentro da validade',
], 'Perigos são fontes com potencial de causar dano, como um fio elétrico danificado, um piso escorregadio ou uma máquina sem proteção.');
c(6, 'azul', 'Qual é a diferença entre perigo e risco?', [
  'Perigo é a fonte com potencial de dano; risco combina a chance de o dano ocorrer e a sua gravidade',
  'Perigo e risco são exatamente a mesma coisa',
  'Risco é a fonte de dano; perigo é a probabilidade de acontecer',
  'Perigo só existe em fábricas; risco só existe em escritórios',
], 'Perigo é uma fonte ou situação com potencial de causar dano. Risco considera a possibilidade de o dano ocorrer e a gravidade das suas consequências.');

/* ───────────────────────── LARANJA — Saúde Mental ───────────────────────── */
c(7, 'laranja', 'A sobrecarga de trabalho pode afetar a saúde mental?', SIM_NAO(true),
  'Sim. A sobrecarga de trabalho pode contribuir para o estresse e para outros prejuízos à saúde.');
c(8, 'laranja', 'Qual alternativa traz fatores de risco psicossociais relacionados ao trabalho?', [
  'Assédio, excesso de demandas, falta de apoio e baixa autonomia',
  'Ruído, calor e poeira',
  'Piso molhado e escada sem corrimão',
  'Produtos químicos e radiação',
], 'Assédio, excesso de demandas, falta de apoio e baixa autonomia são exemplos de fatores de risco psicossociais. Ruído e calor são riscos físicos.');
c(9, 'laranja', 'Humilhações constantes a um colega podem ser um problema no trabalho?', SIM_NAO(true),
  'Sim. Podem caracterizar violência ou assédio, conforme as circunstâncias, e devem ser tratadas adequadamente.');
c(10, 'laranja', 'A saúde no trabalho envolve somente a saúde física?', SIM_NAO(false),
  'Não. A saúde no trabalho também envolve a saúde mental e outros aspectos da saúde dos trabalhadores.');
c(11, 'laranja', 'A falta de apoio da liderança pode ser um fator de risco psicossocial?', SIM_NAO(true),
  'Sim. A falta de suporte da liderança pode contribuir para condições de trabalho prejudiciais à saúde.');
c(12, 'laranja', 'Qual é uma atitude positiva para melhorar o ambiente de trabalho?', [
  'Promover respeito, comunicação, divisão adequada de tarefas e canais seguros para relatar problemas',
  'Incentivar a competição agressiva entre colegas',
  'Evitar conversar sobre problemas para não criar conflito',
  'Cobrar metas sem oferecer nenhum apoio',
], 'Respeito, comunicação, distribuição adequada das tarefas e canais seguros para relatar problemas tornam o ambiente de trabalho mais saudável.');

/* ───────────────────────── VERDE — Responsabilidades ───────────────────────── */
c(13, 'verde', 'A empresa tem responsabilidade na prevenção dos riscos ocupacionais?', SIM_NAO(true),
  'Sim. A organização deve cumprir suas obrigações de prevenção e de gerenciamento dos riscos aplicáveis.');
c(14, 'verde', 'Os trabalhadores também devem colaborar com a segurança?', SIM_NAO(true),
  'Sim. Os trabalhadores devem seguir as orientações aplicáveis e colaborar com as medidas de prevenção.');
c(15, 'verde', 'O que fazer ao identificar um perigo no local de trabalho?', [
  'Comunicar o responsável e adotar as medidas de segurança, sem se expor ao perigo',
  'Ignorar, pois não é sua função',
  'Tentar resolver sozinho, mesmo sem saber como',
  'Esperar alguém se machucar para então avisar',
], 'O correto é comunicar o responsável e adotar as medidas de segurança apropriadas, sem se expor ao perigo.');
c(16, 'verde', 'Para que serve o PGR?', [
  'Organizar ações para identificar, avaliar e controlar os riscos ocupacionais',
  'Calcular a folha de pagamento',
  'Registrar o ponto dos funcionários',
  'Definir o plano de carreira da empresa',
], 'O PGR organiza as ações para identificar, avaliar e controlar os riscos ocupacionais, conforme as exigências aplicáveis.');
c(17, 'verde', 'O treinamento em segurança ajuda a prevenir acidentes?', SIM_NAO(true),
  'Sim. A capacitação ajuda as pessoas a reconhecer riscos e a seguir procedimentos seguros.');
c(18, 'verde', 'Qual é o papel do RH na prevenção de problemas no trabalho?', [
  'Apoiar treinamentos, comunicação, políticas contra o assédio e encaminhar situações aos responsáveis',
  'Apenas contratar e demitir pessoas',
  'Nenhum: segurança é assunto só da manutenção',
  'Punir quem relatar problemas',
], 'O RH pode apoiar treinamentos, comunicação, políticas contra o assédio e o encaminhamento de situações aos responsáveis.');

/* ───────────────────────── ROXO — Situações-Problema ───────────────────────── */
c(19, 'roxo', 'O piso está molhado e sem sinalização. O que fazer?', [
  'Comunicar o responsável e pedir que o local seja sinalizado e o perigo corrigido',
  'Passar correndo para sair logo do local',
  'Não fazer nada, pois logo vai secar',
  'Tirar uma foto para postar nas redes sociais',
], 'O correto é comunicar o responsável e solicitar que o local seja sinalizado e o perigo corrigido.');
c(20, 'roxo', 'Uma equipe recebe tarefas demais e prazos impossíveis o tempo todo. Que risco pode existir?', [
  'Um fator de risco psicossocial ligado à sobrecarga de trabalho',
  'Um risco químico',
  'Nenhum risco, isso é normal em qualquer empresa',
  'Um risco biológico',
], 'Demandas excessivas e prazos impossíveis de forma contínua podem indicar um fator de risco psicossocial relacionado à sobrecarga.');
c(21, 'roxo', 'Um funcionário sofre humilhações frequentes do seu superior. Qual atitude é adequada?', [
  'Procurar um canal seguro de apoio ou denúncia e comunicar a situação pelos meios apropriados',
  'Aceitar calado, pois faz parte do trabalho',
  'Revidar com humilhações também',
  'Pedir demissão imediatamente sem falar com ninguém',
], 'A atitude adequada é procurar um canal seguro de apoio ou denúncia e comunicar a situação pelos meios apropriados.');
c(22, 'roxo', 'A empresa oferece treinamento, mas os equipamentos continuam danificados. O problema foi resolvido?', SIM_NAO(false),
  'Não. O treinamento não substitui a correção dos perigos e a adoção de medidas preventivas.');
c(23, 'roxo', 'Um trabalhador não consegue pedir ajuda quando tem dificuldades. O que a organização pode melhorar?', [
  'A comunicação, o suporte da liderança e os canais de orientação',
  'Aumentar as metas para ele se esforçar mais',
  'Diminuir o salário até ele melhorar',
  'Nada, cada um deve se virar sozinho',
], 'A organização pode melhorar a comunicação, o suporte da liderança e os canais de orientação aos trabalhadores.');
c(24, 'roxo', 'Um funcionário tem medo de comunicar um risco. O que a empresa deve incentivar?', [
  'Uma cultura de prevenção, com canais acessíveis e tratamento adequado das informações',
  'O silêncio, para evitar problemas',
  'A punição de quem aponta falhas',
  'Que só a chefia possa falar sobre riscos',
], 'A empresa deve incentivar uma cultura de prevenção, com canais acessíveis e tratamento adequado das informações recebidas.');

/* ───────────────────────── AMARELO — Desafios Rápidos ───────────────────────── */
c(25, 'amarelo', 'Quais são exemplos de riscos ocupacionais?', [
  'Ruído excessivo e exposição a produtos químicos',
  'Intervalo para almoço e férias',
  'Plano de saúde e vale-refeição',
  'Uniforme limpo e crachá',
], 'Ruído excessivo e exposição a produtos químicos são exemplos de riscos ocupacionais.');
c(26, 'amarelo', 'Complete: GRO significa Gerenciamento de _____ Ocupacionais.', [
  'Riscos', 'Recursos', 'Rotinas', 'Registros',
], 'GRO significa Gerenciamento de Riscos Ocupacionais.');
c(27, 'amarelo', 'Verdadeiro ou falso: os fatores de risco psicossociais relacionados ao trabalho devem ser considerados no gerenciamento de riscos, conforme a NR-1 vigente.', VF(true),
  'Verdadeiro. A atualização da NR-1 deixou explícito que os fatores de risco psicossociais relacionados ao trabalho fazem parte do gerenciamento de riscos ocupacionais.');
c(28, 'amarelo', 'Verdadeiro ou falso: se nunca houve acidente, não existe risco no local.', VF(false),
  'Falso. A ausência de acidentes anteriores não elimina os perigos nem a necessidade de prevenção.');
c(29, 'amarelo', 'Qual ação o RH pode promover para fortalecer o respeito no trabalho?', [
  'Treinamentos, campanhas de conscientização e divulgação de canais de denúncia',
  'Proibir conversas entre colegas',
  'Divulgar publicamente quem fez denúncias',
  'Cancelar todas as reuniões de equipe',
], 'Treinamentos, campanhas de conscientização, orientações e divulgação de canais de denúncia fortalecem o respeito no trabalho.');
c(30, 'amarelo', 'Complete: prevenir é melhor do que _____.', [
  'Remediar', 'Esperar', 'Arriscar', 'Improvisar',
], 'Prevenir é melhor do que remediar: agir antes evita acidentes e adoecimentos.');

/* ════════════════════════ CARTAS EXTRAS (31 a 150) ════════════════════════ */

/* AZUL — Conhecendo a NR-1 (31 a 54) */
c(31, 'azul', 'Quem publica as Normas Regulamentadoras (NRs) de segurança e saúde no trabalho no Brasil?', [
  'O Ministério do Trabalho e Emprego',
  'A prefeitura de cada cidade',
  'Cada empresa cria as suas próprias NRs',
  'O sindicato dos trabalhadores',
], 'As NRs são publicadas pelo Ministério do Trabalho e Emprego (MTE) e valem para as organizações que têm empregados regidos pela CLT.');
c(32, 'azul', 'Quais são os dois documentos que, no mínimo, compõem o PGR?', [
  'Inventário de riscos e plano de ação',
  'Folha de pagamento e cartão de ponto',
  'Contrato de trabalho e carteira assinada',
  'Organograma e missão da empresa',
], 'Pela NR-1, o PGR deve conter, no mínimo, o inventário de riscos e o plano de ação.');
c(33, 'azul', 'O que é o inventário de riscos do PGR?', [
  'O registro dos perigos identificados e da avaliação dos riscos ocupacionais',
  'A lista de materiais do almoxarifado',
  'O cadastro de clientes da empresa',
  'O controle de férias dos empregados',
], 'O inventário de riscos reúne os dados da identificação de perigos e da avaliação dos riscos ocupacionais.');
c(34, 'azul', 'O que é o plano de ação do PGR?', [
  'O documento que indica as medidas de prevenção a implantar, com cronograma e responsáveis',
  'O plano de marketing da empresa',
  'A agenda de festas de fim de ano',
  'O planejamento de vendas do próximo mês',
], 'O plano de ação indica as medidas de prevenção a serem introduzidas, aprimoradas ou mantidas, com cronograma, formas de acompanhamento e aferição de resultados.');
c(35, 'azul', 'Qual é a primeira medida na hierarquia de prevenção da NR-1?', [
  'Eliminar o fator de risco',
  'Entregar EPI aos trabalhadores',
  'Colocar uma placa de aviso',
  'Fazer um treinamento',
], 'A prioridade é eliminar os fatores de risco. Depois vêm a proteção coletiva, as medidas administrativas e, por fim, o EPI.');
c(36, 'azul', 'Na hierarquia de prevenção, o EPI (Equipamento de Proteção Individual) é usado…', [
  'Quando as medidas coletivas e administrativas não forem suficientes ou viáveis',
  'Sempre como primeira e única medida',
  'Somente em escritórios',
  'Apenas quando o trabalhador pedir',
], 'O EPI é usado de forma complementar ou quando as medidas de proteção coletiva e administrativas não forem viáveis ou suficientes.');
c(37, 'azul', 'O que significa EPC?', [
  'Equipamento de Proteção Coletiva',
  'Exame Periódico Completo',
  'Equipe de Prevenção Comunitária',
  'Estudo de Postura Corporal',
], 'EPC é o Equipamento de Proteção Coletiva, como guarda-corpos, exaustores e proteções em máquinas, que protege todos ao redor.');
c(38, 'azul', 'O que significa EPI?', [
  'Equipamento de Proteção Individual',
  'Exame Prévio de Integração',
  'Escala de Produção Interna',
  'Equipe de Primeiros Instrumentos',
], 'EPI é o Equipamento de Proteção Individual, como capacete, luvas e protetor auricular, usado por cada trabalhador.');
c(39, 'azul', 'Qual destes é um RISCO FÍSICO?', [
  'Ruído', 'Assédio moral', 'Vírus', 'Solvente',
], 'Ruído, calor, frio, vibração e radiações são riscos físicos. Vírus é biológico e solvente é químico.');
c(40, 'azul', 'Qual destes é um RISCO QUÍMICO?', [
  'Poeiras e vapores de produtos de limpeza',
  'Vibração de máquinas',
  'Bactérias',
  'Jornada excessiva',
], 'Poeiras, fumos, névoas, gases e vapores de produtos são exemplos de riscos químicos.');
c(41, 'azul', 'Qual destes é um RISCO BIOLÓGICO?', [
  'Contato com vírus, bactérias ou fungos',
  'Calor intenso',
  'Postura inadequada',
  'Iluminação fraca',
], 'Vírus, bactérias, fungos e parasitas são agentes biológicos, comuns em hospitais, laboratórios e coleta de lixo.');
c(42, 'azul', 'Qual destes é um fator de risco ERGONÔMICO?', [
  'Levantar peso em excesso e manter postura inadequada',
  'Radiação ionizante',
  'Contato com bactérias',
  'Gases tóxicos',
], 'Levantamento de peso, postura inadequada, movimentos repetitivos e mobiliário inadequado são fatores ergonômicos (tratados também na NR-17).');
c(43, 'azul', 'Qual destes é um risco de ACIDENTE (mecânico)?', [
  'Máquina sem proteção nas partes móveis',
  'Trabalho em equipe',
  'Pausa para o café',
  'Ventilação adequada',
], 'Máquinas sem proteção, arranjo físico inadequado, ferramentas defeituosas e risco de queda são riscos de acidente.');
c(44, 'azul', 'A avaliação de riscos do PGR deve ser feita uma única vez e nunca mais revista?', SIM_NAO(false),
  'Não. A avaliação deve ser revista periodicamente e sempre que houver mudanças, como novos processos, acidentes ou novas tecnologias.');
c(45, 'azul', 'Para avaliar um risco, a NR-1 considera principalmente…', [
  'A severidade do possível dano e a probabilidade de ele ocorrer',
  'O salário dos trabalhadores envolvidos',
  'A opinião apenas do dono da empresa',
  'A cor do ambiente de trabalho',
], 'O nível de risco é definido combinando a severidade das possíveis lesões ou agravos à saúde com a probabilidade de ocorrência.');
c(46, 'azul', 'Os trabalhadores podem participar do gerenciamento de riscos?', SIM_NAO(true),
  'Sim. A NR-1 prevê a consulta aos trabalhadores quanto à percepção de riscos ocupacionais.');
c(47, 'azul', 'O que a NR-1 diz sobre situações de grave e iminente risco?', [
  'O trabalhador pode interromper a atividade e deve comunicar imediatamente o superior',
  'O trabalhador deve continuar até terminar a tarefa',
  'Só o diretor pode decidir parar a atividade',
  'O trabalhador deve resolver sozinho sem avisar ninguém',
], 'A NR-1 garante ao trabalhador o direito de interromper suas atividades diante de risco grave e iminente, comunicando o fato imediatamente ao superior.');
c(48, 'azul', 'A NR-1 exige que a organização se prepare para emergências?', SIM_NAO(true),
  'Sim. A organização deve estabelecer, implementar e manter procedimentos de resposta aos cenários de emergência, conforme seus riscos.');
c(49, 'azul', 'O que é um acidente de trabalho?', [
  'Um evento ocorrido pelo exercício do trabalho que causa lesão ou perturbação à saúde',
  'Qualquer atraso para chegar ao serviço',
  'Um erro de digitação em um relatório',
  'Uma discussão sobre metas',
], 'Acidente de trabalho é aquele que ocorre pelo exercício do trabalho e provoca lesão corporal ou perturbação funcional.');
c(50, 'azul', 'O que significa CAT?', [
  'Comunicação de Acidente de Trabalho',
  'Cadastro de Atividades Temporárias',
  'Controle Anual de Treinamentos',
  'Certificado de Aptidão Técnica',
], 'A CAT (Comunicação de Acidente de Trabalho) é o documento usado para registrar acidentes e doenças relacionadas ao trabalho.');
c(51, 'azul', 'A capacitação em segurança deve ocorrer em que momento?', [
  'Antes de o trabalhador iniciar suas funções e periodicamente, conforme as NRs',
  'Somente depois de o primeiro acidente acontecer',
  'Apenas quando o trabalhador se aposentar',
  'Nunca, se ele já tiver experiência',
], 'A NR-1 prevê treinamento inicial antes do início das funções, além de treinamentos periódicos e eventuais quando necessário.');
c(52, 'azul', 'Treinamentos de segurança podem ser feitos a distância (EAD), conforme a NR-1?', [
  'Sim, desde que sigam os requisitos da norma',
  'Não, nunca',
  'Sim, sem nenhuma regra',
  'Só se o trabalhador pagar',
], 'A NR-1 permite capacitações a distância ou semipresenciais, desde que atendidos os requisitos do seu anexo, exceto quando outra NR exigir parte prática presencial.');
c(53, 'azul', 'O que significa SST?', [
  'Segurança e Saúde no Trabalho',
  'Sistema de Salário e Tributos',
  'Serviço Social Temporário',
  'Setor de Suprimentos Técnicos',
], 'SST significa Segurança e Saúde no Trabalho, a área que cuida da prevenção de acidentes e doenças ocupacionais.');
c(54, 'azul', 'Qual destas NRs trata especificamente de Ergonomia?', [
  'NR-17', 'NR-1', 'NR-6', 'NR-10',
], 'A NR-17 trata de Ergonomia. A NR-6 trata de EPI e a NR-10 de segurança em eletricidade.');

/* LARANJA — Saúde Mental (55 a 78) */
c(55, 'laranja', 'O que é a Síndrome de Burnout?', [
  'Um esgotamento profissional ligado ao estresse crônico no trabalho',
  'Uma alergia a produtos de limpeza',
  'Uma lesão causada por queda',
  'Uma doença transmitida por mosquitos',
], 'Burnout é a síndrome do esgotamento profissional, ligada ao estresse crônico no trabalho que não foi bem gerenciado.');
c(56, 'laranja', 'Qual destes pode ser um sinal de esgotamento no trabalho?', [
  'Cansaço extremo, irritação e sensação de não dar conta',
  'Disposição e motivação constantes',
  'Dormir bem todas as noites',
  'Vontade de aprender coisas novas',
], 'Cansaço extremo, irritabilidade, distanciamento e sensação de incapacidade são sinais de alerta que merecem atenção.');
c(57, 'laranja', 'O que é assédio moral no trabalho?', [
  'Exposição repetida a situações humilhantes ou constrangedoras',
  'Receber um elogio do chefe',
  'Ter uma meta desafiadora, mas possível',
  'Participar de uma reunião de feedback respeitosa',
], 'Assédio moral é a exposição repetitiva e prolongada a situações humilhantes e constrangedoras no trabalho.');
c(58, 'laranja', 'O assédio sexual no trabalho é…', [
  'Uma conduta grave, que deve ser denunciada e combatida',
  'Uma simples brincadeira',
  'Algo normal entre colegas',
  'Responsabilidade apenas da vítima',
], 'Assédio sexual é uma conduta grave e, no Brasil, também é crime. A empresa deve prevenir, acolher denúncias e apurar.');
c(59, 'laranja', 'Pausas durante a jornada ajudam a saúde do trabalhador?', SIM_NAO(true),
  'Sim. Pausas ajudam a recuperar a energia, reduzem a fadiga e o estresse e diminuem o risco de erros.');
c(60, 'laranja', 'Baixa autonomia (não ter nenhum controle sobre como fazer o trabalho) é um fator de risco psicossocial?', SIM_NAO(true),
  'Sim. A falta de controle sobre o próprio trabalho é um fator de risco psicossocial reconhecido.');
c(61, 'laranja', 'Falta de clareza sobre o que se espera do trabalhador (papéis confusos) pode prejudicar a saúde mental?', SIM_NAO(true),
  'Sim. A ambiguidade de papéis gera insegurança e estresse e é considerada um fator de risco psicossocial.');
c(62, 'laranja', 'Qual atitude da liderança ajuda a proteger a saúde mental da equipe?', [
  'Dar feedbacks respeitosos e distribuir as tarefas de forma justa',
  'Expor erros dos funcionários na frente de todos',
  'Mandar mensagens de trabalho de madrugada',
  'Ignorar quando alguém pede ajuda',
], 'Feedbacks respeitosos, tarefas bem distribuídas e abertura ao diálogo reduzem fatores de risco psicossociais.');
c(63, 'laranja', 'Trabalhar sempre além da jornada, sem descanso, pode prejudicar a saúde?', SIM_NAO(true),
  'Sim. Jornadas excessivas sem descanso adequado aumentam a fadiga, o estresse e o risco de adoecimento e de acidentes.');
c(64, 'laranja', 'Qual é um exemplo de violência no trabalho?', [
  'Ameaças e agressões verbais contra um colega',
  'Uma reunião para planejar o mês',
  'Um elogio público por um bom resultado',
  'Uma pausa para o almoço',
], 'Ameaças, agressões verbais ou físicas e intimidações são formas de violência no trabalho e precisam ser prevenidas.');
c(65, 'laranja', 'Isolar propositalmente um colega da equipe pode ser uma forma de assédio?', SIM_NAO(true),
  'Sim. Isolar, ignorar ou excluir alguém de forma intencional e repetida pode caracterizar assédio moral.');
c(66, 'laranja', 'Por que é importante falar sobre saúde mental no trabalho?', [
  'Para reduzir o preconceito e ajudar as pessoas a buscar apoio cedo',
  'Para identificar quem é "fraco" e demitir',
  'Não é importante, é assunto só da vida pessoal',
  'Para aumentar a carga de trabalho',
], 'Falar sobre saúde mental reduz o estigma e facilita que as pessoas busquem ajuda antes de o problema se agravar.');
c(67, 'laranja', 'Metas impossíveis de atingir, cobradas de forma constante, podem gerar…', [
  'Estresse e adoecimento',
  'Mais saúde e bem-estar',
  'Nenhum efeito',
  'Apenas mais lucro, sem consequências',
], 'Metas inatingíveis e pressão constante estão entre os fatores de risco psicossociais que podem levar ao estresse e ao adoecimento.');
c(68, 'laranja', 'Conflitos entre colegas devem ser…', [
  'Tratados com diálogo e mediação adequada',
  'Ignorados até sumirem sozinhos',
  'Resolvidos com gritos',
  'Espalhados como fofoca',
], 'Conflitos mal resolvidos prejudicam o clima. Diálogo e mediação adequada ajudam a resolvê-los de forma saudável.');
c(69, 'laranja', 'O medo de perder o emprego o tempo todo pode afetar a saúde mental?', SIM_NAO(true),
  'Sim. A insegurança constante no trabalho é um fator que pode gerar ansiedade e estresse.');
c(70, 'laranja', 'Estar sempre disponível no celular para o trabalho, até nas folgas, pode prejudicar a saúde?', SIM_NAO(true),
  'Sim. A falta de desconexão impede o descanso e aumenta o risco de esgotamento.');
c(71, 'laranja', 'O que é um ambiente de trabalho psicologicamente seguro?', [
  'Um ambiente onde as pessoas podem falar, errar e pedir ajuda sem medo de humilhação',
  'Um ambiente onde ninguém pode discordar do chefe',
  'Um local com câmeras em todos os cantos',
  'Um local onde erros são punidos publicamente',
], 'Segurança psicológica é poder se expressar, apontar problemas e pedir ajuda sem medo de punição ou humilhação.');
c(72, 'laranja', 'Reconhecer o bom trabalho dos colaboradores contribui para…', [
  'A motivação e o bem-estar da equipe',
  'O aumento do assédio',
  'A piora do clima',
  'Nada, não faz diferença',
], 'O reconhecimento é um fator de proteção: aumenta a motivação, o senso de valor e o bem-estar.');
c(73, 'laranja', 'Um colega parece muito triste e desmotivado há semanas. Qual atitude é adequada?', [
  'Acolher, conversar com respeito e indicar canais de apoio',
  'Fazer piadas para ele "esquecer"',
  'Contar para toda a equipe',
  'Ignorar, pois não é problema seu',
], 'Acolher com respeito e indicar canais de apoio (RH, saúde ocupacional, serviços de saúde) pode fazer muita diferença.');
c(74, 'laranja', 'A NR-1 atualizada exige que a empresa considere os riscos psicossociais no PGR?', SIM_NAO(true),
  'Sim. Com a atualização da NR-1, os fatores de risco psicossociais relacionados ao trabalho devem ser identificados e avaliados no gerenciamento de riscos.');
c(75, 'laranja', 'Trabalho monótono e repetitivo, sem variação, pode ser um fator de risco?', SIM_NAO(true),
  'Sim. Tarefas monótonas e repetitivas podem gerar desgaste físico e mental.');
c(76, 'laranja', 'Qual destas é uma boa prática para equilibrar trabalho e vida pessoal?', [
  'Respeitar horários de descanso e as férias',
  'Responder e-mails de trabalho de madrugada',
  'Nunca tirar férias',
  'Pular refeições para trabalhar mais',
], 'Respeitar descansos, folgas e férias é essencial para a recuperação física e mental.');
c(77, 'laranja', 'Comunicação clara e respeitosa entre equipes ajuda a prevenir o estresse?', SIM_NAO(true),
  'Sim. A boa comunicação evita mal-entendidos, retrabalho e conflitos, reduzindo o estresse.');
c(78, 'laranja', 'Quem é responsável por promover um ambiente de trabalho saudável?', [
  'A organização, com a colaboração de lideranças e trabalhadores',
  'Somente o trabalhador doente',
  'Apenas o médico do trabalho',
  'Ninguém, é questão de sorte',
], 'A organização tem o dever de gerenciar os riscos, e lideranças e trabalhadores colaboram para um ambiente saudável.');

/* VERDE — Responsabilidades (79 a 102) */
c(79, 'verde', 'Quem deve fornecer o EPI ao trabalhador?', [
  'A empresa, gratuitamente',
  'O próprio trabalhador, com seu salário',
  'O sindicato',
  'A família do trabalhador',
], 'Pela NR-6, a organização deve fornecer o EPI adequado ao risco, gratuitamente e em perfeito estado.');
c(80, 'verde', 'Qual é a obrigação do trabalhador em relação ao EPI?', [
  'Usar o EPI corretamente e cuidar da sua conservação',
  'Vender o EPI se não precisar',
  'Usar só quando o chefe estiver olhando',
  'Modificar o EPI para ficar mais confortável',
], 'O trabalhador deve usar o EPI apenas para a finalidade a que se destina, guardá-lo, conservá-lo e comunicar qualquer dano.');
c(81, 'verde', 'A empresa deve informar os trabalhadores sobre os riscos do seu trabalho?', SIM_NAO(true),
  'Sim. A NR-1 determina que a organização informe os trabalhadores sobre os riscos ocupacionais e as medidas de prevenção.');
c(82, 'verde', 'O que é a CIPA?', [
  'Comissão Interna de Prevenção de Acidentes e de Assédio',
  'Central de Informações de Pagamentos',
  'Comitê de Integração de Pessoas Admitidas',
  'Cadastro Interno de Produtos e Almoxarifado',
], 'A CIPA (NR-5) é a Comissão Interna de Prevenção de Acidentes e de Assédio, formada por representantes da empresa e dos trabalhadores.');
c(83, 'verde', 'Desde a Lei 14.457/2022, a CIPA também passou a atuar na prevenção de…', [
  'Assédio sexual e outras formas de violência no trabalho',
  'Atrasos no pagamento',
  'Faltas por motivo de chuva',
  'Erros de digitação',
], 'A Lei 14.457/2022 incluiu a prevenção e o combate ao assédio sexual e a outras formas de violência entre as atribuições da CIPA.');
c(84, 'verde', 'O trabalhador deve cumprir as ordens de serviço sobre segurança?', SIM_NAO(true),
  'Sim. Cumprir as disposições legais e as ordens de serviço sobre segurança e saúde é dever do trabalhador.');
c(85, 'verde', 'Quem deve elaborar e implementar o PGR?', [
  'A organização (empresa)',
  'Cada trabalhador sozinho',
  'Os clientes da empresa',
  'Os vizinhos da empresa',
], 'A responsabilidade pelo PGR é da organização, que pode contar com profissionais de SST e com a participação dos trabalhadores.');
c(86, 'verde', 'Recusar-se, sem justificativa, a usar o EPI fornecido pode ter consequências para o trabalhador?', SIM_NAO(true),
  'Sim. A recusa injustificada em cumprir normas de segurança, como usar o EPI, pode gerar medidas disciplinares.');
c(87, 'verde', 'O que significa PCMSO?', [
  'Programa de Controle Médico de Saúde Ocupacional',
  'Plano de Cargos e Metas do Setor Operacional',
  'Programa de Cadastro de Materiais e Serviços',
  'Protocolo de Contratação de Mão de Obra',
], 'O PCMSO (NR-7) é o Programa de Controle Médico de Saúde Ocupacional, que acompanha a saúde dos trabalhadores com exames ocupacionais.');
c(88, 'verde', 'Qual exame o trabalhador deve fazer antes de começar a trabalhar?', [
  'O exame admissional',
  'O exame de direção',
  'A prova do ENEM',
  'Nenhum exame',
], 'O exame médico admissional, previsto no PCMSO, deve ser realizado antes de o trabalhador assumir suas atividades.');
c(89, 'verde', 'O RH pode ajudar na integração de novos funcionários com orientações de segurança?', SIM_NAO(true),
  'Sim. A integração é um ótimo momento para apresentar riscos, procedimentos seguros e canais de comunicação.');
c(90, 'verde', 'Quem pode comunicar um risco no trabalho?', [
  'Qualquer trabalhador',
  'Apenas o diretor',
  'Somente quem trabalha há mais de 10 anos',
  'Apenas os clientes',
], 'Todos podem e devem comunicar riscos. Quanto mais cedo um perigo é relatado, mais fácil é evitar acidentes.');
c(91, 'verde', 'A empresa deve investigar os acidentes de trabalho?', SIM_NAO(true),
  'Sim. A NR-1 prevê a análise de acidentes e doenças relacionadas ao trabalho para evitar que se repitam.');
c(92, 'verde', 'O objetivo da investigação de um acidente é…', [
  'Entender as causas para evitar que aconteça de novo',
  'Encontrar um culpado para punir',
  'Esconder o ocorrido',
  'Aumentar a burocracia',
], 'O foco da análise de acidentes é identificar as causas e corrigir as falhas, não apenas procurar culpados.');
c(93, 'verde', 'Os registros de treinamento devem ser guardados pela empresa?', SIM_NAO(true),
  'Sim. A empresa deve emitir certificado e manter os registros de capacitação, com conteúdo, carga horária, data e instrutor.');
c(94, 'verde', 'Terceirizados que trabalham dentro da empresa também devem ser protegidos contra riscos?', SIM_NAO(true),
  'Sim. A NR-1 prevê que contratantes e contratadas coordenem o gerenciamento dos riscos quando trabalham no mesmo local.');
c(95, 'verde', 'Qual atitude do líder ajuda a prevenir acidentes?', [
  'Dar o exemplo, seguindo e cobrando os procedimentos de segurança',
  'Pular etapas de segurança para ganhar tempo',
  'Rir de quem usa EPI',
  'Esconder pequenos acidentes',
], 'Líderes que dão o exemplo e valorizam a segurança fortalecem a cultura de prevenção.');
c(96, 'verde', 'Manter o local de trabalho limpo e organizado ajuda na segurança?', SIM_NAO(true),
  'Sim. Organização e limpeza reduzem quedas, tropeços, incêndios e outros acidentes.');
c(97, 'verde', 'Quem deve ser informado quando um EPI estiver danificado?', [
  'O responsável ou superior, para a troca',
  'Ninguém, é só continuar usando',
  'Apenas os amigos de setor',
  'O cliente',
], 'Ao perceber dano no EPI, o trabalhador deve comunicar o responsável para que ele seja substituído.');
c(98, 'verde', 'A empresa precisa manter o PGR atualizado quando muda processos ou equipamentos?', SIM_NAO(true),
  'Sim. Mudanças em processos, equipamentos ou ambientes exigem revisão da avaliação de riscos e do PGR.');
c(99, 'verde', 'Qual é uma responsabilidade do RH em relação ao assédio?', [
  'Divulgar regras de conduta, acolher denúncias e garantir o sigilo',
  'Expor publicamente quem denunciou',
  'Arquivar todas as denúncias sem ler',
  'Proteger apenas os cargos mais altos',
], 'O RH deve apoiar regras de conduta, canais de denúncia com sigilo, acolhimento e encaminhamento para apuração.');
c(100, 'verde', 'A empresa deve oferecer canais de denúncia que protejam quem denuncia?', SIM_NAO(true),
  'Sim. Canais seguros, com sigilo e sem retaliação, são fundamentais para que os problemas venham à tona.');
c(101, 'verde', 'Quando a empresa entrega o EPI ao trabalhador, ela deve…', [
  'Orientar sobre o uso correto e registrar a entrega',
  'Apenas jogar o EPI na mesa',
  'Cobrar pelo equipamento',
  'Exigir que o trabalhador compre a reposição',
], 'A organização deve orientar e treinar sobre o uso, a guarda e a conservação do EPI, além de registrar o fornecimento.');
c(102, 'verde', 'Segurança no trabalho é responsabilidade de quem?', [
  'De todos: empresa, lideranças e trabalhadores',
  'Só do técnico de segurança',
  'Só do RH',
  'Só de quem já sofreu acidente',
], 'A prevenção é um compromisso coletivo: a empresa gerencia os riscos e todos colaboram com as medidas de segurança.');

/* ROXO — Situações-Problema (103 a 126) */
c(103, 'roxo', 'Uma máquina está com a proteção quebrada e o colega diz: "dá para usar assim mesmo". O que fazer?', [
  'Não usar a máquina e comunicar o responsável',
  'Usar com cuidado para não atrasar a produção',
  'Retirar de vez a proteção',
  'Pedir para outra pessoa usar no seu lugar',
], 'Máquina sem proteção é um perigo grave. O correto é não operar e comunicar o responsável para o conserto.');
c(104, 'roxo', 'Um colega sempre faz "piadas" sobre a aparência de outra funcionária, que fica constrangida. Isso é aceitável?', SIM_NAO(false),
  'Não. Comentários constrangedores e repetidos podem caracterizar assédio e devem ser comunicados pelos canais apropriados.');
c(105, 'roxo', 'Um extintor está bloqueado por caixas no corredor. Qual é a melhor atitude?', [
  'Comunicar o responsável e liberar o acesso, se for seguro',
  'Deixar como está, ninguém vai precisar',
  'Esconder mais caixas na frente',
  'Tirar o extintor do lugar e guardar no armário',
], 'Extintores e rotas de fuga devem ficar sempre desobstruídos para uso rápido em emergências.');
c(106, 'roxo', 'Uma trabalhadora sente dor no punho após meses digitando sem pausas. O que é recomendado?', [
  'Comunicar a situação, buscar avaliação de saúde e rever o posto e as pausas',
  'Ignorar a dor e digitar mais rápido',
  'Tomar remédio por conta própria e não contar a ninguém',
  'Trabalhar com o punho imobilizado sem orientação',
], 'Dores repetidas podem indicar problemas ergonômicos. É importante comunicar, buscar avaliação e adequar o posto e as pausas.');
c(107, 'roxo', 'Um novo funcionário vai operar uma empilhadeira sem nunca ter sido treinado. O que deve ser feito?', [
  'Ele só deve operar após receber capacitação e autorização',
  'Ele pode aprender sozinho na prática',
  'Basta assistir a um vídeo na internet',
  'Pode operar se prometer tomar cuidado',
], 'Operar equipamentos sem capacitação expõe o trabalhador e os colegas a riscos graves. Treinamento e autorização vêm antes.');
c(108, 'roxo', 'Na empresa, quem denuncia problemas acaba sendo "perseguido". Qual é o problema?', [
  'Falta de proteção contra retaliação, o que desestimula as denúncias',
  'Não há problema, quem reclama merece',
  'As pessoas denunciam demais',
  'O problema é ter canal de denúncia',
], 'Sem proteção contra retaliação, as pessoas param de relatar riscos e abusos. A empresa deve garantir sigilo e proteção.');
c(109, 'roxo', 'Um vazamento de produto químico aparece no chão do almoxarifado. Qual é a atitude correta?', [
  'Isolar a área, afastar as pessoas e acionar o responsável',
  'Limpar com as mãos rapidamente',
  'Jogar água sem saber qual é o produto',
  'Ignorar e continuar trabalhando',
], 'Diante de vazamentos, a prioridade é isolar o local, afastar as pessoas e seguir o procedimento de emergência.');
c(110, 'roxo', 'Um supervisor grita e xinga a equipe toda vez que uma meta não é batida. O que isso pode indicar?', [
  'Um fator de risco psicossocial, que pode caracterizar assédio moral',
  'Uma forma eficiente de liderança',
  'Algo normal e saudável',
  'Um risco físico',
], 'Gritos e xingamentos repetidos criam um ambiente hostil e podem caracterizar assédio moral. Devem ser tratados pela organização.');
c(111, 'roxo', 'O alarme de incêndio toca durante o expediente. O que fazer?', [
  'Seguir a rota de fuga e o ponto de encontro, sem usar o elevador',
  'Terminar a tarefa antes de sair',
  'Pegar o elevador para sair mais rápido',
  'Voltar para buscar objetos pessoais',
], 'Em emergências, siga as rotas de fuga e as orientações da brigada. Elevadores não devem ser usados em caso de incêndio.');
c(112, 'roxo', 'Um trabalhador precisa trocar uma lâmpada no alto e pensa em subir numa cadeira giratória. O que é correto?', [
  'Usar uma escada adequada e em bom estado, seguindo as orientações',
  'Subir na cadeira, é rapidinho',
  'Empilhar caixas para alcançar',
  'Pedir para alguém segurar a cadeira enquanto ela gira',
], 'Improvisos para trabalhar em altura causam muitas quedas. Use equipamentos adequados e siga os procedimentos.');
c(113, 'roxo', 'A empresa colocou cartazes sobre segurança, mas não corrigiu a fiação exposta. O problema foi resolvido?', SIM_NAO(false),
  'Não. Avisos e campanhas não substituem a correção do perigo. A fiação exposta precisa ser consertada.');
c(114, 'roxo', 'Uma funcionária grávida trabalha exposta a um produto químico perigoso. O que a empresa deve fazer?', [
  'Avaliar o risco e adotar medidas de proteção, como mudar a atividade se necessário',
  'Nada, pois ela já sabia dos riscos',
  'Demiti-la',
  'Pedir que ela use dois pares de luvas e continue',
], 'A organização deve considerar as condições das trabalhadoras gestantes e lactantes na avaliação de riscos e adotar medidas de proteção.');
c(115, 'roxo', 'Um colega chega ao trabalho visivelmente sob efeito de álcool para operar uma máquina. O que fazer?', [
  'Comunicar a liderança para que ele não opere a máquina',
  'Deixar ele trabalhar, é problema dele',
  'Oferecer café e mandar operar',
  'Filmar e postar nas redes',
], 'A situação coloca em risco o trabalhador e os colegas. A liderança deve ser comunicada para impedir a operação e encaminhar o caso.');
c(116, 'roxo', 'Uma equipe trabalha em um local muito quente, sem pausas nem água disponível. Que risco existe?', [
  'Risco físico (calor), que pode causar mal-estar e acidentes',
  'Risco biológico',
  'Nenhum, é só se acostumar',
  'Risco psicossocial apenas',
], 'O calor excessivo é um risco físico. Medidas como hidratação, pausas e ventilação são necessárias.');
c(117, 'roxo', 'Um trabalhador sofreu um corte leve e não quer registrar "para não dar trabalho". O que é correto?', [
  'Registrar o ocorrido e receber atendimento, mesmo que pareça leve',
  'Esconder para não atrapalhar os indicadores',
  'Colocar uma fita adesiva e esquecer',
  'Registrar só se infeccionar',
], 'Todo acidente deve ser comunicado. Registrar ajuda a cuidar da pessoa e a corrigir a causa antes que algo pior aconteça.');
c(118, 'roxo', 'Um setor tem muitas faltas por adoecimento e alta rotatividade. O que a empresa pode investigar?', [
  'Possíveis fatores de risco psicossociais e condições de trabalho do setor',
  'Apenas punir quem falta',
  'Nada, é coincidência',
  'Contratar mais pessoas sem mudar nada',
], 'Muitas faltas e alta rotatividade podem indicar problemas no ambiente de trabalho, como sobrecarga ou conflitos, que devem ser avaliados.');
c(119, 'roxo', 'Uma escada do prédio está sem corrimão. Qual é a medida adequada?', [
  'Instalar o corrimão (proteção coletiva) e sinalizar até a correção',
  'Proibir as pessoas de usar a escada para sempre',
  'Pedir que todos subam devagar e pronto',
  'Dar luvas a todos',
], 'O corrimão é uma proteção coletiva que reduz o risco de queda. Até a correção, a área deve ser sinalizada.');
c(120, 'roxo', 'Um funcionário relata ao RH que está sofrendo assédio. Qual deve ser a postura do RH?', [
  'Acolher, garantir sigilo e encaminhar para apuração',
  'Dizer que ele está exagerando',
  'Contar ao acusado quem fez a denúncia',
  'Mandar resolver sozinho',
], 'O RH deve acolher com respeito, manter o sigilo e encaminhar o caso para apuração pelos meios apropriados.');
c(121, 'roxo', 'Trabalhadores reclamam de dor de cabeça e cansaço pelo barulho constante no setor. O que fazer?', [
  'Avaliar o ruído e adotar medidas, priorizando a redução na fonte',
  'Aumentar o volume do rádio para disfarçar',
  'Ignorar, o barulho é normal',
  'Pedir que falem mais alto',
], 'O ruído é um risco físico. O ideal é reduzi-lo na fonte ou com proteção coletiva, usando protetor auricular de forma complementar.');
c(122, 'roxo', 'Uma empresa só faz treinamentos de segurança depois que acontece um acidente. Isso é o ideal?', SIM_NAO(false),
  'Não. A prevenção deve ser contínua: treinamentos devem ocorrer antes do início das atividades e periodicamente.');
c(123, 'roxo', 'Um operador percebe um cheiro forte de gás perto do refeitório. O que fazer?', [
  'Não acender nada, afastar as pessoas e acionar a emergência',
  'Acender um isqueiro para ver de onde vem',
  'Ligar os aparelhos elétricos para ventilar',
  'Esperar o cheiro passar sozinho',
], 'Em caso de vazamento de gás, evite qualquer fonte de ignição, afaste as pessoas e acione o procedimento de emergência.');
c(124, 'roxo', 'Um líder exige que a equipe responda mensagens de trabalho em qualquer horário, até nas férias. Que risco existe?', [
  'Um fator de risco psicossocial ligado à falta de descanso e desconexão',
  'Um risco químico',
  'Nenhum risco',
  'Um risco mecânico',
], 'Exigir disponibilidade permanente impede o descanso e favorece o esgotamento. É um fator de risco psicossocial.');
c(125, 'roxo', 'Um setor tem cadeiras quebradas e telas de computador muito baixas. Qual tipo de risco é esse?', [
  'Ergonômico', 'Biológico', 'Químico', 'Radiação',
], 'Mobiliário inadequado e postura forçada são fatores de risco ergonômicos, tratados também na NR-17.');
c(126, 'roxo', 'Na reunião, um funcionário aponta um risco e o chefe responde: "Aqui ninguém reclama". Que cultura isso mostra?', [
  'Uma cultura que desestimula a prevenção e precisa mudar',
  'Uma cultura de segurança exemplar',
  'Uma cultura de inovação',
  'Uma cultura de diálogo',
], 'Calar quem aponta riscos impede a prevenção. Uma cultura saudável valoriza quem comunica problemas.');

/* AMARELO — Desafios Rápidos (127 a 150) */
c(127, 'amarelo', 'Verdadeiro ou falso: o EPI deve ser fornecido gratuitamente pela empresa.', VF(true),
  'Verdadeiro. A NR-6 determina que o EPI seja fornecido gratuitamente, adequado ao risco e em perfeito estado.');
c(128, 'amarelo', 'Complete: PGR significa Programa de _____ de Riscos.', [
  'Gerenciamento', 'Garantia', 'Gratificação', 'Geração',
], 'PGR significa Programa de Gerenciamento de Riscos.');
c(129, 'amarelo', 'Verdadeiro ou falso: o EPI é sempre a primeira medida de proteção.', VF(false),
  'Falso. A prioridade é eliminar o risco, depois proteção coletiva e medidas administrativas. O EPI vem por último ou de forma complementar.');
c(130, 'amarelo', 'Complete: EPI significa Equipamento de Proteção _____.', [
  'Individual', 'Interna', 'Industrial', 'Integral',
], 'EPI significa Equipamento de Proteção Individual.');
c(131, 'amarelo', 'Verdadeiro ou falso: assédio moral pode acontecer entre colegas do mesmo nível, e não só do chefe para o funcionário.', VF(true),
  'Verdadeiro. O assédio pode ser de cima para baixo, entre colegas do mesmo nível ou até de subordinados contra a chefia.');
c(132, 'amarelo', 'Qual destes é um EPI?', [
  'Protetor auricular', 'Corrimão', 'Exaustor', 'Placa de sinalização',
], 'Protetor auricular é um EPI. Corrimão e exaustor são proteções coletivas e a placa é uma sinalização.');
c(133, 'amarelo', 'Qual destes é um EPC (proteção coletiva)?', [
  'Guarda-corpo em área elevada', 'Luva', 'Capacete', 'Óculos de segurança',
], 'O guarda-corpo protege todas as pessoas no local, por isso é uma proteção coletiva. Luvas, capacete e óculos são EPIs.');
c(134, 'amarelo', 'Verdadeiro ou falso: risco psicossocial é "frescura" e não precisa ser gerenciado.', VF(false),
  'Falso. Os fatores de risco psicossociais afetam a saúde dos trabalhadores e devem ser gerenciados conforme a NR-1.');
c(135, 'amarelo', 'Complete: CIPA é a Comissão Interna de Prevenção de Acidentes e de _____.', [
  'Assédio', 'Atrasos', 'Auditorias', 'Arquivos',
], 'Desde a Lei 14.457/2022, a CIPA é a Comissão Interna de Prevenção de Acidentes e de Assédio.');
c(136, 'amarelo', 'Verdadeiro ou falso: o trabalhador pode interromper a atividade diante de risco grave e iminente.', VF(true),
  'Verdadeiro. A NR-1 garante esse direito, e o trabalhador deve comunicar imediatamente o superior.');
c(137, 'amarelo', 'Qual cor é usada na sinalização de segurança para equipamentos de combate a incêndio?', [
  'Vermelho', 'Verde', 'Azul', 'Branco',
], 'O vermelho identifica equipamentos de proteção e combate a incêndio, como extintores e hidrantes.');
c(138, 'amarelo', 'Verdadeiro ou falso: uma placa de aviso elimina o perigo.', VF(false),
  'Falso. A sinalização alerta sobre o perigo, mas não o elimina. É preciso corrigir a causa.');
c(139, 'amarelo', 'Complete: ambiente de trabalho saudável é aquele que cuida da saúde física e _____.', [
  'Mental', 'Financeira', 'Digital', 'Esportiva',
], 'A saúde no trabalho envolve tanto a saúde física quanto a mental.');
c(140, 'amarelo', 'Verdadeiro ou falso: o treinamento de segurança substitui o conserto de um equipamento quebrado.', VF(false),
  'Falso. O treinamento é importante, mas não substitui a correção dos perigos.');
c(141, 'amarelo', 'Qual destes é um sinal de alerta de estresse no trabalho?', [
  'Insônia e irritação frequente', 'Bom humor constante', 'Sono tranquilo', 'Boa concentração',
], 'Insônia, irritação, dores de cabeça e dificuldade de concentração podem ser sinais de estresse.');
c(142, 'amarelo', 'Verdadeiro ou falso: a empresa pode cobrar do trabalhador pelo EPI que fornece para o trabalho.', VF(false),
  'Falso. O EPI deve ser fornecido gratuitamente ao trabalhador.');
c(143, 'amarelo', 'Complete: na dúvida sobre a segurança de uma tarefa, _____ antes de fazer.', [
  'Pergunte', 'Arrisque', 'Corra', 'Improvise',
], 'Na dúvida, pergunte ao responsável antes de executar a tarefa. Isso evita muitos acidentes.');
c(144, 'amarelo', 'Verdadeiro ou falso: o PGR vale apenas para indústrias, não para escritórios e lojas.', VF(false),
  'Falso. O gerenciamento de riscos se aplica às organizações em geral. Há regras simplificadas para alguns pequenos negócios de baixo risco, mas escritórios e lojas também têm riscos, como os ergonômicos e os psicossociais.');
c(145, 'amarelo', 'Qual destas atitudes é segura?', [
  'Usar o corrimão ao descer a escada', 'Correr no corredor molhado', 'Usar o celular dirigindo a empilhadeira', 'Subir em cadeira com rodinhas',
], 'Usar o corrimão é um hábito simples que reduz o risco de quedas.');
c(146, 'amarelo', 'Verdadeiro ou falso: as rotas de fuga podem ficar trancadas para evitar furtos.', VF(false),
  'Falso. Rotas de fuga e saídas de emergência devem ficar sempre desobstruídas e fáceis de abrir.');
c(147, 'amarelo', 'Complete: a CAT é a Comunicação de _____ de Trabalho.', [
  'Acidente', 'Atividade', 'Admissão', 'Ausência',
], 'CAT significa Comunicação de Acidente de Trabalho.');
c(148, 'amarelo', 'Verdadeiro ou falso: cuidar da segurança é responsabilidade só do técnico de segurança.', VF(false),
  'Falso. A segurança é responsabilidade de todos: organização, lideranças e trabalhadores.');
c(149, 'amarelo', 'Qual destes é um exemplo de medida administrativa de prevenção?', [
  'Rodízio de tarefas e pausas programadas', 'Usar luvas', 'Instalar um exaustor', 'Usar capacete',
], 'Rodízio de tarefas, pausas, procedimentos e treinamentos são medidas administrativas. Exaustor é proteção coletiva; luvas e capacete são EPIs.');
c(150, 'amarelo', 'Complete o lema: Trilha do RH — conhecimento que _____!', [
  'Protege', 'Cansa', 'Assusta', 'Atrapalha',
], 'Conhecimento que protege! Saber reconhecer riscos e agir com prevenção protege você e quem está ao seu redor.');

export const CARDS: Card[] = list;

export const CARD_BY_ID: Record<number, Card> = Object.fromEntries(CARDS.map((card) => [card.id, card]));
