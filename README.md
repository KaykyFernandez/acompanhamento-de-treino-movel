# Meu Treino

App Android de acompanhamento de treino (hipertrofia e definição): treinos A/B/C, cronômetro de descanso, calendário, evolução de carga e peso, e controle de comida.

## Instalar no celular

1. Baixe [`apk/MeuTreino.apk`](apk/MeuTreino.apk) no celular.
2. Abra o arquivo e permita "instalar apps de fontes desconhecidas" quando o Android pedir.

Requer Android 8.0 ou mais novo. Os dados ficam salvos no próprio aparelho; use a aba Backup para copiá-los.

## Compilar

O app é a página `app/src/main/assets/index.html` rodando num WebView.

```
./gradlew assembleRelease
```

A assinatura usa `keystore.properties` (fora do git). Guarde a chave `.jks`: sem ela não dá para publicar atualizações por cima do app instalado.
