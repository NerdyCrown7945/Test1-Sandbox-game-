const seasons = ['spring', 'summer', 'fall', 'winter'];

export function createClimate() {
  return {
    globalTemperature: 22,
    rainfall: 0.3,
    humidity: 0.45,
    toxicityLevel: 0.12,
    season: 'spring',
    seasonTimer: 0,
    event: null,
    eventTimer: 0
  };
}

export const CLIMATE_EVENTS = [
  { id: 'drought', name: '가뭄', impact: '강수량 감소, 식물 성장 둔화, 수분 의존 생물 스트레스 증가' },
  { id: 'storm', name: '폭우', impact: '강수량 급증, 토양 유실 가능, 수생 생물 보너스' },
  { id: 'volcano', name: '화산 폭발', impact: '온도 급상승, 독성 증가, 생명체 대량 피해 위험' },
  { id: 'acid_rain', name: '산성비', impact: '습도와 독성 증가, 민감 종 체력 감소' },
  { id: 'plague', name: '전염병', impact: '개체군 체력 저하, 생존률 급락, 내성 개체 선별' }
];

export function updateClimate(climate, dt) {
  climate.seasonTimer += dt;
  if (climate.seasonTimer > 20) {
    climate.seasonTimer = 0;
    const idx = (seasons.indexOf(climate.season) + 1) % seasons.length;
    climate.season = seasons[idx];
  }

  const seasonProfile = {
    spring: { temp: 20, rain: 0.5, humidity: 0.55 },
    summer: { temp: 30, rain: 0.3, humidity: 0.45 },
    fall: { temp: 16, rain: 0.4, humidity: 0.5 },
    winter: { temp: 6, rain: 0.2, humidity: 0.35 }
  };

  const target = seasonProfile[climate.season];
  climate.globalTemperature += (target.temp - climate.globalTemperature) * 0.02;
  climate.rainfall += (target.rain - climate.rainfall) * 0.02;
  climate.humidity += (target.humidity - climate.humidity) * 0.02;

  if (!climate.event && Math.random() < 0.003) {
    climate.event = CLIMATE_EVENTS[Math.floor(Math.random() * CLIMATE_EVENTS.length)].id;
    climate.eventTimer = 0;
  }

  if (climate.event) {
    climate.eventTimer += dt;
    applyEvent(climate);
    if (climate.eventTimer > 8) {
      climate.event = null;
      climate.eventTimer = 0;
    }
  }
}

function applyEvent(climate) {
  if (climate.event === 'drought') {
    climate.rainfall = Math.max(0, climate.rainfall - 0.02);
    climate.humidity = Math.max(0, climate.humidity - 0.02);
  } else if (climate.event === 'storm') {
    climate.rainfall = Math.min(1, climate.rainfall + 0.05);
  } else if (climate.event === 'volcano') {
    climate.globalTemperature += 0.25;
    climate.toxicityLevel = Math.min(1, climate.toxicityLevel + 0.02);
  } else if (climate.event === 'acid_rain') {
    climate.toxicityLevel = Math.min(1, climate.toxicityLevel + 0.03);
    climate.humidity = Math.min(1, climate.humidity + 0.02);
  } else if (climate.event === 'plague') {
    climate.toxicityLevel = Math.min(1, climate.toxicityLevel + 0.015);
  }
}
