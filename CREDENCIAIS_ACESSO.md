# 🔐 Credenciais de Acesso ao Sistema

## 📧 **Login**
```
luis.melo@techfala365.com.br
```

## 🔑 **Senha**
```
senha123
```

---

## ⚠️ **Importante**

- **Acesso Restrito**: O sistema não permite criação de novas contas
- **Credenciais Fixas**: Estas são as únicas credenciais válidas para acesso
- **Segurança**: Em ambiente de produção, considere implementar autenticação mais robusta

---

## 🚀 **Como Acessar**

1. Acesse a página de login do sistema
2. Digite o email: `luis.melo@techfala365.com.br`
3. Digite a senha: `senha123`
4. Clique em "Fazer Login"
5. Se marcou "Lembrar de mim", suas credenciais serão salvas

---

## 🔒 **Funcionalidades de Segurança**

- ✅ **Validação de Credenciais**: Verificação local das credenciais
- ✅ **Proteção de Rotas**: Todas as páginas (exceto login) requerem autenticação
- ✅ **Sessão Persistente**: Opção de "Lembrar de mim" para manter login
- ✅ **Logout Automático**: Sessão expira após 24 horas
- ✅ **Redirecionamento Inteligente**: Retorna à página solicitada após login

---

## 🛠️ **Configuração Técnica**

### **Arquivo de Configuração**
```typescript
// src/config/auth.ts
export const AUTH_CONFIG = {
  CREDENTIALS: {
    email: 'luis.melo@techfala365.com.br',
    password: 'senha123'
  }
}
```

### **Hook de Autenticação**
```typescript
// src/hooks/useAuth.ts
const { login, logout, authData } = useAuth();
```

### **Proteção de Rotas**
```typescript
// src/components/ProtectedRoute.tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## 📱 **Interface do Usuário**

- **Login**: Página de acesso com campos de email e senha
- **Dashboard**: Página principal com menu de navegação
- **Header**: Exibe usuário logado e botão de logout
- **Navegação**: Rotas protegidas para Leads, Contas, Campanhas, etc.

---

## 🔄 **Fluxo de Autenticação**

1. **Acesso**: Usuário acessa rota protegida
2. **Verificação**: Sistema verifica se está autenticado
3. **Redirecionamento**: Se não autenticado, vai para login
4. **Validação**: Credenciais são verificadas localmente
5. **Acesso**: Se válidas, usuário é redirecionado para rota original
6. **Sessão**: Dados são salvos se "Lembrar de mim" estiver marcado

---

## 🚨 **Em Caso de Problemas**

- **Credenciais Incorretas**: Verifique se email e senha estão corretos
- **Sessão Expirada**: Faça login novamente
- **Erro de Sistema**: Verifique o console do navegador para logs
- **Acesso Negado**: Certifique-se de estar usando as credenciais corretas

---

*Última atualização: Janeiro 2025*
