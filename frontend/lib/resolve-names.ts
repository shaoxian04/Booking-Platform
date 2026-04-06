import * as api from "./api";

const providerNameCache = new Map<string, string>();
const serviceNameCache = new Map<string, string>();
const providerServicesCache = new Map<string, Map<string, string>>();

export async function resolveProviderNames(ids: string[]): Promise<Map<string, string>> {
  const uncached = ids.filter((id) => !providerNameCache.has(id));

  await Promise.allSettled(
    uncached.map(async (id) => {
      try {
        const provider = await api.getProviderByIdPublic(id);
        providerNameCache.set(id, provider.providerName);
      } catch {
        providerNameCache.set(id, "Unknown provider");
      }
    })
  );

  const result = new Map<string, string>();
  for (const id of ids) {
    result.set(id, providerNameCache.get(id) ?? "Unknown provider");
  }
  return result;
}

export async function resolveServiceName(serviceId: string, providerId: string): Promise<string> {
  const cacheKey = `${providerId}:${serviceId}`;
  if (serviceNameCache.has(cacheKey)) {
    return serviceNameCache.get(cacheKey)!;
  }

  if (!providerServicesCache.has(providerId)) {
    try {
      const services = await api.getServicesByProviderId(providerId);
      const serviceMap = new Map<string, string>();
      for (const svc of services) {
        serviceMap.set(svc.serviceId, svc.serviceName);
        serviceNameCache.set(`${providerId}:${svc.serviceId}`, svc.serviceName);
      }
      providerServicesCache.set(providerId, serviceMap);
    } catch {
      serviceNameCache.set(cacheKey, "Unknown service");
      return "Unknown service";
    }
  }

  const name = serviceNameCache.get(cacheKey) ?? "Unknown service";
  return name;
}

export async function resolveAppointmentNames(
  appointments: Array<{ serviceId: string; providerId: string }>
): Promise<{ providerNames: Map<string, string>; serviceNames: Map<string, string> }> {
  const providerIds = [...new Set(appointments.map((a) => a.providerId))];
  const providerNames = await resolveProviderNames(providerIds);

  const serviceNames = new Map<string, string>();
  await Promise.allSettled(
    appointments.map(async ({ serviceId, providerId }) => {
      const name = await resolveServiceName(serviceId, providerId);
      serviceNames.set(serviceId, name);
    })
  );

  return { providerNames, serviceNames };
}
