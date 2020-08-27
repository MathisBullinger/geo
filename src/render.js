import * as d3 from 'd3'
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

export default (data, projection) => {
  const pathGenerator = d3.geoPath(projection, ctx)

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
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

    ctx.beginPath()
    pathGenerator(data)
    ctx.fillStyle = '#fff8'
    ctx.fill()
    ctx.strokeStyle = '#0005'
    ctx.stroke()
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

  return { render, resize, initialScale }
}
