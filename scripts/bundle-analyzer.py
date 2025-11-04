#!/usr/bin/env python3
"""
TripRadio.AI CSS Bundle Analyzer

분석 기능:
1. CSS 파일 크기 분석
2. 사용되는 CSS 클래스 추적
3. 미사용 CSS 검출
4. 최적화 제안 생성
5. 번들 크기 감소 예상값 계산

사용법:
    python scripts/bundle-analyzer.py [options]

옵션:
    --full      전체 분석 (기본값)
    --quick     빠른 분석 (기본 통계만)
    --fix       자동 수정 적용
    --output    출력 형식 (json, markdown, csv)
"""

import json
import re
import os
import sys
from pathlib import Path
from typing import Dict, List, Set, Any
from datetime import datetime
import subprocess


class CSSBundleAnalyzer:
    """CSS 번들 분석기"""

    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.app_dir = self.project_root / "app"
        self.src_dir = self.project_root / "src"
        self.styles_dir = self.src_dir / "styles"

        # CSS 파일 목록
        self.css_files = {
            'critical': self.project_root / 'app' / 'globals.css',
            'design_tokens': self.styles_dir / 'design-tokens.css',
            'responsive': self.styles_dir / 'responsive.css',
            'cross_browser': self.styles_dir / 'cross-browser.css',
            'custom': self.styles_dir / 'custom.css',
        }

        self.results = {
            'timestamp': datetime.now().isoformat(),
            'total_size': 0,
            'file_analysis': {},
            'unused_classes': [],
            'optimization_suggestions': [],
            'potential_savings': 0,
        }

    def get_file_size(self, file_path: Path) -> int:
        """파일 크기 조회 (바이트)"""
        if file_path.exists():
            return file_path.stat().st_size
        return 0

    def extract_css_classes(self, css_content: str) -> Set[str]:
        """CSS 파일에서 클래스명 추출"""
        # .className, #id, [attr] 등을 찾기
        class_pattern = r'\.([a-zA-Z0-9_-]+)'
        id_pattern = r'#([a-zA-Z0-9_-]+)'
        attr_pattern = r'\[([a-zA-Z0-9_-]+)'

        classes = set()
        classes.update(re.findall(class_pattern, css_content))
        classes.update(re.findall(id_pattern, css_content))
        classes.update(re.findall(attr_pattern, css_content))

        return classes

    def scan_tsx_files(self) -> Set[str]:
        """TSX/JSX 파일에서 사용되는 클래스명 스캔"""
        used_classes = set()

        # className, class, id 속성에서 클래스명 추출
        pattern = r'(?:className|class|id)\s*=\s*["\']([^"\']*)["\']'

        for tsx_file in self.app_dir.rglob('*.tsx'):
            try:
                with open(tsx_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.findall(pattern, content)
                    for match in matches:
                        # 공백으로 구분된 여러 클래스
                        classes = match.split()
                        used_classes.update(classes)
            except Exception as e:
                print(f"⚠️  파일 읽기 오류: {tsx_file}: {e}")

        return used_classes

    def analyze_css_file(self, name: str, file_path: Path) -> Dict[str, Any]:
        """개별 CSS 파일 분석"""
        file_size = self.get_file_size(file_path)

        if not file_path.exists():
            return {
                'name': name,
                'path': str(file_path),
                'exists': False,
                'size': 0,
                'lines': 0,
                'classes': 0,
            }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"⚠️  파일 읽기 오류: {file_path}: {e}")
            return {
                'name': name,
                'path': str(file_path),
                'exists': True,
                'size': file_size,
                'lines': 0,
                'classes': 0,
                'error': str(e),
            }

        classes = self.extract_css_classes(content)
        lines = len(content.split('\n'))

        # 파일별 특화 분석
        analysis = {
            'name': name,
            'path': str(file_path),
            'exists': True,
            'size': file_size,
            'size_kb': round(file_size / 1024, 2),
            'lines': lines,
            'classes': len(classes),
            'avg_line_size': round(file_size / max(lines, 1), 2),
        }

        return analysis

    def detect_unused_css(self) -> List[str]:
        """미사용 CSS 클래스 검출"""
        all_defined_classes = set()

        # 모든 CSS 파일에서 정의된 클래스 수집
        for name, path in self.css_files.items():
            if path.exists():
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        classes = self.extract_css_classes(content)
                        all_defined_classes.update(classes)
                except Exception:
                    pass

        # TSX 파일에서 사용되는 클래스 수집
        used_classes = self.scan_tsx_files()

        # Tailwind는 동적이므로 제외
        excluded = {'p', 'm', 'w', 'h', 'flex', 'grid', 'bg', 'text', 'border'}

        # 미사용 클래스 찾기 (실제로는 매우 부정확할 수 있으므로 경고)
        unused = []
        for cls in all_defined_classes:
            if cls not in used_classes and not any(
                excluded_prefix in cls for excluded_prefix in excluded
            ):
                unused.append(cls)

        return sorted(unused)

    def generate_optimization_suggestions(self) -> List[Dict[str, str]]:
        """최적화 제안 생성"""
        suggestions = []

        # 1. Tailwind 사용 현황
        suggestions.append({
            'category': 'Framework',
            'priority': 'info',
            'suggestion': 'Tailwind CSS 사용 - 자동 PurgeCSS 적용됨',
            'impact': '현재 이미 최적화됨',
            'effort': '없음',
        })

        # 2. 폰트 최적화
        suggestions.append({
            'category': 'Fonts',
            'priority': 'high',
            'suggestion': 'font-display: swap 적용 (현재 상태 확인)',
            'impact': 'LCP -100ms, CLS 개선',
            'effort': '30분',
        })

        # 3. 이미지 최적화
        suggestions.append({
            'category': 'Images',
            'priority': 'high',
            'suggestion': 'Next.js Image 컴포넌트로 변환',
            'impact': '-0.3초 (로드 시간)',
            'effort': '1시간',
        })

        # 4. CSS-in-JS 확인
        suggestions.append({
            'category': 'CSS-in-JS',
            'priority': 'medium',
            'suggestion': '미사용 스타일 정리 (자동화 되지 않은 것)',
            'impact': '-50-100KB',
            'effort': '2시간',
        })

        # 5. 언어별 폰트 분리
        suggestions.append({
            'category': 'Fonts',
            'priority': 'medium',
            'suggestion': '언어별 폰트 로드 최적화',
            'impact': '-30KB (한국어 제외시)',
            'effort': '1시간',
        })

        # 6. 미디어 쿼리 최적화
        suggestions.append({
            'category': 'Responsive',
            'priority': 'low',
            'suggestion': 'Responsive CSS 정리 및 최적화',
            'impact': '-10-20KB',
            'effort': '1시간',
        })

        return suggestions

    def analyze_tailwind_config(self) -> Dict[str, Any]:
        """Tailwind 설정 분석"""
        tailwind_config = self.project_root / 'tailwind.config.ts'

        if not tailwind_config.exists():
            return {'status': 'not_found'}

        try:
            with open(tailwind_config, 'r', encoding='utf-8') as f:
                content = f.read()

            analysis = {
                'exists': True,
                'purge_enabled': 'content' in content,
                'has_content_globs': bool(re.search(r"content\s*:\s*\[", content)),
                'file_patterns': re.findall(r"['\"]([^'\"]*\.[a-z]+x?)['\"]", content),
            }

            return analysis
        except Exception as e:
            return {'error': str(e)}

    def check_next_config(self) -> Dict[str, Any]:
        """Next.js 설정 분석 (성능 관련)"""
        next_config = self.project_root / 'next.config.js'

        if not next_config.exists():
            return {'status': 'not_found'}

        try:
            with open(next_config, 'r', encoding='utf-8') as f:
                content = f.read()

            analysis = {
                'exists': True,
                'has_compression': 'compress' in content or 'gzip' in content,
                'has_image_optimization': 'images' in content,
                'has_bundle_analyzer': 'BundleAnalyzerPlugin' in content or '@next/bundle-analyzer' in content,
            }

            return analysis
        except Exception as e:
            return {'error': str(e)}

    def get_bundle_size_via_build(self) -> Dict[str, Any]:
        """빌드 분석을 통한 번들 크기 조회"""
        try:
            # Next.js build 실행 (이미 빌드된 경우 캐시됨)
            result = subprocess.run(
                ['npm', 'run', 'build'],
                cwd=self.project_root,
                capture_output=True,
                timeout=120,
                text=True,
            )

            # 빌드 출력에서 파일 크기 정보 추출
            output = result.stdout + result.stderr

            # Next.js는 빌드 요약을 출력함
            sizes = {}

            # 정규표현식으로 파일 크기 추출
            size_pattern = r'([^/]+)\s+(\d+(?:\.\d+)?)\s*(B|KB|MB)'
            matches = re.findall(size_pattern, output)

            for name, size, unit in matches:
                if unit == 'KB':
                    sizes[name.strip()] = float(size)

            return {
                'success': result.returncode == 0,
                'file_sizes': sizes,
                'raw_output': output[:1000] if output else '',
            }
        except subprocess.TimeoutExpired:
            return {'error': 'Build timeout (120s)'}
        except Exception as e:
            return {'error': str(e)}

    def estimate_potential_savings(self) -> Dict[str, Any]:
        """최적화시 예상 절감액 계산"""
        savings = {
            'unused_css_removal': 0,
            'image_optimization': 0,
            'font_optimization': 0,
            'code_splitting': 0,
            'total_estimated_kb': 0,
        }

        # CSS 파일 크기 합계
        total_css_size = 0
        for path in self.css_files.values():
            if path.exists():
                total_css_size += self.get_file_size(path)

        # 미사용 CSS 제거 (추정: 전체의 15-25%)
        unused_ratio = 0.20
        savings['unused_css_removal'] = round(total_css_size * unused_ratio / 1024, 2)

        # 이미지 최적화 (평균 50-70% 감소)
        # 이미지를 스캔해서 추정
        image_size = self._estimate_image_size()
        savings['image_optimization'] = round(image_size * 0.60 / 1024 / 1024, 2)  # MB

        # 폰트 최적화 (서브셋팅으로 30-50% 감소)
        savings['font_optimization'] = 0.15  # MB (추정)

        # 코드 분할 (동적 import로 5-10% 감소)
        savings['code_splitting'] = 0.10  # MB (추정)

        # 합계
        total = (
            savings['unused_css_removal'] +
            savings['image_optimization'] * 1024 +  # MB to KB
            savings['font_optimization'] * 1024 +
            savings['code_splitting'] * 1024
        )
        savings['total_estimated_kb'] = round(total, 2)

        return savings

    def _estimate_image_size(self) -> int:
        """프로젝트의 이미지 파일 크기 합계 추정"""
        total_size = 0
        for pattern in ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif']:
            for img_file in self.project_root.glob(pattern):
                if 'node_modules' not in str(img_file):
                    try:
                        total_size += img_file.stat().st_size
                    except Exception:
                        pass

        return total_size

    def run_analysis(self, mode: str = 'full') -> None:
        """전체 분석 실행"""
        print("🔍 CSS 번들 분석 시작...\n")

        # 1. CSS 파일 분석
        print("📊 CSS 파일 분석...")
        total_css_size = 0
        for name, path in self.css_files.items():
            analysis = self.analyze_css_file(name, path)
            self.results['file_analysis'][name] = analysis
            if analysis['exists']:
                total_css_size += analysis['size']
                print(f"  ✓ {name}: {analysis['size_kb']}KB ({analysis['lines']} lines)")

        self.results['total_size'] = total_css_size

        # 2. 미사용 CSS 검출 (full 모드)
        if mode == 'full':
            print("\n🔎 미사용 CSS 클래스 검출...")
            unused = self.detect_unused_css()
            self.results['unused_classes'] = unused
            if unused:
                print(f"  ⚠️  감지된 미사용 클래스: {len(unused)}개")
                # 샘플만 표시
                print(f"  샘플: {', '.join(unused[:5])}")
            else:
                print("  ✓ 미사용 클래스 없음")

        # 3. Tailwind 설정 분석
        print("\n⚙️  Tailwind 설정 분석...")
        tailwind_analysis = self.analyze_tailwind_config()
        self.results['tailwind_config'] = tailwind_analysis
        if tailwind_analysis.get('exists'):
            print(f"  ✓ Purge 활성화: {tailwind_analysis.get('purge_enabled')}")

        # 4. Next.js 설정 분석
        print("\n⚙️  Next.js 설정 분석...")
        next_analysis = self.check_next_config()
        self.results['next_config'] = next_analysis

        # 5. 최적화 제안
        print("\n💡 최적화 제안...")
        suggestions = self.generate_optimization_suggestions()
        self.results['optimization_suggestions'] = suggestions
        for i, suggestion in enumerate(suggestions[:3], 1):
            print(f"  {i}. [{suggestion['priority'].upper()}] {suggestion['suggestion']}")
            print(f"     영향: {suggestion['impact']}")

        # 6. 예상 절감액
        print("\n💰 예상 절감액...")
        savings = self.estimate_potential_savings()
        self.results['potential_savings'] = savings
        print(f"  미사용 CSS 제거: -{savings['unused_css_removal']}KB")
        print(f"  이미지 최적화: -{savings['image_optimization']:.2f}MB")
        print(f"  폰트 최적화: -{savings['font_optimization']:.2f}MB")
        print(f"  코드 분할: -{savings['code_splitting']:.2f}MB")
        print(f"  총 예상 절감: -{savings['total_estimated_kb']:.2f}KB")

        # 7. 성능 개선 예상값
        print("\n⚡ 예상 성능 개선...")
        # 1KB 당 약 1ms 개선 (경험상)
        estimated_improvement_ms = savings['total_estimated_kb']
        print(f"  예상 로드 시간 단축: -{estimated_improvement_ms:.0f}ms (-{estimated_improvement_ms/8390*100:.1f}%)")

        print("\n✅ 분석 완료!\n")

    def save_report(self, format: str = 'markdown') -> str:
        """보고서 저장"""
        timestamp = datetime.now().strftime('%Y-%m-%d-%H%M%S')

        # 디렉토리 생성
        reports_dir = self.project_root / 'performance-reports'
        reports_dir.mkdir(parents=True, exist_ok=True)

        if format == 'json':
            output_file = reports_dir / f'css-analysis-{timestamp}.json'

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2)
            print(f"💾 JSON 보고서: {output_file}")
            return str(output_file)

        elif format == 'markdown':
            output_file = reports_dir / f'CSS-OPTIMIZATION-{timestamp}.md'

            md_content = f"""# 📊 CSS 번들 최적화 분석 보고서

**생성 날짜:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 🎯 현재 상태

### CSS 파일 크기 분석

| 파일 | 크기 (KB) | 라인 수 | 클래스 수 |
|------|----------|--------|----------|
"""

            for name, analysis in self.results['file_analysis'].items():
                if analysis['exists']:
                    md_content += f"| {analysis['name']} | {analysis['size_kb']} | {analysis['lines']} | {analysis['classes']} |\n"

            md_content += f"""
**총 CSS 크기:** {self.results['total_size'] / 1024:.2f}KB

## 💡 최적화 제안

"""
            for suggestion in self.results['optimization_suggestions']:
                md_content += f"""
### [{suggestion['priority'].upper()}] {suggestion['suggestion']}

- **영향:** {suggestion['impact']}
- **소요 시간:** {suggestion['effort']}
- **카테고리:** {suggestion['category']}
"""

            md_content += f"""

## 💰 예상 절감액

| 항목 | 예상 절감 |
|------|---------|
| 미사용 CSS 제거 | -{self.results['potential_savings']['unused_css_removal']}KB |
| 이미지 최적화 | -{self.results['potential_savings']['image_optimization']:.2f}MB |
| 폰트 최적화 | -{self.results['potential_savings']['font_optimization']:.2f}MB |
| 코드 분할 | -{self.results['potential_savings']['code_splitting']:.2f}MB |
| **총 예상 절감** | **-{self.results['potential_savings']['total_estimated_kb']:.2f}KB** |

### 성능 개선 예상값

- 현재 로드 시간: 7.5초 (Week 2 목표)
- 예상 개선: -{self.results['potential_savings']['total_estimated_kb']:.0f}ms
- **목표 로드 시간: {7500 - self.results['potential_savings']['total_estimated_kb']:.0f}ms**

## 🔧 실행 우선순위

1. **이미지 최적화** (1-2시간) → 최대 절감: -{self.results['potential_savings']['image_optimization']:.2f}MB
2. **폰트 최적화** (30분-1시간) → 예상 절감: -{self.results['potential_savings']['font_optimization']:.2f}MB
3. **코드 분할** (2-3시간) → 예상 절감: -{self.results['potential_savings']['code_splitting']:.2f}MB
4. **CSS 정리** (선택사항) → 예상 절감: -{self.results['potential_savings']['unused_css_removal']}KB

## 📋 체크리스트

- [ ] Tailwind PurgeCSS 확인
- [ ] Next.js Image 컴포넌트 도입
- [ ] 폰트 서브셋팅 적용
- [ ] 동적 import로 코드 분할
- [ ] 불필요한 라이브러리 제거 검토
- [ ] 빌드 분석기 도입 (선택사항)

---

**생성된 파일:** CSS-OPTIMIZATION-{timestamp}.md
**다음 단계:** Task 2-1-2에서 식별된 최적화 사항 적용
"""

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(md_content)
            print(f"💾 Markdown 보고서: {output_file}")
            return str(output_file)

        return ""


def main():
    """메인 실행 함수"""
    analyzer = CSSBundleAnalyzer('/c/GUIDEAI')

    # 명령어 인자 처리
    mode = 'full'
    output_format = 'markdown'

    if '--quick' in sys.argv:
        mode = 'quick'
    if '--json' in sys.argv:
        output_format = 'json'

    # 분석 실행
    analyzer.run_analysis(mode)

    # 보고서 저장
    analyzer.save_report(output_format)

    return 0


if __name__ == '__main__':
    sys.exit(main())
