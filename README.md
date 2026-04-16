# obsidian-various-complements-plugin

[![release](https://img.shields.io/github/release/tadashi-aikawa/obsidian-various-complements-plugin.svg)](https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/releases/latest)
[![Tests](https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/workflows/Tests/badge.svg)](https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/actions)
![downloads](https://img.shields.io/github/downloads/tadashi-aikawa/obsidian-various-complements-plugin/total)

This plugin for [Obsidian] enables you complete words like the auto-completion of IDE.

![](https://tadashi-aikawa.github.io/docs-obsidian-various-complements-plugin/resources/various-complements.gif)

## ✨ Funções Adicionadas (Versão PT-BR)

Esta versão conta com melhorias exclusivas focadas nos usuários da língua portuguesa (e idiomas com acentos):

- **Busca Independente de Acento (Diacritics Insensitive):** Agora você não precisa digitar "café" se quiser que o autocompletar sugira; digitar "cafe" funcionará perfeitamente. Há uma nova chave visual nas opções `Treat accent/diacritics as alphabetic characters`.
- **Corretor de Erros de Digitação Rápido (BK-Tree Spell Correction):** Errou uma letra durante a correria? Se o plugin não achar nenhuma palavra normal, ele agora usa uma estrutura matemática poderosa (Burkhard-Keller Tree) para calcular rapidamente a correção ortográfica (`dsenv` > sugere `desenvolvimento ✨`), sinalizando o erro com uma estrela na interface, sem perder performance em dicionários gigantes.

## 📚 Documentation

- [Official](https://tadashi-aikawa.github.io/docs-obsidian-various-complements-plugin/)
- [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/tadashi-aikawa/obsidian-various-complements-plugin)

## 👥 For users

### Feature requests / Bugs

Please create a new [issue].

### Questions / Others

Please create a new [discussion].

### Pull requests

Before creating a pull request, please make an [issue] or a [discussion]😉

[issue]: https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/issues
[discussion]: https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/discussions

## 🖥️ For developers

- Requirements
    - Node.js v24

### Development

#### Set up

```bash
git config core.hooksPath hooks
```

#### Install dependencies

```bash
pnpm install --frozen-lockfile
```

#### Build for development

```bash
pnpm dev
```

#### Test

```bash
pnpm test
# or
pnpm test --watch
```

#### CI

```bash
pnpm run ci
```

#### Release

Run [Release Action](https://github.com/tadashi-aikawa/obsidian-various-complements-plugin/actions/workflows/release.yaml).

[Obsidian]: https://obsidian.md/

