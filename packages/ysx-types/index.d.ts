declare module '*.ysx' {
  import { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module '*.ysx' {
  import { FC } from 'react';
  const component: FC<any>;
  export = component;
}
