import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private apiKeys: string[] = process.env.API_KEYS.split(',');

  validateApiKey(apiKey: string): string {
    return this.apiKeys.find((key: string) => apiKey === key);
  }
}
