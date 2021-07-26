import { NgModuleRef, NgModule } from '@angular/core';
import { ForeignComponent, BaseComponentProps } from 'piral-core';
import { createExtension } from './extension';
import { enqueue } from './queue';
import { bootstrap } from './bootstrap';

let next = ~~(Math.random() * 10000);

export interface NgConverterOptions {
  /**
   * Defines the name of the extension component.
   * @default extension-component
   */
  selector?: string;
  /**
   * Defines the name of the root element.
   * @default slot
   */
  rootName?: string;
  /**
   * Defines how the next ID for mounting is selected.
   * By default a random number is used in conjunction with a `ng-` prefix.
   */
  selectId?(): string;
  /**
   * Defines the module options to apply when bootstrapping a component.
   */
  moduleOptions?: Omit<NgModule, 'boostrap'>;
}

export function createConverter(config: NgConverterOptions = {}) {
  const {
    selectId = () => `ng-${next++}`,
    moduleOptions = {},
    rootName = 'slot',
    selector = 'extension-component',
  } = config;
  const Extension = createExtension(rootName, selector);
  const convert = <TProps extends BaseComponentProps>(component: any): ForeignComponent<TProps> => {
    let result: Promise<void | NgModuleRef<any>> = Promise.resolve();
    let active = true;

    return {
      mount(el, props, ctx) {
        const id = selectId();
        result = enqueue(() => active && bootstrap(ctx, props, component, el, id, moduleOptions, Extension));
      },
      unmount() {
        active = false;
        result.then((ngMod) => ngMod && ngMod.destroy());
      },
    };
  };
  convert.Extension = Extension;
  return convert;
}
