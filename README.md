# Simulado CTFL 4.0 V2

Simulador interativo para estudos e preparação para a certificação CTFL 4.0.

## Recursos

- Prova oficial com 40 questões.
- Banco adicional com 26 questões.
- Banco técnico K2/K3 com 20 questões.
- Explicação apresentada após a confirmação de cada resposta.
- Histórico, indicadores e painel de desempenho salvos localmente.
- Temas escuro e claro com preferência persistente.
- Layout responsivo para desktop e dispositivos móveis.
- Enunciados especiais com listas, tabelas e diagramas fiéis aos documentos de referência.

## Como executar

O projeto não exige build nem instalação de dependências:

1. Abra `src/index.html` diretamente no navegador; ou
2. Utilize uma extensão de servidor local, como o Live Server do VS Code.

## Estrutura

- `src/index.html`: estrutura principal da aplicação.
- `src/css/main.css`: estilos, responsividade e temas.
- `src/data/`: bancos de questões oficial, adicional e K2/K3.
- `src/js/app.js`: renderização das questões e fluxo do simulado.
- `src/js/quiz-engine.js`: regras de pontuação e validação.
- `src/js/storage.js`: persistência local das tentativas.
- `src/js/dashboard.js`: histórico, desempenho, configurações e temas.
- `scripts/bateria_textos.py`: bateria automatizada dos três simulados.

## Validação

A bateria automatizada percorre cenários positivos e negativos nos três bancos, totalizando 172 respostas verificadas.

```powershell
python scripts/bateria_textos.py
```

## Autoria

Desenvolvido por Diego Stanisci Malheiros.
