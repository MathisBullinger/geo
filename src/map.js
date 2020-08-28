import * as d3 from 'd3'
import microstates from '../data/microstates.json'

export const projection = d3
  .geoOrthographic()
  .scale(250)
  .center([0, 0])
  .rotate([0, -30])

export let data

export async function init() {
  data = await d3.json(
    'https://raw.githubusercontent.com/michael-keith/mps_interests/master/view/js/charts/data/world_map.json'
  )
  data.features = [
    ...data.features,
    ...microstates.map(({ name, iso, coords: [lat, long] }) => ({
      type: 'Feature',
      id: iso,
      properties: { name, microstate: true },
      geometry: d3.geoCircle().center([long, lat]).radius(0.35)(),
    })),
  ]
  return {
    data,
    projection,
  }
}
