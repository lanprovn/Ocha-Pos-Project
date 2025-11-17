# Quick Start - Backend

Hướng dẫn nhanh để chạy backend server.

## Setup

1. **Tạo file .env:**
```bash
cd backend
cp .env.example .env
```

2. **Cấu hình .env:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ocha_pos"
JWT_SECRET="your-secret-key-at-least-32-chars"
FRONTEND_URL="http://localhost:3000"
```

3. **Chạy migrations:**
```bash
npm run prisma:migrate
```

4. **Seed data (optional):**
```bash
npm run prisma:seed
```

5. **Start server:**
```bash
npm run dev
```

Server chạy tại `http://localhost:8080`

## Kiểm tra

- Health check: `http://localhost:8080/health`
- API base: `http://localhost:8080/api`

## Troubleshooting

**Database connection failed:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL đúng format
- Tạo database nếu chưa có: `createdb ocha_pos`

**JWT_SECRET error:**
- Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copy vào .env

**Port already in use:**
- Đổi PORT trong .env
- Hoặc kill process đang dùng port 8080

## Scripts hữu ích

```bash
npm run dev              # Start dev server
npm run build            # Build production
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed sample data
```
