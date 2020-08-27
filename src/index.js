import * as d3 from 'd3'

let projection = d3.geoOrthographic().scale(250).center([0, 0]).rotate([0, -30])

;(async () => {
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  const pathGenerator = d3.geoPath(projection, ctx)

  const data = await d3.json(
    'https://raw.githubusercontent.com/michael-keith/mps_interests/master/view/js/charts/data/world_map.json'
  )

  resize()
  const initialScale = projection.scale()

  let running = false
  let lastRequest = 0
  let dragMoment = false
  let lastDragDir

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

    return performance.now() - lastRequest < 200
  }

  function update() {
    if (!dragMoment || !lastDragDir) return false

    const nextDragDir = lastDragDir.map((v) => v * 0.95)
    const mag = Math.sqrt(nextDragDir.reduce((a, c) => a ** 2 + c, 0))
    if (mag < 0.1) return false
    const rotate = projection.rotate()
    const k = 90 / projection.scale()
    const next = [
      rotate[0] + nextDragDir[0] * k,
      rotate[1] - nextDragDir[1] * k,
    ]
    next[1] = Math.max(Math.min(next[1], 60), -60)
    projection.rotate(next)
    lastDragDir = nextDragDir
    return true
  }

  function startStep() {
    lastRequest = performance.now()
    if (running) return
    running = true

    const step = () => {
      if ([update(), render()].some(Boolean)) requestAnimationFrame(step)
      else {
        running = false
      }
    }
    step()
  }

  startStep()

  function onDrag({ movementX: x, movementY: y }) {
    dragMoment = false
    const rotate = projection.rotate()
    const k = 90 / projection.scale()
    const next = [rotate[0] + x * k, rotate[1] - y * k]
    next[1] = Math.max(Math.min(next[1], 60), -60)
    projection.rotate(next)
    lastDragDir = [x, y]
    if (Math.abs(next[0] - rotate[0]) + Math.abs(next[1] - rotate[1]) > 0)
      startStep()
  }

  canvas.addEventListener('mousedown', () => {
    window.addEventListener('mousemove', onDrag, { passive: true })
  })
  ;['mouseup', 'mouseleave'].forEach((event) => {
    canvas.addEventListener(event, () => {
      window.removeEventListener('mousemove', onDrag)
      dragMoment = true
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
    startStep()
  })

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio
    canvas.height = canvas.offsetHeight * devicePixelRatio
    projection.translate([canvas.width / 2, canvas.height / 2])
    projection.scale((Math.min(canvas.width, canvas.height) * 0.9) / 2)
  }
  window.addEventListener('resize', () => {
    resize()
    render()
  })
})()
