import dns from 'node:dns';
import os from 'node:os';
import path from 'node:path';
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
      binary: {
        downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || path.join(os.tmpdir(), 'mongodb-binaries'),
      },
      instance: {
        dbName: 'homeease',
      },
    });
    uri = memoryServer.getUri();
  }

  try {
    await mongoose.connect(uri!, {
      dbName: 'homeease',
    });
  } catch (err: unknown) {
    const dnsErr = err as { code?: string; syscall?: string };
    const isSrvDnsError =
      !isPlaceholder &&
      uri?.startsWith('mongodb+srv://') &&
      dnsErr?.syscall === 'querySrv' &&
      (dnsErr?.code === 'ECONNREFUSED' || dnsErr?.code === 'ETIMEOUT');

    if (!isSrvDnsError) {
      throw err;
    }

    console.warn(
      '[HomeEase DB] Local DNS refused MongoDB SRV lookup; retrying with Google/Cloudflare DNS (8.8.8.8, 1.1.1.1)...'
    );
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(uri!, {
      dbName: 'homeease',
    });
  }

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
