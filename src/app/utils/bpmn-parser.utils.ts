import BpmnModdle from 'bpmn-moddle';

export interface ParsedBpmn {
  processId: string;
}

const moddle = new BpmnModdle();

export async function parseMetadata(file: File): Promise<ParsedBpmn> {
  const xml = await file.text();

  const result: any = await moddle.fromXML(xml);
  const rootElement = result.rootElement;

  const processElement = rootElement.rootElements?.find((el: any) => el.$type === 'bpmn:Process');

  if (!processElement) {
    throw new Error('Không tìm thấy định nghĩa quy trình trong file!');
  }

  return {
    processId: processElement.id,
  };
}
