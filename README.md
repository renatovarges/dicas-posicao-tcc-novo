# 🏆 Dicas por Posição - TCC Cartola FC

## 📖 Sobre o Projeto

Ferramenta web para criar artes personalizadas com dicas de jogadores do Cartola FC, organizadas por posição. Integração automática com a API oficial do Cartola para preços sempre atualizados.

## ✨ Funcionalidades

- 🎨 **Geração de artes** com layout profissional
- 💰 **Preços atualizados** automaticamente da API do Cartola
- 📱 **Interface responsiva** para desktop e mobile
- 🏅 **Indicadores visuais** para capitão, unanimidade e reserva de luxo
- 📊 **Níveis de confiança** (A, B, C) com cores diferenciadas
- 🖼️ **Download em PNG** de alta qualidade
- ⚽ **Escudos dos times** integrados

## 🚀 Como Usar

1. **Acesse** o site publicado no Netlify
2. **Prepare** um arquivo CSV com seus jogadores:
   ```csv
   pos,nome,clube,conf,cap,uni,rl
   GOL,Alisson,Liverpool,A,CAP
   ZAG,Marquinhos,PSG,A,,UNI
   MEI,Casemiro,Manchester United,B
   ATA,Neymar,Al-Hilal,A,,,RL
   ```
3. **Upload** do arquivo no site
4. **Clique** em "Gerar Arte"
5. **Download** do PNG gerado

## 📋 Formato do CSV

| Campo | Descrição | Valores |
|-------|-----------|----------|
| `pos` | Posição | GOL, ZAG, LAT, MEI, ATA, TEC |
| `nome` | Nome do jogador | Texto livre |
| `clube` | Nome do clube | Nome completo do time |
| `conf` | Nível de confiança | A, B ou C |
| `cap` | Capitão | "CAP" ou vazio |
| `uni` | Unanimidade | "UNI" ou vazio |
| `rl` | Reserva de Luxo | "RL" ou vazio |

## 🛠️ Tecnologias

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e layout responsivo
- **JavaScript** - Lógica da aplicação e integração com API
- **Canvas API** - Geração de imagens PNG
- **Cartola FC API** - Dados atualizados dos jogadores

## 🌐 Deploy

O projeto está configurado para deploy automático no Netlify. Consulte o arquivo `GUIA-NETLIFY.md` para instruções detalhadas.

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── script.js               # Lógica da aplicação
├── styles.css              # Estilos CSS
├── netlify.toml            # Configuração do Netlify
├── public/
│   ├── escudos/           # Logos dos times
│   └── icons/             # Ícones (capitão, estrela, etc.)
├── exemplo_rodada.csv      # Exemplo de arquivo CSV
└── GUIA-NETLIFY.md        # Guia de publicação
```

## 🔧 Configuração Local

1. Clone o repositório
2. Abra um servidor local:
   ```bash
   python -m http.server 8000
   ```
3. Acesse `http://localhost:8000`

## 📊 API do Cartola

A aplicação utiliza a API oficial do Cartola FC:
- **Endpoint:** `https://api.cartola.globo.com/atletas/mercado`
- **Atualização:** Automática a cada rodada
- **Fallback:** Dados locais em caso de indisponibilidade

## 🎨 Personalização

- **Cores:** Editáveis no arquivo `styles.css`
- **Layout:** Sistema dinâmico que se adapta à quantidade de jogadores
- **Ícones:** SVG editáveis na pasta `public/icons/`
- **Escudos:** PNG dos times na pasta `public/escudos/`

## 📄 Licença

Projeto desenvolvido para fins educacionais (TCC).

## 🤝 Contribuição

Sugestões e melhorias são bem-vindas! Abra uma issue ou envie um pull request.

---

**Desenvolvido com ❤️ para a comunidade do Cartola FC**
