import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId: "6a02d2983989447500838a5e",
  headers: {
    "api_key": "9cfe17cba67b408e943bd4056e593b9d"
  }
});
