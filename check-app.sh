#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      KIỂM TRA TRẠNG THÁI ỨNG DỤNG     ${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Kiểm tra Node.js và npm
echo -e "\n${BLUE}[1/7] Kiểm tra Node.js và npm${NC}"
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

if [ -z "$NODE_VERSION" ]; then
  echo -e "${RED}✘ Node.js chưa được cài đặt${NC}"
else
  echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"
fi

if [ -z "$NPM_VERSION" ]; then
  echo -e "${RED}✘ npm chưa được cài đặt${NC}"
else
  echo -e "${GREEN}✓ npm version: $NPM_VERSION${NC}"
fi

# 2. Kiểm tra cấu trúc thư mục
echo -e "\n${BLUE}[2/7] Kiểm tra cấu trúc thư mục${NC}"
if [ -d "frontend" ]; then
  echo -e "${GREEN}✓ Thư mục frontend tồn tại${NC}"
else
  echo -e "${RED}✘ Thư mục frontend không tồn tại${NC}"
fi

if [ -f "frontend/package.json" ]; then
  echo -e "${GREEN}✓ File package.json tồn tại${NC}"
else
  echo -e "${RED}✘ File package.json không tồn tại${NC}"
fi

# 3. Kiểm tra tệp .env
echo -e "\n${BLUE}[3/7] Kiểm tra tệp .env${NC}"
if [ -f "frontend/.env" ]; then
  echo -e "${GREEN}✓ File .env tồn tại${NC}"
  
  # Kiểm tra các biến môi trường cần thiết
  if grep -q "REACT_APP_SUPABASE_URL" frontend/.env; then
    echo -e "${GREEN}✓ REACT_APP_SUPABASE_URL đã cấu hình${NC}"
  else
    echo -e "${RED}✘ REACT_APP_SUPABASE_URL chưa được cấu hình${NC}"
  fi
  
  if grep -q "REACT_APP_SUPABASE_ANON_KEY" frontend/.env; then
    echo -e "${GREEN}✓ REACT_APP_SUPABASE_ANON_KEY đã cấu hình${NC}"
  else
    echo -e "${RED}✘ REACT_APP_SUPABASE_ANON_KEY chưa được cấu hình${NC}"
  fi
else
  echo -e "${RED}✘ File .env không tồn tại${NC}"
fi

# 4. Kiểm tra Git
echo -e "\n${BLUE}[4/7] Kiểm tra Git${NC}"
if command -v git &> /dev/null; then
  echo -e "${GREEN}✓ Git đã được cài đặt${NC}"
  
  if [ -d ".git" ]; then
    echo -e "${GREEN}✓ Repository Git đã được khởi tạo${NC}"
    
    # Kiểm tra remote
    GIT_REMOTE=$(git remote -v)
    if [ -n "$GIT_REMOTE" ]; then
      echo -e "${GREEN}✓ Git remote đã cấu hình${NC}"
      echo -e "  $GIT_REMOTE"
    else
      echo -e "${YELLOW}⚠ Git remote chưa được cấu hình${NC}"
    fi
    
    # Kiểm tra trạng thái
    GIT_STATUS=$(git status --porcelain)
    if [ -n "$GIT_STATUS" ]; then
      echo -e "${YELLOW}⚠ Có thay đổi chưa được commit${NC}"
    else
      echo -e "${GREEN}✓ Working directory sạch${NC}"
    fi
  else
    echo -e "${RED}✘ Repository Git chưa được khởi tạo${NC}"
  fi
else
  echo -e "${RED}✘ Git chưa được cài đặt${NC}"
fi

# 5. Kiểm tra cấu hình Vercel
echo -e "\n${BLUE}[5/7] Kiểm tra cấu hình Vercel${NC}"
if [ -f "vercel.json" ]; then
  echo -e "${GREEN}✓ File vercel.json tồn tại${NC}"
else
  echo -e "${RED}✘ File vercel.json không tồn tại${NC}"
fi

if [ -f "frontend/vercel.json" ]; then
  echo -e "${GREEN}✓ File frontend/vercel.json tồn tại${NC}"
else
  echo -e "${RED}✘ File frontend/vercel.json không tồn tại${NC}"
fi

# 6. Kiểm tra file auth đã được tạo
echo -e "\n${BLUE}[6/7] Kiểm tra file auth${NC}"
if [ -f "frontend/src/lib/auth/auth.ts" ]; then
  echo -e "${GREEN}✓ File frontend/src/lib/auth/auth.ts tồn tại${NC}"
else
  echo -e "${RED}✘ File frontend/src/lib/auth/auth.ts không tồn tại${NC}"
fi

# 7. Kiểm tra kết nối với Supabase
echo -e "\n${BLUE}[7/7] Kiểm tra tích hợp Supabase${NC}"
if [ -f "frontend/src/lib/database/supabase.ts" ]; then
  echo -e "${GREEN}✓ File supabase.ts tồn tại${NC}"
else
  echo -e "${RED}✘ File supabase.ts không tồn tại${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}      KẾT THÚC KIỂM TRA ỨNG DỤNG       ${NC}"
echo -e "${BLUE}========================================${NC}"

# Lời khuyên
echo -e "\n${YELLOW}Lời khuyên:${NC}"
echo -e "1. Kiểm tra kết nối với Supabase bằng cách đăng nhập vào ứng dụng"
echo -e "2. Đảm bảo các biến môi trường đã được cấu hình đúng trong Vercel"
echo -e "3. Sử dụng 'npm run build' để kiểm tra quá trình build trước khi triển khai"
echo -e "4. Thường xuyên đồng bộ code với Git để tránh mất dữ liệu" 