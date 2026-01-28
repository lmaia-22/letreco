# 🔤 Letreco

Letreco é um jogo de palavras diário em português, inspirado no popular Wordle. Descubra a palavra de 5 letras em 6 tentativas!

## ✨ Características

- 🇵🇹 **Totalmente em português** - palavras em português PT-PT
- 🎯 **Palavra diária** - uma nova palavra todos os dias
- 📱 **Responsive** - funciona perfeitamente em móvel e desktop
- 🌙 **Modo escuro** - alternância entre tema claro e escuro
- 📊 **Estatísticas** - acompanha o teu progresso
- 🎨 **Animações fluidas** - flip tiles e feedback visual
- 📤 **Partilhar resultados** - partilha os teus resultados com emojis
- ⌨️ **Teclado virtual** - clica ou usa o teclado físico
- 💾 **Guarda progresso** - retoma onde ficaste

## 🎮 Como Jogar

1. **Objetivo**: Adivinhar uma palavra portuguesa de 5 letras em 6 tentativas
2. **Feedback colorido**:
   - 🟩 **Verde**: Letra correta na posição certa
   - 🟨 **Amarelo**: Letra existe na palavra mas na posição errada
   - ⬜ **Cinzento**: Letra não existe na palavra
3. **Nova palavra**: Uma palavra nova todos os dias à meia-noite

## 🚀 Demo

Joga online: [letreco.vercel.app](https://lmaia-22.github.io/letreco)

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 14+ (para deploy)
- Python 3+ (para servidor local)
- Git

### Desenvolvimento Local

```bash
# Clonar o repositório
git clone https://github.com/lmaia-22/letreco.git
cd letreco

# Servidor local com Python
npm run dev
# ou
python3 -m http.server 3000

# Abrir http://localhost:3000
```

### Deploy

#### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar domínio personalizado (opcional)
vercel --prod
```

#### Railway
```bash
# Conectar ao Railway
railway login
railway link

# Deploy
railway up
```

#### GitHub Pages
1. Fazer push para GitHub
2. Ir a Settings > Pages
3. Selecionar branch `main`
4. Site fica disponível em `username.github.io/letreco`

## 📁 Estrutura do Projeto

```
letreco/
├── index.html          # Página principal
├── styles.css          # Estilos e animações
├── script.js           # Lógica do jogo
├── words.js            # Lista de palavras portuguesas
├── package.json        # Configuração NPM
├── README.md           # Este ficheiro
└── .gitignore          # Ficheiros a ignorar
```

## 🎨 Características Técnicas

### Frontend
- **Vanilla JS** - sem frameworks, máxima performance
- **CSS Grid & Flexbox** - layout responsive moderno
- **CSS Animations** - flip tiles, shake, bounce
- **LocalStorage** - persistência de dados local
- **Service Worker** - cache offline (futuro)

### Palavras
- **~2.000 palavras** solucionáveis (comuns e conhecidas)
- **~8.000 palavras** válidas para tentativas
- **Normalização** - caracteres acentuados tratados como base (ã→a, ç→c)
- **Filtradas** - sem palavras obscenas ou demasiado obscuras

### Performance
- **< 1MB total** - aplicação muito leve
- **Offline-ready** - funciona sem internet após carregamento inicial
- **SEO otimizado** - meta tags e Open Graph
- **Mobile-first** - design pensado para móvel

## 🔧 Configuração

### Personalização de Palavras
Edita `words.js` para:
- Adicionar/remover palavras da lista de soluções
- Modificar lista de palavras válidas
- Ajustar algoritmo de palavra diária

### Temas
Edita variáveis CSS em `styles.css` para personalizar cores:
```css
:root {
    --color-correct: #6aaa64;    /* Verde */
    --color-present: #c9b458;    /* Amarelo */
    --color-absent: #787c7e;     /* Cinzento */
}
```

### Anúncios
O projeto inclui espaços para anúncios Google AdSense:
- Banner superior
- Banner inferior  
- Intersticial após fim do jogo

Substitui `.ad-placeholder` em `index.html` pelos códigos dos anúncios.

## 📈 Funcionalidades Futuras

- [ ] **Modo Hardcore** - sem feedback de cores
- [ ] **Estatísticas avançadas** - gráficos detalhados
- [ ] **Conquistas** - badges por marcos alcançados
- [ ] **Modo Prática** - jogar palavras aleatórias
- [ ] **Dicas** - sistema de ajudas opcional
- [ ] **Multiplayer** - competir com amigos
- [ ] **PWA** - instalação como app nativo
- [ ] **Acessibilidade** - leitor de ecrã, alto contraste

## 🐛 Problemas Conhecidos

- Algumas palavras podem não estar na lista (sugere novas palavras)
- Suporte limitado para browsers muito antigos
- Countdown pode desalinhar em fusos horários específicos

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Fork do projeto
2. Cria feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abre Pull Request

### Áreas que precisam de ajuda:
- **Palavras**: Revisão e expansão da lista de palavras
- **Design**: Melhorias na UI/UX
- **Acessibilidade**: Suporte para leitores de ecrã
- **Performance**: Otimizações de velocidade
- **SEO**: Melhorias para motores de busca

## 📄 Licença

Este projeto está sob licença MIT. Vê `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Inspirado no [Wordle](https://www.nytimes.com/games/wordle/index.html) por Josh Wardle
- Comunidade portuguesa de jogadores de palavra
- Contribuidores do projeto

## 📞 Contacto

- GitHub: [@lmaia-22](https://github.com/lmaia-22)
- Issues: [GitHub Issues](https://github.com/lmaia-22/letreco/issues)

---

**Diverte-te a jogar Letreco! 🎉**