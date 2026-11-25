const NORTH = 85;
const SOUTH = -60;

export function mapPosition(latitude: number, longitude: number) {
  return {
    left: `${((longitude + 180) / 360) * 100}%`,
    top: `${((NORTH - latitude) / (NORTH - SOUTH)) * 100}%`,
  };
}

export function mapCoordinates(x: number, y: number) {
  return {
    latitude: Number((NORTH - Math.min(1, Math.max(0, y)) * (NORTH - SOUTH)).toFixed(4)),
    longitude: Number((Math.min(1, Math.max(0, x)) * 360 - 180).toFixed(4)),
  };
}
