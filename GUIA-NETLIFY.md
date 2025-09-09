# 🚀 GUIA COMPLETO: Como Publicar seu Site no Netlify

## 📋 O que você vai conseguir fazer:
- ✅ Publicar seu site na internet GRATUITAMENTE
- ✅ Acessar de qualquer lugar (celular, computador, tablet)
- ✅ Atualizar jogadores online sem mexer em arquivos
- ✅ Baixar PNG das artes direto do site
- ✅ Preços sempre atualizados automaticamente do Cartola

---

## 🎯 PASSO 1: Criar conta no Netlify

1. **Acesse:** https://www.netlify.com
2. **Clique em:** "Sign up" (Cadastrar)
3. **Escolha:** "Sign up with GitHub" (mais fácil)
   - Se não tem GitHub, clique em "Sign up with email"
4. **Preencha** seus dados e confirme o email

---

## 📁 PASSO 2: Preparar seus arquivos

### Opção A: Upload Direto (MAIS FÁCIL)
1. **Comprima** toda a pasta do projeto em um arquivo ZIP
   - Clique com botão direito na pasta
   - Escolha "Enviar para > Pasta compactada"
   - Nome sugerido: `dicas-cartola.zip`

### Opção B: GitHub (Recomendado para atualizações futuras)
1. **Crie conta no GitHub:** https://github.com
2. **Clique em:** "New repository"
3. **Nome:** `dicas-cartola-tcc`
4. **Marque:** "Public" e "Add a README file"
5. **Upload** todos os arquivos do projeto

---

## 🌐 PASSO 3: Publicar no Netlify

### Se escolheu Opção A (Upload Direto):
1. **Entre** no Netlify
2. **Clique** em "Sites" no menu lateral
3. **Arraste** o arquivo ZIP para a área "Want to deploy a new site without connecting to Git?"
4. **Aguarde** o upload e deploy (1-2 minutos)

### Se escolheu Opção B (GitHub):
1. **Entre** no Netlify
2. **Clique** em "New site from Git"
3. **Escolha** "GitHub"
4. **Autorize** o Netlify a acessar seu GitHub
5. **Selecione** o repositório `dicas-cartola-tcc`
6. **Configurações de build:**
   - Build command: `echo 'Site pronto'`
   - Publish directory: `.` (ponto)
7. **Clique** em "Deploy site"

---

## ⚙️ PASSO 4: Configurar seu site

1. **Após o deploy**, clique no nome do site
2. **Vá em:** "Site settings"
3. **Clique em:** "Change site name"
4. **Digite:** `dicas-cartola-tcc` (ou outro nome de sua preferência)
5. **Salve** as alterações

**SEU SITE ESTARÁ DISPONÍVEL EM:**
`https://dicas-cartola-tcc.netlify.app`

---

## 🎮 PASSO 5: Como usar seu site online

### Para criar uma nova arte:
1. **Acesse** seu site pelo link
2. **Prepare** um arquivo CSV com seus jogadores:
   ```
   pos,nome,clube,conf,cap,uni,rl
   GOL,Alisson,Liverpool,A,CAP
   ZAG,Marquinhos,PSG,A,,UNI
   MEI,Casemiro,Manchester United,B
   ATA,Neymar,Al-Hilal,A,,,RL
   ```

3. **Formato do CSV:**
   - `pos`: Posição (GOL, ZAG, LAT, MEI, ATA, TEC)
   - `nome`: Nome do jogador
   - `clube`: Nome do clube
   - `conf`: Confiança (A, B ou C)
   - `cap`: Escreva "CAP" se for capitão
   - `uni`: Escreva "UNI" se for unanimidade
   - `rl`: Escreva "RL" se for reserva de luxo

4. **Upload** do arquivo no site
5. **Clique** em "Gerar Arte"
6. **Download** do PNG

---

## 🔄 PASSO 6: Atualizar o site (quando necessário)

### Se usou Upload Direto:
1. **Faça** as alterações nos arquivos locais
2. **Comprima** novamente em ZIP
3. **Vá** no Netlify > seu site > "Deploys"
4. **Arraste** o novo ZIP na área de deploy

### Se usou GitHub:
1. **Faça** as alterações nos arquivos
2. **Upload** no GitHub (substitua os arquivos)
3. **O Netlify atualiza automaticamente!**

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### ❌ Site não carrega:
- Verifique se todos os arquivos foram enviados
- Confirme que o arquivo `index.html` está na raiz

### ❌ Preços não atualizam:
- Clique no botão "Atualizar Mercado" no site
- A API do Cartola pode estar temporariamente indisponível

### ❌ Escudos não aparecem:
- Verifique se a pasta `public/escudos/` foi enviada
- Confirme que os nomes dos clubes estão corretos

### ❌ Erro ao gerar PNG:
- Tente com menos jogadores primeiro
- Verifique se o CSV está no formato correto

---

## 📱 DICAS EXTRAS

### ✨ Para facilitar o uso:
1. **Salve** o link do seu site nos favoritos
2. **Crie** um atalho na tela inicial do celular
3. **Compartilhe** o link com outros usuários

### 🔒 Segurança:
- Seu site é público (qualquer um pode acessar)
- Não coloque informações pessoais no código
- O Netlify oferece HTTPS automaticamente

### 💰 Custos:
- **Netlify:** GRATUITO (até 100GB de banda por mês)
- **GitHub:** GRATUITO para repositórios públicos
- **Domínio personalizado:** Opcional (pago)

---

## 🎉 PRONTO!

Seu site está no ar! Agora você pode:
- ✅ Acessar de qualquer lugar
- ✅ Criar artes online
- ✅ Preços sempre atualizados
- ✅ Download direto do PNG
- ✅ Compartilhar com amigos

**Link do seu site:** `https://SEU-NOME-ESCOLHIDO.netlify.app`

---

## 📞 SUPORTE

Se tiver dúvidas:
1. **Netlify Docs:** https://docs.netlify.com
2. **GitHub Help:** https://help.github.com
3. **Comunidade:** Stack Overflow

**Boa sorte com seu site! 🚀⚽**