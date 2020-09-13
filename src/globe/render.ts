import * as d3 from 'd3'

export default (canvas: HTMLCanvasElement, data, projection) => {
  const ctx = canvas.getContext('2d')
  const pathGenerator = d3.geoPath(projection, ctx)

  let countries = data.features
  let hovered

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 1
    ctx.fillStyle = '#111'
    const radius = projection.scale()

    const gradient = ctx.createRadialGradient(
      canvas.width / 2 + radius / 3,
      canvas.height / 2 - radius / 3,
      radius / 10,
      canvas.width / 2,
      canvas.height / 2,
      radius
    )
    gradient.addColorStop(0, '#333b')
    gradient.addColorStop(1, '#000b')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#0005'
    countries.forEach((d) => {
      ctx.beginPath()
      pathGenerator(d)
      ctx.fillStyle = d.id === hovered ? '#ff9800' : '#ddd'
      ctx.fill()
      ctx.stroke()
    })
  }

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

  resize()
  const initialScale = projection.scale()

  function onHover(id) {
    hovered = id
    render()
  }

  return { render, resize, initialScale, pathGenerator, onHover }
}
