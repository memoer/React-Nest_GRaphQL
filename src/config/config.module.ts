import { ConfigModule } from '@nestjs/config';
import { databaseConfigAs, appConfigAs } from './registerAs';

export default ConfigModule.forRoot({
  isGlobal: true,
  // .env -> shared environment variables
  envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
  load: [databaseConfigAs, appConfigAs],
});
