# 革製品ケア記録

GH Bass LarsonとHERZ ダレスリュックのケア履歴を記録するミニマルなサイト。Next.js 15 (App Router)。

## ローカル起動

```bash
npm install
npm run dev   # http://localhost:3000
```

## データの保存先

- ローカル開発時: `data/care.json`
- 本番 (Vercel): Vercel Blob (`BLOB_READ_WRITE_TOKEN` が設定されている場合に自動的に切り替わる)

Vercel Blobを使うことで、Mac・iPhoneのどちらからアクセスしても同じ記録が見える。
