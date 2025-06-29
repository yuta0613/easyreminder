# Easy Reminder - 日用品リマインダーアプリ

日用品の買い忘れを防ぐスマートなリマインダーアプリです。レシートをスマホで撮影するだけで、日用品を自動認識し、消費ペースに基づいてリマインドします。

## 📱 主な機能

### Phase 1（MVP実装済み）
- **レシート撮影**: スマホカメラでレシートを撮影
- **OCR処理**: 日用品を自動抽出してリスト表示
- **リマインダー**: ストック切れ予測日にアラート
- **商品管理**: 登録済み商品の確認・編集
- **レスポンシブデザイン**: スマホ・タブレット対応

### Phase 2（今後実装予定）
- バーコード読み取り機能
- GoogleカレンダーやLINE通知連携
- 購入履歴の分析機能

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **データベース**: SQLite (開発) / PostgreSQL (本番)
- **ORM**: Prisma
- **OCR**: Google Cloud Vision API (設定により有効化)
- **UI コンポーネント**: Lucide React

## 🚀 セットアップ手順

1. **依存関係のインストール**
```bash
npm install
```

2. **データベースの設定**
```bash
# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate
```

3. **環境変数の設定**
`.env`ファイルを作成し、以下の変数を設定：
```env
# Database
DATABASE_URL="file:./dev.db"

# OCR API (オプション)
GOOGLE_CLOUD_VISION_API_KEY=""

# Authentication (将来実装)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **開発サーバーの起動**
```bash
npm run dev
```

5. **ブラウザでアクセス**
http://localhost:3000

## 📖 使い方

1. **アプリを開く**: ブラウザまたはスマートフォンでアクセス
2. **レシートを撮影**: 「レシートを撮影」ボタンをタップしてカメラを起動
3. **商品を確認**: OCR結果を確認し、必要に応じて手動で調整
4. **リマインダーを受け取る**: 設定した期間に基づいてアラートを受信

## 🗂 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   └── globals.css        # グローバルスタイル
├── components/
│   └── camera/            # カメラ関連コンポーネント
│       └── CameraCapture.tsx
├── lib/
│   ├── stores/            # Zustand状態管理
│   │   └── app-store.ts
│   ├── db.ts              # Prismaクライアント
│   ├── ocr.ts             # OCR処理
│   └── utils.ts           # ユーティリティ関数
├── types/
│   └── index.ts           # TypeScript型定義
└── hooks/
    └── useCamera.ts       # カメラフック
```

## 🎯 対象商品カテゴリ

- **洗剤類**: 衣料用、食器用、住居用洗剤
- **調味料**: 塩、醤油、味噌、油類
- **ケア用品**: 綿棒、コットン、化粧品
- **トイレタリー**: 歯磨き粉、シャンプー、石鹸
- **その他日用品**: ティッシュ、電池など

## 📱 動作環境

- **推奨ブラウザ**: Chrome, Safari, Edge (最新版)
- **スマートフォン**: iOS Safari, Android Chrome
- **カメラ**: デバイスのカメラアクセスが必要

## 🔧 開発者向け

### データベースコマンド
```bash
# データベーススタジオを開く
npm run db:studio

# マイグレーションをリセット
npx prisma migrate reset

# データベースをシード
npx prisma db seed
```

### ビルドコマンド
```bash
# プロダクション用ビルド
npm run build

# ビルド結果を起動
npm run start
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題や質問がある場合は、GitHubのIssuesページで報告してください。

---

**Easy Reminder** - 買い忘れのない快適な生活を 🛒✨
