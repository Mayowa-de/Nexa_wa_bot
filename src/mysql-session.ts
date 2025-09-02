import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const SESSION_DIR = join(process.cwd(), 'sessions');

function ensureSessionDir() {
    if (!existsSync(SESSION_DIR)) {
        mkdirSync(SESSION_DIR);
    }
}

export async function saveSession(sessionId: string, data: any) {
    ensureSessionDir();
    writeFileSync(join(SESSION_DIR, `${sessionId}.json`), JSON.stringify(data));
}

export async function loadSession(sessionId: string): Promise<any | null> {
    ensureSessionDir();
    const filePath = join(SESSION_DIR, `${sessionId}.json`);
    if (existsSync(filePath)) {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    }
    return null;
}
