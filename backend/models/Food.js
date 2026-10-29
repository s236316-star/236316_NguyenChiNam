const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
    {
        foodId: {
            type: String,
            required: [true, 'Mã món ăn là bắt buộc'],
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, 'Tên món ăn là bắt buộc'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Danh mục là bắt buộc'],
            trim: true
        },
        cuisine: {
            type: String,
            trim: true,
            default: ''
        },
        ingredients: {
            type: [String],
            default: []
        },
        price: {
            type: Number,
            required: [true, 'Giá món ăn là bắt buộc'],
            min: [0, 'Giá không được âm']
        },
        quantity: {
            type: Number,
            required: [true, 'Số lượng là bắt buộc'],
            min: [0, 'Số lượng không được âm'],
            default: 0
        },
        description: {
            type: String,
            default: ''
        },
        imageUrl: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'available'
        }
    },
    {
        timestamps: true,
        collection: 'foods'
    }
);

module.exports = mongoose.model('Food', foodSchema);