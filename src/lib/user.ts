import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  hashedPassword: string; // 필수 필드로 변경 (undefined 제거)
  isAdmin?: boolean; // 관리자 권한 필드 추가
  createdAt: Date;
  updatedAt?: Date;
}

// 사용자 생성 (이메일 회원가입용)
export async function createUser(email: string, name: string, password: string, isAdmin: boolean = false): Promise<User> {
  try {
    // 1. 이메일 중복 체크
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 2. 패스워드 해싱
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 3. 사용자 ID 생성 (안전한 UUID 사용)
    const id = `user_${randomUUID()}`;
    
    const userData = {
      id,
      email,
      name,
      password: hashedPassword, // 기존 테이블의 'password' 컬럼 사용
      is_admin: isAdmin, // 관리자 권한 추가
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 4. Supabase users 테이블에 저장
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Supabase 사용자 생성 실패:', error);
      throw new Error('회원가입 처리 중 오류가 발생했습니다.');
    }

    // 5. User 인터페이스 형태로 반환
    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      hashedPassword: data.password, // 기존 테이블의 'password' 컬럼
      isAdmin: data.is_admin || false, // 관리자 권한 추가
      createdAt: new Date(data.created_at)
    };

    console.log('✅ 사용자 생성 완료:', { email, name });
    return user;

  } catch (error) {
    console.error('사용자 생성 실패:', error);
    throw error;
  }
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('이메일로 사용자 조회 실패:', error);
      return null;
    }

    if (!data || !data.password) {
      return null; // password가 없으면 null 반환
    }

    // User 인터페이스 형태로 변환
    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      hashedPassword: data.password, // 기존 테이블의 'password' 컬럼
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };

    return user;

  } catch (error) {
    console.error('getUserByEmail 오류:', error);
    return null;
  }
}

// 관리자 계정 생성 또는 업데이트 함수
export async function createOrUpdateAdmin(): Promise<User> {
  const adminEmail = 'naviadmin@navidocent.com';
  const adminName = 'NaviAdmin';
  const adminPassword = 'naviadmin1134';

  try {
    // 기존 관리자 계정 확인
    const existingAdmin = await getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log('✅ 관리자 계정이 이미 존재합니다:', adminEmail);
      
      // 관리자 권한이 없다면 업데이트
      if (!existingAdmin.isAdmin) {
        const { data, error } = await supabase
          .from('users')
          .update({ 
            is_admin: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAdmin.id)
          .select()
          .single();

        if (error) {
          console.error('관리자 권한 업데이트 실패:', error);
          throw new Error('관리자 권한 업데이트 실패');
        }

        const updatedUser: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          hashedPassword: data.password,
          isAdmin: true,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        console.log('✅ 관리자 권한 업데이트 완료');
        return updatedUser;
      }
      
      return existingAdmin;
    }

    // 새 관리자 계정 생성
    console.log('🔧 새 관리자 계정 생성 중...');
    const adminUser = await createUser(adminEmail, adminName, adminPassword, true);
    console.log('✅ 관리자 계정 생성 완료:', { email: adminEmail, name: adminName });
    
    return adminUser;

  } catch (error) {
    console.error('❌ 관리자 계정 생성/업데이트 실패:', error);
    throw error;
  }
}

// ID로 사용자 조회
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('ID로 사용자 조회 실패:', error);
      return null;
    }

    if (!data || !data.password) {
      return null; // password가 없으면 null 반환
    }

    // User 인터페이스 형태로 변환
    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      hashedPassword: data.password, // 기존 테이블의 'password' 컬럼
      isAdmin: data.is_admin || false, // 관리자 권한 추가
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };

    return user;

  } catch (error) {
    console.error('getUserById 오류:', error);
    return null;
  }
}

// 패스워드 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('패스워드 검증 실패:', error);
    return false;
  }
}

// 사용자 정보 업데이트
export async function updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User | null> {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (!data || !data.password) {
      return null; // password가 없으면 null 반환
    }

    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      hashedPassword: data.password, // 기존 테이블의 'password' 컬럼
      isAdmin: data.is_admin || false, // 관리자 권한 추가
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    return user;

  } catch (error) {
    console.error('updateUser 오류:', error);
    return null;
  }
}

// 사용자 삭제
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('사용자 삭제 실패:', error);
      return false;
    }

    console.log('✅ 사용자 삭제 완료:', id);
    return true;

  } catch (error) {
    console.error('deleteUser 오류:', error);
    return false;
  }
}