import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  hashedPassword: string;
  createdAt: Date;
}

// 사용자 생성
export async function createUser(email: string, name: string, password: string): Promise<User> {
  // 이메일 중복 체크
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  // 패스워드 해싱
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // 사용자 ID 생성
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const user: User = {
    id,
    email,
    name,
    hashedPassword,
    createdAt: new Date()
  };

  try {
    // Vercel KV에 사용자 저장
    await kv.hset(`user:${id}`, user as unknown as Record<string, unknown>);
    await kv.set(`email:${email}`, id); // 이메일로 ID 조회용
    
    return user;
  } catch (error) {
    console.error('Vercel KV에 사용자 저장 실패:', error);
    // KV 실패 시 메모리 캐시에 저장
    const memoryCache = global as any;
    if (!memoryCache.users) memoryCache.users = new Map();
    if (!memoryCache.emailToId) memoryCache.emailToId = new Map();
    
    memoryCache.users.set(id, user);
    memoryCache.emailToId.set(email, id);
    
    return user;
  }
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Vercel KV에서 조회
    const userId = await kv.get(`email:${email}`);
    if (!userId) return null;
    
    const user = await kv.hgetall(`user:${userId}`) as User | null;
    return user;
  } catch (error) {
    console.error('Vercel KV에서 사용자 조회 실패:', error);
    // KV 실패 시 메모리 캐시에서 조회
    const memoryCache = global as any;
    if (!memoryCache.emailToId) return null;
    
    const userId = memoryCache.emailToId.get(email);
    if (!userId) return null;
    
    return memoryCache.users?.get(userId) || null;
  }
}

// ID로 사용자 조회
export async function getUserById(id: string): Promise<User | null> {
  try {
    // Vercel KV에서 조회
    const user = await kv.hgetall(`user:${id}`) as User | null;
    return user;
  } catch (error) {
    console.error('Vercel KV에서 사용자 조회 실패:', error);
    // KV 실패 시 메모리 캐시에서 조회
    const memoryCache = global as any;
    return memoryCache.users?.get(id) || null;
  }
}

// 패스워드 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 