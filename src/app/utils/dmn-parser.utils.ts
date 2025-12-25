import DmnModdle from 'dmn-moddle';

export interface ParsedDmn {
  decisionName: string;
  hitPolicy: string;
}

const moddle = new DmnModdle();

export async function parseDmnMetadata(file: File): Promise<ParsedDmn> {
  const xml = await file.text();

  const result: any = await moddle.fromXML(xml);
  const rootElement = result.rootElement;

  const decisionElement = rootElement.drgElement?.find((el: any) => el.$type === 'dmn:Decision');

  if (!decisionElement) {
    throw new Error('Không tìm thấy bảng quyết định trong file DMN!');
  }

  const decisionTable = decisionElement.decisionTable;

  return {
    decisionName: decisionElement.name || decisionElement.id,
    hitPolicy: decisionTable?.hitPolicy || 'UNIQUE',
  };
}
