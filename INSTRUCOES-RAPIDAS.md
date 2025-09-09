# 📝 INSTRUÇÕES RÁPIDAS

## 🎯 Como Usar Esta Ferramenta

### 1️⃣ Prepare seu arquivo CSV
**Formato obrigatório:**
```csv
pos,nome,clube,conf,cap,uni,rl
GOL,Alisson,Liverpool,A,CAP
ZAG,Marquinhos,PSG,A,,UNI
MEI,Casemiro,Manchester United,B
ATA,Neymar,Al-Hilal,A,,,RL
```

### 2️⃣ Significado das colunas:
- **pos**: Posição (TEC, GOL, LAT, ZAG, MEI, ATA)
- **nome**: Nome do jogador
- **clube**: Nome do time
- **conf**: Confiança (A=Verde, B=Amarelo, C=Vermelho)
- **cap**: Escreva "CAP" se for capitão
- **uni**: Escreva "UNI" se for unanimidade
- **rl**: Escreva "RL" se for reserva de luxo

### 3️⃣ Passos para gerar a arte:
1. **Clique** em "Escolher arquivo" e selecione seu CSV
2. **Digite** o número da rodada (opcional)
3. **Clique** em "Gerar Arte"
4. **Aguarde** o processamento
5. **Clique** em "Download PNG" para baixar

### 4️⃣ Dicas importantes:
- ✅ Use o arquivo `exemplo_rodada.csv` como modelo
- ✅ Preços são atualizados automaticamente do Cartola
- ✅ Clique em "Atualizar Mercado" se necessário
- ✅ Máximo recomendado: 20 jogadores por arte

### 5️⃣ Indicadores visuais:
- 🏅 **Faixa amarela**: Capitão
- ⭐ **Estrela dourada**: Unanimidade  
- 🔶 **RL laranja**: Reserva de Luxo
- 🟢 **A**: Alta confiança
- 🟡 **B**: Média confiança
- 🔴 **C**: Baixa confiança

---

## ⚠️ Problemas Comuns

**❌ Jogador não encontrado:**
- Verifique a grafia do nome
- Confirme o nome do clube
- Alguns jogadores podem não estar no Cartola

**❌ Erro ao gerar PNG:**
- Reduza o número de jogadores
- Verifique se o CSV está no formato correto
- Recarregue a página e tente novamente

**❌ Preços não aparecem:**
- Clique em "Atualizar Mercado"
- Aguarde alguns segundos
- A API do Cartola pode estar indisponível

---

## 🚀 Para Publicar no Netlify

**Consulte o arquivo `GUIA-NETLIFY.md` para instruções completas!**

1. Crie conta no Netlify
2. Faça upload da pasta do projeto
3. Configure o domínio
4. Pronto! Seu site estará online

---

**💡 Dica:** Salve este arquivo para consulta rápida!