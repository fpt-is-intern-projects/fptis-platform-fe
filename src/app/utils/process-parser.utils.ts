import BpmnModdle from 'bpmn-moddle';
import DmnModdle from 'dmn-moddle';
import { parseMetadata, type ParsedBpmn } from './bpmn-parser.utils';
import { parseDmnMetadata, type ParsedDmn } from './dmn-parser.utils';

export interface ParsedProcess {
  processCode: string;
  resourceType: 'BPMN' | 'DMN';
  hitPolicy?: string;
}

export async function parseProcessFile(file: File): Promise<ParsedProcess> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.bpmn') || fileName.endsWith('.bpmn20.xml')) {
    const bpmnData: ParsedBpmn = await parseMetadata(file);
    return {
      processCode: bpmnData.processId,
      resourceType: 'BPMN',
    };
  } else if (fileName.endsWith('.dmn') || fileName.endsWith('.dmn13.xml')) {
    const dmnData: ParsedDmn = await parseDmnMetadata(file);
    return {
      processCode: dmnData.decisionId,
      hitPolicy: dmnData.hitPolicy,
      resourceType: 'DMN',
    };
  } else {
    throw new Error('File không hợp lệ. Chỉ hỗ trợ file .bpmn hoặc .dmn');
  }
}
