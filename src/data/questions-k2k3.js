window.CTFL_DB = window.CTFL_DB || {};
window.CTFL_DB.k2k3 = [
 {
 ch: "K3 - ANÁLISE DE VALOR LIMITE (2 PONTOS)",
 q: "Um campo de entrada aceita números inteiros de 1 a 100 (inclusive). O exame especifica o uso da **Análise de Valor Limite de 2 pontos**. Qual é o conjunto mínimo de valores de teste para verificar o limite SUPERIOR deste campo?",
 opts: ["99, 100, 101", "100, 101", "100, 101, 102", "99, 100"],
 corr: 1,
 f: "Na AVL de 2 pontos, testamos o valor exato do limite (100) e o primeiro valor fora do limite (101)."
 },
 {
 ch: "K3 - PARTIÇÃO DE EQUIVALÊNCIA",
 q: "Um sistema de frete cobra R$ 10 para pesos entre 0 (exclusivo) e 5kg, R$ 20 para 5kg (exclusivo) até 20kg, e proíbe pesos acima de 20kg ou menores/iguais a zero.\nSeus casos de teste atuais usam os valores: `3kg` e `15kg`.\nQual partição de equivalência NÃO está sendo coberta?",
 opts: ["A partição válida de 5kg a 20kg.", "A partição inválida de valores negativos ou zero.", "A partição válida de 0kg a 5kg.", "A partição inválida de valores acima de 20kg."],
 corr: 3,
 f: "Os testes cobrem as duas faixas válidas. Porém, não há testes para as partições inválidas (<=0 e >20)."
 },
 {
 ch: "K3 - TABELA DE DECISÃO",
 q: "Regra de negócio: 'Se o cliente tem cartão Fidelidade (Sim/Não) E a compra é maior que R$ 500 (Sim/Não), ganha 10% de desconto. Caso contrário, 0%.'\nAo projetar a Tabela de Decisão, quantas regras (colunas) resultam em '0% de desconto' antes de qualquer simplificação?",
 opts: ["1 regra.", "2 regras.", "3 regras.", "4 regras."],
 corr: 2,
 f: "Existem 4 combinações (TT, TF, FT, FF). Apenas TT dá desconto. As outras 3 (TF, FT, FF) dão 0%."
 },
 {
 ch: "K3 - TRANSIÇÃO DE ESTADO",
 q: "Estados: Rascunho -> (Enviar) -> Revisão -> (Aprovar) -> Publicado.\nDo estado 'Revisão', é possível (Rejeitar) voltando para 'Rascunho'.\nQual sequência de transição é INVÁLIDA?",
 opts: ["Rascunho -> Enviar -> Revisão -> Rejeitar -> Rascunho.", "Rascunho -> Enviar -> Revisão -> Aprovar -> Publicado.", "Rascunho -> Aprovar -> Publicado.", "Revisão -> Rejeitar -> Rascunho -> Enviar -> Revisão."],
 corr: 2,
 f: "Não existe transição direta de 'Rascunho' para 'Aprovar' ou 'Publicado'. Deve passar por 'Revisão'."
 },
 {
 ch: "K3 - COBERTURA DE INSTRUÇÃO",
 q: "Pseudocódigo:\nSE (A > 5) ENTÃO Imprima 'Maior';\nSE (B < 0) ENTÃO Imprima 'Negativo';\nQual é o número MÍNIMO de casos de teste para garantir 100% de Cobertura de Instrução?",
 opts: ["1 caso de teste (A=6, B=-1).", "2 casos de teste (A=6, B=0 e A=3, B=-1).", "3 casos de teste.", "4 casos de teste."],
 corr: 0,
 f: "Um único caso onde A=6 (Entra no primeiro IF) e B=-1 (Entra no segundo IF) executa todas as linhas."
 },
 {
 ch: "K3 - COBERTURA DE DECISÃO",
 q: "Trecho: `SE (Idade >= 18) { Cadastrar(); }`\nVocê executou um teste com `Idade = 20`. Qual é a porcentagem de Cobertura de Decisão alcançada?",
 opts: ["100%", "50%", "25%", "0%"],
 corr: 1,
 f: "O valor 20 testa apenas o ramo VERDADEIRO. Falta testar o FALSO para completar 100%."
 },
 {
 ch: "K2 - TESTE DE MANUTENÇÃO",
 q: "Uma correção de emergência foi aplicada no módulo de pagamentos. A Análise de Impacto indicou que a mudança pode afetar o cálculo de frete. Além de testar a correção, o que mais é CRÍTICO?",
 opts: ["Realizar teste de regressão apenas no módulo de pagamentos.", "Realizar teste de regressão no módulo de frete e áreas integradas.", "Atualizar todos os casos de teste do sistema antes de testar.", "Executar um teste completo de sistema em todos os módulos."],
 corr: 1,
 f: "A análise de impacto direciona a regressão para as áreas afetadas (frete) sem precisar retestar tudo."
 },
 {
 ch: "K2 - NÍVEIS DE TESTE (INTEGRAO)",
 q: "Dev A terminou 'Login' e Dev B terminou 'Banco'. Ambos funcionam isoladamente, mas falham ao tentar salvar o login no banco.\nQue tipo de defeito é esse e onde seria encontrado?",
 opts: ["Defeito de lógica interna; Teste de Componente.", "Defeito de interface/comunicação; Teste de Integração.", "Defeito de aceitação; Teste de Sistema.", "Defeito de usabilidade; Teste de Aceitação."],
 corr: 1,
 f: "Falha na comunicação entre módulos funcionais caracteriza defeito de integração."
 },
 {
 ch: "K2 - ESTRATÉGIA DE TESTE",
 q: "Risco X: Alta Probabilidade, Altíssimo Impacto.\nRisco Y: Baixa Probabilidade, Baixo Impacto.\nQual abordagem correta baseada em risco?",
 opts: ["Testar X e Y com a mesma profundidade.", "Testar Y primeiro (Quick Win).", "Testar X primeiro e com rigor; Y se houver tempo.", "Automatizar Y e testar X manualmente."],
 corr: 2,
 f: "Teste Baseado em Risco prioriza o esforço onde o risco (Probabilidade x Impacto) é maior."
 },
 {
 ch: "K2 - DEFEITOS E ERROS",
 q: "Um testador reporta: 'O sistema trava ao clicar em Salvar'. O desenvolvedor descobre que esqueceu de tratar valores nulos.\nO que é o 'Esquecimento do desenvolvedor'?",
 opts: ["A Falha.", "O Defeito.", "O Erro (Engano).", "O Falso-Positivo."],
 corr: 2,
 f: "Erro é a ação humana. O erro introduz um Defeito. O defeito causa uma Falha."
 },
 {
 ch: "K3 - ANÁLISE DE VALOR LIMITE (3 PONTOS)",
 q: "Um sistema industrial de resfriamento aceita temperaturas entre -20°C e 10°C (inclusive). Temperaturas fora disso geram alarme. \n\nUsando AVL de 3 pontos para o LIMITE INFERIOR (-20), quais valores devem ser testados?",
 opts: ["-21, -20, -19", "-20, -19, -18", "-19, -20, 10", "-21, -20, 9"],
 corr: 0,
 f: "3 pontos: O valor (-20), um abaixo (-21) e um acima (-19)."
 },
 {
 ch: "K3 - PARTIÇÃO DE EQUIVALÊNCIA",
 q: "Sistema de bônus:\n0-1 anos: 0%\n2-5 anos: 5%\n6-10 anos: 10%\n>10 anos: 15%\nQual o conjunto mínimo para cobrir todas as partições VÁLIDAS?",
 opts: ["1, 3, 8, 12", "0, 1, 2, 5, 6, 10, 11", "0, 5, 15", "1, 12"],
 corr: 0,
 f: "Um valor representante de cada faixa válida."
 },
 {
 ch: "K3 - TABELA DE DECISÃO",
 q: "Regra: Se 'Premium' e 'Compra > 100', Frete Grátis. Se não, Frete R$ 20. \n\nQuantas colunas tem a tabela completa e quantos casos de teste após simplificar se 'Não Premium' torna o valor da compra irrelevante?",
 opts: ["4 colunas; 3 casos simplificados.", "4 colunas; 4 casos.", "2 colunas; 2 casos.", "8 colunas; 3 casos."],
 corr: 0,
 f: "2 condições = 2^2 = 4 colunas. Se não é premium, não importa o valor, unindo 2 colunas em 1."
 },
 {
 ch: "K3 - TRANSIÇÃO DE ESTADOS",
 q: "Pedido: [Aberto] -> (Pagar) -> [Pago] -> (Enviar) -> [Entregue].\nSe (Cancelar) no estado [Aberto] ou [Pago], vai para [Cancelado].\nQuantas transições chegam ao estado [Cancelado]?",
 opts: ["1", "2", "3", "4"],
 corr: 1,
 f: "Duas transições: de Aberto para Cancelado e de Pago para Cancelado."
 },
 {
 ch: "K3 - COBERTURA DE INSTRUÇÃO",
 q: "Analise o seguinte código:\n\n1: SE (X > 0) { A = 1 }\n2: CASO CONTRÁRIO { A = 2 }\n3: SE (Y > 0) { B = 1 }\n\nQual é o número MÍNIMO de casos de teste para garantir 100% de Cobertura de Instrução (Statement Coverage)?",
 opts: ["1 caso de teste", "2 casos de teste", "3 casos de teste", "4 casos de teste"],
 corr: 1,
 f: "São necessários 2 testes: \nTeste 1: (X=1, Y=1) -> Cobre as linhas 1 e 3.\nTeste 2: (X=0, Y=0) -> Cobre a linha 2 (o ELSE).\nComo a linha 3 já foi 'pisada' no Teste 1, não precisamos de um teste específico que entre nela novamente para satisfazer a cobertura de INSTRUÇÃO."

 },
 {
 ch: "K3 - COBERTURA DE DECISÃO",
 q: "IF (Idade >= 18) { Pode Dirigir }\nQual o mínimo de testes para 100% de cobertura de decisão?",
 opts: ["1", "2", "3", "4"],
 corr: 1,
 f: "Precisa de um teste para o ramo Verdadeiro e outro para o Falso."
 },
 {
 ch: "K2 - MANUTENO",
 q: "A equipe vai desativar um módulo legado e migrar os dados para um novo. Qual o foco principal do teste de manutenção aqui?",
 opts: ["Apenas deletar o código antigo.", "Teste de migração de dados e teste de regressão no sistema restante.", "Teste de unidade no módulo novo.", "Não precisa testar o que foi deletado."],
 corr: 1,
 f: "Manutenção inclui testes de migração e impacto (regressão)."
 },
 {
 ch: "K2 - MODELO V",
 q: "Qual nível de teste valida a 'Arquitetura do Sistema'?",
 opts: ["Componente.", "Integração.", "Sistema.", "Aceite."],
 corr: 1,
 f: "Integração foca na comunicação e interfaces (arquitetura)."
 },
 {
 ch: "K2 - RISCO",
 q: "Risco: 'O sistema pode vazar dados de cartões'. Impacto Altíssimo. Probabilidade Baixa. Como tratar?",
 opts: ["Ignorar pela baixa probabilidade.", "Prioridade alta de teste devido ao impacto crítico.", "Testar por último.", "Deixar para o cliente testar."],
 corr: 1,
 f: "Impacto crítico exige prioridade alta independente da probabilidade."
 },
 {
 ch: "K2 - INDEPENDNCIA",
 q: "Um consultor externo é contratado para validar o software. Nível de independência?",
 opts: ["Baixo.", "Médio.", "Alto (Externo à organização).", "Nulo."],
 corr: 2,
 f: "Terceiros externos provêem o maior nível de independência."
 }
 ];
