import { init as initWorld } from './map'
import initRender from './render'
import initInteract from './interaction'

//
;(async () => {
  let running = false
  let dragMoment = false
  let lastDragDir

  const { data, projection } = await initWorld()
  const { render, initialScale, pathGenerator, onHover } = initRender(
    data,
    projection
  )

  function handleDragEvent(event, payload) {
    switch (event) {
      case 'start':
        dragMoment = false
        break
      case 'stop':
        dragMoment = true
        break
      case 'dir':
        lastDragDir = payload
        break
    }
  }

  const { onUpdate } = initInteract(
    startStep,
    handleDragEvent,
    projection,
    initialScale,
    pathGenerator,
    onHover
  )

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
    onUpdate()
    return true
  }

  let lastRequest = 0

  function startStep() {
    lastRequest = performance.now()
    if (running) return
    running = true

    const step = () => {
      const next = update() || performance.now() - lastRequest < 200
      render()
      if (next) requestAnimationFrame(step)
      else {
        running = false
      }
    }
    step()
  }
  startStep()
})()
