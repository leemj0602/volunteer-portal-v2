import CRM, { ComparisonOperator } from "../crm";

export interface ServiceInfoPack {
  id: string;
  subject: string;
  details: string;
}

interface FetchOptions<T extends string | undefined = undefined> {
  id?: T;
  where?: [string, ComparisonOperator, any][];
  limit?: number;
  page?: number;
  subject?: string;
}

const ServiceInfoPackManager = new class ServiceInfoPackManager {
  private entity = 'Activity';

  async fetch(options?: FetchOptions): Promise<ServiceInfoPack[]>;
  async fetch(options: FetchOptions<string>): Promise<ServiceInfoPack>;

  async fetch<T extends string | undefined>(options?: FetchOptions<T>) {
    const where: [string, ComparisonOperator, any][] = [
      ['activity_type_id:name', '=', 'Service Info Pack']
    ];
    if (options?.id) where.push(["id", "=", options.id]);
    else if (options?.where) where.push(...options.where);
          
    const response = await CRM(this.entity, 'get', {
      where,
      select: ['subject', 'details'],
      limit: options?.limit,
      offset: options?.page && options?.limit ? (options?.page - 1) * options?.limit : 0
    });

    if (options?.id) return response?.data[0] as ServiceInfoPack;
    else return (response?.data ?? []) as ServiceInfoPack[];
  }
}

export default ServiceInfoPackManager;