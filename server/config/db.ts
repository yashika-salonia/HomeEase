import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;
let connected = false;

export async function connectDB(): Promise<void> {
  if (connected && mongoose.connection.readyState === 1) {
    return;
  }

  const configuredUri = process.env.MONGODB_URI?.trim();
  const isPlaceholder =
    !configuredUri ||
    configuredUri.includes('<username>') ||
    configuredUri.includes('MY_MONGODB_URI');

  let uri = configuredUri;

  if (isPlaceholder) {
    console.log('[HomeEase DB] No external MONGODB_URI configured. Starting local MongoDB server...');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'homeease',
      },
    });
    uri = memoryServer.getUri();
  }

  await mongoose.connect(uri!, {
    dbName: 'homeease',
  });

  connected = true;
  console.log(
    `[HomeEase DB] MongoDB connected (${isPlaceholder ? 'embedded local MongoDB' : 'external MongoDB'})`
  );
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  connected = false;
}
