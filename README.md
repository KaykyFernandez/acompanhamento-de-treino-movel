# Meu Treino

App Android de treino e nutrição para hipertrofia e definição.

## Recursos

- **Treino ao vivo:** cronômetro da sessão, séries com carga e repetições, coluna "anterior" com o que você fez na última vez, e ✓ que preenche a série com os valores anteriores. Tipos de série (aquecimento, drop set, falha), anotações por exercício, troca e reordenação de exercícios.
- **Timer de descanso automático** ao concluir cada série, com ±15 s. Ele vibra e toca mesmo com o app em segundo plano, e a tela fica ligada durante o treino.
- **Recordes automáticos (PR)** de carga e 1RM estimado (fórmula de Epley), com aviso na hora e um resumo ao finalizar.
- **Rotinas e programas prontos:** ABC, Push/Pull/Legs, Superior/Inferior e Full body. Editor de rotinas com séries, repetições e descanso.
- **Biblioteca com 97 exercícios** por grupo muscular, busca, e exercícios personalizados.
- **Progresso:** volume semanal, séries por músculo, calendário, histórico de treinos, e gráficos por exercício (1RM, carga máxima, volume) com cargas sugeridas.
- **Corpo:** peso com linha de tendência e medidas (cintura, braço, % de gordura etc.).
- **Nutrição:** cerca de 80 alimentos brasileiros, refeições do dia, calorias e macros, água, e alimentos personalizados.
- **Onboarding** que calcula as metas de calorias e macros (Mifflin-St Jeor) pelo objetivo.
- Calculadoras de 1RM e de anilhas, tema escuro e claro, backup em arquivo, e uso offline.

## Instalar no celular

1. Baixe [`apk/MeuTreino.apk`](apk/MeuTreino.apk) no celular.
2. Abra o arquivo e permita "instalar apps de fontes desconhecidas" quando o Android pedir.

Requer Android 8.0 ou mais novo. A versão 2 instala por cima da 1 e mantém os dados.

## Testar no PC

Abra `app/src/main/assets/index.html` no Chrome, aperte F12 e depois Ctrl+Shift+M para ver em modo celular.

## Estrutura

```
app/src/main/assets/
  index.html
  css/app.css        design system (tema escuro/claro)
  js/data.js         exercícios, alimentos, programas
  js/core.js         estado, migração, estatísticas, gráficos
  js/views.js        telas e páginas
  js/workout.js      treino ativo, descanso, recordes
  js/main.js         onboarding, ações, inicialização
app/src/main/java/.../MainActivity.java   WebView + recursos nativos
```

## Compilar

```
./gradlew assembleRelease
```

A assinatura usa `keystore.properties` (fora do git). Guarde a chave `.jks`: sem ela não dá para publicar atualizações por cima do app instalado.
