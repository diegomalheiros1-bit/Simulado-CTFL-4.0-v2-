# Simulado CTFL 4.0 V2

Simulador interativo para estudos e preparação para a certificação CTFL 4.0.

## Recursos

- Prova oficial com 40 questões.
- Banco adicional com 26 questões.
- Banco técnico K2/K3 com 20 questões.
- Exame de Amostra Set B com 40 questões, baseado no ISTQB® CTFL 4.0 v1.7BR.
- Suporte a questões de resposta única e múltiplas respostas com correspondência exata.
- Explicação apresentada após a confirmação de cada resposta.
- Timer individual por simulado com controle de pausa e retomada.
- Histórico, indicadores e painel de desempenho salvos localmente.
- Histórico do Exame B armazenado separadamente e integrado aos indicadores gerais.
- Temas escuro e claro com preferência persistente e estados de alto contraste.
- Layout responsivo para desktop e dispositivos móveis.
- Enunciados especiais com listas, tabelas, código e diagramas fiéis aos documentos de referência.

## Como executar

O projeto não exige build nem instalação de dependências para uso:

1. Abra `src/index.html` diretamente no navegador; ou
2. Utilize um servidor local, como o Live Server do VS Code.

## Estrutura

- `src/index.html`: estrutura principal da aplicação.
- `src/css/main.css`: estilos, responsividade e temas.
- `src/data/`: quatro bancos de questões independentes.
- `src/assets/exame-b/`: recursos visuais utilizados pelo Exame B.
- `src/js/app.js`: renderização das questões, timer e fluxo do simulado.
- `src/js/quiz-engine.js`: regras de pontuação e validação.
- `src/js/storage.js`: persistência local das tentativas.
- `src/js/dashboard.js`: histórico, desempenho, configurações e temas.
- `scripts/bateria_textos.py`: bateria automatizada dos quatro simulados.

## Validação

A bateria automatizada percorre cenários positivos e negativos nos quatro bancos, totalizando 252 questões respondidas, além de auditar os textos renderizados.

```powershell
python scripts/bateria_textos.py
```

O relatório e as capturas geradas ficam em `screenshots/bateria-3.8/` e não são versionados.

## Autoria

Desenvolvido por Diego Stanisci Malheiros.
