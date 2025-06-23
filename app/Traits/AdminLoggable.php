<?php

namespace App\Traits;

use App\Models\AdminLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait AdminLoggable
{
    /**
     * Log admin action
     */
    public function logAdminAction($action, $tableName, $recordId = null, $recordName = null, $oldData = null, $newData = null, $description = null)
    {
        $admin = Auth::user();
        
        if (!$admin) {
            return;
        }

        AdminLog::create([
            'admin_id' => $admin->id,
            'admin_name' => $admin->ho_ten,
            'action' => $action,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'record_name' => $recordName,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'description' => $description,
        ]);
    }

    /**
     * Log CREATE action
     */
    public function logCreate($tableName, $model, $description = null)
    {
        $recordName = $this->getRecordName($model);
        
        $this->logAdminAction(
            'CREATE',
            $tableName,
            $model->id,
            $recordName,
            null,
            $model->toArray(),
            $description ?: "Tạo mới {$tableName}: {$recordName}"
        );
    }

    /**
     * Log UPDATE action
     */
    public function logUpdate($tableName, $model, $oldData, $description = null)
    {
        $recordName = $this->getRecordName($model);
        
        $this->logAdminAction(
            'UPDATE',
            $tableName,
            $model->id,
            $recordName,
            $oldData,
            $model->toArray(),
            $description ?: "Cập nhật {$tableName}: {$recordName}"
        );
    }

    /**
     * Log DELETE action
     */
    public function logDelete($tableName, $model, $description = null)
    {
        $recordName = $this->getRecordName($model);
        
        $this->logAdminAction(
            'DELETE',
            $tableName,
            $model->id,
            $recordName,
            $model->toArray(),
            null,
            $description ?: "Xóa {$tableName}: {$recordName}"
        );
    }

    /**
     * Log IMPORT action
     */
    public function logImport($tableName, $recordCount, $description = null)
    {
        $this->logAdminAction(
            'IMPORT',
            $tableName,
            null,
            null,
            null,
            ['record_count' => $recordCount],
            $description ?: "Import {$recordCount} bản ghi vào {$tableName}"
        );
    }

    /**
     * Get record name for logging
     */
    private function getRecordName($model)
    {
        // Tùy theo model mà lấy field thích hợp làm tên
        if (method_exists($model, 'getDisplayName')) {
            return $model->getDisplayName();
        }

        if (isset($model->ho_ten)) return $model->ho_ten;
        if (isset($model->ten_khoa)) return $model->ten_khoa;
        if (isset($model->ten_bo_mon)) return $model->ten_bo_mon;
        if (isset($model->ten_nam_hoc)) return $model->ten_nam_hoc;
        if (isset($model->ten_hoc_ky)) return $model->ten_hoc_ky;
        if (isset($model->ten_loai)) return $model->ten_loai;
        if (isset($model->ten_hoat_dong)) return $model->ten_hoat_dong;
        if (isset($model->ten_chuc_danh)) return $model->ten_chuc_danh;
        if (isset($model->ma_gv)) return $model->ma_gv;
        if (isset($model->ma_khoa)) return $model->ma_khoa;
        if (isset($model->ma_bo_mon)) return $model->ma_bo_mon;

        return "ID: {$model->id}";
    }
}
