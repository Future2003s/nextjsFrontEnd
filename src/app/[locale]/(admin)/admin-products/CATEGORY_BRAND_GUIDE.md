# Hướng dẫn sử dụng: Chọn "Không có danh mục" và "Không có thương hiệu"

## 🎯 **Tính năng mới:**

Bây giờ bạn có thể tạo hoặc chỉnh sửa sản phẩm mà **không cần** chọn danh mục hoặc thương hiệu cụ thể.

## ✨ **Cách sử dụng:**

### **1. Khi tạo sản phẩm mới:**

- Mở form "Thêm sản phẩm mới"
- Ở phần **Danh mục**: Chọn "✗ Không có danh mục"
- Ở phần **Thương hiệu**: Chọn "✗ Không có thương hiệu"
- Điền các thông tin khác và lưu

### **2. Khi chỉnh sửa sản phẩm:**

- Click nút **Edit** (biểu tượng bút chì) trên sản phẩm
- Ở phần **Danh mục**: Chọn "✗ Không có danh mục" để bỏ danh mục
- Ở phần **Thương hiệu**: Chọn "✗ Không có thương hiệu" để bỏ thương hiệu
- Lưu thay đổi

## 🔍 **Hiển thị trong bảng:**

- **Không có danh mục**: Hiển thị "Không có danh mục" với màu xám nhạt
- **Không có thương hiệu**: Hiển thị "Không có thương hiệu" với màu xám nhạt

## 📝 **Ví dụ sử dụng:**

### **Trường hợp 1: Sản phẩm generic**

- Tên: "Bút bi đen"
- Danh mục: ✗ Không có danh mục
- Thương hiệu: ✗ Không có thương hiệu
- Kết quả: Sản phẩm không thuộc danh mục cụ thể nào

### **Trường hợp 2: Sản phẩm có danh mục nhưng không có thương hiệu**

- Tên: "Áo thun nam"
- Danh mục: 📁 Quần áo
- Thương hiệu: ✗ Không có thương hiệu
- Kết quả: Sản phẩm thuộc danh mục "Quần áo" nhưng không có thương hiệu

### **Trường hợp 3: Sản phẩm có thương hiệu nhưng không có danh mục**

- Tên: "Nước hoa nam"
- Danh mục: ✗ Không có danh mục
- Thương hiệu: 🏷️ Chanel
- Kết quả: Sản phẩm thuộc thương hiệu "Chanel" nhưng không có danh mục

## ⚠️ **Lưu ý quan trọng:**

1. **Khi chọn "Không có danh mục"**: Sản phẩm sẽ không được phân loại vào danh mục nào
2. **Khi chọn "Không có thương hiệu"**: Sản phẩm sẽ không được gắn với thương hiệu nào
3. **Cả hai đều có thể chọn cùng lúc**: Sản phẩm sẽ không có cả danh mục và thương hiệu
4. **Dữ liệu được gửi đúng**: Backend sẽ nhận được `null` hoặc `undefined` thay vì giá trị rỗng

## 🔧 **Debug logs:**

Khi sử dụng tính năng này, kiểm tra console để xem:

- `Category selected: none` - Khi chọn không có danh mục
- `Brand selected: none` - Khi chọn không có thương hiệu
- `No category selected - product will have no category` - Khi submit
- `No brand selected - product will have no brand` - Khi submit

## 🎨 **Giao diện:**

- **✗ Không có danh mục**: Màu xám, in nghiêng
- **✗ Không có thương hiệu**: Màu xám, in nghiêng
- **📁 Danh mục**: Có icon folder
- **🏷️ Thương hiệu**: Có icon tag
- **Thông báo xác nhận**: Hiển thị khi đã chọn "không có"

## 🚀 **Lợi ích:**

1. **Linh hoạt**: Có thể tạo sản phẩm không cần phân loại cứng nhắc
2. **Thực tế**: Phù hợp với các sản phẩm generic, không có thương hiệu
3. **Dễ quản lý**: Có thể thêm danh mục/thương hiệu sau khi cần
4. **Tương thích**: Hoạt động tốt với backend hiện tại
