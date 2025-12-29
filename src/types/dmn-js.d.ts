declare module 'dmn-js/lib/Modeler' {
  export default class DmnModeler {
    constructor(options?: {
      container?: HTMLElement | string;
      keyboard?: { bindTo?: HTMLElement };
      drd?: {
        propertiesPanel?: {
          parent?: HTMLElement | string;
        };
      };
      decisionTable?: {
        propertiesPanel?: {
          parent?: HTMLElement | string;
        };
      };
      literalExpression?: {
        propertiesPanel?: {
          parent?: HTMLElement | string;
        };
      };
      additionalModules?: any[];
    });

    importXML(xml: string): Promise<{ warnings: any[] }>;
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>;
    get(name: string): any;
    on(event: string, callback: (context: any) => void): void;
    destroy(): void;
  }
}

declare module 'dmn-js-properties-panel' {
  export const DmnPropertiesPanelModule: any;
  export const DmnPropertiesProviderModule: any;
}
