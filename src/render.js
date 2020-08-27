import * as d3 from 'd3'
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

export default (data, projection) => {
  const pathGenerator = d3.geoPath(projection, ctx)

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

  return { render, resize }
}
