#!/bin/bash

# Script để sửa các lỗi lint cơ bản

echo "Bắt đầu sửa lỗi linter..."

# 1. Sửa lỗi trong react.d.ts
echo "Sửa lỗi trong react.d.ts..."
sed -i '' 's/import '\''react'\'';/import * as React from '\''react'\'';/' src/types/react.d.ts

# 2. Sửa lỗi import trùng lặp trong App.tsx
echo "Sửa lỗi import trùng lặp trong App.tsx..."
sed -i '' '3,4d' src/App.tsx

# 3. Thêm SyntheticEvent type cho handleTabChange
echo "Sửa lỗi SyntheticEvent trong App.tsx..."
sed -i '' 's/const handleTabChange = (event: React.SyntheticEvent/const handleTabChange = (event: React.SyntheticEvent<unknown>/' src/App.tsx

# 4. Thêm tiền tố _ cho các biến không sử dụng trong App.tsx
echo "Sửa lỗi biến không sử dụng trong App.tsx..."
sed -i '' 's/const { data: transaction,/const { data: _transaction,/g' src/App.tsx

# 5. Sửa lỗi trong FinancialAnalysis.tsx - đúng loại sự kiện
echo "Sửa lỗi trong FinancialAnalysis.tsx..."
sed -i '' 's/const handleTabChange = (event: React.BaseSyntheticEvent/const handleTabChange = (event: React.SyntheticEvent<unknown>/' src/modules/admin/components/FinancialAnalysis/index.tsx

echo "Đã sửa xong các lỗi cơ bản. Chạy lại npm run lint để kiểm tra lại." 