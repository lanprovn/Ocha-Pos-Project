# Backend Environment Setup

Cấu hình file `.env` cho backend.

## Tạo file

```bash
cd backend
cp .env.example .env
```

Hoặc chạy script tự động:
- Windows: `.\create-env.ps1`
- Linux/Mac: `./create-env.sh`

## Biến bắt buộc

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ocha_pos?schema=public"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"

# Server
PORT=8080
FRONTEND_URL=http://localhost:3000
```

## Giải thích

**DATABASE_URL:**
- Format: `postgresql://username:password@host:port/database?schema=public`
- Tạo database trước: `createdb ocha_pos`
- Hoặc dùng PostgreSQL GUI (pgAdmin, DBeaver)

**JWT_SECRET:**
- Tối thiểu 32 ký tự
- Generate random: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Production: dùng secret mạnh, không commit lên Git

**PORT:**
- Default: 8080
- Đổi nếu port bị chiếm

**FRONTEND_URL:**
- URL của frontend app
- Dùng cho CORS config

## Biến tùy chọn

### VNPay (Thanh toán thẻ)
```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
```

### QR Code Ngân Hàng
```env
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=your_account_number
BANK_ACCOUNT_NAME=OCHA POS
```

Xem chi tiết setup payment: [PAYMENT_GATEWAY_INTEGRATION.md](./PAYMENT_GATEWAY_INTEGRATION.md)

## Production

- Dùng environment variables trên server (không hardcode)
- JWT_SECRET phải khác với development
- DATABASE_URL dùng connection pooling
- Set NODE_ENV=production

## Lưu ý

- File `.env` đã được gitignore
- Không commit `.env` lên Git
- Copy `.env.example` làm template
- Restart server sau khi sửa `.env`
