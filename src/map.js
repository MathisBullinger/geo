import * as d3 from 'd3'

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
  return {
    data,
    projection,
  }
}
