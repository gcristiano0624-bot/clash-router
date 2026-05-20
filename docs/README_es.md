<h1 align="center">
  <img src="../src-tauri/icons/icon.png" alt="Clash Router" width="128" />
  <br>
  Clash Router
  <br>
</h1>

<h3 align="center">
Cliente de escritorio de enrutamiento y proxy basado en <a href="https://github.com/clash-verge-rev/clash-verge-rev">clash-verge-rev</a>, construido con <a href="https://github.com/tauri-apps/tauri">Tauri 2</a>, Rust y React.
</h3>

<p align="center">
  Idiomas:
  <a href="../README.md">简体中文</a> ·
  <a href="./README_en.md">English</a> ·
  <a href="./README_es.md">Español</a> ·
  <a href="./README_ru.md">Русский</a> ·
  <a href="./README_ja.md">日本語</a> ·
  <a href="./README_ko.md">한국어</a> ·
  <a href="./README_fa.md">فارسی</a>
</p>

## Resumen

`Clash Router` es un cliente gráfico para `mihomo` con identidad propia, interfaz más plana y mejoras de estabilidad sobre el proyecto base.

## Instalación

- Repositorio: [gcristiano0624-bot/clash-router](https://github.com/gcristiano0624-bot/clash-router)
- Lanzamientos: [Releases](https://github.com/gcristiano0624-bot/clash-router/releases)
- Documentación del proyecto: [Project.md](https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md)

Paquetes conservados en el repositorio:

- `release-assets/clash-router-macos/Clash Router.app`
- `release-assets/clash-router-macos/Clash Router_2.5.1_aarch64.dmg`
- `release-assets/clash-router-macos/Clash Router.app.tar.gz`

## Canales

| Canal | Descripción | Enlace |
| :--- | :--- | :--- |
| Stable | Canal estable para uso diario | [Releases](https://github.com/gcristiano0624-bot/clash-router/releases) |
| Router Preview | Primera versión de la fork con marca propia y correcciones DNS | [v2.5.1-router.1](https://github.com/gcristiano0624-bot/clash-router/releases/tag/v2.5.1-router.1) |

## Funciones

- Cliente de escritorio basado en Rust, Tauri 2 y React
- Núcleo `mihomo` integrado con modos sidecar y service
- Corrección del flujo de DNS y recuperación automática de permisos ejecutables en macOS
- Interfaz plana para navegación, inicio, proxies y ajustes

## Desarrollo

```bash
pnpm i
pnpm prebuild
pnpm dev
```

## Licencia

Licencia `GPL-3.0`. Consulta [LICENSE](../LICENSE).

