import { API_BASE } from "@/constants/api";

export class ProviderCapacityValidator {
  static async getProviderVehiclesCount(providerId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/providers/vehicles/${providerId}`, {
      credentials: "include"
    });
    if (!res.ok) return 0;
    const txt = await res.text();
    const n = Number(txt);
    return Number.isFinite(n) ? n : 0;
  }

  static async getProviderNetworkPointsCount(providerId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/providers/network-point/${providerId}`, {
      credentials: "include"
    });
    if (!res.ok) return 0;
    const txt = await res.text();
    const n = Number(txt);
    return Number.isFinite(n) ? n : 0;
  }

  static async validateCapacity(providerId: number): Promise<{ isValid: boolean; message?: string }> {
    const have = await this.getProviderVehiclesCount(providerId);
    const nn = await this.getProviderNetworkPointsCount(providerId);
    const required = Math.ceil(1.3 * (nn + 1));

    if (have < required) {
      return {
        isValid: false,
        message: `Provider has only ${have} vehicles but must have ${required} vehicles.`
      };
    }

    return { isValid: true };
  }
}