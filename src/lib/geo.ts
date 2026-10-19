import { Vector3 } from "three";

/**
 * Lat/lng → point on a sphere, matching three.js SphereGeometry's
 * equirectangular UV layout (lng −180 at u=0).
 */
export function latLngToVector3(lat: number, lng: number, radius = 1, target = new Vector3()) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Points along the great circle between two surface points, lifted into an
 * arc whose height grows with distance so long-haul routes read clearly.
 */
export function greatCircleArc(from: Vector3, to: Vector3, radius = 1, segments = 64) {
  const a = from.clone().normalize();
  const b = to.clone().normalize();
  const angle = a.angleTo(b);
  const lift = 0.06 + angle * 0.14;
  const sinA = Math.sin(angle);
  const points: Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // spherical linear interpolation
    const p =
      sinA < 1e-6
        ? a.clone()
        : a
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / sinA)
            .add(b.clone().multiplyScalar(Math.sin(t * angle) / sinA));
    const h = radius * (1 + lift * Math.sin(Math.PI * t));
    points.push(p.normalize().multiplyScalar(h));
  }
  return points;
}
