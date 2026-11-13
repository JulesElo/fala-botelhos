/* ==========================================================================
   Fala, Botelhos — dados do protótipo
   Nomes de ruas, bairros e lugares são reais. Os PROBLEMAS, apoios, votos e
   datas são fictícios, criados só para demonstração.
   Para mudar um exemplo, edite apenas este arquivo.
   ========================================================================== */

// Etapas de um pedido
const STATUS = [
  { id: 'recebido',  label: 'Recebido',   color: 'var(--s-recebido)' },
  { id: 'analise',   label: 'Em análise', color: 'var(--s-analise)' },
  { id: 'agendado',  label: 'Agendado',   color: 'var(--s-agendado)' },
  { id: 'resolvido', label: 'Resolvido',  color: 'var(--s-resolvido)' }
];

// Tipos de problema. imp/urg = impacto e urgência padrão (1 baixo, 2 médio, 3 alto),
// atribuídos quando o servidor coloca o pedido "em análise".
const TIPOS = {
  asfalto:    { label: 'Buraco no asfalto',          imp: 3, urg: 2 },
  iluminacao: { label: 'Iluminação pública',         imp: 2, urg: 2 },
  calcada:    { label: 'Calçada e acessibilidade',   imp: 3, urg: 1 },
  bueiro:     { label: 'Bueiro e drenagem',          imp: 2, urg: 3 },
  lixo:       { label: 'Descarte irregular de lixo', imp: 2, urg: 1 },
  outro:      { label: 'Outro problema',             imp: 1, urg: 1 }
};

// Bairros e distritos. x/y = posição aproximada no mapa ilustrativo (1000 x 600).
const BAIRROS = [
  { n: 'Centro',                   x: 620, y: 300 },
  { n: 'Jardim Eldorado',          x: 430, y: 160 },
  { n: 'Santa Cruz',               x: 830, y: 160 },
  { n: 'João Rocha',               x: 860, y: 310 },
  { n: 'Jardim José Alexandre',    x: 830, y: 460 },
  { n: 'Jardim Ipê',               x: 590, y: 470 },
  { n: 'São Bento',                x: 420, y: 470 },
  { n: 'São Gonçalo de Botelhos',  x: 110, y: 110 },
  { n: 'Palmeiral',                x: 110, y: 490 },
  { n: 'Zona rural',               x: null, y: null }
];

// Pedidos de exemplo. hist = data em que entrou em cada etapa; dias = tempo até resolver.
let pedidos = [
  { id: 101, tipo: 'asfalto', titulo: 'Buraco grande depois de obra na rede de esgoto', end: 'Rua Tiradentes', bairro: 'Centro', x: 560, y: 250, status: 'agendado', copasa: true, imp: 3, urg: 3, apoios: 34, origem: 'app', hist: { recebido: '28/10', analise: '29/10', agendado: '03/11' }, agenda: '17/11/2026' },
  { id: 102, tipo: 'asfalto', titulo: 'Remendo afundado na pista', end: 'Av. Major Antônio A. Fernandes', bairro: 'Centro', x: 700, y: 300, status: 'resolvido', copasa: true, imp: 3, urg: 2, apoios: 21, origem: 'app', hist: { recebido: '06/10', analise: '07/10', agendado: '09/10', resolvido: '15/10' }, dias: 9, confirmado: true },
  { id: 103, tipo: 'calcada', titulo: 'Esquina sem rampa de acessibilidade', end: 'Rua Maria José Franco', bairro: 'Jardim Eldorado', x: 440, y: 135, status: 'analise', imp: 3, urg: 2, apoios: 18, origem: 'presencial', hist: { recebido: '24/10', analise: '27/10' } },
  { id: 104, tipo: 'iluminacao', titulo: 'Poste apagado há duas semanas', end: 'Rua Herculano do Lago', bairro: 'Santa Cruz', x: 860, y: 130, status: 'recebido', imp: null, urg: null, apoios: 6, origem: 'app', hist: { recebido: '12/11' } },
  { id: 105, tipo: 'bueiro', titulo: 'Bueiro entupido alaga a rua quando chove', end: 'Av. João Rocha', bairro: 'João Rocha', x: 880, y: 280, status: 'analise', imp: 2, urg: 3, apoios: 27, origem: 'app', hist: { recebido: '30/10', analise: '31/10' } },
  { id: 106, tipo: 'lixo', titulo: 'Entulho descartado na beira da estrada', end: 'Estrada para Palmeiral', bairro: 'Zona rural', x: 215, y: 520, status: 'recebido', imp: null, urg: null, apoios: 3, origem: 'presencial', hist: { recebido: '05/11' } },
  { id: 107, tipo: 'asfalto', titulo: 'Buracos na rua principal do distrito', end: 'Rua Tancredo Neves', bairro: 'Palmeiral', x: 125, y: 475, status: 'agendado', imp: 3, urg: 2, apoios: 12, origem: 'presencial', hist: { recebido: '18/10', analise: '21/10', agendado: '04/11' }, agenda: '19/11/2026' },
  { id: 108, tipo: 'calcada', titulo: 'Calçada quebrada no caminho da capela', end: 'Rua Olinto Paulino', bairro: 'São Gonçalo de Botelhos', x: 95, y: 125, status: 'analise', imp: 3, urg: 2, apoios: 9, origem: 'presencial', hist: { recebido: '22/10', analise: '28/10' } },
  { id: 109, tipo: 'iluminacao', titulo: 'Praça sem iluminação à noite', end: 'Praça Gabriel Botelho (Praça da Matriz)', bairro: 'Centro', x: 610, y: 335, status: 'resolvido', imp: 2, urg: 2, apoios: 15, origem: 'app', hist: { recebido: '26/10', analise: '27/10', agendado: '29/10', resolvido: '31/10' }, dias: 5, confirmado: false, meu: true },
  { id: 110, tipo: 'asfalto', titulo: 'Remendo da COPASA cedeu de novo', end: 'Rua Osvaldo Vieira', bairro: 'Jardim José Alexandre', x: 860, y: 445, status: 'recebido', copasa: true, imp: null, urg: null, apoios: 11, origem: 'app', hist: { recebido: '11/11' } },
  { id: 111, tipo: 'bueiro', titulo: 'Boca de lobo sem grade', end: 'Rua Monsenhor Ricardo Grela', bairro: 'Jardim Eldorado', x: 500, y: 190, status: 'resolvido', imp: 2, urg: 3, apoios: 8, origem: 'presencial', hist: { recebido: '01/10', analise: '02/10', agendado: '06/10', resolvido: '13/10' }, dias: 12, confirmado: true },
  { id: 112, tipo: 'calcada', titulo: 'Travessia de pedestres sem rampa', end: 'Rua 13 de Maio', bairro: 'Centro', x: 660, y: 370, status: 'agendado', imp: 3, urg: 2, apoios: 23, origem: 'app', hist: { recebido: '20/10', analise: '22/10', agendado: '05/11' }, agenda: '20/11/2026' },
  { id: 113, tipo: 'asfalto', titulo: 'Rua cheia de buracos depois das chuvas', end: 'Rua da Saudade', bairro: 'Jardim Ipê', x: 560, y: 465, status: 'analise', imp: 3, urg: 2, apoios: 7, origem: 'presencial', hist: { recebido: '03/11', analise: '06/11' } },
  { id: 114, tipo: 'iluminacao', titulo: 'Dois postes apagados no mesmo quarteirão', end: 'Av. Natalle Sgreccia', bairro: 'Jardim Ipê', x: 625, y: 500, status: 'recebido', imp: null, urg: null, apoios: 4, origem: 'app', hist: { recebido: '10/11' } },
  { id: 115, tipo: 'bueiro', titulo: 'Água parada na sarjeta', end: 'Rua Guanabara', bairro: 'Jardim Eldorado', x: 335, y: 250, status: 'analise', imp: 2, urg: 2, apoios: 5, origem: 'app', hist: { recebido: '04/11', analise: '07/11' } },
  { id: 116, tipo: 'calcada', titulo: 'Raiz de árvore levantou a calçada', end: 'Rua Independência', bairro: 'Santa Cruz', x: 760, y: 190, status: 'resolvido', imp: 3, urg: 1, apoios: 10, origem: 'app', hist: { recebido: '25/09', analise: '26/09', agendado: '01/10', resolvido: '09/10' }, dias: 14, confirmado: true },
  { id: 117, tipo: 'asfalto', titulo: 'Vala mal fechada após troca de rede', end: 'Av. João Batista de Abreu', bairro: 'João Rocha', x: 845, y: 345, status: 'agendado', copasa: true, imp: 3, urg: 2, apoios: 16, origem: 'app', hist: { recebido: '27/10', analise: '28/10', agendado: '06/11' }, agenda: '18/11/2026' },
  { id: 118, tipo: 'asfalto', titulo: 'Buraco na esquina', end: 'Rua Orlando Fonseca', bairro: 'Jardim José Alexandre', x: 775, y: 490, status: 'resolvido', imp: 3, urg: 2, apoios: 6, origem: 'presencial', hist: { recebido: '08/10', analise: '09/10', agendado: '13/10', resolvido: '15/10' }, dias: 7, confirmado: true }
];

// Consulta aberta do componente Decidir
const OPCOES = [
  { id: 'a', t: 'Recapeamento da Av. Major Antônio A. Fernandes', d: 'Trecho central, com mais pedidos de buracos e remendos no mapa.', o: 'Baseada em 14 pedidos do mapa', app: 118, pres: 22 },
  { id: 'b', t: 'Rampas e calçadas acessíveis no Jardim Ipê',     d: 'Rotas mais usadas por idosos e pessoas com deficiência no bairro.', o: 'Baseada no diagnóstico técnico e em 9 pedidos', app: 84, pres: 41 },
  { id: 'c', t: 'Arborização e bancos no Parque Municipal',        d: 'Plantio de mudas nativas e áreas de sombra.', o: 'Sugestão de moradores (52 apoios)', app: 96, pres: 15 },
  { id: 'd', t: 'Pavimentação do acesso a Palmeiral',              d: 'Trecho de terra que fica intransitável na época de chuva.', o: 'Pedida nos encontros presenciais', app: 37, pres: 63 }
];

// Sugestões dos moradores para as próximas consultas
let sugestoes = [
  { t: 'Recapeamento da Av. Dr. Ulisses Silva', ap: 31 },
  { t: 'Bancos e sombra na Praça Mozart Xavier Lopes', ap: 19 }
];

// Resultado da consulta anterior
const CONSULTA_ANTERIOR = {
  titulo: 'Consulta anterior · 2º semestre de 2026',
  opcoes: [
    { t: 'Recapeamento da Rua Tiradentes', pc: 43 },
    { t: 'Rampas de acessibilidade no Jardim Eldorado', pc: 35 },
    { t: 'Reforma do poliesportivo de Palmeiral', pc: 22 }
  ],
  participantes: '612 participantes · 488 pelo aplicativo e 124 nos encontros presenciais',
  respostas: [
    { tipo: 'ok',   texto: '<b>Resposta da prefeitura:</b> a mais votada foi executada. O recapeamento foi concluído em outubro de 2026.' },
    { tipo: 'warn', texto: '<b>Rampas no Jardim Eldorado:</b> incluídas no orçamento de 2027. As rampas das esquinas mais movimentadas foram antecipadas por segurança.' }
  ]
};

// Próximos encontros presenciais
const ENCONTROS = [
  { dia: '21', mes: 'NOV', lugar: 'Palmeiral', local: 'E.E. Afonso Romão de Siqueira · sábado, 9h' },
  { dia: '28', mes: 'NOV', lugar: 'São Gonçalo de Botelhos', local: 'Capela de São Gonçalo · sábado, 9h' },
  { dia: '05', mes: 'DEZ', lugar: 'Botelhos · sede', local: 'E.E. João de Souza Gonçalves · sábado, 9h' },
  { dia: '12', mes: 'DEZ', lugar: 'Botelhos · sede', local: 'Poliesportivo · sábado, 9h' }
];
