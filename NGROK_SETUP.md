# 🌐 **Configuração do ngrok para Exposição Pública**

## 🚀 **O que é o ngrok?**

O ngrok é uma ferramenta que cria túneis seguros para expor seu aplicativo local na internet, permitindo que qualquer pessoa acesse seu app através de uma URL pública.

---

## 📋 **Pré-requisitos**

- ✅ Node.js instalado
- ✅ Aplicativo rodando na porta 8080
- ✅ Conta gratuita no ngrok.com

---

## 🔧 **Instalação e Configuração**

### **1. Instalar o ngrok:**
```bash
# Via npm (recomendado)
npm install -g ngrok

# Ou baixar do site oficial
# https://ngrok.com/download
```

### **2. Criar conta no ngrok:**
1. Acesse: https://ngrok.com/
2. Clique em "Sign up for free"
3. Crie sua conta
4. Faça login no dashboard

### **3. Obter o authtoken:**
1. No dashboard do ngrok, vá em "Your Authtoken"
2. Copie o token (ex: `2abc123def456ghi789jkl`)
3. Guarde este token!

### **4. Autenticar o ngrok:**
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

---

## 🎯 **Como Usar**

### **Opção 1: Comando direto**
```bash
# Em um terminal separado:
ngrok http 8080
```

### **Opção 2: Scripts npm (recomendado)**
```bash
# Túnel básico
npm run ngrok

# Túnel com HTTPS
npm run ngrok:https

# Túnel + dev server (Linux/Mac)
npm run tunnel
```

---

## 📱 **URLs Geradas**

Após executar o ngrok, você verá algo assim:

```
Session Status                online
Account                       Seu Nome (Plan: Free)
Version                       3.x.x
Region                       United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8080
```

**URLs importantes:**
- **🌐 URL pública**: `https://abc123.ngrok.io` (compartilhe esta!)
- **🔧 Interface web**: `http://127.0.0.1:4040` (para monitoramento)

---

## 🔒 **Segurança e Configurações**

### **Configuração avançada:**
```bash
# Túnel com autenticação básica
ngrok http 8080 --basic-auth="usuario:senha"

# Túnel com domínio específico (requer plano pago)
ngrok http 8080 --hostname=meuapp.ngrok.io

# Túnel com subdomínio
ngrok http 8080 --subdomain=meuapp
```

### **Arquivo de configuração:**
Copie o arquivo `ngrok.yml` para:
- **Windows**: `%USERPROFILE%\.ngrok2\ngrok.yml`
- **Linux/Mac**: `~/.ngrok2/ngrok.yml`

---

## 🚨 **Limitações da Versão Gratuita**

- **Sessões**: Máximo 2 horas por sessão
- **Conexões**: Máximo 40 conexões por minuto
- **Domínios**: URLs aleatórias (não personalizadas)
- **Túneis**: Máximo 1 túnel por vez

---

## 💡 **Dicas de Uso**

### **Para desenvolvimento:**
```bash
# Terminal 1: Rodar o app
npm run dev

# Terminal 2: Expor com ngrok
npm run ngrok
```

### **Para demonstrações:**
```bash
# Túnel com HTTPS (mais profissional)
npm run ngrok:https
```

### **Para testes móveis:**
```bash
# Compartilhe a URL do ngrok
# Teste em diferentes dispositivos
```

---

## 🔍 **Monitoramento e Debug**

### **Interface web do ngrok:**
- Acesse: `http://localhost:4040`
- Veja todas as requisições em tempo real
- Debug de problemas de rede
- Estatísticas de uso

### **Logs no terminal:**
```bash
# Logs detalhados
ngrok http 8080 --log=stdout

# Logs em arquivo
ngrok http 8080 --log=ngrok.log
```

---

## 🚀 **Exemplo de Uso Completo**

```bash
# 1. Iniciar o aplicativo
npm run dev

# 2. Em outro terminal, expor com ngrok
npm run ngrok

# 3. Compartilhar a URL gerada
# Ex: https://abc123.ngrok.io

# 4. Acessar de qualquer dispositivo
# - Computador: https://abc123.ngrok.io
# - Celular: https://abc123.ngrok.io
# - Tablet: https://abc123.ngrok.io
```

---

## 🆘 **Solução de Problemas**

### **Erro: "port already in use"**
```bash
# Verificar se a porta 8080 está livre
netstat -an | grep 8080

# Ou usar outra porta
ngrok http 3000
```

### **Erro: "authtoken not found"**
```bash
# Reautenticar
ngrok config add-authtoken SEU_TOKEN
```

### **URL não funciona externamente**
- Verificar se o ngrok está rodando
- Verificar se o app está na porta correta
- Verificar firewall/antivírus

---

## 📞 **Suporte**

- **Documentação oficial**: https://ngrok.com/docs
- **Dashboard**: https://dashboard.ngrok.com/
- **Comunidade**: https://ngrok.com/community

---

*Configurado para o Sistema de Gestão - Janeiro 2025* 🎯
