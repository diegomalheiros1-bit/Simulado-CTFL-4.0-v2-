'use strict';

const db = window.CTFL_DB || {};
const engine = window.quizEngine;

// ===== Q38 Formatting Patch v3.7.6 (only Official Q38) =====
function applyQ38Formatting(questionText, questionNumber) {
  if (questionNumber !== 38) return null;
  if (!questionText) return null;

  const markerStart = "O aplicativo desliga";
  const markerEnd = "Que informaÃ§Ãµes essenciais";

  const posStart = questionText.indexOf(markerStart);
  if (posStart === -1) return null;

  const before = questionText.slice(0, posStart).trim();

  const rest = questionText.slice(posStart);
  const posEnd = rest.indexOf(markerEnd);

  const block = (posEnd !== -1 ? rest.slice(0, posEnd) : rest).trim();
  const after = (posEnd !== -1 ? rest.slice(posEnd) : "").trim();

  // Return HTML with highlighted italic block, smaller font, no bold.
  return `
    <div class="leading-relaxed">${before}</div>
    <div class="my-5 px-5 py-4 rounded-2xl border border-indigo-400/30 bg-indigo-950/20 italic font-normal text-slate-300 text-sm whitespace-normal leading-snug">
      ${block}
    </div>
    <div class="leading-relaxed">${after}</div>
  `;
}


 // Banco de questÃµes utilizado pelo simulador.
  let currentSet = [], idx = 0, score = 0, selected = null, confirmed = false, attempts = [];
 let currentType = null, quizStartedAt = null, resultSaved = false;
 let timerInterval;
 let timerRemaining = 0;
 let timerPaused = false;
 // Formata o texto da questão para melhorar a leitura sem alterar conteúdo.
 function decodeMojibake(input) {
 const text = String(input ?? "");
 const suspicious = /[\u00c2\u00c3\u00e2\u00ef\u00bf\u00bd\u0191\u0192]|\u00c3[\x80-\xbf]|\u00c2[\x80-\xbf]/;
 if (!suspicious.test(text)) return text;

 const score = (value) => {
 const matches = String(value).match(/[\u00c2\u00c3\u00e2\u00ef\u00bf\u00bd\u0191\u0192]|\u00c3[\x80-\xbf]|\u00c2[\x80-\xbf]/g);
 return matches ? matches.length : 0;
 };

 const decodeWindows1252BytesAsUtf8 = (value) => {
 const cp1252Reverse = {
 "\u20ac": 0x80, "\u201a": 0x82, "\u0192": 0x83, "\u0191": 0x83, "\u201e": 0x84, "\u2026": 0x85,
 "\u2020": 0x86, "\u2021": 0x87, "\u02c6": 0x88, "\u2030": 0x89, "\u0160": 0x8a,
 "\u2039": 0x8b, "\u0152": 0x8c, "\u017d": 0x8e, "\u2018": 0x91, "\u2019": 0x92,
 "\u201c": 0x93, "\u201d": 0x94, "\u2022": 0x95, "\u2013": 0x96, "\u2014": 0x97,
 "\u02dc": 0x98, "\u2122": 0x99, "\u0161": 0x9a, "\u203a": 0x9b, "\u0153": 0x9c,
 "\u017e": 0x9e, "\u0178": 0x9f
 };

 const bytes = new Uint8Array(Array.from(value, (char) => {
 const code = char.charCodeAt(0);
 if (code <= 0xff) return code;
 if (cp1252Reverse[char] !== undefined) return cp1252Reverse[char];
 throw new Error("char fora de faixa CP-1252");
 }));

 return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
 };

 let out = text;
 let bestScore = score(out);

 for (let i = 0; i < 5; i++) {
 let improved = false;

 try {
 const candidate = decodeURIComponent(escape(out));
 const candidateScore = score(candidate);
 if (candidateScore < bestScore) {
 out = candidate;
 bestScore = candidateScore;
 improved = true;
 }
 } catch {
 // Ignora tentativa inválida.
 }

 try {
 const fallback = decodeWindows1252BytesAsUtf8(out);
 const fallbackScore = score(fallback);
 if (fallbackScore < bestScore) {
 out = fallback;
 bestScore = fallbackScore;
 improved = true;
 }
 } catch {
 // Ignora fallback inválido.
 }

 if (!improved) break;
 }

 return out
 .replace(/\u00e2\u20ac\u00a2/g, "\u2022")
 .replace(/\u00e2\u20ac\u201c/g, "\u2013")
 .replace(/\u00e2\u20ac\u201d/g, "\u2014")
 .replace(/\u00e2\u20ac\u0153/g, "\u201c")
 .replace(/\u00e2\u20ac\u009d/g, "\u201d")
 .replace(/\u00e2\u20ac\u02dc/g, "\u2018")
 .replace(/\u00e2\u20ac\u2122/g, "\u2019")
 .replace(/\u00e2\u20ac\u00a6/g, "\u2026")
 .replace(/\u00c2(?=\s|[.,;:!?])/g, "");
}

function repairVisibleText(root = document.body) {
 if (!root) return;
 const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
 let node = walker.nextNode();
 while (node) {
 if (node.nodeValue && /[\u00c2\u00c3\u00e2\u00ef\u00bf\u00bd]/.test(node.nodeValue)) {
 node.nodeValue = decodeMojibake(node.nodeValue);
 }
 node = walker.nextNode();
 }
}

function escapeHtml(str) {
 return decodeMojibake(String(str))
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
 }

 function renderExamBVisual(visual) {
 if (!visual || typeof visual !== 'object') return '';

 if (visual.type === 'table') {
 const columns = Array.isArray(visual.columns) ? visual.columns : [];
 const rows = Array.isArray(visual.rows) ? visual.rows : [];
 return `
 <figure class="exam-b-visual" aria-label="${escapeHtml(visual.caption ?? 'Tabela da questão')}">
 <div class="exam-b-table-wrap">
 <table class="exam-b-table">
 <caption>${escapeHtml(visual.caption ?? '')}</caption>
 <thead><tr>${columns.map(column => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead>
 <tbody>${rows.map(row => `<tr>${row.map((cell, index) => index === 0
 ? `<th scope="row">${escapeHtml(cell)}</th>`
 : `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
 </table>
 </div>
 </figure>`;
 }

 if (visual.type === 'image') {
 return `
 <figure class="exam-b-visual">
 <img class="exam-b-diagram" src="${escapeHtml(visual.src ?? '')}" alt="${escapeHtml(visual.alt ?? '')}">
 </figure>`;
 }

 if (visual.type === 'code') {
 return `
 <figure class="exam-b-visual">
 <figcaption>${escapeHtml(visual.label ?? 'Trecho apresentado na questão')}</figcaption>
 <pre class="exam-b-code"><code>${escapeHtml(visual.text ?? '')}</code></pre>
 </figure>`;
 }

 if (visual.type === 'scenario') {
 const lines = Array.isArray(visual.lines) ? visual.lines : [];
 return `
 <blockquote class="exam-b-scenario" aria-label="Critérios de aceite">
 ${lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
 </blockquote>`;
 }

 return '';
 }

 function formatExamBQuestionHtml(data) {
 const parts = String(data.q ?? '').split('[[VISUAL]]');
 if (parts.length === 1) return formatQuestionHtml(parts[0], data.ch);
 return parts.map((part, index) => {
 const textHtml = formatQuestionHtml(part.trim(), data.ch);
 return index === 0 ? `${textHtml}${renderExamBVisual(data.visual)}` : textHtml;
 }).join('');
 }

 function formatQuestionHtml(raw, tag) {
 const text = raw ?? "";

 // Q38: manter como no documento oficial (bloco inteiro em itÃ¡lico, fonte menor, sem caixa)
 const __tagStr = decodeMojibake(String(tag ?? ""))
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "");
 const __mNum = __tagStr.match(/^questao\s+(\d+)\b/i);
 const __qNum = __mNum ? Number(__mNum[1]) : (typeof tag === "number" ? tag : NaN);
 if (__qNum === 38) {
   return `
     <p class="mb-3 font-normal leading-relaxed">Você recebeu o seguinte relatório de defeito dos desenvolvedores afirmando que a anomalia descrita neste relatório de teste não é reproduzível.</p>
     <div class="mb-4 space-y-3 italic font-normal leading-relaxed text-slate-100">
       <p>O aplicativo desliga</p>
       <p>2022-May-03 - John Doe - Rejeitado</p>
       <p>O aplicativo desliga depois de inserir &quot;Test input: $ä&quot; no campo Nome na tela de criação de novo usuário. Tentei fazer logoff e fazer login com a conta <strong class="font-black">test_admin01</strong>, o mesmo problema. Tentei com outras contas de administrador de teste, o mesmo problema. Nenhuma mensagem de erro recebida; o registro (veja anexo) contém notificação de erro fatal. Com base no caso de teste TC-1305, o aplicativo deve aceitar a entrada fornecida e criar o usuário. Corrija com alta prioridade, pois esse recurso está relacionado ao REQ-0012, que é um novo requisito crítico de negócio.</p>
     </div>
     <p class="mb-4 font-normal leading-relaxed">Que informações essenciais estão FALTANDO nesse relatório de teste que teriam sido úteis para os desenvolvedores?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }
 const lines = text.split("\n");

 // Helper para renderizar parÃ¡grafos preservando quebras de linha
 const renderParagraphs = (t) => {
 const parts = t.split(/\n\s*\n/);
 return parts.map(p => `<p class="mb-4 whitespace-pre-wrap leading-relaxed">${escapeHtml(p)}</p>`).join("");
 };


 // ===== Ajustes de UX (somente questÃµes solicitadas) =====
 const qNum = Number.isFinite(__qNum) ? __qNum : null;

 const normalizeSingleLine = (t) => {
   return String(t ?? "")
     .replace(/\r/g, "")
     .replace(/\n+/g, " ")
     .replace(/\s{2,}/g, " ")
     .trim();
 };

 const additionalMatch = decodeMojibake(String(tag ?? "")).match(/\bA(\d+)\b/i);
 const additionalNumber = additionalMatch ? Number(additionalMatch[1]) : null;

 // A4: carta de teste apresentada como tabela, conforme o documento oficial.
 if (additionalNumber === 4) {
   return `
     <p class="mb-3 font-normal leading-relaxed">Considere o seguinte testware.</p>
     <div class="mb-5 overflow-x-auto">
       <table class="w-full min-w-[680px] border-collapse font-normal text-slate-100">
         <tbody>
           <tr>
             <th class="border border-slate-500 px-3 py-1 text-right font-bold">Carta de teste nº</th>
             <td class="border border-slate-500 px-3 py-1">04.018</td>
             <th class="border border-slate-500 px-3 py-1 text-right font-bold">Tempo da sessão:</th>
             <td class="border border-slate-500 px-3 py-1">1h</td>
           </tr>
           <tr>
             <th class="border border-slate-500 px-3 py-1 text-right font-bold">Explore:</th>
             <td class="border border-slate-500 px-3 py-1" colspan="3">Página de registro</td>
           </tr>
           <tr>
             <th class="border border-slate-500 px-3 py-1 text-right font-bold">Com:</th>
             <td class="border border-slate-500 px-3 py-1" colspan="3">Diferentes conjuntos de dados de entrada incorretos</td>
           </tr>
           <tr>
             <th class="border border-slate-500 px-3 py-1 text-right font-bold">Para descobrir:</th>
             <td class="border border-slate-500 px-3 py-1" colspan="3">Defeitos relacionados ao aceite do processo de registro com a entrada incorreta</td>
           </tr>
         </tbody>
       </table>
     </div>
     <p class="mb-4 font-normal leading-relaxed">Qual atividade de teste produz esse testware como resultado?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // A8: itens i-v organizados como no documento oficial.
 if (additionalNumber === 8) {
   return `
     <p class="mb-2 font-normal leading-relaxed">Quais são as vantagens do DevOps?</p>
     <ol class="mb-4 ml-9 list-[lower-roman] space-y-1 pl-2 font-normal leading-relaxed">
       <li class="pl-3">Lançamento de produtos e tempo de comercialização mais rápidos;</li>
       <li class="pl-3">Aumenta a necessidade de testes manuais repetitivos;</li>
       <li class="pl-3">Disponibilidade constante de software executável;</li>
       <li class="pl-3">Redução do número de testes de regressão associados à refatoração do código;</li>
       <li class="pl-3">A configuração da estrutura de automação de testes é barata, pois tudo é automatizado.</li>
     </ol>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // A9: requisito citado em itálico dentro do enunciado contínuo.
 if (additionalNumber === 9) {
   return `
     <p class="mb-4 font-normal leading-relaxed">Você trabalha como testador em um projeto de um aplicativo móvel para pedidos de comida para um de seus clientes. O cliente lhe enviou uma lista de requisitos. Um deles, com alta prioridade, diz: <em>&ldquo;O pedido deve ser processado em menos de 10 segundos em 95% dos casos&rdquo;</em>. Você criou um conjunto de casos de teste em que foram feitos vários pedidos aleatórios, o tempo de processamento foi medido e os resultados do teste foram comparados com os requisitos. Que tipo de teste você realizou?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // A11: produtos de trabalho em lista romana.
 if (additionalNumber === 11) {
   return `
     <p class="mb-2 font-normal leading-relaxed">A seguir, uma lista dos produtos de trabalho produzidos no SDLC.</p>
     <ol class="mb-4 ml-9 list-[lower-roman] space-y-1 pl-2 font-normal leading-relaxed">
       <li class="pl-3">Requisitos de negócios;</li>
       <li class="pl-3">Cronograma;</li>
       <li class="pl-3">Orçamento de teste;</li>
       <li class="pl-3">Código executável de terceiros;</li>
       <li class="pl-3">Histórias de usuários e seus critérios de aceite.</li>
     </ol>
     <p class="mb-4 font-normal leading-relaxed">Quais deles podem ser revisados?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // A12: afirmações i-v separadas e alinhadas.
 if (additionalNumber === 12) {
   return `
     <p class="mb-2 font-normal leading-relaxed">Decida quais das seguintes afirmações (i-v) são verdadeiras para testes dinâmicos e quais são verdadeiras para testes estáticos.</p>
     <ol class="mb-4 ml-9 list-[lower-roman] space-y-1 pl-2 font-normal leading-relaxed">
       <li class="pl-3">Os comportamentos externos anormais são mais fáceis de identificar com esse teste;</li>
       <li class="pl-3">As discrepâncias em relação a um padrão de codificação são mais fáceis de encontrar com esse teste;</li>
       <li class="pl-3">Ele identifica as falhas causadas por defeitos quando o software é executado;</li>
       <li class="pl-3">Seu objetivo de teste é identificar defeitos o mais cedo possível;</li>
       <li class="pl-3">A falta de cobertura para requisitos críticos de segurança é mais fácil de encontrar e corrigir.</li>
     </ol>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // A23: riscos em lista romana, sem itens unidos pelo texto extraído do PDF.
 if (additionalNumber === 23) {
   return `
     <p class="mb-2 font-normal leading-relaxed">A lista a seguir contém riscos que foram identificados para um novo produto de software a ser desenvolvido:</p>
     <ol class="mb-4 ml-9 list-[lower-roman] space-y-1 pl-2 font-normal leading-relaxed">
       <li class="pl-3">A gerência transfere dois testadores experientes para outro projeto;</li>
       <li class="pl-3">O sistema não está em conformidade com os padrões de segurança funcional;</li>
       <li class="pl-3">O tempo de resposta do sistema excede os requisitos do usuário;</li>
       <li class="pl-3">Os stakeholders têm expectativas imprecisas;</li>
       <li class="pl-3">Pessoas com deficiência têm problemas ao usar o sistema;</li>
     </ol>
     <p class="mb-4 font-normal leading-relaxed">Quais deles são riscos do projeto?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // Q20: lista, destaques e parágrafos conforme o documento oficial.
 if (qNum === 20 && additionalNumber === null) {
   return `
     <p class="mb-2 font-normal leading-relaxed">Você está testando um formulário simplificado de busca de apartamento que tem apenas dois critérios de busca:</p>
     <ul class="mb-3 ml-7 list-disc space-y-2 font-normal leading-relaxed">
       <li><strong>andar</strong> (com três opções possíveis: térreo; primeiro andar; segundo andar)</li>
       <li><strong>tipo de jardim</strong> (com três opções possíveis: sem jardim; jardim pequeno; jardim grande)</li>
     </ul>
     <p class="mb-3 font-normal leading-relaxed">Somente apartamentos no andar térreo podem ter jardins. O formulário tem um mecanismo de validação integrado que não permitirá que você use os critérios de pesquisa que violam essa regra.</p>
     <p class="mb-3 font-normal leading-relaxed">Cada teste tem dois valores de entrada: andar e tipo de jardim. Você deseja aplicar o particionamento de equivalência (EP) para cobrir cada andar e cada tipo de jardim em seus testes.</p>
     <p class="mb-4 font-normal leading-relaxed">Qual é o número <strong>mínimo</strong> de casos de teste para atingir 100% de cobertura do EP?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção</p>
   `;
 }

 // Q27: as quebras do PDF não representam novos parágrafos.
 if (qNum === 27) {
   const full = decodeMojibake(String(raw ?? ""));
   const questionMarker = "Qual técnica de teste se encaixa MELHOR nessa situação?";
   const selectionMarker = "Selecione UMA opção.";
   const scenario = full.split(questionMarker)[0];

   return `
     <p class="mb-4 leading-relaxed">${escapeHtml(normalizeSingleLine(scenario))}</p>
     <p class="mb-4 leading-relaxed">${escapeHtml(questionMarker)}</p>
     <p class="mb-0 leading-relaxed">${escapeHtml(selectionMarker)}</p>
   `;
 }

 // Q29: história em itálico e critérios em lista, como no documento oficial.
 if (qNum === 29) {
   return `
     <p class="mb-1 leading-relaxed">Considere a seguinte história de usuário: <em class="font-normal">&ldquo;Como editor, quero revisar o conteúdo antes de ser publicado, para que eu possa garantir que a gramática esteja correta&rdquo;</em>, e seus critérios de aceite:</p>
     <ul class="mb-4 ml-7 list-disc space-y-1 font-normal leading-relaxed">
       <li>O usuário pode fazer login no sistema de gerenciamento de conteúdo com o papel de &quot;Editor&quot;;</li>
       <li>O editor pode visualizar as páginas de conteúdo existentes;</li>
       <li>O editor pode editar o conteúdo da página;</li>
       <li>O editor pode adicionar comentários de marcação;</li>
       <li>O editor pode salvar as alterações;</li>
       <li>O editor pode reatribuir a função de &quot;proprietário do conteúdo&quot; para fazer atualizações.</li>
     </ul>
     <p class="mb-4 leading-relaxed">Qual dos seguintes é o MELHOR exemplo de um teste ATDD para essa história de usuário?</p>
     <p class="mb-0 leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // Q32: estimativas em lista, sem as quebras artificiais extraídas do PDF.
 if (qNum === 32) {
   return `
     <p class="mb-2 font-normal leading-relaxed">Sua equipe usa a técnica de estimativa de três pontos para estimar o esforço de teste de um novo recurso de alto risco. Foram feitas as seguintes estimativas:</p>
     <ul class="mb-4 ml-7 list-disc space-y-1 font-normal leading-relaxed">
       <li>Estimativa mais otimista: 2 homens/hora</li>
       <li>Estimativa mais provável: 11 homens/hora</li>
       <li>Estimativa mais pessimista: 14 homens/-hora</li>
     </ul>
     <p class="mb-4 font-normal leading-relaxed">Qual é a estimativa final?</p>
     <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // Q33: tabela exatamente como na documentaÃ§Ã£o (renderizada como tabela, nÃ£o texto corrido)
 if (qNum === 33) {
   const tableHtml = `
     <div class="my-5">
       <div class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Deslize para o lado para ver todas as colunas</div>
       <div class="overflow-x-auto rounded-2xl border border-slate-500/60 bg-slate-900/35 shadow-inner shadow-black/20">
         <table class="w-full min-w-[640px] table-fixed border-collapse text-[13px] md:text-sm text-slate-100">
           <thead>
             <tr class="bg-slate-950/65">
               <th class="w-[27%] border border-slate-500/70 px-3 py-2 text-left font-black uppercase tracking-wide text-slate-200">Número do caso de teste</th>
               <th class="w-[34%] border border-slate-500/70 px-3 py-2 text-left font-black uppercase tracking-wide text-slate-200">Condição de teste coberta</th>
               <th class="w-[15%] border border-slate-500/70 px-3 py-2 text-center font-black uppercase tracking-wide text-slate-200">Prioridade</th>
               <th class="w-[24%] border border-slate-500/70 px-3 py-2 text-left font-black uppercase tracking-wide text-slate-200">Dependência lógica</th>
             </tr>
           </thead>
           <tbody>
             <tr class="odd:bg-slate-900/25 even:bg-slate-900/10">
               <td class="border border-slate-500/70 px-3 py-2 font-black tracking-wide whitespace-nowrap">TC 001</td>
               <td class="border border-slate-500/70 px-3 py-2">Selecione o tipo de alimento</td>
               <td class="border border-slate-500/70 px-3 py-2 text-center font-bold">3</td>
               <td class="border border-slate-500/70 px-3 py-2 whitespace-nowrap">nenhum</td>
             </tr>
             <tr class="odd:bg-slate-900/25 even:bg-slate-900/10">
               <td class="border border-slate-500/70 px-3 py-2 font-black tracking-wide whitespace-nowrap">TC 002</td>
               <td class="border border-slate-500/70 px-3 py-2">Selecione o restaurante</td>
               <td class="border border-slate-500/70 px-3 py-2 text-center font-bold">2</td>
               <td class="border border-slate-500/70 px-3 py-2 whitespace-nowrap">TC 001</td>
             </tr>
             <tr class="odd:bg-slate-900/25 even:bg-slate-900/10">
               <td class="border border-slate-500/70 px-3 py-2 font-black tracking-wide whitespace-nowrap">TC 003</td>
               <td class="border border-slate-500/70 px-3 py-2">Obter direção</td>
               <td class="border border-slate-500/70 px-3 py-2 text-center font-bold">1</td>
               <td class="border border-slate-500/70 px-3 py-2 whitespace-nowrap">TC 002</td>
             </tr>
             <tr class="odd:bg-slate-900/25 even:bg-slate-900/10">
               <td class="border border-slate-500/70 px-3 py-2 font-black tracking-wide whitespace-nowrap">TC 004</td>
               <td class="border border-slate-500/70 px-3 py-2">Ligar para o restaurante</td>
               <td class="border border-slate-500/70 px-3 py-2 text-center font-bold">2</td>
               <td class="border border-slate-500/70 px-3 py-2 whitespace-nowrap">TC 002</td>
             </tr>
             <tr class="odd:bg-slate-900/25 even:bg-slate-900/10">
               <td class="border border-slate-500/70 px-3 py-2 font-black tracking-wide whitespace-nowrap">TC 005</td>
               <td class="border border-slate-500/70 px-3 py-2">Fazer reserva</td>
               <td class="border border-slate-500/70 px-3 py-2 text-center font-bold">3</td>
               <td class="border border-slate-500/70 px-3 py-2 whitespace-nowrap">TC 002</td>
             </tr>
           </tbody>
         </table>
       </div>
     </div>
   `;
   return `
     <p class="mb-4 leading-relaxed">Você está testando um aplicativo móvel que permite que os usuários encontrem um restaurante próximo com base no tipo de comida que desejam comer. Considere a seguinte lista de casos de teste, prioridades (ou seja, um número menor significa uma prioridade maior) e dependências:</p>
     ${tableHtml}
     <p class="mt-4 leading-relaxed">Qual dos seguintes casos de teste deve ser o <strong>terceiro</strong> a ser executado?</p>
     <p class="mb-0 leading-relaxed">Selecione UMA opção</p>
   `;
 }

 // Q34: categorias e quadrantes lado a lado em telas amplas, seguindo o original.
 if (qNum === 34) {
   return `
     <p class="mb-3 leading-relaxed">Considere as seguintes categorias de teste (1-4) e os quadrantes de teste ágil (A-D):</p>
     <div class="mb-5 grid gap-2 font-normal leading-relaxed md:grid-cols-[minmax(220px,0.8fr)_minmax(360px,1.35fr)] md:gap-0">
       <div class="space-y-1 md:border-r md:border-slate-500 md:pr-5">
         <p>(1)&nbsp; Teste de usabilidade</p>
         <p>(2)&nbsp; Teste de componentes</p>
         <p>(3)&nbsp; Teste funcional</p>
         <p>(4)&nbsp; Teste de confiabilidade</p>
       </div>
       <div class="space-y-1 md:pl-5">
         <p>(A)&nbsp; Q1: voltado para a tecnologia, apoiando o desenvolvimento</p>
         <p>(B)&nbsp; Q2: voltado para o negócio, apoiando o desenvolvimento</p>
         <p>(C)&nbsp; Q3: voltado para o negócio, crítica do produto</p>
         <p>(D)&nbsp; Q4: voltado para a tecnologia, crítica do produto</p>
       </div>
     </div>
     <p class="mb-4 leading-relaxed">Como as seguintes categorias de teste são mapeadas nos quadrantes de teste ágil?</p>
     <p class="mb-0 leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // Q35: lista e destaques tipográficos iguais aos do documento oficial.
 if (qNum === 35) {
   return `
     <p class="mb-3 leading-relaxed">Durante uma análise de risco, o seguinte risco foi identificado e avaliado:</p>
     <ul class="mb-4 ml-7 list-disc space-y-1 font-normal leading-relaxed">
       <li><strong>Risco:</strong> o tempo de resposta é muito longo para gerar um relatório</li>
       <li><strong>Probabilidade do risco:</strong> média</li>
       <li><strong>Impacto do risco:</strong> alto</li>
       <li><strong>Resposta ao risco:</strong> (1) uma equipe de teste independente realiza testes de performance durante o teste do sistema; (2) uma amostra selecionada de usuários finais realiza testes de aceite alfa e beta antes do lançamento.</li>
     </ul>
     <p class="mb-4 leading-relaxed">Que medida é proposta para ser tomada em resposta a esse risco analisado?</p>
     <p class="mb-0 leading-relaxed">Selecione UMA opção.</p>
   `;
 }

 // Quebras de linha: ajustar SOMENTE as questÃµes enviadas (sem alterar texto, sÃ³ normalizando espaÃ§os/linhas)
 const needsSingleLine = new Set([3,4,8,9,10,12,30,36]);
 if (qNum && needsSingleLine.has(qNum)) {
   return `<p class="mb-0 leading-relaxed">${escapeHtml(normalizeSingleLine(raw))}</p>`;
 }

 // Q32: manter bullets, mas remover quebras â€œvaziasâ€ e juntar o texto fora dos bullets
 if (qNum === 32) {
   const ls = String(raw ?? "").replace(/\r/g,"").split("\n").map(l => l.trim()).filter(l => l.length > 0);
   const head = [];
   const bullets = [];
   for (const l of ls) {
     if (l.startsWith("â€¢")) bullets.push(l);
     else if (bullets.length === 0) head.push(l);
     else bullets.push(l);
   }
   const headHtml = head.length ? `<p class="mb-3 leading-relaxed">${escapeHtml(head.join(" "))}</p>` : "";
   const bulletsHtml = bullets.map(b => `<p class="mb-2 leading-relaxed">${escapeHtml(b)}</p>`).join("");
   return headHtml + bulletsHtml;
 }

// Layout especial somente para A8 e A11 (melhor visualizaÃ§Ã£o dos itens i-v/afins)

 // A20: enunciado de Planning Poker e tabela conforme o documento oficial.
 if (additionalNumber === 20) {
 const tableHtml = `
 <div class="my-4 overflow-x-auto">
 <table class="min-w-[620px] border border-slate-400/70 border-collapse text-sm text-slate-100 rounded-xl overflow-hidden">
 <thead>
 <tr>
 <th class="border border-slate-400/70 px-3 py-2 bg-slate-950/40 text-left"></th>
 <th class="border border-slate-400/70 px-3 py-2 bg-slate-950/40 text-center font-bold" colspan="7">
 Estimativas dos membros da equipe
 </th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td class="border border-slate-400/70 px-3 py-2 font-bold whitespace-nowrap">Primeira rodada</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">21</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">2</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">5</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">34</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">2</td>
 </tr>
 <tr>
 <td class="border border-slate-400/70 px-3 py-2 font-bold whitespace-nowrap">Segunda rodada</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">34</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">5</td>
 </tr>
 <tr>
 <td class="border border-slate-400/70 px-3 py-2 font-bold whitespace-nowrap">Terceira rodada</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">13</td>
 <td class="border border-slate-400/70 px-3 py-2 text-center">8</td>
 </tr>
 </tbody>
 </table>
 </div>
 `;

 return `
 <p class="mb-3 font-normal leading-relaxed">Sua equipe usa o <em>Planning Poker</em> para estimar o esforço de teste de um novo recurso necessário. Há uma regra em sua equipe que diz que, se não houver tempo para chegar a um acordo total e a variação nos resultados for pequena, regras como &ldquo;aceitar o número com mais votos&rdquo; podem ser aplicadas.</p>
 <p class="mb-3 font-normal leading-relaxed">Após duas rodadas, o consenso não foi alcançado, então a terceira rodada foi iniciada. Você pode ver os resultados da estimativa de teste na tabela abaixo.</p>
 ${tableHtml}
 <p class="mb-4 font-normal leading-relaxed">Qual dos itens a seguir é o <strong>MELHOR</strong> exemplo da próxima etapa?</p>
 <p class="mb-0 font-normal leading-relaxed">Selecione UMA opção.</p>
 `;
 }


 // Layout especial para A12: lista i-v + alternativas (estilo documento).
 if (((tag || "").toLowerCase().includes("questÃ£o a12")) || ((raw || "").toLowerCase().includes("testes dinÃ¢micos") && (raw || "").toLowerCase().includes("testes estÃ¡ticos"))) {
 const text = raw ?? "";
 const lines0 = text.split("\n").map(l => l.replace(/\r/g, ""));
 const lines = lines0.map(l => l.trim()).filter(Boolean);

 // Remove "Selecione..." (se existir) para renderizar ao final
 const selectIdx = lines.findIndex(l => l.toLowerCase().startsWith("selecione "));
 const selectLine = selectIdx >= 0 ? lines[selectIdx] : null;
 const body = (selectIdx >= 0) ? lines.slice(0, selectIdx) : lines.slice();

 // Para A12: os itens podem vir sem os rÃ³tulos i-iii no texto (como no seu HTML atual).
 // EstratÃ©gia: tudo apÃ³s o enunciado e antes de opÃ§Ãµes (A), B), etc.) vira uma lista de 5 itens, separada por ';'.
 const stopIdx = body.findIndex(l => /^[A-D]\)\s+/i.test(l));
 const main = (stopIdx >= 0) ? body.slice(0, stopIdx) : body.slice();

 // Enunciado: primeira(s) linha(s) atÃ© antes dos itens (heurÃ­stica: atÃ© a primeira linha que termina com ';' ou contÃ©m ';')
 const intro = [];
 let rest = [];
 let sawItemish = false;

 for (const l of main) {
 if (!sawItemish && !l.includes(";")) {
 intro.push(l);
 } else {
 sawItemish = true;
 rest.push(l);
 }
 }

 // Junta o "rest" e quebra por ';' preservando o texto
 const joined = rest.join(" ");
 const rawParts = joined.split(";").map(p => p.trim()).filter(Boolean);

 // Tira prefixos romanos se existirem
 const stripRoman = (s) => s.replace(/^((?:i{1,3})|iv|v)\.\s*/i, "").trim();

 const roman = ["i.", "ii.", "iii.", "iv.", "v."];
 const items = rawParts.slice(0, 5).map((p, idx) => ({
 key: roman[idx],
 text: stripRoman(p) + ";"
 }));

 const introHtml = intro.length
 ? `<div class="space-y-2">${intro.map(p => `<p class="whitespace-pre-wrap leading-snug text-white">${escapeHtml(p)}</p>`).join("")}</div>`
 : "";

 const itemsHtml = items.length
 ? `
 <div class="mt-3 space-y-1.5">
 ${items.map(it => `
 <div class="grid grid-cols-[2.4rem_1fr] gap-x-2">
 <div class="text-slate-300 font-bold">${escapeHtml(it.key)}</div>
 <div class="text-slate-100">${escapeHtml(it.text)}</div>
 </div>
 `).join("")}
 </div>
 `
 : "";

 const selectHtml = selectLine
 ? `<div class="mt-3 text-sm font-semibold text-slate-400">${escapeHtml(selectLine)}</div>`
 : "";

 return `
 <div class="space-y-1">
 ${introHtml}
 ${itemsHtml}
 ${selectHtml}
 </div>
 `;
 }


 // Layout especial para Questao 14: incluir tabela do enunciado (igual ao documento oficial)
 const __normQ14 = (value) => decodeMojibake(String(value || ""))
 .toLowerCase()
 .normalize("NFD")
 .replace(/[̀-ͯ]/g, "")
 .replace(/\s+/g, " ")
 .trim();

 const __q14Tag = __normQ14(tag);
 const __q14Raw = __normQ14(raw);
 const __isQ14 =
 __q14Tag.includes("questao 14") ||
 (__q14Raw.includes("criterios de aceite: ac1") && __q14Raw.includes("quais dos testes acima sao executados como testes de regressao"));

 if (__isQ14) {
 const text = decodeMojibake(raw ?? "");
 const lines0 = text.split("\n").map(l => l.replace(/\r/g, ""));
 let lines = lines0.map(l => l.trim()).filter(Boolean);
 const normLine = (l) => __normQ14(l);

 const idxComo = lines.findIndex(l => normLine(l).includes("como segue"));
 const idxDepois = lines.findIndex(l => normLine(l).startsWith("os testes sao repetidos"));

 if (idxComo >= 0 && idxDepois > idxComo) {
 // remove qualquer "tabela em texto" entre as frases, para evitar duplicacao
 lines = [...lines.slice(0, idxComo + 1), ...lines.slice(idxDepois)];
 }

 const idxComo2 = lines.findIndex(l => normLine(l).includes("como segue"));

 const tableHtml = `
 <div class="my-2 overflow-x-auto">
 <table class="mx-auto min-w-[520px] border border-slate-500/70 border-collapse text-[14px] text-slate-800 bg-white">
 <thead>
 <tr>
 <th class="border border-slate-500/70 px-3 py-0.5 text-left"></th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">Execu&ccedil;&atilde;o 1</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">Execu&ccedil;&atilde;o 2</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">Execu&ccedil;&atilde;o 3</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC1</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(1) Falhou</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(4) Aprovado</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(7) Aprovado</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC2</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(2) Aprovado</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(5) Falhou</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(8) Aprovado</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC3</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(3) Falhou</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(6) Falhou</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">(9) Aprovado</td>
 </tr>
 </tbody>
 </table>
 </div>
 `;

 const out = [];
 for (let i = 0; i < lines.length; i++) {
 const l = lines[i];
 out.push(`<p class="whitespace-pre-wrap leading-snug">${escapeHtml(l)}</p>`);
 if (i === idxComo2) out.push(tableHtml);
 }

 return `<div class="space-y-2">${out.join("")}</div>`;
 }

// Layout especial para Questão 23: incluir diagrama (SVG) do enunciado (sem dependência de imagem externa)
 // Mantém texto original e apenas adiciona o diagrama logo após a frase "mostrado abaixo".
 {
 const t = (tag || "").toLowerCase();
 const r = (raw || "").toLowerCase();
 const isQ23 =
 /quest[aãÃ]o\s*23\b/.test(t) ||
 t === "questão 23" || t === "questÃ£o 23" || t === "questao 23" ||
 ((r.includes("diagrama de transição de estado") || r.includes("diagrama de transiÃ§Ã£o de estado")) && r.includes("init") && r.includes("off"));

 if (isQ23 && !t.includes("exame b")) {
 const text = raw ?? "";
 const lines0 = text.split("\n").map(l => l.replace(/\r/g, ""));
 const lines = lines0.map(l => l.trim()).filter(Boolean);

 const svgHtml = `
 <div class="my-4 flex justify-center">
 <div class="w-full max-w-[760px] overflow-x-auto">
 <svg viewBox="0 0 820 230" class="w-full h-auto rounded-lg border border-slate-400/60 bg-white p-2">
 <defs>
 <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
 <path d="M0,0 L10,5 L0,10 z" fill="#000"></path>
 </marker>
 </defs>

 <!-- Boxes -->
 <rect x="20" y="95" width="120" height="55" rx="10" ry="10" fill="#fff" stroke="#000" stroke-width="2"></rect>
 <text x="80" y="127" text-anchor="middle" font-size="18" font-weight="700" fill="#000">INIT</text>

 <rect x="240" y="20" width="170" height="60" rx="10" ry="10" fill="#fff" stroke="#000" stroke-width="2"></rect>
 <text x="325" y="45" text-anchor="middle" font-size="16" font-weight="700" fill="#000">DEBUG</text>
 <text x="325" y="66" text-anchor="middle" font-size="16" font-weight="700" fill="#000">MODE</text>

 <rect x="240" y="145" width="170" height="60" rx="10" ry="10" fill="#fff" stroke="#000" stroke-width="2"></rect>
 <text x="325" y="170" text-anchor="middle" font-size="16" font-weight="700" fill="#000">IN</text>
 <text x="325" y="191" text-anchor="middle" font-size="16" font-weight="700" fill="#000">OPERATION</text>

 <rect x="640" y="20" width="140" height="60" rx="10" ry="10" fill="#fff" stroke="#000" stroke-width="2"></rect>
 <text x="710" y="55" text-anchor="middle" font-size="18" font-weight="700" fill="#000">OFF</text>

 <rect x="610" y="145" width="170" height="60" rx="10" ry="10" fill="#fff" stroke="#000" stroke-width="2"></rect>
 <text x="695" y="180" text-anchor="middle" font-size="18" font-weight="700" fill="#000">ON HOLD</text>

 <!-- Arrows -->
 <!-- INIT -> DEBUG MODE (test) -->
 <line x1="140" y1="95" x2="240" y2="55" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="185" y="55" text-anchor="middle" font-size="14" fill="#000">test</text>

 <!-- DEBUG MODE -> OFF (done) -->
 <line x1="410" y1="50" x2="640" y2="50" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="525" y="36" text-anchor="middle" font-size="14" fill="#000">done</text>

 <!-- INIT -> IN OPERATION (run) -->
 <line x1="140" y1="150" x2="240" y2="175" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="185" y="185" text-anchor="middle" font-size="14" fill="#000">run</text>

 <!-- IN OPERATION -> DEBUG MODE (error) -->
 <line x1="325" y1="145" x2="325" y2="80" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="300" y="115" text-anchor="end" font-size="14" fill="#000">error</text>

 <!-- IN OPERATION -> ON HOLD (pause) -->
 <line x1="410" y1="175" x2="610" y2="175" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="510" y="160" text-anchor="middle" font-size="14" fill="#000">pause</text>

 <!-- ON HOLD -> IN OPERATION (resume) -->
 <line x1="610" y1="195" x2="410" y2="195" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="510" y="215" text-anchor="middle" font-size="14" fill="#000">resume</text>

 <!-- ON HOLD -> OFF (done) -->
 <line x1="695" y1="145" x2="710" y2="80" stroke="#000" stroke-width="2" marker-end="url(#arrow)"></line>
 <text x="725" y="115" text-anchor="start" font-size="14" fill="#000">done</text>
 </svg>
 </div>
 </div>
 `;

 const out = [];
 let inserted = false;

 for (let i = 0; i < lines.length; i++) {
 const l = lines[i];
 out.push(`<p class="whitespace-pre-wrap leading-snug">${escapeHtml(l)}</p>`);

 const lower = l.toLowerCase();
 if (!inserted && (lower.includes("mostrado abaixo") || i === 0)) {
 out.push(svgHtml);
 inserted = true;
 }
 }

 return `<div class="space-y-2">${out.join("")}</div>`;
 }
 }




 // Layout especial para Questão 21: incluir tabelas do enunciado (faixas + casos de teste)
 const __q21Tag = decodeMojibake(String(tag || "")).toLowerCase();
 const __q21Raw = decodeMojibake(String(raw || "")).toLowerCase();
 const __q21TagNorm = __q21Tag.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
 const __q21RawNorm = __q21Raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
 const __isQ21 =
 __q21TagNorm === "questao 21 (1 ponto)" ||
 (__q21RawNorm.includes("bva") && __q21RawNorm.includes("nota final") && __q21RawNorm.includes("de acordo com as regras a seguir"));
 if (__isQ21) {
 const text = decodeMojibake(raw ?? "");
 const lines0 = text.split("\n").map(l => l.replace(/\r/g, ""));
 let lines = lines0.map(l => l.trim()).filter(Boolean);

 // Pontos de inser??o
 const idxRegras = lines.findIndex(l => l.toLowerCase().includes("de acordo com as regras a seguir"));
 const idxCasos = lines.findIndex(l =>
 l.toLowerCase().includes("você preparou o seguinte conjunto de casos de teste")
 || l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("voce preparou o seguinte conjunto de casos de teste")
 );

 // Remove poss?vel "tabela textual" entre regras e casos, para evitar duplica??o
 if (idxRegras >= 0 && idxCasos > idxRegras) {
 const before = lines.slice(0, idxRegras + 1);
 const after = lines.slice(idxCasos);
 lines = [...before, ...after];
 }

 // Recalcula ?ndices ap?s poss?vel corte
 const idxRegras2 = lines.findIndex(l => l.toLowerCase().includes("de acordo com as regras a seguir"));
 const idxCasos2 = lines.findIndex(l =>
 l.toLowerCase().includes("você preparou o seguinte conjunto de casos de teste")
 || l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("voce preparou o seguinte conjunto de casos de teste")
 );

 const faixaHtml = `
 <div class="my-2 overflow-x-auto">
 <table class="mx-auto min-w-[640px] border border-slate-500/70 border-collapse text-[14px] text-slate-800 bg-white">
 <thead>
 <tr>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">0 a 50</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">51 a 60</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">61 a 70</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">71 a 80</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">81 a 90</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">91 a 100</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Reprovado</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Razo?vel</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Satisfat?rio</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Bom</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Muito Bom</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Excelente</td>
 </tr>
 </tbody>
 </table>
 </div>
 `;

 const casosHtml = `
 <div class="my-2 overflow-x-auto">
 <table class="mx-auto min-w-[420px] border border-slate-500/70 border-collapse text-[14px] text-slate-800 bg-white">
 <thead>
 <tr>
 <th class="border border-slate-500/70 px-3 py-0.5 text-left"></th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">Resultado final</th>
 <th class="border border-slate-500/70 px-3 py-0.5 text-center font-bold">Nota final</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC1</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">91</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Excelente</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC2</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">50</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Reprovado</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC3</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">81</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Muito Bom</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC4</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">60</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Razo?vel</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC5</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">70</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Satisfat?rio</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-3 py-0.5 font-bold whitespace-nowrap">TC6</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">80</td>
 <td class="border border-slate-500/70 px-3 py-0.5 text-center">Bom</td>
 </tr>
 </tbody>
 </table>
 </div>
 `;

 const out = [];
 for (let i = 0; i < lines.length; i++) {
 const l = lines[i];
 out.push(`<p class="whitespace-pre-wrap leading-snug">${escapeHtml(l)}</p>`);
 if (i === idxRegras2) out.push(faixaHtml);
 if (i === idxCasos2) out.push(casosHtml);
 }

 return `<div class="space-y-2">${out.join("")}</div>`;
 }




// Layout especial para Questao 22: incluir tabela de decisao do enunciado
 const __normNoAccent = (value) => decodeMojibake(String(value || ""))
 .toLowerCase()
 .normalize("NFD")
 .replace(/[̀-ͯ]/g, "")
 .replace(/\s+/g, " ")
 .trim();

 const __q22TagFlat = __normNoAccent(tag);
 const __q22RawFlat = __normNoAccent(raw);
 const __isQ22 =
 __q22TagFlat.includes("questao 22") ||
 (__q22RawFlat.includes("tabela de decisao") && __q22RawFlat.includes("gerenciamento de relacionamento com o cliente"));

 if (__isQ22 && !__q22TagFlat.includes("exame b")) {
 const text = decodeMojibake(raw ?? "");
 const lines = text.split("\n").map(l => l.replace(/\r/g, "").trim()).filter(Boolean);
 const normLine = (l) => __normNoAccent(l);

 const idxRecursos = lines.findIndex(l => normLine(l).includes("os recursos implementados sao os seguintes"));
 const idxTabela = lines.findIndex(l => normLine(l).includes("a tabela de decisao"));
 const idxDepois = lines.findIndex(l => normLine(l).startsWith("com base apenas"));

 let renderLines = lines;
 if (idxTabela >= 0 && idxDepois > idxTabela) {
 const before = lines.slice(0, idxTabela + 1);
 const after = lines.slice(idxDepois);
 renderLines = [...before, ...after];
 }

 const idxRecursos2 = renderLines.findIndex(l => normLine(l).includes("os recursos implementados sao os seguintes"));
 const idxTabela2 = renderLines.findIndex(l => normLine(l).includes("a tabela de decisao"));

 const tableHtml = `
 <div class="my-2 overflow-x-auto">
 <table class="mx-auto min-w-[680px] border border-slate-500/70 border-collapse text-[14px] text-slate-800 bg-white">
 <thead>
 <tr>
 <th class="border border-slate-500/70 px-2 py-0.5 text-left font-bold">Condi&ccedil;&otilde;es</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R1</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R2</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R3</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R4</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R5</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R6</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R7</th>
 <th class="border border-slate-500/70 px-2 py-0.5 text-center font-bold">R8</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5">Ser um membro</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5">Prazo n&atilde;o cumprido</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5">15&ordm; aluguel</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">F</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">T</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5 font-bold" colspan="9">A&ccedil;&otilde;es</td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5">20% de desconto</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">X</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">X</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 </tr>
 <tr>
 <td class="border border-slate-500/70 px-2 py-0.5">Camiseta de presente</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">X</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">X</td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center"></td>
 <td class="border border-slate-500/70 px-2 py-0.5 text-center">X</td>
 </tr>
 </tbody>
 </table>
 </div>
 `;

 const out = [];
 let bulletsInserted = false;
 for (let i = 0; i < renderLines.length; i++) {
 if (idxRecursos2 >= 0 && idxTabela2 > idxRecursos2 && i > idxRecursos2 && i < idxTabela2) {
 if (!bulletsInserted) {
 const bullets = renderLines.slice(idxRecursos2 + 1, idxTabela2).map(l => l.trim()).filter(Boolean);
 if (bullets.length) {
 out.push(`<ul class="list-disc pl-6 space-y-0.5 text-slate-100">${bullets.map(b => `<li class="leading-snug">${escapeHtml(b)}</li>`).join("")}</ul>`);
 }
 bulletsInserted = true;
 }
 continue;
 }
 const l = renderLines[i];
 out.push(`<p class="whitespace-pre-wrap leading-snug">${escapeHtml(l)}</p>`);
 if (i === idxTabela2) out.push(tableHtml);
 }

 return `<div class="space-y-2">${out.join("")}</div>`;
 }


if (tag === "QuestÃ£o A8 (1 ponto)" || tag === "QuestÃ£o A11 (1 ponto)") {
 const text = raw ?? "";
 const lines0 = text.split("\n").map(l => l.replace(/\r/g, ""));
 const lines = lines0.map(l => l.trim()).filter(Boolean);

 // Captura "Selecione..." (se existir) para renderizar ao final
 const selectIdx = lines.findIndex(l => l.toLowerCase().startsWith("selecione "));
 const selectLine = selectIdx >= 0 ? lines[selectIdx] : null;
 const body = (selectIdx >= 0) ? lines.slice(0, selectIdx) : lines.slice();

 // Identifica a linha de pergunta (termina com ?)
 const qIdx = body.findIndex(l => l.includes("?"));
 const questionLine = qIdx >= 0 ? body[qIdx] : null;

 // Para A11: existe uma linha de introduÃ§Ã£o antes da lista
 let introLine = null;
 if (tag === "QuestÃ£o A11 (1 ponto)") {
 // Se a primeira linha NÃƒO for a pergunta e nÃ£o for um item, trate como intro
 const first = body[0] ?? null;
 if (first && first !== questionLine) introLine = first;
 }

 // Coleta os itens (linhas que NÃƒO sÃ£o intro e NÃƒO sÃ£o a pergunta)
 const candidates = body.filter(l => l !== introLine && l !== questionLine);

 // Normaliza o caso da A11 onde vieram itens colados na mesma linha (sem alterar o texto)
 const normalized = [];
 candidates.forEach(l => {
 if (tag === "QuestÃ£o A11 (1 ponto)" && /;\s*iv\./i.test(l)) {
 const parts = l.split(/;\s*(iv\.)/i);
 if (parts.length >= 3) {
 const before = (parts[0] ?? "").trimEnd();
 const after = (parts.slice(1).join("")).trimStart(); // inclui "iv." + resto
 if (before) normalized.push(before + ";");
 if (after) normalized.push(after);
 return;
 }
 }
 normalized.push(l);
 });

 // Remove prefixos romanos caso existam, para nÃ£o duplicar (layout adiciona a coluna i-v)
 const stripRoman = (l) => l.replace(/^((?:i{1,3})|iv|v)\.\s*/i, "");

 // MantÃ©m atÃ© 10 por seguranÃ§a, mas A8/A11 sÃ£o i-v
 const roman = ["i.", "ii.", "iii.", "iv.", "v.", "vi.", "vii.", "viii.", "ix.", "x."];

 const items = normalized.map((l, idx) => ({
 key: roman[idx] ?? "",
 text: stripRoman(l).trim()
 }));

 const introHtml = introLine
 ? `<p class="mb-3 whitespace-pre-wrap leading-snug text-white">${escapeHtml(introLine)}</p>`
 : "";

 const questionHtml = questionLine
 ? `<p class="mb-3 whitespace-pre-wrap leading-snug text-white font-semibold">${escapeHtml(questionLine)}</p>`
 : "";

 const itemsHtml = items.length
 ? `
 <div class="space-y-1.5">
 ${items.map(it => `
 <div class="grid grid-cols-[2.4rem_1fr] gap-x-2">
 <div class="text-slate-300 font-bold">${escapeHtml(it.key)}</div>
 <div class="text-slate-100">${escapeHtml(it.text)}</div>
 </div>
 `).join("")}
 </div>
 `
 : "";

 const selectHtml = selectLine
 ? `<div class="mt-3 text-sm font-semibold text-slate-400">${escapeHtml(selectLine)}</div>`
 : "";

 // Ordem igual ao documento: Pergunta (topo) + lista (i-v) + (A11: pergunta final jÃ¡ vem no topo do bloco tambÃ©m)
 // A11: intro primeiro, depois lista, depois a pergunta final, e por fim "Selecione..."
 if (tag === "QuestÃ£o A11 (1 ponto)") {
 return `
 <div class="space-y-1">
 ${introHtml}
 ${itemsHtml}
 ${questionHtml}
 ${selectHtml}
 </div>
 `;
 }

 // A8: pergunta primeiro, depois lista, depois "Selecione..."
 return `
 <div class="space-y-1">
 ${questionHtml}
 ${itemsHtml}
 ${selectHtml}
 </div>
 `;
 }

 // Default: parÃ¡grafos com espaÃ§amento e quebras preservadas
 return `<div class="space-y-2">${renderParagraphs(text)}</div>`;
 }


 function updateProgressBar() {
 const bar = document.getElementById('progress-bar');
 const progress = ((idx + 1) / currentSet.length) * 100;
 bar.style.width = progress + '%';
 }

 function start(type) {
 currentSet = db[type];
 currentType = type;
 quizStartedAt = Date.now();
 resultSaved = false;
 idx = 0; score = 0;
 attempts = [];

 let duration = 3600;
 if(type === 'adicionais') duration = 2700;
 if(type === 'k2k3') duration = 2400;
 if(type === 'exameB') duration = 3600;

 document.getElementById('menu').classList.add('hidden');
 document.getElementById('quiz').classList.remove('hidden');
 document.getElementById('live-stats').classList.remove('hidden');
 document.getElementById('timer-box').classList.remove('hidden');
 document.getElementById('timer-box').classList.add('flex');
 window.quizDashboard?.setQuizMode(true);

 startTimer(duration);
 load();
 }

 function startTimer(duration) {
 timerRemaining = duration;
 timerPaused = false;
 const display = document.getElementById('timer-display');
 const box = document.getElementById('timer-box');

 clearInterval(timerInterval);
 syncTimerToggle();

 timerInterval = setInterval(function () {
 if (timerPaused) return;
 let m = parseInt(timerRemaining / 60, 10);
 let s = parseInt(timerRemaining % 60, 10);

 m = m < 10 ? "0" + m : m;
 s = s < 10 ? "0" + s : s;

 display.textContent = m + ":" + s;

 if (timerRemaining < 300) {
 display.classList.add('urgent-timer');
 box.classList.replace('border-slate-700', 'border-red-500');
 } else {
 display.classList.remove('urgent-timer');
 box.classList.remove('border-red-500');
 if(!box.classList.contains('border-slate-700')) box.classList.add('border-slate-700');
 }

 if (--timerRemaining < 0) {
 clearInterval(timerInterval);
 alert("Tempo Esgotado! O simulado serÃ¡ encerrado.");
 showResult();
 }
 }, 1000);
 }

 function syncTimerToggle() {
 const box = document.getElementById('timer-box');
 const button = document.getElementById('timer-toggle');
 if (!box || !button) return;
 box.classList.toggle('timer-paused', timerPaused);
 button.setAttribute('aria-pressed', String(timerPaused));
 button.setAttribute('aria-label', timerPaused ? 'Retomar cronômetro' : 'Pausar cronômetro');
 button.title = timerPaused ? 'Retomar cronômetro' : 'Pausar cronômetro';
 button.innerHTML = timerPaused
 ? '<i data-lucide="play" class="w-4 h-4"></i><span>Retomar</span>'
 : '<i data-lucide="pause" class="w-4 h-4"></i><span>Pausar</span>';
 lucide.createIcons();
 }

 function toggleTimerPause() {
 if (!currentType || !timerInterval) return;
 timerPaused = !timerPaused;
 syncTimerToggle();
 }

 // Remove prefixo duplicado das alternativas (ex.: "A.", "B)", "C -", "D:") quando o UI jÃ¡ exibe o selo A/B/C/D.
 function normalizeOptionText(optionText, idx) {
 const expected = String.fromCharCode(65 + idx); // A, B, C, D
 const t = decodeMojibake(String(optionText ?? ""));
 const re = new RegExp("^\\s*" + expected + "\\s*(?:[\\.|\\)|\\-|:])\\s*", "i");
 return t.replace(re, "");
 }

 function patchKnownBrokenQuestionText(questionText) {
 const normalized = decodeMojibake(String(questionText ?? ""));
 const lower = normalized.toLowerCase();

 if (lower.includes("benefício dos testes estáticos")) {
 return "Qual das opções a seguir NÃO é um benefício dos testes estáticos?\n\nSelecione UMA opção.";
 }

 return normalized;
 }

 function patchKnownBrokenOptionText(questionText, optionIndex, optionText) {
 const lower = String(questionText ?? "").toLowerCase();
 if (!lower.includes("benefício dos testes estáticos")) return optionText;

 const fixedOptions = [
 "Ter um gerenciamento de defeitos menos dispendioso devido à facilidade de detectar defeitos mais tarde no processo SDLC.",
 "A correção de defeitos encontrados durante o teste estático geralmente é muito mais barata do que a correção de defeitos encontrados durante o teste dinâmico.",
 "Encontrar defeitos de codificação que poderiam não ter sido encontrados apenas com a realização de testes dinâmicos.",
 "Detecção de lacunas e inconsistências nos requisitos."
 ];

 return fixedOptions[optionIndex] ?? optionText;
 }


 function load() {
 confirmed = false;
 const data = currentSet[idx];
 const corr = data.corr ?? data.answer;
 const questionText = patchKnownBrokenQuestionText(data.q ?? data.question);
 const multiMode = engine.isMultiMode(corr);
 selected = multiMode ? [] : null;

 updateProgressBar();

 document.getElementById('live-idx').innerText = `Quest\u00e3o ${idx + 1} de ${currentSet.length}`;
 document.getElementById('live-score').innerText = score;
 document.getElementById('q-tag').innerText = decodeMojibake(data.ch ?? `Quest\u00e3o ${idx + 1}`);
 document.getElementById('q-text').innerHTML = currentType === 'exameB'
 ? formatExamBQuestionHtml(data)
 : formatQuestionHtml(questionText, (data.ch ?? `Quest\u00e3o ${idx + 1}`));
 document.getElementById('feedback').classList.add('hidden');
 document.getElementById('next-btn').innerText = "Confirmar Resposta";
 document.getElementById('next-btn').classList.replace('bg-emerald-600', 'bg-indigo-600');

 const optsDiv = document.getElementById('opts');
 optsDiv.innerHTML = '';
 const opts = data.opts ?? data.options;
 opts.forEach((o, i) => {
  const d = document.createElement('div');
  d.className = 'opt p-5 rounded-2xl flex items-start gap-4 text-sm font-semibold text-slate-300 leading-relaxed';
  const normalizedOption = normalizeOptionText(o, i);
  const patchedOption = patchKnownBrokenOptionText(questionText, i, normalizedOption);
  d.innerHTML = `<span class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-700 shrink-0">${String.fromCharCode(65+i)}</span> <span class="flex-1 whitespace-pre-wrap leading-relaxed">${patchedOption}</span>`;
  d.onclick = () => { if(!confirmed) select(i, d); };
  optsDiv.appendChild(d);
 });
 repairVisibleText(document.getElementById('q-container'));
 lucide.createIcons();
 }

 function select(i, el) {
 const data = currentSet[idx];
 const corr = data.corr ?? data.answer;
 const multiMode = engine.isMultiMode(corr);

 if(!multiMode) {
 selected = i;
 document.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
 el.classList.add('selected');
 return;
 }


 // Modo mÃºltipla escolha (ex: 'Selecione DUAS opÃ§Ãµes')
 const max = corr.length;
 const pos = selected.indexOf(i);
 if(pos >= 0) {
 selected.splice(pos, 1);
 el.classList.remove('selected');
 } else {
 // limita a quantidade de seleÃ§Ãµes ao nÃºmero de respostas corretas
 if(selected.length >= max) {
 const removed = selected.shift();
 const items = document.querySelectorAll('.opt');
 if(items[removed]) items[removed].classList.remove('selected');
 }
 selected.push(i);
 el.classList.add('selected');
 }

 }

 function check() {
 const data = currentSet[idx];
 const corr = data.corr ?? data.answer;
 const multiMode = engine.isMultiMode(corr);

 if(!engine.hasCompleteSelection(selected, corr)) return;

 if(!confirmed) {
 confirmed = true;
 const items = document.querySelectorAll('.opt');

 const result = engine.evaluateSelection(selected, corr);
 if(!multiMode) {
 if(result.allCorrect) {
 items[selected].classList.add('correct');
 score++;
 } else {
 items[selected].classList.add('wrong');
 items[corr].classList.add('correct');
 }
 } else {
 corr.forEach(i => items[i].classList.add('correct'));
 selected.forEach(i => { if(!result.correctSet.has(i)) items[i].classList.add('wrong'); });
 if(result.allCorrect) score++;
 }

 // Registra a tentativa do usuÃ¡rio (para revisÃ£o final)
 const _tag = decodeMojibake(data.ch ?? `Questão ${idx + 1}`);
 const _qText = patchKnownBrokenQuestionText(data.q ?? data.question);
 const _optsFixed = (data.opts ?? data.options).map((opt, optionIndex) => {
 const normalized = decodeMojibake(opt);
 return patchKnownBrokenOptionText(_qText, optionIndex, normalized);
 });
 const _sel = Array.isArray(selected) ? [...selected] : selected;
 const _corr = Array.isArray(corr) ? [...corr] : corr;
 const _reviewText = String(_qText).replace('[[VISUAL]]', '[Elemento visual apresentado na questão]');
 attempts[idx] = { n: idx + 1, tag: _tag, q: _reviewText, opts: _optsFixed, sel: _sel, corr: _corr };

 document.getElementById('f-text').innerText = decodeMojibake(data.f ?? '');
 document.getElementById('feedback').classList.remove('hidden');
 document.getElementById('next-btn').innerText = (idx + 1 === currentSet.length) ? "Ver Resultado Final" : "Próxima Questão";
 document.getElementById('next-btn').classList.replace('bg-indigo-600', 'bg-emerald-600');
 document.getElementById('live-score').innerText = score;
 lucide.createIcons();
 } else {
 idx++;
 if(idx < currentSet.length) load();
 else {
 updateProgressBar(); // Garante que chegue a 100% no fim
 showResult();
 }
 }
 }


function showResult() {
 clearInterval(timerInterval);
 timerInterval = null;
 timerPaused = false;
 syncTimerToggle();
 const pct = Math.round((score/currentSet.length)*100);

 // Regra de aprovaÃ§Ã£o
 const aprovado = pct >= 65;
 const statusText = aprovado ? "APROVADO" : "REPROVADO";
 const statusClass = aprovado ? "text-emerald-400" : "text-rose-400";

 if (!resultSaved && currentType && window.quizStorage) {
 const quizNames = {
 oficial: "Prova Oficial",
 adicionais: "Questões Adicionais",
 k2k3: "Cálculos K2 & K3",
 exameB: "Exame B — CTFL 4.0"
 };
 window.quizStorage.saveAttempt({
 quizType: currentType,
 quizName: quizNames[currentType],
 score: pct,
 correct: score,
 total: currentSet.length,
 approved: aprovado,
 completedAt: new Date().toISOString(),
 duration: quizStartedAt ? (Date.now() - quizStartedAt) / 1000 : undefined
 });
 resultSaved = true;
 }

 // Monta lista de questÃµes incorretas

 function fmtAnswer(a, indices) {
 if(indices === null || indices === undefined) return "<span class='text-slate-400'>—</span>";
 const toOne = (i) => {
 const letter = String.fromCharCode(65 + i);
 const raw = a.opts[i] ?? "";
 const clean = normalizeOptionText(raw, i);
 return `<div class="mt-1"><span class="font-black text-slate-300">${letter})</span> <span class="text-slate-200">${escapeHtml(clean)}</span></div>`;
 };
 if(Array.isArray(indices)) {
 return indices.slice().sort((x,y)=>x-y).map(toOne).join("");
 }
 return toOne(indices);
 }

 const wrong = attempts
 .filter(a => a && !engine.isCorrectAttempt(a))
 .map(a => {
 const selHtml = fmtAnswer(a, a.sel);
 const corrHtml = fmtAnswer(a, a.corr);
 return `
 <div class="card p-6 rounded-3xl border border-slate-700/60 bg-slate-900/30">
 <div class="flex items-center justify-between mb-3">
 <div class="text-xs font-black uppercase tracking-widest text-indigo-400">${escapeHtml(a.tag)} • Q${a.n}</div>
 <div class="text-[10px] font-black uppercase tracking-widest text-rose-300">ERRADA</div>
 </div>
 <div class="text-slate-100 font-semibold leading-relaxed whitespace-pre-wrap">${escapeHtml(a.q)}</div>

 <div class="mt-5 grid gap-4 md:grid-cols-2">
 <div class="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20">
 <div class="text-xs font-black uppercase tracking-widest text-rose-300 mb-2">Você marcou</div>
 ${selHtml}
 </div>
 <div class="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
 <div class="text-xs font-black uppercase tracking-widest text-emerald-300 mb-2">Correta</div>
 ${corrHtml}
 </div>
 </div>
 </div>
 `;
 })
 .join("");

 const unansweredCount = engine.getUnansweredCount(currentSet.length, attempts);

 const wrongBlock = wrong
 ? `<div class="mt-10">
 <h3 class="text-xl font-black tracking-tight text-white mb-4">Revisão das questões que você errou</h3>
 <div class="grid gap-6">${wrong}</div>
 </div>`
 : unansweredCount > 0
 ? `<div class="mt-10 p-6 rounded-3xl border border-amber-500/30 bg-amber-950/20 text-center">
 <div class="text-amber-300 font-black uppercase tracking-widest text-sm mb-2">Atenção</div>
 <div class="text-slate-200 font-semibold">Você tem ${unansweredCount} questão(ões) não respondida(s) neste simulado.</div>
 </div>`
 : `<div class="mt-10 p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 text-center">
 <div class="text-emerald-300 font-black uppercase tracking-widest text-sm mb-2">Perfeito</div>
 <div class="text-slate-200 font-semibold">Você não errou nenhuma questão neste simulado.</div>
 </div>`;

 document.getElementById('quiz').innerHTML = `
 <div class="text-center py-10 animate-in fade-in zoom-in">
 <h2 class="text-7xl font-black text-indigo-500 mb-3">${pct}%</h2>
 <div class="text-3xl font-black mb-6 tracking-tight ${statusClass}">${statusText}</div>
 <p class="text-2xl font-bold mb-8 uppercase italic tracking-tighter">Simulado Finalizado!</p>
 <p class="text-slate-400 mb-10 text-lg">Acertou ${score} de ${currentSet.length} questões.</p>
 <button onclick="location.reload()" class="bg-indigo-600 px-10 py-5 rounded-full font-black uppercase hover:bg-white hover:text-indigo-900 transition-all text-white">Voltar ao Painel</button>
 </div>
 ${wrongBlock}
 `;
 repairVisibleText(document.getElementById('quiz'));
 }

 repairVisibleText(document.body);
 lucide.createIcons();
