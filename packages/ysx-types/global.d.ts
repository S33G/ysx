/// <reference types="ysx-types" />

declare namespace YSX {
  interface ComponentMetadata {
    version?: string;
    name?: string;
    description?: string;
  }

  interface TypeDefinitions {
    props?: string;
    state?: string;
  }

  interface HookDefinition {
    useState?: {
      variable: string;
      initialValue: any;
    };
    useEffect?: {
      dependencies?: string[];
      effect?: string;
    };
    useCallback?: {
      variable: string;
      dependencies?: string[];
      callback: string;
    };
    useMemo?: {
      variable: string;
      dependencies?: string[];
      compute: string;
    };
  }

  interface ElementNode {
    [tagName: string]: ElementConfig;
  }

  interface ElementConfig {
    children?: ElementNode | ElementNode[] | string;
    [key: string]: any;
  }

  interface YSXDocument {
    version?: string;
    name?: string;
    description?: string;
    types?: TypeDefinitions;
    props?: Record<string, any>;
    state?: Record<string, any>;
    hooks?: HookDefinition[];
    render: ElementNode;
  }
}

export = YSX;
export as namespace YSX;
