import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://neondb_owner:npg_ZudtxRcM29Ob@ep-round-violet-aco3s82l-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  },
});