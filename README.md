<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/images/logo_dark.png">
    <img height="100" src=".github/images/logo_light.png" alt="Sourcecat">
  </picture>
</p>

<h3 align="center">Code understanding for humans and agents</h3>

<p align="center">
  <a href="https://github.com/simonsmh/sourcecat">GitHub</a> ·
  <a href="https://github.com/simonsmh/sourcecat/blob/main/CONTRIBUTING.md">Contributing</a> ·
  <a href="https://github.com/simonsmh/sourcecat/issues/new/choose">Feedback</a>
</p>

Sourcecat is a self-hosted code search and understanding platform for humans and AI agents. Connect your GitHub, GitLab, Bitbucket, or Azure DevOps repos — or local Git directories — and it indexes everything into one fast, unified layer you can search, navigate, and ask questions about.

It began as a fork of [Sourcebot](https://github.com/sourcebot-dev/sourcebot) v5.1.16, the last version released under an open-source license before upstream went closed-source. The name nods to both Sourcegraph and Sourcebot — and marks a clean break: no license checks, no seat limits, no telemetry phoning home. Your code stays yours.

## Get started

The fastest way is Docker Compose:

```sh
git clone https://github.com/simonsmh/sourcecat.git
cd sourcecat
docker compose up -d
```

Then open http://localhost:3000 and follow the onboarding to connect your first repos.

You'll need Docker and Docker Compose. For manual setup or Kubernetes, see [CONTRIBUTING.md](https://github.com/simonsmh/sourcecat/blob/main/CONTRIBUTING.md).

## Code Context for Agents

Your agent can use the Sourcecat MCP server to search repos you haven't checked out locally. For example, it can find callers of an API in other services or read the implementation for dependencies that you don't have checked out locally.

![Repositories on GitHub, GitLab, Bitbucket, and Azure DevOps connected through Sourcecat to agents via API/MCP and humans via the web app](.github/images/code-context.svg)

The MCP server exposes code search, file reading, and symbol definitions and references for the repos you've indexed. Open **Settings → MCP** in Sourcecat to connect Claude Code, Codex, Cursor, or another MCP client.

Connect repos from GitHub, GitLab, Bitbucket, Azure DevOps, or local Git directories. Permission syncing controls access based on your code host's repository permissions.

## Code Search

Code Search lets you search across all your indexed repos and branches in one place. Find uses of a dependency, track down a function, or look for a pattern across services without cloning each repo.

Use regular expressions and boolean queries, then narrow the results by repo, file, language, or symbol definition. Results include syntax-highlighted code, with repo and language filters alongside them.

[![Code Search demo: a regex query streams matching code from repositories across multiple code hosts](.github/images/codeSearch.gif)]

## Ask Sourcecat

Ask Sourcecat answers questions about your codebase, including repos you haven't checked out locally. Ask how a feature works or what a migration would involve. It searches your code and follows references using the same tools as the MCP server.

Open cited code alongside the answer, explore generated diagrams, and share the conversation with your team. Ask runs on a language model provider you configure (Bring Your Own Key), so you control where your code is sent.

[![Ask Sourcecat demo: tool calls, a streaming answer, and cited source files shown side by side](.github/images/askSourcecat.gif)]


## Feedback

[Report a bug or request a feature](https://github.com/simonsmh/sourcecat/issues/new/choose).
