import { registerAs } from '@nestjs/config';
import config from '../../gtfs.config';

export default registerAs('gtfs-realtime', () => config);
