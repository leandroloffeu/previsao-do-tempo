[![N|Solid](https://universidadedevassouras.edu.br/wp-content/uploads/2022/03/campus_marica.png)](https://universidadedevassouras.edu.br/campus-marica/)

# Engenharia de Software
### Leandro Loffeu Pereira Costa - mat. 202212089
### Laboratório de Desenvolvimento de Aplicativos Nativos - 8º Período
### Professor: Fabicio

Prova P2 

# App de Previsão do Tempo

Um aplicativo móvel simples desenvolvido com React Native e Expo que exibe a previsão do tempo para uma cidade específica utilizando a API pública Open-Meteo. O app possui um design moderno inspirado no Google e inclui gráfico de previsão semanal.

**Não é necessário configurar API Key!** O app utiliza a API pública Open-Meteo, que é completamente gratuita e não requer cadastro ou chave de API.

## 🏃 Como Executar

### Usando Expo Go (Recomendado para testes rápidos)

1. Inicie o servidor de desenvolvimento:
```bash
npm start
```

ou

```bash
yarn start
```

2. Escaneie o QR code com:
   - **Android**: App Expo Go da Play Store
   - **iOS**: Câmera do iPhone (ou app Expo Go da App Store)

### Usando Emulador/Simulador

#### Android
```bash
npm run android
```

#### iOS (apenas macOS)
```bash
npm run ios
```

### Web (para testes no navegador)
```bash
npm run web
```

### Usando Snack Expo (Online)

1. Acesse: https://snack.expo.dev

## ✨ Funcionalidades

- ✅ Campo de busca estilo Google para nome da cidade
- ✅ Botão de busca integrado
- ✅ Exibição do nome da cidade e país
- ✅ Temperatura atual em Celsius
- ✅ Descrição do clima em português
- ✅ Ícone visual representando o clima
- ✅ Informações adicionais (sensação térmica, umidade, velocidade do vento)
- ✅ **Gráfico de previsão semanal** com temperaturas máximas e mínimas
- ✅ **API pública gratuita** - sem necessidade de cadastro ou chave

## 🎨 Interface

O aplicativo possui uma interface limpa e moderna inspirada no Google com:

- **Cabeçalho**: Título "Tempo" com subtítulo
- **Barra de busca**: Campo de busca estilo Google com ícone de lupa
- **Área de resultados**: Exibe:
  - Nome da cidade e país
  - Ícone do clima grande e destacado
  - Temperatura atual em destaque
  - Descrição do clima
  - Detalhes adicionais (sensação térmica, umidade, vento)
  - **Gráfico semanal**: Visualização de 7 dias com temperaturas máximas e mínimas

## 📊 Gráfico da Semana

O app inclui um gráfico interativo que mostra:
- Previsão de temperatura para os próximos 7 dias
- Temperaturas máximas (barra azul)
- Temperaturas mínimas (barra cinza)
- Ícone do clima para cada dia
- Nome do dia da semana

## 📱 Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma e ferramentas para React Native
- **@expo/vector-icons**: Biblioteca de ícones (MaterialCommunityIcons)
- **Open-Meteo API**: API pública gratuita para dados meteorológicos (sem necessidade de chave)

## 🔧 Estrutura do Projeto

```
.
├── App.js              # Componente principal do aplicativo
├── app.json            # Configuração do Expo
├── package.json        # Dependências do projeto
├── README.md           # Este arquivo
├── CONFIGURAR_API_KEY.md # (Não necessário - API pública)
└── .gitignore          # Arquivos ignorados pelo Git
```

## 📝 Notas

- A API Open-Meteo é completamente pública e gratuita
- Não há limite de requisições (uso livre)
- O aplicativo exibe temperaturas em Celsius
- As descrições do clima são exibidas em português
- O gráfico mostra a previsão de 7 dias automaticamente


## 🎯 Diferenciais

- **Sem necessidade de API Key**: Usa API pública gratuita
- **Design moderno**: Interface inspirada no Google
- **Gráfico interativo**: Visualização semanal de temperaturas
- **Totalmente gratuito**: Sem limites ou cadastros
- **Funciona no Snack Expo**: Pode ser testado online sem instalação

