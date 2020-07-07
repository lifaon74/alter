import { Constructor } from '@lifaon/class-factory';

const SERVICES: WeakMap<Constructor, Map<string, any>> = new WeakMap<Constructor, Map<string, any>>();

export const DEFAULT_SERVICE_NAME: string = 'default';

export function LoadService<TConstructor extends Constructor>(ctor: TConstructor, name: string = DEFAULT_SERVICE_NAME): InstanceType<TConstructor> {
  let serviceNameToServiceInstanceMap: Map<string, any>;
  if (SERVICES.has(ctor)) {
    serviceNameToServiceInstanceMap = SERVICES.get(ctor) as Map<string, any>;
  } else {
    serviceNameToServiceInstanceMap = new Map<string, any>();
    SERVICES.set(ctor, serviceNameToServiceInstanceMap);
  }

  let instance: InstanceType<TConstructor>;
  if (serviceNameToServiceInstanceMap.has(name)) {
    instance = serviceNameToServiceInstanceMap.get(name) as InstanceType<TConstructor>;
  } else {
    instance = new ctor();
    serviceNameToServiceInstanceMap.set(name, instance);
  }

  if ((instance as any) instanceof ctor) {
    return instance;
  } else {
    serviceNameToServiceInstanceMap.delete(name);
    throw new Error(`Instance has a different type than constructor`);
  }
}

export function RemoveService(ctor: Constructor, name: string = DEFAULT_SERVICE_NAME): void {
  let serviceNameToServiceInstanceMap: Map<string, any>;
  if (SERVICES.has(ctor)) {
    serviceNameToServiceInstanceMap = SERVICES.get(ctor) as Map<string, any>;
  } else {
    serviceNameToServiceInstanceMap = new Map<string, any>();
    SERVICES.set(ctor, serviceNameToServiceInstanceMap);
  }

  serviceNameToServiceInstanceMap.delete(name);

  if (serviceNameToServiceInstanceMap.size === 0) {
    SERVICES.delete(ctor);
  }
}

