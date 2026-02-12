# 2D 물리 기반 샌드박스 (폴링샌드)

브라우저에서 실행되는 단일 페이지 샌드박스 게임입니다. 20종 이상의 물질과 데이터 기반 상호작용 규칙을 포함합니다.

## 실행 방법

### 방법 1) 파일 직접 열기
1. `index.html`을 브라우저에서 직접 엽니다.

### 방법 2) 로컬 서버
```bash
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속.

## 주요 기능
- 29종 물질 (solid/liquid/gas/energy)
- 브러시 크기 조절, 생성/삭제 모드
- 일시정지/재개, 초기화, 시뮬레이션 속도 조절
- 상호작용 도감(설명 페이지) + 규칙 동기화 렌더링
- 터치/모바일 입력 지원

## 동작 검증 체크리스트
1. `Water`와 `Lava`를 맞닿게 하면 `Stone/Glass`와 `Steam`이 생성되는지 확인
2. `Fire`를 `Wood/Oil/Coal/Alcohol` 근처에 두면 불이 번지고 `Smoke`가 생기는지 확인
3. `Salt`와 `Water`가 `Brine`으로 변하는지 확인
4. `Acid`가 `Metal/Stone`에 닿으면 `Rust` 또는 `Toxic Gas`가 생기는지 확인
5. `Spark`가 `Hydrogen`을 만나면 `Explosion`이 발생하는지 확인
6. `Fire`와 `Water` 접촉 시 `Steam`으로 소화되는지 확인
7. 설명/도감 패널에서 규칙 테이블이 실제 코드 규칙 목록과 동일하게 보이는지 확인
