const express = require('express');
const router = express.Router();
const Food = require('../models/Food'); // Điều chỉnh đường dẫn model nếu cần thiết

// 1. Lấy danh sách món ăn (Hỗ trợ tìm kiếm theo từ khóa: name, category, cuisine)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search && search.trim()) {
            const keyword = search.trim();
            query = {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { category: { $regex: keyword, $options: 'i' } },
                    { cuisine: { $regex: keyword, $options: 'i' } }
                ]
            };
        }

        const foods = await Food.find(query).sort({ foodId: 1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        console.error('Error fetching foods:', error.message);
        res.status(500).json({
            success: false,
            message: 'Khong the lay danh sach mon an'
        });
    }
});

// 2. Xem chi tiết món ăn theo foodId
router.get('/:id', async (req, res) => {
    try {
        const food = await Food.findOne({
            foodId: req.params.id
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay mon an'
            });
        }

        return res.status(200).json({
            success: true,
            data: food
        });
    } catch (error) {
        console.error('Error fetching food:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Khong the lay thong tin mon an'
        });
    }
});

// 3. Thêm món ăn mới
router.post('/', async (req, res) => {
    try {
        const {
            foodId,
            name,
            category,
            cuisine,
            ingredients,
            price,
            quantity,
            description,
            imageUrl,
            status
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (
            typeof foodId !== 'string' || !foodId.trim() ||
            typeof name !== 'string' || !name.trim() ||
            typeof category !== 'string' || !category.trim() ||
            price === undefined || price === null ||
            quantity === undefined || quantity === null
        ) {
            return res.status(400).json({
                success: false,
                message: 'Vui long cung cap foodId, name, category, price va quantity'
            });
        }

        // Giá và số lượng phải là số không âm
        if (
            typeof price !== 'number' ||
            typeof quantity !== 'number' ||
            !Number.isFinite(price) ||
            !Number.isFinite(quantity) ||
            price < 0 ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Gia va so luong phai la so khong am'
            });
        }

        // Kiểm tra thành phần
        if (
            ingredients !== undefined &&
            (!Array.isArray(ingredients) ||
                !ingredients.every(item => typeof item === 'string'))
        ) {
            return res.status(400).json({
                success: false,
                message: 'ingredients phai la mang cac chuoi'
            });
        }

        // Kiểm tra mã món ăn đã tồn tại
        const normalizedFoodId = foodId.trim();

        const existingFood = await Food.findOne({
            foodId: normalizedFoodId
        });

        if (existingFood) {
            return res.status(409).json({
                success: false,
                message: 'Ma mon an da ton tai'
            });
        }

        const food = await Food.create({
            foodId: normalizedFoodId,
            name: name.trim(),
            category: category.trim(),
            cuisine,
            ingredients,
            price,
            quantity,
            description,
            imageUrl,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Them mon an thanh cong',
            data: food
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Ma mon an da ton tai'
            });
        }

        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Du lieu mon an khong hop le'
            });
        }

        console.error('Error creating food:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Khong the them mon an'
        });
    }
});

// 4. Cập nhật thông tin món ăn theo foodId
router.put('/:id', async (req, res) => {
    try {
        const {
            name,
            category,
            cuisine,
            ingredients,
            price,
            quantity,
            description,
            imageUrl,
            status
        } = req.body;

        // Kiểm tra tên và danh mục nếu được gửi
        if (
            (name !== undefined &&
                (typeof name !== 'string' || !name.trim())) ||
            (category !== undefined &&
                (typeof category !== 'string' || !category.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Ten mon an va danh muc khong duoc de trong'
            });
        }

        // Kiểm tra giá và số lượng
        if (
            (price !== undefined &&
                (typeof price !== 'number' ||
                    !Number.isFinite(price) || price < 0)) ||
            (quantity !== undefined &&
                (typeof quantity !== 'number' ||
                    !Number.isFinite(quantity) || quantity < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Gia va so luong phai la so khong am'
            });
        }

        // Kiểm tra thành phần
        if (
            ingredients !== undefined &&
            (!Array.isArray(ingredients) ||
                !ingredients.every(item => typeof item === 'string'))
        ) {
            return res.status(400).json({
                success: false,
                message: 'ingredients phai la mang cac chuoi'
            });
        }

        const allowedFields = [
            'name',
            'category',
            'cuisine',
            'ingredients',
            'price',
            'quantity',
            'description',
            'imageUrl',
            'status'
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui long cung cap thong tin can cap nhat'
            });
        }

        if (updateData.name !== undefined) {
            updateData.name = updateData.name.trim();
        }

        if (updateData.category !== undefined) {
            updateData.category = updateData.category.trim();
        }

        const food = await Food.findOneAndUpdate(
            { foodId: req.params.id },
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay mon an'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cap nhat mon an thanh cong',
            data: food
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Du lieu mon an khong hop le'
            });
        }

        console.error('Error updating food:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Khong the cap nhat mon an'
        });
    }
});

// 5. Xóa món ăn theo foodId
router.delete('/:id', async (req, res) => {
    try {
        const food = await Food.findOneAndDelete({ foodId: req.params.id });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay mon an'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Xoa mon an thanh cong'
        });
    } catch (error) {
        console.error('Error deleting food:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Khong the xoa mon an'
        });
    }
});

module.exports = router;