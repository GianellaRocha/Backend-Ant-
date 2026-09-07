import { Inject } from '@nestjs/common';

type EntityClass = { name: string };

export function InjectRepository(
  entity: EntityClass,
  dataSource?: string,
): any {
  const prefix = typeof dataSource === 'undefined' ? '' : `${dataSource}_`;
  return Inject(`${prefix}${entity.name}Repository`);
}
