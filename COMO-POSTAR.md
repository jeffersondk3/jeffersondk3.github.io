# Como usar o blog

## Editar seus dados (nome, bio, redes)

Abra o arquivo `_config.yml` no GitHub, clique no lápis ✏️ e mude a parte de cima:
`title`, `tagline`, `author` e `social`. Depois clique em **Commit changes**.
Em 1 ou 2 minutos o site atualiza.

## Escrever um post novo

1. Entre na pasta `_posts`.
2. Clique em **Add file → Create new file**.
3. Dê o nome no formato `ANO-MES-DIA-titulo-sem-espaco.md`, por exemplo:
   `2026-10-20-meu-primeiro-teste-automatizado.md`
4. Cole e preencha:

```markdown
---
layout: post
title: "Título do post"
description: "Uma frase que aparece na lista de posts."
tags: [qa, sap]
---

Seu texto aqui. Pode usar **negrito**, *itálico*, listas, links e imagens.

## Um subtítulo

Mais texto...
```

5. Clique em **Commit changes**. Pronto, o post aparece no site em 1 ou 2 minutos.

## Colocar imagens

Crie a pasta `assets/img` (Add file → Upload files), suba a imagem e use no post:

```markdown
![descrição da imagem](/assets/img/nome-da-imagem.jpg)
```

## Editar a página "Sobre"

É o arquivo `sobre.md`. Mesmo esquema: lápis ✏️, edita e commita.

## Apagar o post de exemplo

Entre em `_posts/2026-10-17-ola-mundo.md`, clique nos `...` e em **Delete file**.
