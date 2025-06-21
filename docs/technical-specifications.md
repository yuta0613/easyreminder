# Easy Reminder - 技術仕様書

## 1. システム構成

### 1.1 アーキテクチャ
```
Frontend (React/Next.js)
     ↓
Backend API (Node.js/Express)
     ↓
Database (SQLite → PostgreSQL)
     ↓
External APIs (OCR, Calendar)
```

### 1.2 推奨技術スタック

#### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Camera**: react-webcam または native camera API

#### バックエンド
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **Authentication**: NextAuth.js

#### データベース
- **Development**: SQLite + Prisma ORM
- **Production**: PostgreSQL + Prisma ORM

#### OCR & 外部サービス
- **OCR**: Google Cloud Vision API
- **Alternative**: Tesseract.js (無料版)
- **Calendar**: Google Calendar API
- **Notifications**: Web Push API

#### インフラ
- **Hosting**: Vercel
- **Database**: Supabase または Railway
- **File Storage**: Cloudinary または Supabase Storage

## 2. データベース設計

### 2.1 ERD概要
```
Users ─── Households ─── Products ─── PurchaseHistories
  │                          │
  └─── Reminders ─────────────┘
```

### 2.2 テーブル定義

#### users テーブル
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  household_id UUID REFERENCES households(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### households テーブル
```sql
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  member_count INTEGER DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### products テーブル
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  default_consumption_days INTEGER NOT NULL,
  current_consumption_days INTEGER NOT NULL,
  barcode VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### purchase_histories テーブル
```sql
CREATE TABLE purchase_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  price INTEGER,
  quantity INTEGER DEFAULT 1,
  purchased_at DATE NOT NULL,
  receipt_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### reminders テーブル
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  reminder_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, dismissed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. API設計

### 3.1 エンドポイント一覧

#### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - ユーザー情報取得

#### レシート処理
- `POST /api/receipts/upload` - レシート画像アップロード
- `POST /api/receipts/ocr` - OCR処理実行
- `GET /api/receipts/:id` - レシート処理結果取得

#### 商品管理
- `GET /api/products` - 商品一覧取得
- `POST /api/products` - 商品登録
- `PUT /api/products/:id` - 商品更新
- `DELETE /api/products/:id` - 商品削除

#### 購入履歴
- `GET /api/purchases` - 購入履歴一覧
- `POST /api/purchases` - 購入記録作成
- `PUT /api/purchases/:id` - 購入記録更新

#### リマインダー
- `GET /api/reminders` - リマインダー一覧
- `POST /api/reminders` - リマインダー作成
- `PUT /api/reminders/:id/status` - リマインダー状態更新

### 3.2 API レスポンス例

#### GET /api/products
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "衣料用洗剤",
      "category": "洗剤",
      "currentConsumptionDays": 60,
      "lastPurchased": "2024-01-15",
      "nextReminderDate": "2024-03-10",
      "status": "ok" // ok, warning, urgent
    }
  ]
}
```

#### POST /api/receipts/ocr
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "extractedProducts": [
      {
        "name": "アタック洗剤",
        "price": 298,
        "category": "洗剤",
        "confidence": 0.95
      }
    ],
    "totalItems": 3,
    "processingTime": 2.1
  }
}
```

## 4. フロントエンド設計

### 4.1 ディレクトリ構成
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── products/
│   ├── camera/
│   └── settings/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/
│   ├── layouts/
│   └── features/
├── lib/
│   ├── api.ts             # API client
│   ├── utils.ts
│   └── stores/            # Zustand stores
├── types/
│   └── index.ts
└── hooks/
    └── useCamera.ts
```

### 4.2 主要コンポーネント

#### CameraCapture コンポーネント
```typescript
interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onError: (error: Error) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onError
}) => {
  // カメラ撮影 + OCR処理
};
```

#### ProductList コンポーネント
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  status: 'ok' | 'warning' | 'urgent';
  nextReminderDate: string;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
}
```

#### ReminderCard コンポーネント
```typescript
interface Reminder {
  id: string;
  productName: string;
  daysUntilEmpty: number;
  status: 'pending' | 'completed' | 'dismissed';
}
```

### 4.3 状態管理（Zustand）

```typescript
interface AppState {
  user: User | null;
  products: Product[];
  reminders: Reminder[];
  
  // Actions
  setUser: (user: User) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  fetchProducts: () => Promise<void>;
  
  // OCR関連
  ocrResult: OCRResult | null;
  setOCRResult: (result: OCRResult) => void;
}
```

## 5. OCR処理フロー

### 5.1 画像処理パイプライン
```
1. 画像撮影 → 2. 前処理 → 3. OCR実行 → 4. 後処理 → 5. 商品抽出
```

### 5.2 OCR実装例
```typescript
// lib/ocr.ts
export class OCRService {
  async processReceipt(imageData: string): Promise<OCRResult> {
    // 1. 画像前処理
    const processedImage = await this.preprocessImage(imageData);
    
    // 2. OCR実行
    const ocrText = await this.extractText(processedImage);
    
    // 3. 商品抽出
    const products = await this.extractProducts(ocrText);
    
    return {
      products,
      confidence: this.calculateConfidence(products)
    };
  }
  
  private async extractProducts(text: string): Promise<Product[]> {
    // 日用品キーワードマッチング
    const keywords = ['洗剤', '醤油', '砂糖', '綿棒', '歯磨き'];
    // 商品名抽出ロジック
  }
}
```

## 6. 通知システム

### 6.1 リマインダー計算ロジック
```typescript
function calculateNextReminder(
  lastPurchaseDate: Date,
  consumptionDays: number,
  warningDays: number = 3
): Date {
  const nextEmptyDate = new Date(lastPurchaseDate);
  nextEmptyDate.setDate(nextEmptyDate.getDate() + consumptionDays);
  
  const reminderDate = new Date(nextEmptyDate);
  reminderDate.setDate(reminderDate.getDate() - warningDays);
  
  return reminderDate;
}
```

### 6.2 通知配信
```typescript
// lib/notifications.ts
export class NotificationService {
  async sendReminder(reminder: Reminder): Promise<void> {
    // Web Push通知
    await this.sendPushNotification(reminder);
    
    // カレンダー連携（オプション）
    if (reminder.calendarEnabled) {
      await this.addToCalendar(reminder);
    }
  }
}
```

## 7. 開発環境セットアップ

### 7.1 必要なツール
```bash
# Node.js 18+
# npm または yarn
# VS Code + 拡張機能
```

### 7.2 初期セットアップコマンド
```bash
# プロジェクト初期化
npx create-next-app@latest easyreminder --typescript --tailwind --app

# 依存関係追加
npm install prisma @prisma/client zustand react-webcam
npm install -D @types/node

# 開発サーバー起動
npm run dev
```

### 7.3 環境変数（.env.local）
```env
# Database
DATABASE_URL="file:./dev.db"

# OCR API
GOOGLE_CLOUD_VISION_API_KEY=""

# Authentication
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Calendar API
GOOGLE_CALENDAR_API_KEY=""
```

## 8. デプロイメント

### 8.1 Vercel デプロイ
```bash
# Vercelにデプロイ
vercel --prod

# 環境変数設定
vercel env add DATABASE_URL
vercel env add GOOGLE_CLOUD_VISION_API_KEY
```

### 8.2 データベース（Supabase）
```sql
-- 本番環境でのテーブル作成
-- 上記のテーブル定義をSupabaseで実行
```

---

**Claude Codeへの指示**:
この技術仕様書に基づいて、Phase 1（MVP）から順次開発を進めてください。特に以下の点を重視してください：

1. **TypeScript + Next.js 14**での実装
2. **Tailwind CSS**での美しいUI
3. **Prisma ORM**でのデータベース操作
4. **段階的な開発**（まずは基本機能から）
5. **エラーハンドリング**の徹底
6. **レスポンシブデザイン**対応

最初に基本的なプロジェクト構成を作成し、カメラ撮影機能→OCR処理→商品管理の順で実装を進めてください。 
