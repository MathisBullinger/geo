import * as d3 from 'd3'
import world from '../../data/world.json'
import microstates from '../../data/microstates.json'

export const projection = d3
  .geoOrthographic()
  .scale(250)
  .center([0, 0])
  .rotate([0, -30])

export const data = {
  ...world,
  features: [
    ...world.features,
    ...microstates.map(({ name, iso, coords: [lat, long] }) => ({
      type: 'Feature',
      id: iso,
      properties: { name, microstate: true },
      geometry: d3.geoCircle().center([long, lat]).radius(0.35)(),
    })),
  ],
}
