<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if ($user->trang_thai == 0) {
            return response()->json(['message' => 'Tài khoản đã bị khóa.'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'ho_ten' => $user->ho_ten,
                'email' => $user->email,
                'vai_tro' => $user->vai_tro,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function adminDashboard()
    {
        return response()->json([
            'message' => 'Chào mừng Admin!',
            'user' => auth()->user(),
        ]);
    }

    public function managerDashboard()
    {
        return response()->json([
            'message' => 'Chào mừng Manager!',
            'user' => auth()->user(),
        ]);
    }

    public function lecturerDashboard()
    {
        return response()->json([
            'message' => 'Chào mừng Giảng viên!',
            'user' => auth()->user(),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại địa chỉ email.',
                'status' => 'error'
            ], 404);
        }

        try {
            // Enhanced mail configuration check
            $mailConfig = config('mail');
            $currentDriver = config('mail.default');
            
            // Check if we're in testing mode
            if ($currentDriver === 'log' || $currentDriver === 'array') {
                Log::warning('Mail is configured for testing', [
                    'driver' => $currentDriver,
                    'email' => $request->email,
                    'user_id' => $user->id
                ]);
                
                return response()->json([
                    'message' => 'Hệ thống đang ở chế độ test. Email đã được ghi vào log thay vì gửi thực tế. Vui lòng liên hệ quản trị viên để cấu hình email.',
                    'status' => 'warning',
                    'debug_info' => config('app.debug') ? [
                        'mail_driver' => $currentDriver,
                        'note' => 'Email được ghi vào storage/logs/laravel.log'
                    ] : null
                ], 200);
            }

            // Check SMTP configuration for production
            if ($currentDriver === 'smtp') {
                $smtpConfig = $mailConfig['mailers']['smtp'] ?? [];
                $missingConfigs = [];
                
                if (empty($smtpConfig['host'])) $missingConfigs[] = 'MAIL_HOST';
                if (empty($smtpConfig['port'])) $missingConfigs[] = 'MAIL_PORT';
                if (empty($smtpConfig['username'])) $missingConfigs[] = 'MAIL_USERNAME';
                if (empty($smtpConfig['password'])) $missingConfigs[] = 'MAIL_PASSWORD';
                if (empty($mailConfig['from']['address'])) $missingConfigs[] = 'MAIL_FROM_ADDRESS';
                
                if (!empty($missingConfigs)) {
                    Log::error('SMTP configuration incomplete', [
                        'missing_configs' => $missingConfigs,
                        'email' => $request->email
                    ]);
                    
                    return response()->json([
                        'message' => 'Cấu hình email chưa hoàn tất. Vui lòng liên hệ quản trị viên.',
                        'status' => 'error',
                        'debug_info' => config('app.debug') ? [
                            'missing_configs' => $missingConfigs,
                            'current_driver' => $currentDriver
                        ] : null
                    ], 500);
                }

                // Basic SMTP configuration validation
                Log::info('SMTP configuration check', [
                    'host' => $smtpConfig['host'],
                    'port' => $smtpConfig['port'],
                    'encryption' => $smtpConfig['encryption'] ?? 'none',
                    'username_set' => !empty($smtpConfig['username'])
                ]);
            }

            // Additional check for Gmail specific issues
            if (strpos(config('mail.mailers.smtp.host'), 'gmail.com') !== false) {
                $password = config('mail.mailers.smtp.password');
                if (strlen($password) < 16 || !preg_match('/^[a-z]{16}$/', $password)) {
                    Log::warning('Gmail configuration may need App Password', [
                        'email' => $request->email,
                        'password_length' => strlen($password)
                    ]);
                    
                    return response()->json([
                        'message' => 'Cấu hình Gmail có vẻ không đúng. Vui lòng đảm bảo sử dụng App Password thay vì mật khẩu thường.',
                        'status' => 'warning',
                        'suggestions' => [
                            'Bật xác thực 2 bước cho Gmail',
                            'Tạo App Password từ cài đặt Gmail',
                            'Sử dụng App Password thay vì mật khẩu thường'
                        ]
                    ], 400);
                }
            }

            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                Log::info('Password reset link sent successfully', [
                    'email' => $request->email,
                    'timestamp' => now(),
                    'user_id' => $user->id,
                    'mail_driver' => $currentDriver
                ]);

                return response()->json([
                    'message' => 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và làm theo hướng dẫn.',
                    'status' => 'success',
                    'email' => $request->email,
                    'additional_info' => [
                        'Kiểm tra thư mục spam/junk',
                        'Email có thể mất 5-10 phút để đến',
                        'Liên kết có hiệu lực trong 60 phút'
                    ]
                ]);
            } else {
                Log::error('Password reset failed', [
                    'email' => $request->email,
                    'status' => $status,
                    'user_id' => $user->id,
                    'timestamp' => now(),
                    'mail_driver' => $currentDriver
                ]);

                return response()->json([
                    'message' => 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.',
                    'status' => 'error',
                    'debug_info' => config('app.debug') ? [
                        'laravel_status' => $status,
                        'mail_driver' => $currentDriver,
                        'possible_causes' => [
                            'Email server temporarily unavailable',
                            'Rate limiting',
                            'Invalid SMTP credentials'
                        ]
                    ] : null
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception occurred while sending password reset email', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id ?? null,
                'timestamp' => now(),
                'mail_driver' => config('mail.default')
            ]);

            // Check for specific mail-related errors
            $errorMessage = 'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu.';
            $suggestions = [
                'Kiểm tra kết nối internet',
                'Đảm bảo địa chỉ email chính xác',
                'Thử lại sau 5-10 phút'
            ];

            // Enhanced error detection
            $errorLower = strtolower($e->getMessage());
            
            if (strpos($errorLower, 'connection') !== false || strpos($errorLower, 'refused') !== false) {
                $errorMessage = 'Không thể kết nối đến máy chủ email. Vui lòng thử lại sau.';
                $suggestions = [
                    'Kiểm tra kết nối internet',
                    'Máy chủ email có thể đang bảo trì',
                    'Liên hệ quản trị viên nếu vấn đề tiếp tục'
                ];
            } elseif (strpos($errorLower, 'authentication') !== false || strpos($errorLower, 'login') !== false || strpos($errorLower, 'password') !== false) {
                $errorMessage = 'Lỗi xác thực email server. Vui lòng liên hệ quản trị viên.';
                $suggestions = [
                    'Kiểm tra cấu hình MAIL_USERNAME và MAIL_PASSWORD',
                    'Đối với Gmail, sử dụng App Password',
                    'Liên hệ quản trị viên để kiểm tra cấu hình'
                ];
            } elseif (strpos($errorLower, 'rate') !== false || strpos($errorLower, 'limit') !== false || strpos($errorLower, 'quota') !== false) {
                $errorMessage = 'Đã gửi quá nhiều email. Vui lòng thử lại sau 15 phút.';
                $suggestions = [
                    'Chờ 15-30 phút trước khi thử lại',
                    'Liên hệ quản trị viên nếu cần gấp'
                ];
            } elseif (strpos($errorLower, 'timeout') !== false) {
                $errorMessage = 'Kết nối email bị timeout. Vui lòng thử lại.';
                $suggestions = [
                    'Kiểm tra kết nối internet',
                    'Thử lại sau vài phút',
                    'Liên hệ quản trị viên nếu vấn đề tiếp tục'
                ];
            }

            if (config('app.debug')) {
                $errorMessage .= ' Chi tiết lỗi: ' . $e->getMessage();
            }

            return response()->json([
                'message' => $errorMessage,
                'status' => 'error',
                'suggestions' => $suggestions,
                'debug_info' => config('app.debug') ? [
                    'exception_type' => get_class($e),
                    'error_message' => $e->getMessage(),
                    'mail_config' => [
                        'driver' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'encryption' => config('mail.mailers.smtp.encryption'),
                        'from_address' => config('mail.from.address'),
                        'username_configured' => !empty(config('mail.mailers.smtp.username')),
                        'password_configured' => !empty(config('mail.mailers.smtp.password'))
                    ]
                ] : null
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'token', 'password', 'password_confirmation'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mật khẩu đã được đặt lại thành công'])
            : response()->json(['message' => 'Link reset không hợp lệ'], 400);
    }
    
    /**
     * Verify if the authenticated user has the specified role
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyRole(Request $request)
    {
        $user = $request->user();
        $requiredRole = $request->query('role');
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }
        
        // For 'manager' role, check if vai_tro is 2
        if ($requiredRole === 'manager' && $user->vai_tro === 2) {
            return response()->json([
                'success' => true,
                'hasRole' => true,
                'message' => 'Người dùng có quyền quản lý'
            ]);
        }
        
        // For other roles, convert role name to role id
        $roleMapping = [
            'admin' => 1,
            'lecturer' => 3
        ];
        
        $roleId = $roleMapping[$requiredRole] ?? null;
        $hasRole = $roleId !== null && $user->vai_tro === $roleId;
        
        return response()->json([
            'success' => true,
            'hasRole' => $hasRole,
            'message' => $hasRole ? 'Người dùng có quyền truy cập' : 'Người dùng không có quyền truy cập'
        ]);
    }
}
