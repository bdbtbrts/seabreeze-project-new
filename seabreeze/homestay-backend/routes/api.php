<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController; 
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\AccessoryController;
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --- CÁC ROUTE CÔNG KHAI ---//
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::get('/rooms/{id}/reviews', [ReviewController::class, 'getRoomReviews']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Danh sách đồ thuê cho trang chủ
Route::get('/accessories', [AccessoryController::class, 'index']);

// 🚨 --- NHÓM CÁC ROUTE BẮT BUỘC PHẢI ĐĂNG NHẬP --- 🚨
Route::middleware('auth:sanctum')->group(function () {
    
    // --- CHỨC NĂNG HỒ SƠ CÁ NHÂN (PROFILE) ---
    Route::post('/upload-avatar', [UserController::class, 'uploadAvatar']);
    Route::put('/update-profile', [UserController::class, 'updateProfile']);
    Route::post('/change-password', [UserController::class, 'changePassword']);
    
    // Các thao tác đặt hàng, đánh giá
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    
    // Các thao tác của Chủ nhà (Host)
    Route::post('/rooms', [RoomController::class, 'store']); 
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
    
    Route::get('/orders', [OrderController::class, 'index']);
    Route::put('/orders/{id}/confirm', [OrderController::class, 'confirm']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    
    Route::post('/accessories', [AccessoryController::class, 'store']);
    Route::put('/accessories/{id}', [AccessoryController::class, 'update']);
    Route::delete('/accessories/{id}', [AccessoryController::class, 'destroy']);
    
    Route::get('/host/{hostId}/reviews', [ReviewController::class, 'hostIndex']);
    Route::delete('/host/reviews/{id}', [ReviewController::class, 'destroy']);
});

// --- CÁC ROUTE KHÁC & ADMIN ---
Route::put('/users/{id}/upgrade-host', [UserController::class, 'upgradeToHost']);
Route::get('/rentals/tracking/{email}', [RentalController::class, 'getByEmail']);

Route::put('/admin/rooms/{id}/approve', [RoomController::class, 'approve']);
Route::get('/admin/rentals', [RentalController::class, 'indexAdmin']);
Route::put('/admin/rentals/{id}/status', [RentalController::class, 'updateStatus']);
Route::get('/admin/accessories', [AccessoryController::class, 'index']);
Route::post('/admin/accessories', [AccessoryController::class, 'store']);
Route::delete('/admin/accessories/{id}', [AccessoryController::class, 'destroy']);
Route::get('/admin/dashboard-stats', [AdminController::class, 'dashboardStats']);
Route::get('/admin/users', [UserController::class, 'index']);
Route::put('/admin/users/{id}/status', [UserController::class, 'updateStatus']);
Route::get('/admin/promotions', [PromotionController::class, 'index']);
Route::post('/admin/promotions', [PromotionController::class, 'store']);
Route::delete('/admin/promotions/{id}', [PromotionController::class, 'destroy']);
Route::post('/check-promo', [PromotionController::class, 'checkPromo']);