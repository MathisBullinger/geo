import { data } from './map'
import { ptInPoly } from './collision'

export default (
  requestUpdate,
  dragEvent,
  projection,
  initialScale,
  pathGenerator,
  onHover
) => {
  const canvas = document.querySelector('canvas')
  const countries = data.features

  let mod = true
  let _bounds
  function bounds() {
    if (!mod) return _bounds
    _bounds = genBounds()
    mod = false
    return _bounds
  }

  let isMouseDown = false
  let lastHover

  function onMouseMove(e) {
    if (isMouseDown) return void onDrag(e)
    let { x, y } = e
    x *= devicePixelRatio
    y *= devicePixelRatio
    const hits = bounds().filter(
      ({ bounds: [p1, p2] }) =>
        p1[0] <= x && p1[1] <= y && p2[0] >= x && p2[1] >= y
    )
    if (!hits.length) return

    const pos = projection.invert([x, y])
    const hit = hits.find(({ d }) =>
      (d.geometry.type === 'MultiPolygon'
        ? d.geometry.coordinates.flat()
        : d.geometry.coordinates
      ).some((coords) => ptInPoly(pos, coords))
    )
    if (!hit) {
      if (lastHover) {
        lastHover = undefined
        onHover(null)
      }
      return
    }
    const id = hit.d.id
    if (id === lastHover) return
    lastHover = id
    onHover(id)
  }

  function onDrag({ movementX: x, movementY: y }) {
    dragEvent('start')
    const rotate = projection.rotate()
    const k = 90 / projection.scale()
    const next = [rotate[0] + x * k, rotate[1] - y * k]
    next[1] = Math.max(Math.min(next[1], 60), -60)
    projection.rotate(next)
    dragEvent('dir', [x, y])
    if (Math.abs(next[0] - rotate[0]) + Math.abs(next[1] - rotate[1]) > 0) {
      requestUpdate()
      mod = true
    }
  }

  canvas.addEventListener('mousemove', onMouseMove, { passive: true })
  canvas.addEventListener('mousedown', () => {
    isMouseDown = true
  })
  ;['mouseup', 'mouseleave'].forEach((event) => {
    canvas.addEventListener(event, () => {
      isMouseDown = false
      dragEvent('stop')
    })
  })

  const ZOOM = {
    MAX: 5,
    MIN: 1,
  }

  function onZoom(e) {
    const scale = projection.scale()
    let next = scale - (e.deltaY / 750) * scale
    if (next < ZOOM.MIN * initialScale) {
      next = ZOOM.MIN * initialScale
      e.preventDefault()
    } else if (next > ZOOM.MAX * initialScale) {
      next = ZOOM.MAX * initialScale
      e.preventDefault()
    }
    projection.scale(next)
    requestUpdate()
    mod = true
  }

  function genBounds() {
    return countries.map((d) => ({
      bounds: pathGenerator.bounds(d),
      d,
    }))
  }

  canvas.addEventListener('mousewheel', onZoom)
}
