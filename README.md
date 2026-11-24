# Trilha do RH — Segurança e Saúde no Trabalho

Jogo de tabuleiro educativo baseado na **NR-1**, para jogar no celular, tablet ou computador.

- **Jogar neste aparelho:** de 1 a 3 jogadores passando o aparelho. Funciona **sem internet** e sem login. É o plano B se o Wi-Fi da feira falhar.
- **Jogar online:** de 1 a 3 jogadores, cada um no seu celular, com sala, código, link e QR Code. Usa login com Google ou o modo Visitante (apenas nome).
- **150 cartas** de múltipla escolha: as 30 oficiais e mais 120 extras, com 30 por categoria. Ficam em [`src/data/cards.ts`](src/data/cards.ts).

Tecnologias: React, Vite, TypeScript, Tailwind CSS, Lucide Icons e Firebase (Authentication e Realtime Database). A hospedagem é gratuita, no GitHub Pages.

---

## Regras implementadas

1. Todos começam na casa 1 (INÍCIO).
2. No começo da vez, uma carta de **qualquer categoria** é sorteada, sem repetir. Quando o monte acaba, as cartas são embaralhadas de novo.
3. O jogador tem **1 minuto** para responder, com tempo para ler com calma.
4. **Se acertar:** aparece a explicação e o botão **Jogar Dado**. O peão anda casa a casa.
5. **Se errar ou o tempo acabar:** o peão **fica onde está**. A resposta certa e a explicação aparecem para todos por até 10 segundos (o jogador da vez pode tocar em **Continuar** antes), e a vez passa.
6. **Casas especiais:**

   | Casa | Tipo | Efeito |
   |---|---|---|
   | 3 e 16 | 🔵 PERGUNTA | Responda a uma carta Azul. Se acertar, avança +1 casa. |
   | 5 e 14 | 🟡 ALERTA | Volte 1 casa e responda a uma carta de prevenção (Amarela ou Verde). Se acertar, avança +1 casa. |
   | 7 e 18 | 🟢 PREVENÇÃO | Avance 2 casas. A casa 7 leva à 9 (Desafio) e a 18 leva à 20 (vitória). |
   | 9 e 19 | 🟣 DESAFIO | Responda a uma situação-problema (Roxa). Se acertar, avança +1 casa. |
   | 11 | 🟠 SAÚDE | Responda a uma carta de Saúde Mental (Laranja). Se acertar, avança +1 casa. |
   | 20 | 🏁 CHEGADA | Vitória ao chegar ou passar da casa 20. |

   Errou a carta de uma casa especial? O peão fica onde está. A casa alcançada pelo bônus de +1 não aplica um novo efeito, mas, se ela for a casa 20, o jogador vence.
7. **Tempo da partida (opcional: Livre, 5, 10 ou 15 minutos):** quando o tempo acaba, vence quem estiver na casa mais avançada. O desempate é por pontos.
8. **Pontos e Ranking:** cada carta acertada vale pontos conforme a dificuldade: **Fácil = 1**, **Médio = 2**, **Difícil = 3**. O nível aparece no topo de cada carta.
   - Ao fim da partida, aparece o **pódio dos 3 primeiros** (em grupo) ou a sua pontuação (sozinho).
   - A pontuação é salva no **Ranking de jogadores**, separado em *Sozinho* e *Em grupo*, com filtro *Hoje* e *Todos*.
   - Com o Firebase configurado, o ranking é **compartilhado** entre todos os aparelhos. Sem Firebase ou sem internet, ele fica salvo no próprio aparelho.
   - A dificuldade de cada carta fica nas listas `FACIL` e `DIFICIL`, no início de [`src/data/cards.ts`](src/data/cards.ts). As cartas que não estão nessas listas são *Médio*.

Os tempos ficam em `TIMING`, em [`src/game/engine.ts`](src/game/engine.ts), e o mapa das casas fica em [`src/game/board.ts`](src/game/board.ts).

---

## 1. Rodar no computador

Instale o [Node.js](https://nodejs.org) (versão 20 ou mais nova). Depois, abra um terminal nesta pasta e rode:

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (algo como `http://localhost:5173`). O modo **"Jogar neste aparelho"** já funciona. O modo online precisa do Firebase, que é configurado no passo 2.

---

## 2. Configurar o Firebase (gratuito, plano Spark)

### 2.1 Criar o projeto
1. Acesse <https://console.firebase.google.com> com a conta Google do projeto.
2. Clique em **Adicionar projeto**, dê um nome (ex.: `trilha-do-rh`) e conclua. O Google Analytics é opcional.

### 2.2 Ativar o login
1. No menu, vá em **Criação → Authentication → Vamos começar**.
2. Na aba **Método de login**, ative:
   - **Google**: escolha o e-mail de suporte e salve.
   - **Anônimo**: é usado pelo modo "Visitante rápido" e para salvar no ranking as partidas jogadas no modo "Jogar neste aparelho".

### 2.3 Criar o banco de dados (Realtime Database)
1. No menu, vá em **Criação → Realtime Database → Criar banco de dados**.
2. Escolha a localização (ex.: `us-central1`) e comece no **modo bloqueado**.
3. Abra a aba **Regras**, apague tudo, cole o conteúdo do arquivo [`database.rules.json`](database.rules.json) e clique em **Publicar**.

Essas regras garantem que:
- apenas usuários logados (Google ou Visitante) acessam as salas;
- cada sala tem **no máximo 3 vagas** (`players/0`, `players/1` e `players/2`);
- só se entra na sala enquanto ela está no lobby;
- o **ranking** pode ser lido por todos, e cada pessoa só adiciona os próprios resultados, sem editar nem apagar os dos outros;
- cada pessoa só altera os próprios dados, e só o criador inicia a partida;
- salas com mais de 6 horas podem ser reaproveitadas.

### 2.4 Pegar as chaves do app
1. Vá na engrenagem ⚙️ → **Configurações do projeto** → **Seus apps** → ícone **Web `</>`**.
2. Registre o app (ex.: `trilha-web`). Não é preciso ativar o Hosting.
3. Copie os valores do `firebaseConfig`.
4. Nesta pasta, copie `.env.example` para `.env` e preencha os valores:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=trilha-do-rh.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://trilha-do-rh-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=trilha-do-rh
VITE_FIREBASE_STORAGE_BUCKET=trilha-do-rh.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> O `databaseURL` aparece no topo da página do Realtime Database.
> Essas chaves **não são senhas**: elas sempre ficam visíveis no site. Quem protege os dados são as regras do passo 2.3.

Rode `npm run dev` de novo. O botão **Entrar com Google** já deve funcionar no `localhost`.

---

## 3. Publicar no GitHub Pages

### 3.1 Criar o repositório
1. Crie uma conta em <https://github.com> e um repositório **público**, por exemplo `trilha-do-rh`.
2. Envie esta pasta para o repositório:

```bash
git init
git add .
git commit -m "Trilha do RH"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/trilha-do-rh.git
git push -u origin main
```

O arquivo `.env` **não** é enviado, porque está no `.gitignore`.

### 3.2 Opção A (recomendada): GitHub Actions
Com ela, o site é publicado sozinho a cada `git push`.

1. No repositório, vá em **Settings → Secrets and variables → Actions → New repository secret**.
2. Crie os 7 secrets, com os mesmos nomes e valores do `.env`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`.
3. Vá em **Settings → Pages → Build and deployment → Source** e escolha **GitHub Actions**.
4. Na aba **Actions**, rode o workflow "Publicar no GitHub Pages" (ou faça um novo push).
5. O site fica em `https://SEU-USUARIO.github.io/trilha-do-rh/`.

### 3.2 Opção B: `npm run deploy`
Essa opção publica a partir do seu computador, usando o `.env` local.

```bash
npm run deploy
```

Depois, em **Settings → Pages**, escolha **Deploy from a branch**, depois a branch `gh-pages` e a pasta `/ (root)`.

### 3.3 Autorizar o domínio no Firebase (obrigatório para o login)
1. No Firebase, vá em **Authentication → Configurações → Domínios autorizados → Adicionar domínio**.
2. Adicione `SEU-USUARIO.github.io`, sem `https://` e sem o nome do repositório.

Sem esse passo, o login com Google mostra o erro `auth/unauthorized-domain`.

---

## 4. Dicas para o dia da feira

- **Teste antes** com 3 celulares na rede do evento. Se a internet falhar, use **Jogar neste aparelho**.
- **Telão:** abra o link da sala em um notebook ligado a uma TV. Se a sala estiver cheia ou a partida já tiver começado, ele entra **assistindo**, sem ocupar vaga.
- O QR Code do lobby leva direto para a sala. Quem não quiser logar com Google pode usar **Visitante rápido**.
- Se alguém fechar o app durante a partida, basta abrir o mesmo link: a pessoa volta para a vaga dela. Se o criador da sala cair, os outros aparelhos continuam o jogo sozinhos.

## Estrutura do projeto

```
src/
  data/cards.ts         150 cartas (a 1ª alternativa de cada carta é a correta; a ordem é embaralhada no jogo)
  game/board.ts         mapa das 20 casas e seus efeitos
  game/engine.ts        regras do jogo (funções puras, usadas no modo local e no online)
  game/types.ts         tipos do estado da partida
  lib/firebase.ts       inicialização do Firebase
  lib/auth.tsx          login com Google e Visitante
  lib/rooms.ts          salas online (criar, entrar, presença, transações)
  lib/ranking.ts        ranking de jogadores (Firebase ou no próprio aparelho)
  components/           tabuleiro, dado, carta, tela final…
  screens/              Início, Jogo local, Sala online
database.rules.json     regras de segurança do Realtime Database
.github/workflows/      publicação automática no GitHub Pages
```

> Material educativo escolar baseado na NR-1. Para conferir os requisitos legais, consulte sempre a versão vigente publicada pelo Ministério do Trabalho e Emprego.
