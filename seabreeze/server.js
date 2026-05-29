import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- CẤU HÌNH ĐƯỜNG DẪN (Để chạy được import/export trên Node.js) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// --- 1. CẤU HÌNH CORS PHẢI ĐẶT TRÊN CÙNG ---
app.use(cors({
  origin: [
    'http://localhost:5173', // Mở cửa cho test local máy m hoặc máy Thịnh
    'http://localhost:5174', // Mở cửa cho test local (nếu dùng port này)
    'https://seabreeze-booking.vercel.app', 
    'https://seabreeze-booking-git-main-8386.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// --- CẤU HÌNH LƯU TRỮ ẢNH VỚI MULTER ---

// Tự động tạo thư mục 'uploads' nếu chưa có để tránh lỗi server
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Đã tạo thư mục uploads mới!");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Nơi chứa ảnh
  },
  filename: (req, file, cb) => {
    // Đặt tên: Thời-gian-tên-file-gốc.jpg
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB cho ảnh
});

// Cho phép trình duyệt xem ảnh trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- HỆ THỐNG API ---

// 1. API Tải ảnh đại diện lên
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Kiểm tra xem file đã lên tới server chưa
    if (!req.file) {
      return res.status(400).json({ error: "Server chưa nhận được file ảnh!" });
    }

    // ĐÂY LÀ CHỖ ĂN TIỀN: Lấy APP_URL từ Render, nếu test máy Thịnh thì nó lấy localhost
    const APP_URL = process.env.APP_URL || 'http://localhost:5000';
    const avatarUrl = `${APP_URL}/uploads/${req.file.filename}`;

    // Cập nhật đường dẫn ảnh vào Database
    const updatedUser = await prisma.nGUOIDUNG.update({
      where: { EMAIL: email },
      data: { AVATAR: avatarUrl },
    });

    console.log(`✅ Đã cập nhật Avatar cho: ${email}`);
    res.status(200).json({ 
      message: "Tải ảnh lên thành công!", 
      avatarUrl: avatarUrl 
    });

  } catch (error) {
    console.error("❌ LỖI TẠI SERVER:", error);
    res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
  }
});

// 2. API Đăng ký
app.post('/api/register', async (req, res) => {
  const { hoTen, email, matKhau, soDienThoai } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const user = await prisma.nGUOIDUNG.create({
      data: {
        HOTEN: hoTen,
        EMAIL: email,
        MATKHAU: hashedPassword,
        SODIENTHOAI: soDienThoai,
      },
    });
    res.status(201).json({ message: 'Đăng ký thành công!', user });
  } catch (error) {
    res.status(400).json({ error: 'Email đã tồn tại!' });
  }
});

// 3. API Đăng nhập
app.post('/api/login', async (req, res) => {
  const { email, matKhau } = req.body;
  try {
    const user = await prisma.nGUOIDUNG.findUnique({ where: { EMAIL: email } });
    if (!user) return res.status(404).json({ error: "Email chưa đăng ký!" });

    const isPasswordValid = await bcrypt.compare(matKhau, user.MATKHAU);
    if (!isPasswordValid) return res.status(401).json({ error: "Mật khẩu sai!" });

    res.status(200).json({ 
      message: "Đăng nhập thành công!", 
      user: { 
        hoTen: user.HOTEN, 
        email: user.EMAIL, 
        vaiTro: user.VAITRO,
        avatar: user.AVATAR // Trả về ảnh khi đăng nhập
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. API Cập nhật SĐT
app.put('/api/update-profile', async (req, res) => {
  const { email, soDienThoai } = req.body;
  try {
    const updatedUser = await prisma.nGUOIDUNG.update({
      where: { EMAIL: email },
      data: { SODIENTHOAI: soDienThoai },
    });
    res.status(200).json({ 
      message: "Cập nhật thành công!", 
      user: { hoTen: updatedUser.HOTEN, email: updatedUser.EMAIL, soDienThoai: updatedUser.SODIENTHOAI } 
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật!" });
  }
});

// 5. API Đổi mật khẩu
app.post('/api/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const user = await prisma.nGUOIDUNG.findUnique({ where: { EMAIL: email } });
    const isMatch = await bcrypt.compare(oldPassword, user.MATKHAU);
    if (!isMatch) return res.status(401).json({ error: "Mật khẩu cũ sai!" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.nGUOIDUNG.update({
      where: { EMAIL: email },
      data: { MATKHAU: hashedNewPassword },
    });
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
});

// 6. API Lấy lịch sử đơn hàng
app.get('/api/orders/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const orders = await prisma.dONHANG.findMany({
      where: { NGUOIDUNG: { EMAIL: email } },
      include: { CT_DONHANG: true },
      orderBy: { NGAYDAT: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lịch sử!" });
  }
});

// 7. API Lấy lịch sử đồ thuê (Đã gom chung lên trên đây)
app.get('/api/rental-tracking/:email', async (req, res) => {
  const { email } = req.params;
  console.log("🔍 Đang tìm đồ thuê cho email:", email);
  try {
    const tracking = await prisma.tHEODOITHUE.findMany({
      where: {
        CT_DONHANG: {
          DONHANG: { NGUOIDUNG: { EMAIL: email } }
        }
      },
      include: { CT_DONHANG: true }
    });
    console.log("📊 Dữ liệu tìm thấy:", tracking);
    res.status(200).json(tracking);
  } catch (error) {
    console.error("❌ Lỗi query:", error);
    res.status(500).json({ error: "Lỗi lấy dữ liệu theo dõi!" });
  }
});

// --- BẬT SERVER ĐÚNG CHUẨN RENDER ---
// Lấy Port của môi trường (Render), nếu code chạy máy Thịnh thì nó lấy Port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server bộ não đang chạy tại Port: ${PORT}`);
});