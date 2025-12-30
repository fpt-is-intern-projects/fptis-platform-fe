/** * ============================================================
 * 1. NHÓM QUẢN LÝ QUY TRÌNH (Process Definition & Deployment)
 * ============================================================
 */

export type ProcessDeployRequest = {
  name: string;
  processCode: string;
  resourceType: 'BPMN' | 'DMN';
};

export type ProcessDefinitionResponse = {
  id: number;
  name: string;
  processCode: string;
  activeVersion: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';
  resourceType: 'BPMN' | 'DMN';
};

/** * ============================================================
 * 2. NHÓM CẤU HÌNH TASK & PHÂN QUYỀN (Task & Authorization)
 * ============================================================
 */

export type ProcessTaskResponse = {
  taskCode: string;
  taskName: string;
  permission: string;
  isActive: boolean;
  buttons: ActionButtonResponse[];
};

export type TaskPermissionRequest = {
  processCode: string;
  taskCode: string;
  permissionRole: string;
};

/** * ============================================================
 * 3. NHÓM NÚT BẤM ĐỘNG (Action Buttons Metadata)
 * ============================================================
 */

export type ActionButtonResponse = {
  label: string;
  color: string;
  variableName: string;
  value: any;
};

export type ActionButtonRequest = ActionButtonResponse;

export type TaskActionsUpdateRequest = {
  processCode: string;
  taskCode: string;
  buttons: ActionButtonRequest[];
};

/** * ============================================================
 * 4. NHÓM DỮ LIỆU & BIẾN (Process Variables)
 * ============================================================
 */

export type ProcessVariableResponse = {
  variableName: string;
  displayName: string;
  dataType: string;
};

/** * ============================================================
 * 5. NHÓM THỰC THI (Task Runtime)
 * ============================================================
 */

export type TaskCompleteRequest = {
  taskId: string;
  variables: { [key: string]: any };
};
