# 🔧 Complete Environment Variables Setup Guide

Hướng dẫn đầy đủ để cấu hình environment variables cho cả Frontend và Backend.

## 📁 File Structure

```
Ocha-Pos Project/
├── frontend/
│   ├── .env.local          # Frontend environment (gitignored)
│   └── .env.local.example  # Frontend template
└── backend/
    ├── .env                # Backend environment (gitignored)
    └── .env.example        # Backend template
```

## 🎯 Quick Start

### Frontend Setup

1. **Copy template file:**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`:**
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_USE_API=true
   ```

### Backend Setup

1. **Copy template file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/ocha_pos"
   JWT_SECRET="your-secret-key-here"
   BANK_CODE=VCB
   BANK_ACCOUNT_NUMBER=your_account_number
   BANK_ACCOUNT_NAME=OCHA POS
   ```

## 📋 Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080/api` | ✅ |
| `VITE_USE_API` | Use API or mock data | `true` | ❌ |
| `VITE_APP_NAME` | App name | `Ocha Việt POS` | ❌ |
| `VITE_APP_VERSION` | App version | `1.0.0` | ❌ |
| `VITE_APP_ENV` | Environment | `development` | ❌ |

### Frontend Example

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true
```

## 📋 Backend Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ocha_pos` |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | `your-secret-key-here` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment | `development` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |

### Payment Gateway (VNPay) - Optional

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VNPAY_TMN_CODE` | VNPay merchant code | https://sandbox.vnpayment.vn/ |
| `VNPAY_SECRET_KEY` | VNPay secret key | https://sandbox.vnpayment.vn/ |
| `VNPAY_URL` | VNPay API URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNPAY_RETURN_URL` | Callback URL | `http://localhost:3000/payment/callback` |

### QR Code Bank Transfer - Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `BANK_CODE` | Bank code | `VCB` (Vietcombank) |
| `BANK_ACCOUNT_NUMBER` | Your bank account number | `1234567890` |
| `BANK_ACCOUNT_NAME` | Account holder name | `OCHA POS` |

### Backend Example

```env
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ocha_pos?schema=public"
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# VNPay (Optional - for card payment)
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback

# Bank QR Code (Optional - for QR payment)
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=your_bank_account_number
BANK_ACCOUNT_NAME=OCHA POS
```

## 🔑 Generate JWT Secret

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## 🏦 Bank Codes Reference

Common Vietnamese bank codes:

| Code | Bank Name |
|------|-----------|
| `VCB` | Vietcombank |
| `TCB` | Techcombank |
| `VPB` | VPBank |
| `ACB` | ACB |
| `TPB` | TPBank |
| `MBB` | MBBank |
| `VIB` | VIB |
| `STB` | Sacombank |
| `HDB` | HDBank |
| `MSB` | Maritime Bank |

## 🚀 Production Setup

### Frontend Production

```env
# frontend/.env.local (or .env.production)
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_USE_API=true
VITE_APP_ENV=production
```

### Backend Production

```env
# backend/.env
DATABASE_URL="postgresql://user:pass@prod-db:5432/ocha_pos"
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d

# Production VNPay
VNPAY_TMN_CODE=<production-tmn-code>
VNPAY_SECRET_KEY=<production-secret-key>
VNPAY_URL=https://www.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/callback

# Production Bank Account
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=<your-production-account>
BANK_ACCOUNT_NAME=<your-company-name>
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend `.env.local` exists and has `VITE_API_BASE_URL`
- [ ] Backend `.env` exists and has `DATABASE_URL`, `JWT_SECRET`
- [ ] Database is accessible with `DATABASE_URL`
- [ ] Backend server starts without errors
- [ ] Frontend can connect to backend API
- [ ] JWT authentication works (login page)
- [ ] Payment methods configured (if using):
  - [ ] VNPay credentials (for card payment)
  - [ ] Bank account info (for QR payment)

## 🔒 Security Notes

1. **Never commit `.env` or `.env.local` to Git**
2. **Use strong JWT_SECRET** (at least 32 characters, random)
3. **Keep VNPay Secret Key secure**
4. **Don't expose sensitive data in frontend env variables**
5. **Use different credentials for development and production**

## 📚 Related Documentation

- `backend/ENV_SETUP.md` - Detailed backend setup
- `backend/QR_CODE_SETUP.md` - QR code payment setup
- `backend/PAYMENT_GATEWAY_INTEGRATION.md` - VNPay integration

---

**Last Updated:** 2024-01-01

