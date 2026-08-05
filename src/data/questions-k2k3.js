window.CTFL_DB = window.CTFL_DB || {};
window.CTFL_DB.k2k3 = [
  {
    ch: "K3 - ANÁLISE DE VALOR LIMITE - DOIS VALORES",
    q: "Um campo aceita números inteiros de 1 a 100, inclusive. Aplicando a Análise de Valor Limite de dois valores ao limite superior, quais valores devem ser selecionados?",
    opts: ["99 e 100.", "100 e 101.", "99, 100 e 101.", "100, 101 e 102."],
    corr: 1,
    f: "Na técnica de dois valores, são escolhidos o valor no limite e o valor adjacente na partição vizinha. Para o limite superior 100, os valores são 100, ainda válido, e 101, primeiro valor inválido."
  },
  {
    ch: "K3 - PARTICIONAMENTO DE EQUIVALÊNCIA",
    q: "Um serviço de entrega aceita pesos maiores que 0 kg e menores ou iguais a 20 kg. A cobrança é de R$ 10,00 para pesos maiores que 0 kg e menores ou iguais a 5 kg, e de R$ 20,00 para pesos maiores que 5 kg e menores ou iguais a 20 kg. Pesos menores ou iguais a 0 kg e maiores que 20 kg são rejeitados. Os testes existentes usam 3 kg e 15 kg. Qual alternativa identifica corretamente a cobertura obtida?",
    opts: ["Todas as partições válidas e inválidas foram cobertas.", "Somente a primeira partição válida foi coberta.", "As duas partições válidas foram cobertas, mas as duas partições inválidas não foram cobertas.", "Uma partição válida e uma partição inválida foram cobertas."],
    corr: 2,
    f: "O valor 3 representa a partição válida acima de 0 até 5 kg, e 15 representa a partição válida acima de 5 até 20 kg. Nenhum teste representa pesos menores ou iguais a 0 kg nem pesos acima de 20 kg."
  },
  {
    ch: "K3 - TESTE DE TABELA DE DECISÃO",
    q: "Uma loja concede 10% de desconto somente quando o cliente possui cartão fidelidade e o valor da compra é superior a R$ 500,00. As duas condições podem assumir os valores Sim ou Não. Em uma tabela de decisão completa, quantas regras resultam em nenhum desconto?",
    opts: ["Uma regra.", "Duas regras.", "Três regras.", "Quatro regras."],
    corr: 2,
    f: "Duas condições booleanas produzem quatro combinações. Apenas a combinação em que ambas são verdadeiras concede desconto. As outras três combinações resultam em nenhum desconto."
  },
  {
    ch: "K3 - TESTE DE TRANSIÇÃO DE ESTADOS",
    q: "Um documento pode seguir estas transições: Rascunho --Enviar--> Em revisão; Em revisão --Aprovar--> Publicado; Em revisão --Rejeitar--> Rascunho. Qual sequência contém uma transição inválida?",
    opts: ["Rascunho --Enviar--> Em revisão --Rejeitar--> Rascunho.", "Rascunho --Enviar--> Em revisão --Aprovar--> Publicado.", "Em revisão --Rejeitar--> Rascunho --Enviar--> Em revisão.", "Rascunho --Aprovar--> Publicado."],
    corr: 3,
    f: "O evento Aprovar está disponível somente no estado Em revisão. Não existe transição direta de Rascunho para Publicado por meio desse evento."
  },
  {
    ch: "K3 - COBERTURA DE INSTRUÇÕES",
    q: "Considere o pseudocódigo:\n\nSE A > 5 ENTÃO\n    imprimir \"Maior\"\nFIM_SE\n\nSE B < 0 ENTÃO\n    imprimir \"Negativo\"\nFIM_SE\n\nQual é o número mínimo de casos de teste necessário para obter 100% de cobertura de instruções?",
    opts: ["Um caso: A = 6 e B = -1.", "Dois casos: A = 6, B = 0; e A = 3, B = -1.", "Três casos.", "Quatro casos."],
    corr: 0,
    f: "Um único caso com A = 6 e B = -1 executa as duas instruções internas. Isso satisfaz a cobertura de instruções, embora não cubra todos os resultados verdadeiro e falso das decisões."
  },
  {
    ch: "K3 - COBERTURA DE DECISÃO",
    q: "Considere a decisão: SE idade >= 18 ENTÃO cadastrar usuário. Foi executado somente um teste com idade igual a 20. Qual cobertura de decisão foi alcançada?",
    opts: ["0%.", "25%.", "50%.", "100%."],
    corr: 2,
    f: "A decisão possui dois resultados possíveis: verdadeiro e falso. O teste com idade 20 exercita apenas o resultado verdadeiro, portanto cobre um de dois resultados, ou 50%."
  },
  {
    ch: "K2 - TESTE DE MANUTENÇÃO E ANÁLISE DE IMPACTO",
    q: "Uma correção emergencial foi aplicada ao módulo de pagamentos. A análise de impacto mostrou que a alteração também pode afetar o cálculo de frete e a integração entre esses módulos. Além do teste de confirmação da correção, qual atividade é mais apropriada?",
    opts: ["Executar regressão somente no módulo de pagamentos.", "Executar regressão nas funções de frete e nas integrações relacionadas.", "Atualizar todos os casos de teste do sistema antes de iniciar qualquer execução.", "Executar obrigatoriamente todos os testes existentes de todos os módulos."],
    corr: 1,
    f: "A análise de impacto orienta a seleção dos testes de regressão. O esforço deve se concentrar nas áreas potencialmente afetadas e nas integrações relacionadas, sem exigir automaticamente a repetição de todos os testes do sistema."
  },
  {
    ch: "K2 - NÍVEIS DE TESTE - INTEGRAÇÃO",
    q: "Os componentes de autenticação e persistência foram aprovados separadamente nos testes de componente. Quando integrados, o sistema não consegue gravar no banco de dados as informações do usuário autenticado. Qual combinação descreve melhor o problema e o nível de teste que tende a detectá-lo?",
    opts: ["Defeito interno de cálculo; teste de componente.", "Defeito de interface ou interação; teste de integração de componentes.", "Defeito de usabilidade; teste de aceitação.", "Defeito de regra de negócio; teste de sistema exclusivamente."],
    corr: 1,
    f: "Como os componentes funcionam isoladamente e falham quando interagem, o problema está na interface ou comunicação entre eles, foco típico do teste de integração de componentes."
  },
  {
    ch: "K2 - TESTE BASEADO EM RISCO",
    q: "O risco X possui alta probabilidade e impacto muito alto. O risco Y possui baixa probabilidade e baixo impacto. Qual abordagem está mais alinhada ao teste baseado em risco?",
    opts: ["Aplicar a mesma profundidade e prioridade aos dois riscos.", "Priorizar os testes relacionados ao risco X e alocar maior esforço a eles.", "Testar primeiro o risco Y por ser mais simples.", "Definir a prioridade apenas pelo custo de automação."],
    corr: 1,
    f: "No teste baseado em risco, a prioridade e a intensidade do teste são influenciadas pelo nível de risco, geralmente determinado pela combinação de probabilidade e impacto. O risco X deve receber maior atenção."
  },
  {
    ch: "K2 - ERRO, DEFEITO E FALHA",
    q: "Um sistema apresenta uma falha ao salvar um cadastro. Durante a investigação, descobre-se que o desenvolvedor esqueceu de tratar valores nulos. De acordo com a terminologia de testes, o esquecimento do desenvolvedor é classificado como:",
    opts: ["Falha.", "Defeito.", "Erro humano.", "Falso positivo."],
    corr: 2,
    f: "Erro é uma ação humana que pode introduzir um defeito no produto de trabalho. Quando o defeito é executado em determinadas condições, pode provocar uma falha observável."
  },
  {
    ch: "K3 - ANÁLISE DE VALOR LIMITE - TRÊS VALORES",
    q: "Um sistema aceita temperaturas inteiras entre -20 °C e 10 °C, inclusive. Valores fora desse intervalo geram um alarme. Aplicando a Análise de Valor Limite de três valores ao limite inferior, qual conjunto deve ser testado?",
    opts: ["-21, -20 e -19.", "-20, -19 e -18.", "-21, -20 e 10.", "-20, 9 e 10."],
    corr: 0,
    f: "Na abordagem de três valores, são testados o valor no limite e os dois valores adjacentes, um de cada lado. Para o limite inferior -20, isso corresponde a -21, -20 e -19."
  },
  {
    ch: "K3 - PARTICIONAMENTO DE EQUIVALÊNCIA",
    q: "Um sistema recebe a quantidade de anos completos de vínculo de um funcionário, usando números inteiros não negativos, e define o bônus da seguinte forma: 0 a 1 ano: 0%; 2 a 5 anos: 5%; 6 a 10 anos: 10%; acima de 10 anos: 15%. Qual conjunto mínimo cobre todas as partições válidas?",
    opts: ["1, 3, 8 e 12.", "0, 1, 2, 5, 6, 10 e 11.", "0, 5 e 15.", "1 e 12."],
    corr: 0,
    f: "O particionamento de equivalência exige ao menos um representante de cada partição. Os valores 1, 3, 8 e 12 representam, respectivamente, as quatro faixas válidas."
  },
  {
    ch: "K3 - SIMPLIFICAÇÃO DE TABELA DE DECISÃO",
    q: "Uma loja oferece frete grátis quando o cliente é Premium e a compra é superior a R$ 100,00. Caso contrário, cobra R$ 20,00 de frete. A tabela completa usa duas condições booleanas. Se, para clientes não Premium, o valor da compra for irrelevante, quantas regras existem na tabela completa e quantas permanecem após a simplificação?",
    opts: ["Quatro regras completas e três regras simplificadas.", "Quatro regras completas e quatro regras simplificadas.", "Duas regras completas e duas regras simplificadas.", "Oito regras completas e três regras simplificadas."],
    corr: 0,
    f: "Duas condições booleanas geram quatro regras. As duas regras em que o cliente não é Premium produzem a mesma ação, independentemente do valor da compra, e podem ser combinadas em uma única regra. Restam três."
  },
  {
    ch: "K3 - COBERTURA DE TRANSIÇÕES VÁLIDAS",
    q: "Um pedido possui as seguintes transições: Aberto --Pagar--> Pago; Pago --Enviar--> Entregue; Aberto --Cancelar--> Cancelado; Pago --Cancelar--> Cancelado. Qual é o número mínimo de sequências de teste necessário para cobrir todas as transições válidas ao menos uma vez, considerando que cada sequência começa em Aberto?",
    opts: ["Uma sequência.", "Duas sequências.", "Três sequências.", "Quatro sequências."],
    corr: 2,
    f: "São necessárias três sequências: (1) Aberto--Pagar-->Pago--Enviar-->Entregue; (2) Aberto--Pagar-->Pago--Cancelar-->Cancelado; e (3) Aberto--Cancelar-->Cancelado. Nenhuma sequência única pode executar as duas transições alternativas que saem de Aberto."
  },
  {
    ch: "K3 - COBERTURA DE INSTRUÇÕES",
    q: "Considere o pseudocódigo:\n\nSE X > 0 ENTÃO\n    A = 1\nSENÃO\n    A = 2\nFIM_SE\n\nSE Y > 0 ENTÃO\n    B = 1\nFIM_SE\n\nQual é o número mínimo de casos de teste necessário para obter 100% de cobertura de instruções?",
    opts: ["Um caso.", "Dois casos.", "Três casos.", "Quatro casos."],
    corr: 1,
    f: "São necessários dois casos para executar tanto A = 1 quanto A = 2. Um exemplo é X = 1, Y = 1, que executa A = 1 e B = 1, e X = 0, Y = 0, que executa A = 2."
  },
  {
    ch: "K3 - COBERTURA DE DECISÃO",
    q: "Considere o pseudocódigo:\n\nSE idade >= 18 ENTÃO\n    permitir cadastro\nFIM_SE\n\nSE possui documento = verdadeiro ENTÃO\n    validar documento\nFIM_SE\n\nQual é o número mínimo de casos de teste necessário para obter 100% de cobertura de decisão?",
    opts: ["Um caso.", "Dois casos.", "Três casos.", "Quatro casos."],
    corr: 1,
    f: "Cada decisão precisa produzir os resultados verdadeiro e falso. Dois casos são suficientes: por exemplo, idade 20 com documento verdadeiro e idade 17 com documento falso. Assim, ambos os resultados de cada decisão são exercitados."
  },
  {
    ch: "K2 - TESTE DE MANUTENÇÃO - MIGRAÇÃO",
    q: "Uma organização substituirá um módulo legado e migrará seus dados para uma nova solução. Qual conjunto de atividades representa melhor o foco do teste de manutenção nesse cenário?",
    opts: ["Somente remover o código antigo.", "Testar a migração e conversão dos dados e executar regressão nas partes do sistema que permanecem em uso.", "Executar apenas testes de componente no novo módulo.", "Ignorar o módulo removido e testar somente a interface visual da nova solução."],
    corr: 1,
    f: "Mudanças de manutenção podem exigir testes de migração ou conversão de dados, além de testes de regressão para verificar efeitos colaterais nas partes do sistema que continuam operando."
  },
  {
    ch: "K2 - NÍVEIS DE TESTE E BASE DE TESTE",
    q: "Em um modelo de desenvolvimento no qual os níveis de teste são associados a produtos de trabalho anteriores, qual nível de teste é mais diretamente relacionado à verificação das interfaces e interações definidas no projeto da arquitetura do sistema?",
    opts: ["Teste de componente.", "Teste de integração de componentes.", "Teste de sistema.", "Teste de aceitação."],
    corr: 1,
    f: "O teste de integração de componentes concentra-se nas interfaces e interações entre componentes. O projeto da arquitetura do sistema pode servir como uma de suas bases de teste."
  },
  {
    ch: "K2 - RISCO DE PRODUTO E SEGURANÇA",
    q: "Foi identificado o risco de exposição de dados de cartão. A probabilidade estimada é baixa, mas o impacto potencial é crítico e há requisitos de segurança e conformidade aplicáveis. Qual decisão é mais apropriada?",
    opts: ["Ignorar o risco porque sua probabilidade é baixa.", "Avaliar o nível de risco considerando probabilidade, impacto e requisitos aplicáveis, e definir testes e medidas de mitigação compatíveis.", "Testar somente após todos os riscos de impacto menor.", "Transferir integralmente a responsabilidade de teste ao usuário final."],
    corr: 1,
    f: "A priorização deve considerar a combinação de probabilidade e impacto, além de fatores como segurança, conformidade e exposição do negócio. A baixa probabilidade não justifica ignorar um risco de impacto crítico."
  },
  {
    ch: "K2 - INDEPENDÊNCIA DO TESTE",
    q: "Uma empresa contrata uma organização externa para avaliar seu software. Em comparação com testes executados pelo próprio autor do código, qual afirmação descreve melhor essa situação?",
    opts: ["Representa menor independência e menor chance de encontrar defeitos.", "Representa maior independência, embora possa haver menor conhecimento do produto e maior distância da equipe.", "Não existe diferença relevante de independência.", "Elimina a necessidade de testes realizados pela equipe interna."],
    corr: 1,
    f: "Testadores externos à organização oferecem alto grau de independência e podem identificar defeitos diferentes dos encontrados pelos autores. Porém, essa independência pode trazer desvantagens, como menor conhecimento do contexto e isolamento da equipe."
  }
];
