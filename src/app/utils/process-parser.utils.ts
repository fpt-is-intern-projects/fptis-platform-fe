import BpmnModdle from 'bpmn-moddle';
import DmnModdle from 'dmn-moddle';
import { parseMetadata, type ParsedBpmn } from './bpmn-parser.utils';
import { parseDmnMetadata, type ParsedDmn } from './dmn-parser.utils';

export interface ParsedProcess {
  processName: string;
  resourceType: 'BPMN' | 'DMN';
  tasks?: { taskCode: string; taskName: string }[];
  hitPolicy?: string;
}

const bpmnModdle = new BpmnModdle();
const dmnModdle = new DmnModdle();

export async function parseProcessFile(file: File): Promise<ParsedProcess> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.bpmn') || fileName.endsWith('.bpmn20.xml')) {
    const bpmnData: ParsedBpmn = await parseMetadata(file);
    return {
      processName: bpmnData.processName,
      resourceType: 'BPMN',
      tasks: bpmnData.tasks,
    };
  } else if (fileName.endsWith('.dmn') || fileName.endsWith('.dmn13.xml')) {
    const dmnData: ParsedDmn = await parseDmnMetadata(file);
    return {
      processName: dmnData.decisionName,
      resourceType: 'DMN',
      hitPolicy: dmnData.hitPolicy,
    };
  } else {
    throw new Error('File không hợp lệ. Chỉ hỗ trợ file .bpmn hoặc .dmn');
  }
}
