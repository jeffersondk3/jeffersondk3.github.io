# Deutsch im Alltag

Aplicativo estático publicado em /alemao/ no GitHub Pages.

- Diálogos: 100 conversas originais com áudio DE/PT e quatro campos A–D para reescrever cada fala. A correção compara as palavras com a frase original, destaca diferenças após enviar e salva o treino por diálogo e perfil. Não é uma avaliação aberta de gramática ou de traduções alternativas.
- Aba Apoio: 10 links indicados pelo usuário, agrupados em sites/cursos, leitura/arquivos, áudios/rádio e vídeos. Abre a plataforma de origem sem alterar permissões de acesso.
- Meus materiais: 12 PDFs originais cifrados em partes AES-256-GCM. PDF.js reconstitui o original apenas na memória após desbloqueio.
- Treino de escrita abaixo de cada página dos 12 materiais, com texto independente por página, módulo e perfil; salvamento na mesma fila de sincronização do progresso.
- Uma conta Supabase, dois perfis selecionáveis: Jefferson e Sofia. Os dois perfis ficam acessíveis à mesma conta.
- Progresso online em study_progress; RLS limita os registros ao usuário autenticado. O prefixo de scope separa os perfis. Alterações sem conexão ficam na fila local e são reenviadas quando houver conexão.
- Favoritos, diálogos praticados, páginas e materiais concluídos são sincronizados. O perfil selecionado é uma preferência deste aparelho.
- O progresso antigo dos diálogos pode ser importado em Minha conta, no perfil escolhido.

## Entrada lembrada

A opção “Manter minha entrada neste aparelho” usa a sessão padrão do Supabase no armazenamento persistente; desmarcada, usa apenas o armazenamento da aba. A senha nunca é armazenada pelo app. A sessão existente é preservada ao atualizar. O desbloqueio dos materiais continua separado e pode pedir a senha após reabrir.

## Testes

`node tests/exercises.test.mjs`
`node tests/session-storage.test.mjs`
`node tests/writing.test.mjs`

## Primeiro acesso

Confirmar o e-mail principal no Supabase Auth, entrar no app e selecionar o perfil. Ao reabrir o app pode ser necessário digitar novamente a senha dos materiais. A chave de conteúdo não é persistida no navegador.

## Dependências

Supabase JS 2.118.0, compilado com esbuild 0.25.12 (versões e lockfile em vendor). PDF.js 4.10.38 (licença em materiais/vendor). O worker está compactado em gzip e é descompactado no navegador.

## Segurança e manutenção

A configuração do frontend contém somente a chave publicável do projeto. Não adicionar senhas, service_role, tokens de sessão, chave de conteúdo ou PDFs sem criptografia ao repositório. Trocar a senha de login não altera a senha que protege os materiais; o cofre exige reempacotamento para essa mudança.

O aviso de configuração do Supabase sobre proteção contra senhas vazadas pode ser consultado em https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
