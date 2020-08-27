export default (requestUpdate, dragEvent, projection, initialScale) => {
  const canvas = document.querySelector('canvas')

  function onDrag({ movementX: x, movementY: y }) {
    dragEvent('start')
    const rotate = projection.rotate()
    const k = 90 / projection.scale()
    const next = [rotate[0] + x * k, rotate[1] - y * k]
    next[1] = Math.max(Math.min(next[1], 60), -60)
    projection.rotate(next)
    dragEvent('dir', [x, y])
    if (Math.abs(next[0] - rotate[0]) + Math.abs(next[1] - rotate[1]) > 0)
      requestUpdate()
  }

  canvas.addEventListener('mousedown', () => {
    window.addEventListener('mousemove', onDrag, { passive: true })
  })
  ;['mouseup', 'mouseleave'].forEach((event) => {
    canvas.addEventListener(event, () => {
      window.removeEventListener('mousemove', onDrag)
      dragEvent('stop')
    })
  })

  function onZoom(e) {
    const scale = projection.scale()
    let next = scale - (e.deltaY / 750) * scale
    if (next < 0.5 * initialScale) {
      next = 0.5 * initialScale
      e.preventDefault()
    } else if (next > 4 * initialScale) {
      next = 4 * initialScale
      e.preventDefault()
    }
    projection.scale(next)
    requestUpdate()
  }

  canvas.addEventListener('mousewheel', onZoom)
}
