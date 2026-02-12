# Eco Sandbox Evolution Engine

기존 2D 폴링샌드 게임을 **생태계 + 유전 + 진화 + FSM AI + 기후 이벤트 + (옵션)강화학습** 구조로 재설계한 브라우저 시뮬레이션입니다.

## 1) 전체 아키텍처 설계

### 모듈 구조
- `materials.js`: 재질/지형 데이터, 카테고리, 초기 지형 생성
- `dna.js`: DNA 스키마 생성/교배/돌연변이/표현색
- `lifeforms.js`: 20+ 생명체 종 정의, 개체 스폰
- `ai_fsm.js`: FSM 상태/전이/행동 업데이트
- `climate.js`: 계절/기후 변수/이벤트
- `ecosystem.js`: 먹이사슬 근접 상호작용, 사망→영양 순환, Quadtree, RL(Q값) 모드
- `evolution.js`: 진화 트리, 진화 조건 평가
- `renderer.js`: 월드 렌더링
- `ui.js`: 좌/우 패널, 상단 환경 제어, 하단 디버그 바, 탭 처리
- `engine.js`: 메인 루프, 모듈 통합
- `app.js`: 부트스트랩

### 시스템 흐름
1. `engine`이 월드를 초기화.
2. 프레임마다 `climate` 갱신.
3. 각 개체의 FSM 상태 평가(`ai_fsm`).
4. 상태별 행동 적용 + 생태 상호작용(`ecosystem`).
5. 집계값 기반 진화 조건 판정(`evolution`).
6. `renderer`로 시각화, `ui`로 디버그/FPS/유전자 평균 업데이트.

---

## 2) DNA 구조

```js
{
  speed: 0~100,
  aggression: 0~100,
  intelligence: 0~100,
  reproductionRate: 0~100,
  lifespan: 0~100,
  mutationRate: 0~1,
  dietPreference: enum,
  temperatureTolerance: number,
  waterDependency: number
}
```

### 번식
- 부모 DNA 평균값 기반 유전자 생성
- `mutationRate`로 각 유전자별 돌연변이 확률 적용

### 돌연변이 효과
- 색상 변화(`dnaToColor`)
- 공격성/지능/수명/번식률 변화
- 식성(`dietPreference`) 변이 가능

---

## 3) 생명체 목록 (20종 이상)

1. microbe
2. algae
3. mossling
4. fungoid
5. seedling
6. grazer_mite
7. burrower
8. snailoid
9. pollinator
10. crawler
11. scavenger_beetle
12. school_fish
13. reef_filter
14. glider
15. pack_hunter
16. ambush_stalker
17. apex_predator
18. parasite_worm
19. symbiote_sprite
20. decomposer
21. plankton
22. river_turtle
23. canopy_herbivore

---

## 4) 진화 트리

- `microbe` → `primitive_organism`
- `primitive_organism` → `predator_class`
- `predator_class` → `apex_predator`

### 진화 조건
- 환경 적응 점수(adaptationScore)
- 평균 생존 시간(avgSurvival)
- 최소 개체 수(population)
- N세대 이상 조건 유지(history 기반)

---

## 5) 주요 기후 이벤트 표

| 이벤트 | 영향 |
|---|---|
| 가뭄 (drought) | 강수량/습도 감소, 식물 성장 둔화 |
| 폭우 (storm) | 강수량 급증, 수생 생물 우세 |
| 화산 폭발 (volcano) | 온도 급상승, 독성 증가 |
| 산성비 (acid_rain) | 독성/습도 증가, 민감 종 체력 저하 |
| 전염병 (plague) | 군집 체력 약화, 내성 개체 선별 |

---

## 6) FSM 상태 전이 다이어그램 설명

### States
- Idle
- Wander
- SeekFood
- Flee
- Attack
- Reproduce
- Rest
- Explore

### 핵심 전이
- 위협 감지/체력 저하 → `Flee`
- 배고픔 상승 → `SeekFood`
- 번식 가능 + 짝 근접 + 에너지 충분 → `Reproduce`
- 에너지 부족 → `Rest`
- 고지능 개체(`intelligence > 70`)는 `Explore/SeekFood` 우선 선택

---

## 7) 실행 가능한 코드

```bash
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속.

---

## 8) 테스트 시나리오

1. 좌측 Materials Palette에서 `rich_soil`을 칠하고 우측에서 식물/초식 종을 추가해 개체군 증가 확인
2. 상단 Temperature를 극단값으로 조정 후 저온/고온 내성 종의 생존 차이 확인
3. Rainfall 0에 가까운 상태에서 waterDependency 높은 개체 체력 감소 확인
4. 디버그 탭에서 RL 토글 ON 후 장시간 실행 시 qTable 값 누적 확인
5. 성능 모드를 `Performance`로 변경 시 최대 개체수 캡 적용 확인
6. 하단 바에서 FPS, 개체수, 평균 지능 유전자값, 진화 상태 실시간 갱신 확인

---

## 9) 추가된 상호작용/중력 처리

### 중력 적용 대상
- `gravity=true`로 지정된 재질은 프레임마다 중력 계산을 받습니다.
- 현재 대상: `sand`, `water`, `freshwater`, `saltwater`, `lava`, `toxic_sludge`, `nectar_pool`
- 밀도(`density`)가 높은 재질은 낮은 재질을 아래로 밀어내며 가라앉습니다.

### 개체 ↔ 지형 상호작용
- 수분 지형(`water`, `freshwater`, `saltwater`) 위에서는 갈증/허기 회복 보정
- 고비옥 지형(`fertility > 0.5`) 위의 비육식 개체는 먹이 섭취(허기 감소 + 에너지 증가)
- 위험 지형(`toxic_sludge`, `lava`)은 체력 지속 피해

### 개체 ↔ 개체 상호작용
- 육식 개체가 `Attack` 상태일 때 근접한 타종 개체에 실제 피해 적용
- 사냥 성공 시 포식자는 허기/에너지를 회복
- `Reproduce` 상태에서 같은 종 근접 시 체력 소폭 회복(번식 군집 보정)
