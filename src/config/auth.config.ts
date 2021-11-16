import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const { API_KEYS: auth } = process.env;
const apiKeys = auth.split(',');

export default registerAs('auth', () => ({ apiKeys }));
