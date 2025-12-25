import BpmnModdle from 'bpmn-moddle';

export interface ParsedBpmn {
  processName: string;
  tasks: { taskCode: string; taskName: string }[];
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

  const tasks = (processElement.flowElements || [])
    .filter((el: any) => el.$type === 'bpmn:UserTask')
    .map((task: any) => ({
      taskCode: task.id,
      taskName: task.name || task.id,
    }));

  return {
    processName: processElement.name || processElement.id,
    tasks: tasks,
  };
}
