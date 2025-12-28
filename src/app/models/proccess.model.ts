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

export type ProcessTaskResponse = {
  taskCode: string;
  taskName: string;
  permission: string;
  isActive: boolean;
};

export type ProcessVariableResponse = {
  variableName: string;
  displayName: string;
  defaultValue: string;
  dataType: string;
};
