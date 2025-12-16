# Portal.C Documentation

Portal.Cプロジェクトのドキュメントへようこそ！

## プロジェクト概要

Portal.Cは、Tech.C Ventureのメンバー管理とイベント管理を行うWebアプリケーションです。技育プロジェクトVol.16で開発される、Tech.C Venture初の基盤システムです。

### 主要機能

- **認証・ログイン機能**: ZITADEL認証基盤を使用した認証システム
- **メンバープロフィール機能**: 学年自動計算、24時間限定ステータス、スキルタグ管理
- **時間割閲覧機能**: 学年・専攻でフィルタリング可能なメンバー時間割
- **イベント管理機能**: イベント一覧表示と参加表明
- **管理者画面**: イベント登録、参加者管理

### 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript 5.6+
- **バックエンド**: TypeScript
- **データベース**: Supabase (PostgreSQL)
- **認証基盤**: ZITADEL (NextAuth.js経由)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: @openameba/spindle-ui
- **ホスティング**: Vercel

## ドキュメント構成

### Getting Started
開発を始めるための基本的な情報

- [開発者向けオンボーディング](getting-started/onboarding.md) - 環境構築から開発フローまで

### Architecture
プロジェクトのアーキテクチャ設計

- [アーキテクチャ設計](architecture/architecture.md) - Clean Architectureの詳細設計
- [マイグレーション計画](architecture/migration-plan.md) - アーキテクチャ移行計画

### Development Guide
開発時のガイドライン

- [SDD使用ガイド](development/cc-sdd-usage.md) - Spec-Driven Developmentの使い方
- [AGENTS設定](development/agents.md) - AI開発支援の設定

### Specification (SDD)
プロジェクトの仕様書とガイドライン

- **Steering**: プロジェクト全体のガイドライン
  - Product, Tech, Structure
- **Specs**: 機能仕様書
  - Clean Architecture Refactor

## クイックスタート

1. [開発者向けオンボーディング](getting-started/onboarding.md)を読む
2. [アーキテクチャ設計](architecture/architecture.md)でプロジェクト構造を理解
3. [SDD使用ガイド](development/cc-sdd-usage.md)で開発フローを確認

## リンク

- [GitHub Repository](https://github.com/Tech-C-Venture/Portal.C)
- [プロジェクトREADME](https://github.com/Tech-C-Venture/Portal.C/blob/main/README.md)
