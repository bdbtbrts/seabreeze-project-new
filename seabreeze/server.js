import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API Đăng ký người dùng
app.post('/api/register', async (req, res) => {
  const { hoTen, email, matKhau, soDienThoai } = req.body;

  try {
    // 1. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // 2. Lưu vào database SQLite
    const user = await prisma.nGUOIDUNG.create({
      data: {
        HOTEN: hoTen,
        EMAIL: email,
        MATKHAU: hashedPassword,
        SODIENTHOAI: soDienThoai,
      },
    });

    res.status(201).json({ message: 'Đăng ký thành công rồi!', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Email đã tồn tại hoặc dữ liệu không hợp lệ!' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server bộ não đang chạy tại http://localhost:${PORT}`);
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
  const { email, matKhau } = req.body;

  try {
    // 1. Tìm người dùng theo Email
    const user = await prisma.nGUOIDUNG.findUnique({
      where: { EMAIL: email }
    });

    if (!user) {
      return res.status(404).json({ error: "Thịnh ơi, Email này chưa đăng ký!" });
    }

    // 2. Kiểm tra mật khẩu (So sánh mật khẩu gõ vào với mật khẩu đã mã hóa)
    const isPasswordValid = await bcrypt.compare(matKhau, user.MATKHAU);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mật khẩu sai rồi nhé!" });
    }

    // 3. Đăng nhập thành công
    res.status(200).json({ 
      message: "Đăng nhập thành công!", 
      user: { hoTen: user.HOTEN, email: user.EMAIL, vaiTro: user.VAITRO } 
    });

  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống rồi: " + error.message });
  }
});