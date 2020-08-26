import * as d3 from 'd3'

let width = window.innerWidth
let height = window.innerHeight

let projection = d3
  .geoOrthographic()
  .scale(250)
  .center([0, 0])
  .rotate([0, -30])
  .translate([width / 2, height / 2])

;(async () => {
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = canvas.offsetWidth * devicePixelRatio
  canvas.height = canvas.offsetHeight * devicePixelRatio

  const pathGenerator = d3.geoPath(projection, ctx)

  const data = await d3.json(
    'https://raw.githubusercontent.com/michael-keith/mps_interests/master/view/js/charts/data/world_map.json'
  )

  const size = Math.min(canvas.width, canvas.height) * 0.9
  projection.scale(size / 2)
  projection.translate([canvas.width / 2, canvas.height / 2])
  const initialScale = projection.scale()

  ctx.strokeStyle = '#111'

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#111'
    const radius = projection.scale()
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2,
      radius,
      radius,
      0,
      0,
      2 * Math.PI
    )
    ctx.fill()
    ctx.fillStyle = '#bbb'
    ctx.beginPath()
    pathGenerator(data)
    ctx.fill()
    ctx.stroke()
  }

  let rendering = false
  let lastRequest = 0
  function startRender() {
    if (rendering) return
    rendering = true
    lastRequest = performance.now()
    const step = () => {
      render()
      requestAnimationFrame(() => {
        if (performance.now() - lastRequest > 200) {
          rendering = false
          return
        }
        step()
      })
    }
    step()
  }

  startRender()

  function onDrag({ movementX: x, movementY: y }) {
    const rotate = projection.rotate()
    const k = 90 / projection.scale()
    projection.rotate([rotate[0] + x * k, rotate[1] - y * k])
    startRender()
  }

  canvas.addEventListener('mousedown', () => {
    window.addEventListener('mousemove', onDrag, { passive: true })
  })
  ;['mouseup', 'mouseleave'].forEach((event) => {
    canvas.addEventListener(event, () => {
      window.removeEventListener('mousemove', onDrag)
    })
  })

  canvas.addEventListener('mousewheel', (e) => {
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
    startRender()
  })
})()
