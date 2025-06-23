<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        if (!in_array($user->vai_tro, array_map('intval', $roles))) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        return $next($request);
    }
}
