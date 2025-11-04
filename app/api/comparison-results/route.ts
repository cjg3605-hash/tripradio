import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'test-v1-v2-results.json');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          message: '테스트 결과 파일을 찾을 수 없습니다. 테스트가 진행 중일 수 있습니다.',
          tests: [],
          timestamp: null
        },
        { status: 404 }
      );
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(
      {
        success: true,
        ...data
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error reading comparison results:', error);
    return NextResponse.json(
      {
        success: false,
        message: `오류: ${error.message}`,
        tests: [],
        timestamp: null
      },
      { status: 500 }
    );
  }
}
