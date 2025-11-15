# 🤖 Tự Động Deploy với GitHub Actions

## Tự Động Deploy Khi Push Code

Script này sẽ tự động deploy lên Render.com mỗi khi bạn push code lên GitHub.

### Setup (1 lần duy nhất)

1. **Tạo Render API Key**
   - Vào Render Dashboard → Account Settings → API Keys
   - Click "Create API Key"
   - Copy API Key

2. **Thêm Secret vào GitHub**
   - Vào GitHub Repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `RENDER_API_KEY`
   - Value: Paste API Key từ Render

3. **Lấy Service IDs từ Render**
   - Vào Backend Service → Settings → Service ID
   - Copy Service ID (ví dụ: `srv-xxxxx`)
   - Vào Frontend Static Site → Settings → Service ID
   - Copy Service ID (ví dụ: `srv-yyyyy`)

4. **Thêm Secrets vào GitHub**
   - `RENDER_BACKEND_SERVICE_ID`: Backend Service ID
   - `RENDER_FRONTEND_SERVICE_ID`: Frontend Service ID

### Sử Dụng

Sau khi setup xong, mỗi khi bạn:
```bash
git push
```

GitHub Actions sẽ tự động:
- ✅ Build Backend
- ✅ Deploy Backend lên Render
- ✅ Build Frontend  
- ✅ Deploy Frontend lên Render

**Không cần làm gì thêm!** 🎉

---

## Alternative: Render Webhook (Đơn Giản Hơn)

1. Vào Render Dashboard → Service → Settings → Webhooks
2. Copy Webhook URL
3. Vào GitHub Repo → Settings → Webhooks → Add webhook
4. Paste Webhook URL
5. Chọn event: "Just the push event"
6. Save

**Xong!** Mỗi khi push code, Render tự động deploy. ✅

